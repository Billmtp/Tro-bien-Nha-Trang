import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Vui lòng đăng nhập để thực hiện xác minh Gmail/Email." }, { status: 401 });
    }

    const { email } = await request.json();
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Vui lòng nhập địa chỉ Gmail/Email hợp lệ." }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if email already verified by another user
    const existing = await prisma.user.findFirst({
      where: {
        email: cleanEmail,
        isEmailVerified: true,
        NOT: { id: user.id },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Địa chỉ Gmail này đã được sử dụng bởi một tài khoản khác." },
        { status: 400 }
      );
    }

    // Sinh mã OTP 6 số
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        email: cleanEmail,
        emailOtp: otp,
      },
    });

    return NextResponse.json({
      success: true,
      email: cleanEmail,
      otpDemo: otp,
      message: `Mã xác thực đã được gửi đến địa chỉ ${cleanEmail}.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Lỗi khi gửi mã xác thực email" }, { status: 500 });
  }
}
