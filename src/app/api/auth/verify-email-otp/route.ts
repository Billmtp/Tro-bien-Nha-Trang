import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Vui lòng đăng nhập để xác minh." }, { status: 401 });
    }

    const { otp } = await request.json();
    if (!otp || typeof otp !== "string") {
      return NextResponse.json({ error: "Vui lòng nhập mã OTP." }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, email: true, emailOtp: true },
    });

    if (!dbUser?.emailOtp) {
      return NextResponse.json(
        { error: "Chưa có yêu cầu xác thực nào hoặc mã đã hết hạn. Vui lòng gửi lại mã." },
        { status: 400 }
      );
    }

    if (dbUser.emailOtp !== otp.trim()) {
      return NextResponse.json({ error: "Mã OTP không chính xác. Vui lòng kiểm tra lại." }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailOtp: null,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        isVerified: true,
        isEmailVerified: true,
        role: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Xác thực Gmail thành công! Tài khoản của bạn đã đủ tư cách đăng tin phòng trọ.",
      user: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Lỗi khi xác minh Gmail" }, { status: 500 });
  }
}
