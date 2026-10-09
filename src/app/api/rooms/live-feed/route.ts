import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sinceStr = searchParams.get("since");
    const category = searchParams.get("category") || "rent";

    const since = sinceStr ? new Date(sinceStr) : new Date(Date.now() - 60_000);

    // Đếm số tin mới được đăng / cào sau mốc `since`
    const [newCount, latestRooms, total] = await Promise.all([
      prisma.room.count({
        where: {
          category,
          isActive: true,
          scrapedAt: { gt: since },
        },
      }),
      prisma.room.findMany({
        where: {
          category,
          isActive: true,
          scrapedAt: { gt: since },
        },
        orderBy: { scrapedAt: "desc" },
        take: 3,
        select: {
          id: true,
          title: true,
          price: true,
          district: true,
          scrapedAt: true,
        },
      }),
      prisma.room.count({
        where: { category, isActive: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      category,
      newCount,
      latestRooms,
      total,
      serverTime: new Date().toISOString(),
      isScrapingNow: false,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
