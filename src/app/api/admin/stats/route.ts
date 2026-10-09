import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    const devKey = searchParams.get("devKey");

    // Allow if user is admin OR devKey matches
    if (user?.role !== "admin" && devKey !== "admin123") {
      return NextResponse.json({ error: "Yêu cầu quyền Quản trị viên (Admin)." }, { status: 403 });
    }

    const [
      totalRooms,
      pendingCount,
      approvedCount,
      rejectedCount,
      vipCount,
      totalUsers,
      verifiedUsersCount,
      bannedUsersCount,
      bySource,
      byCategory,
      recentPending,
    ] = await Promise.all([
      prisma.room.count(),
      prisma.room.count({ where: { status: "pending" } }),
      prisma.room.count({ where: { status: "approved" } }),
      prisma.room.count({ where: { status: "rejected" } }),
      prisma.room.count({ where: { isVip: true } }),
      prisma.user.count(),
      prisma.user.count({ where: { isVerified: true } }),
      prisma.user.count({ where: { isBanned: true } }),
      prisma.room.groupBy({
        by: ["sourceSite"],
        _count: { id: true },
      }),
      prisma.room.groupBy({
        by: ["category"],
        _count: { id: true },
      }),
      prisma.room.findMany({
        where: { status: "pending" },
        take: 5,
        orderBy: { scrapedAt: "desc" },
        select: {
          id: true,
          title: true,
          price: true,
          district: true,
          contact: true,
          scrapedAt: true,
          images: true,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalRooms,
        pendingCount,
        approvedCount,
        rejectedCount,
        vipCount,
        totalUsers,
        verifiedUsersCount,
        bannedUsersCount,
        bySource,
        byCategory,
      },
      recentPending,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Lỗi khi lấy thống kê admin" }, { status: 500 });
  }
}
