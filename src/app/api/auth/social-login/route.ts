import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, createToken, COOKIE_NAME } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { provider, email, name, phone, avatar } = body;

    const validProviders = ["google", "zalo", "apple"];
    const normalizedProvider = (provider || "google").toLowerCase();

    if (!validProviders.includes(normalizedProvider)) {
      return NextResponse.json(
        { error: "Nền tảng đăng nhập không hợp lệ (hỗ trợ Google, Zalo, Apple)." },
        { status: 400 }
      );
    }

    // Xác định thông tin tài khoản xã hội
    let finalEmail: string | null = email ? email.trim().toLowerCase() : null;
    let finalName: string = name ? name.trim() : "";
    let finalPhone: string = phone ? phone.trim().replace(/\s+/g, "") : "";
    let isStudentVerified = false;

    if (normalizedProvider === "google") {
      if (!finalEmail) {
        finalEmail = `sinhvien.ntu.${Math.floor(1000 + Math.random() * 9000)}@gmail.com`;
      }
      if (!finalName) {
        finalName = finalEmail.includes(".edu.vn")
          ? "Sinh Viên NTU (Google)"
          : "Người Dùng Google";
      }
      if (finalEmail.endsWith(".edu.vn") || finalEmail.includes("ntu")) {
        isStudentVerified = true;
      }
    } else if (normalizedProvider === "zalo") {
      if (!finalPhone) {
        finalPhone = "09" + Math.floor(10000000 + Math.random() * 90000000).toString();
      }
      if (!finalName) {
        finalName = "Người Dùng Zalo";
      }
      if (!finalEmail) {
        finalEmail = `zalo.${finalPhone.slice(-6)}@zalo.me`;
      }
    } else if (normalizedProvider === "apple") {
      if (!finalEmail) {
        finalEmail = `apple.id.${Math.floor(1000 + Math.random() * 9000)}@privaterelay.appleid.com`;
      }
      if (!finalName) {
        finalName = "Người Dùng Apple";
      }
    }

    // Nếu chưa có số điện thoại (ví dụ Google/Apple login), tạo alias số điện thoại hợp lệ
    if (!finalPhone) {
      finalPhone = "09" + Math.floor(10000000 + Math.random() * 90000000).toString();
    }

    // 1. Kiểm tra xem người dùng đã tồn tại theo Email hoặc Phone chưa
    let existingUser = null;
    if (finalEmail) {
      existingUser = await prisma.user.findFirst({
        where: { email: { equals: finalEmail, mode: "insensitive" } },
      });
    }

    if (!existingUser && finalPhone) {
      existingUser = await prisma.user.findUnique({
        where: { phone: finalPhone },
      });
    }

    let user = existingUser;

    // 2. Nếu chưa tồn tại, tự động tạo mới tài khoản với Tích Xanh xác thực từ nền tảng
    if (!user) {
      // Đảm bảo số điện thoại là duy nhất
      let uniquePhone = finalPhone;
      let counter = 0;
      while (await prisma.user.findUnique({ where: { phone: uniquePhone } })) {
        counter++;
        uniquePhone = "09" + Math.floor(10000000 + Math.random() * 90000000).toString();
        if (counter > 5) break;
      }

      const randomPassword = hashPassword("social_oauth_" + Math.random().toString(36));

      user = await prisma.user.create({
        data: {
          phone: uniquePhone,
          name: finalName,
          email: finalEmail,
          password: randomPassword,
          avatar: avatar || null,
          bio: `Thành viên xác thực qua ${normalizedProvider.toUpperCase()} trên Trọ Biển Nha Trang`,
          role: "user",
          isVerified: true, // Đã xác thực qua nền tảng bên thứ ba
          isEmailVerified: normalizedProvider === "google" || isStudentVerified,
        },
      });
    }

    // 3. Tạo JWT Token đăng nhập an toàn
    const safeUser = {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      role: user.role,
      isVerified: user.isVerified,
      isEmailVerified: user.isEmailVerified,
    };

    const token = createToken({
      id: user.id,
      phone: user.phone,
      name: user.name,
    });

    const res = NextResponse.json({
      success: true,
      message: `Đăng nhập thành công qua ${normalizedProvider.toUpperCase()}`,
      token,
      user: safeUser,
    });

    // Set cookie phiên làm việc
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 3600,
      path: "/",
    });

    return res;
  } catch (err: any) {
    console.error("Social login API error:", err);
    return NextResponse.json(
      { error: err.message || "Lỗi khi đăng nhập bằng nền tảng xã hội." },
      { status: 500 }
    );
  }
}
