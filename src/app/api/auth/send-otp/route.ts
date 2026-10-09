import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Vui lòng đăng nhập để thực hiện xác minh tài khoản." }, { status: 401 });
    }

    if (user.isVerified) {
      return NextResponse.json({ error: "Tài khoản của bạn đã được xác minh trước đó." }, { status: 400 });
    }

    // Tạo mã OTP 6 số ngẫu nhiên
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await prisma.user.update({
      where: { id: user.id },
      data: { verificationOtp: otp },
    });

    return NextResponse.json({
      success: true,
      phone: user.phone,
      // Trả về otpDemo để trải nghiệm trên localhost thuận tiện mà không cần SMS Gateway trả phí
      otpDemo: otp,
      message: `Mã xác thực OTP đã được gửi đến số ${user.phone}.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Lỗi khi gửi mã OTP" }, { status: 500 });
  }
}
