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

    // Lấy thông tin user mới nhất kèm verificationOtp
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, verificationOtp: true },
    });

    if (!dbUser?.verificationOtp) {
      return NextResponse.json(
        { error: "Chưa có yêu cầu OTP nào hoặc mã đã hết hạn. Vui lòng bấm gửi lại mã." },
        { status: 400 }
      );
    }

    if (dbUser.verificationOtp !== otp.trim()) {
      return NextResponse.json({ error: "Mã OTP không chính xác. Vui lòng kiểm tra lại." }, { status: 400 });
    }

    // Xác thực thành công -> cấp tích xanh
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationOtp: null,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        role: true,
        isVerified: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Xác thực tài khoản thành công! Bạn đã nhận được huy hiệu Tích Xanh Uy Tín.",
      user: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Lỗi khi xác minh OTP" }, { status: 500 });
  }
}
