import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, createToken, COOKIE_NAME } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { phone, name, password } = await request.json();

    if (!phone || !name || !password) {
      return NextResponse.json(
        { error: "Vui lòng nhập đầy đủ Số điện thoại, Họ tên và Mật khẩu." },
        { status: 400 }
      );
    }

    const cleanPhone = phone.trim().replace(/\s+/g, "");
    if (!/^0\d{9,10}$/.test(cleanPhone)) {
      return NextResponse.json(
        { error: "Số điện thoại không hợp lệ (ví dụ: 0912345678)." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Mật khẩu phải có ít nhất 6 ký tự." },
        { status: 400 }
      );
    }

    // Check if phone already registered
    const existing = await prisma.user.findUnique({
      where: { phone: cleanPhone },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Số điện thoại này đã được đăng ký tài khoản." },
        { status: 400 }
      );
    }

    const user = await prisma.user.create({
      data: {
        phone: cleanPhone,
        name: name.trim(),
        password: hashPassword(password),
      },
      select: { id: true, name: true, phone: true },
    });

    const token = createToken(user);
    const res = NextResponse.json({ success: true, user });

    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 3600, // 30 days
      path: "/",
    });

    return res;
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Lỗi khi đăng ký tài khoản." },
      { status: 500 }
    );
  }
}
