import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword, createToken, COOKIE_NAME } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { phone, password } = await request.json();

    if (!phone || !password) {
      return NextResponse.json(
        { error: "Vui lòng nhập Số điện thoại và Mật khẩu." },
        { status: 400 }
      );
    }

    const cleanInput = phone.trim();
    const isEmail = cleanInput.includes("@");

    const user = isEmail
      ? await prisma.user.findFirst({
          where: { email: { equals: cleanInput.toLowerCase(), mode: "insensitive" } },
        })
      : await prisma.user.findUnique({
          where: { phone: cleanInput.replace(/\s+/g, "") },
        });

    if (!user || !verifyPassword(password, user.password)) {
      return NextResponse.json(
        { error: isEmail ? "Email hoặc mật khẩu không chính xác." : "Số điện thoại hoặc mật khẩu không chính xác." },
        { status: 401 }
      );
    }

    const safeUser = { id: user.id, name: user.name, phone: user.phone };
    const token = createToken(safeUser);
    const res = NextResponse.json({ success: true, user: safeUser });

    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 3600,
      path: "/",
    });

    return res;
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Lỗi khi đăng nhập." },
      { status: 500 }
    );
  }
}
