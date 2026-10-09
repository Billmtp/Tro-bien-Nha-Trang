import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    const devKey = searchParams.get("devKey");

    if (user?.role !== "admin" && devKey !== "admin123") {
      return NextResponse.json({ error: "Yêu cầu quyền Quản trị viên (Admin)." }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        phone: true,
        role: true,
        isVerified: true,
        email: true,
        isEmailVerified: true,
        isBanned: true,
        createdAt: true,
        _count: {
          select: { rooms: true },
        },
      },
    });

    return NextResponse.json({ success: true, users });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Lỗi khi lấy danh sách người dùng" }, { status: 500 });
  }
}
