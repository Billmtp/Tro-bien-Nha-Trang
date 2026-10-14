import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const origin = request.nextUrl.origin;
    const platform = request.nextUrl.searchParams.get("platform") || "web";
    const redirectUrl = request.nextUrl.searchParams.get("redirect") || "";

    const neonAuthBaseUrl =
      process.env.NEON_AUTH_BASE_URL ||
      "https://ep-aged-wildflower-b3m0rmzo.neonauth.c-4.ap-southeast-1.aws.neon.tech/neondb/auth";

    const callbackURL = `${origin}/api/auth/callback/google?platform=${encodeURIComponent(
      platform
    )}${redirectUrl ? `&redirect=${encodeURIComponent(redirectUrl)}` : ""}`;

    // Gọi Neon Auth để khởi tạo Google OAuth flow
    const res = await fetch(`${neonAuthBaseUrl}/sign-in/social`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: origin,
      },
      body: JSON.stringify({
        provider: "google",
        callbackURL,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Neon Auth sign-in/social failed:", res.status, errText);
      return NextResponse.json(
        { error: "Không thể khởi tạo phiên đăng nhập Google từ hệ thống xác thực." },
        { status: 500 }
      );
    }

    const data = await res.json();
    if (!data.url) {
      return NextResponse.json(
        { error: "Hệ thống xác thực không trả về đường dẫn Google OAuth." },
        { status: 500 }
      );
    }

    // Chuyển hướng người dùng thẳng tới trang đăng nhập Google chính thức
    const response = NextResponse.redirect(data.url);

    // Chuyển tiếp các cookies challenge bảo mật nếu có từ Neon Auth
    const setCookies = res.headers.getSetCookie();
    if (setCookies && setCookies.length > 0) {
      for (const cookie of setCookies) {
        response.headers.append("Set-Cookie", cookie);
      }
    }

    // Đánh dấu cookie ghi nhớ nền tảng (web/mobile) và URL chuyển hướng
    response.cookies.set("oauth_platform", platform, {
      path: "/",
      maxAge: 600,
      sameSite: "lax",
    });
    if (redirectUrl) {
      response.cookies.set("oauth_redirect", redirectUrl, {
        path: "/",
        maxAge: 600,
        sameSite: "lax",
      });
    }

    return response;
  } catch (err: any) {
    console.error("OAuth Google init error:", err);
    return NextResponse.json(
      { error: err.message || "Lỗi khi bắt đầu đăng nhập Google." },
      { status: 500 }
    );
  }
}
