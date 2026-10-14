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

    const cleanInput = phone.trim();
    const isEmail = cleanInput.includes("@");
    let finalPhone = cleanInput.replace(/\s+/g, "");
    let finalEmail: string | null = null;
    let isStudentVerified = false;

    if (isEmail) {
      finalEmail = cleanInput.toLowerCase();
      // Generate a unique phone alias if registered with email alone
      finalPhone = "09" + Math.floor(10000000 + Math.random() * 90000000).toString();
      if (finalEmail && finalEmail.endsWith(".edu.vn")) {
        isStudentVerified = true;
      }
    } else {
      if (!/^0\d{9,10}$/.test(finalPhone)) {
        return NextResponse.json(
          { error: "Số điện thoại không hợp lệ (ví dụ: 0912345678)." },
          { status: 400 }
        );
      }
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Mật khẩu phải có ít nhất 6 ký tự." },
        { status: 400 }
      );
    }

    // Check if phone or email already registered
    if (finalEmail) {
      const existingEmail = await prisma.user.findFirst({
        where: { email: { equals: finalEmail, mode: "insensitive" } },
      });
      if (existingEmail) {
        return NextResponse.json(
          { error: "Email này đã được sử dụng cho một tài khoản khác." },
          { status: 400 }
        );
      }
    } else {
      const existingPhone = await prisma.user.findUnique({
        where: { phone: finalPhone },
      });
      if (existingPhone) {
        return NextResponse.json(
          { error: "Số điện thoại này đã được đăng ký tài khoản." },
          { status: 400 }
        );
      }
    }

    const user = await prisma.user.create({
      data: {
        phone: finalPhone,
        email: finalEmail,
        name: name.trim(),
        password: hashPassword(password),
        isEmailVerified: isStudentVerified,
        isVerified: isStudentVerified,
      },
      select: { id: true, name: true, phone: true, email: true, isEmailVerified: true, isVerified: true },
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
