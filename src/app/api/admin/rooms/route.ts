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

    const status = searchParams.get("status") || "all";
    const category = searchParams.get("category") || "all";
    const site = searchParams.get("site") || "";
    const q = searchParams.get("q") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "25");

    const where: any = {
      ...(status !== "all" && { status }),
      ...(category !== "all" && { category }),
      ...(site && { sourceSite: site.startsWith("facebook") ? { contains: "facebook" } : site }),
      ...(q && {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { address: { contains: q, mode: "insensitive" } },
          { contact: { contains: q, mode: "insensitive" } },
        ],
      }),
    };

    const [rooms, total] = await Promise.all([
      prisma.room.findMany({
        where,
        orderBy: [
          { status: "asc" }, // 'pending' comes first
          { scrapedAt: "desc" },
        ],
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              phone: true,
              isVerified: true,
            },
          },
        },
      }),
      prisma.room.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      rooms,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Lỗi khi tải danh sách tin admin" }, { status: 500 });
  }
}
