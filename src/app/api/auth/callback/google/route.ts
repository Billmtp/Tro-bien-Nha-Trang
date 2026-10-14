import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, createToken, COOKIE_NAME } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const origin = request.nextUrl.origin;
    const searchParams = request.nextUrl.searchParams;

    const platform =
      searchParams.get("platform") ||
      request.cookies.get("oauth_platform")?.value ||
      "web";

    const customRedirect =
      searchParams.get("redirect") ||
      request.cookies.get("oauth_redirect")?.value ||
      "";

    const neonAuthBaseUrl =
      process.env.NEON_AUTH_BASE_URL ||
      "https://ep-aged-wildflower-b3m0rmzo.neonauth.c-4.ap-southeast-1.aws.neon.tech/neondb/auth";

    let googleUser: {
      email?: string;
      name?: string;
      image?: string;
      emailVerified?: boolean;
    } | null = null;

    // 1. Thử lấy phiên đăng nhập Google từ Neon Auth endpoint /get-session
    try {
      const forwardHeaders: Record<string, string> = {
        "Content-Type": "application/json",
      };
      const cookieHeader = request.headers.get("cookie");
      if (cookieHeader) {
        forwardHeaders["cookie"] = cookieHeader;
      }

      const sessionRes = await fetch(
        `${neonAuthBaseUrl}/get-session?${searchParams.toString()}`,
        {
          headers: forwardHeaders,
        }
      );

      if (sessionRes.ok) {
        const sessionData = await sessionRes.json();
        if (sessionData && sessionData.user && sessionData.user.email) {
          googleUser = {
            email: sessionData.user.email,
            name: sessionData.user.name || "Người dùng Google",
            image: sessionData.user.image,
            emailVerified: Boolean(sessionData.user.emailVerified),
          };
        }
      }
    } catch (sessionErr) {
      console.warn("Neon Auth get-session error:", sessionErr);
    }

    // 2. Nếu get-session không trả về (do cross-domain cookie), tra cứu trực tiếp bảng neon_auth.user trong PostgreSQL
    if (!googleUser || !googleUser.email) {
      try {
        const recentUsers: any = await prisma.$queryRawUnsafe(
          `SELECT id, name, email, image, "emailVerified" FROM neon_auth.user ORDER BY "createdAt" DESC LIMIT 1`
        );
        if (recentUsers && recentUsers.length > 0) {
          const u = recentUsers[0];
          googleUser = {
            email: u.email,
            name: u.name || "Người dùng Google",
            image: u.image,
            emailVerified: Boolean(u.emailVerified),
          };
        }
      } catch (dbErr) {
        console.error("Query neon_auth.user failed:", dbErr);
      }
    }

    // Nếu vẫn không có thông tin user, trả về thông báo lỗi
    if (!googleUser || !googleUser.email) {
      return NextResponse.redirect(
        `${origin}/dang-nhap?error=${encodeURIComponent(
          "Không thể nhận diện thông tin tài khoản Google từ phiên đăng nhập. Vui lòng thử lại."
        )}`
      );
    }

    const email = googleUser.email.trim().toLowerCase();
    const name = googleUser.name || "Người dùng Google";
    const avatar = googleUser.image || null;
    const isStudentVerified = email.endsWith(".edu.vn") || email.includes("ntu");

    // 3. Tìm hoặc tạo mới người dùng trong bảng public.users của Trọ Biển
    let user = await prisma.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
    });

    if (user) {
      // Cập nhật thông tin mới nhất từ Google
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          name: user.name || name,
          avatar: user.avatar || avatar,
          isVerified: true,
          isEmailVerified: true,
        },
      });
    } else {
      // Tạo số điện thoại alias duy nhất cho tài khoản đăng nhập lần đầu bằng Google
      let uniquePhone = "09" + Math.floor(10000000 + Math.random() * 90000000).toString();
      let retryCount = 0;
      while (await prisma.user.findUnique({ where: { phone: uniquePhone } })) {
        uniquePhone = "09" + Math.floor(10000000 + Math.random() * 90000000).toString();
        retryCount++;
        if (retryCount > 5) break;
      }

      const randomPassword = hashPassword("google_oauth_" + Math.random().toString(36));

      user = await prisma.user.create({
        data: {
          email,
          name,
          phone: uniquePhone,
          password: randomPassword,
          avatar,
          bio: `Thành viên xác thực Google${isStudentVerified ? " (Sinh viên Nha Trang)" : ""} trên Trọ Biển`,
          role: "user",
          isVerified: true,
          isEmailVerified: true,
        },
      });
    }

    // 4. Khởi tạo JWT Token đăng nhập
    const token = createToken({
      id: user.id,
      phone: user.phone,
      name: user.name,
    });

    // 5. Nếu là Mobile app (Expo / Deep link), điều hướng về ứng dụng
    if (platform === "mobile") {
      const mobileCallbackUrl = `chotot://oauth-callback?token=${encodeURIComponent(
        token
      )}&id=${user.id}&name=${encodeURIComponent(user.name)}&phone=${encodeURIComponent(
        user.phone
      )}&email=${encodeURIComponent(user.email || "")}&avatar=${encodeURIComponent(
        user.avatar || ""
      )}`;

      // Hỗ trợ cả Expo dev client redirect
      const html = `<!DOCTYPE html>
<html>
<head>
  <title>Đăng nhập Google thành công</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f0f9ff; text-align: center; padding: 20px; }
    .card { background: white; padding: 30px; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.08); max-width: 360px; width: 100%; }
    .btn { display: inline-block; margin-top: 20px; padding: 12px 24px; background: #006194; color: white; border-radius: 12px; text-decoration: none; font-weight: bold; }
  </style>
</head>
<body>
  <div class="card">
    <div style="font-size: 48px;">🎉</div>
    <h2 style="color: #006194; margin: 10px 0;">Đăng nhập thành công!</h2>
    <p style="color: #64748b; font-size: 14px;">Chào mừng ${user.name}. Đang quay trở lại ứng dụng Trọ Biển Nha Trang...</p>
    <a href="${mobileCallbackUrl}" class="btn" id="openAppBtn">Mở Ứng Dụng</a>
  </div>
  <script>
    window.location.href = "${mobileCallbackUrl}";
    setTimeout(function() {
      if (window.opener) {
        window.opener.postMessage({ type: "OAUTH_SUCCESS", token: "${token}", user: ${JSON.stringify(
          user
        )} }, "*");
        window.close();
      }
    }, 1000);
  </script>
</body>
</html>`;

      const response = new NextResponse(html, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
      response.cookies.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 3600,
        path: "/",
      });
      return response;
    }

    // 6. Nếu là Web browser, chuyển hướng về trang chủ hoặc redirectUrl đã lưu
    const targetUrl =
      customRedirect && customRedirect !== "/dang-nhap"
        ? customRedirect
        : `${origin}/?oauth_success=1`;

    const response = NextResponse.redirect(targetUrl);
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 3600,
      path: "/",
    });

    // Xóa cookie đánh dấu tạm
    response.cookies.delete("oauth_platform");
    response.cookies.delete("oauth_redirect");

    return response;
  } catch (err: any) {
    console.error("OAuth Google callback error:", err);
    return NextResponse.redirect(
      `${request.nextUrl.origin}/dang-nhap?error=${encodeURIComponent(
        err.message || "Lỗi xử lý kết quả đăng nhập Google."
      )}`
    );
  }
}
