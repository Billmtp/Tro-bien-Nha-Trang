import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { memoryCache } from "@/lib/cache";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const roomId = parseInt(id);
    if (isNaN(roomId)) {
      return NextResponse.json({ error: "ID phòng không hợp lệ" }, { status: 400 });
    }

    const room = await memoryCache.getOrSet(
      `room:${roomId}`,
      () => prisma.room.findUnique({ where: { id: roomId } }),
      300,
      null
    );

    if (!room) {
      return NextResponse.json({ error: "Không tìm thấy phòng trọ" }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, room },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      }
    );
  } catch (error: any) {
    console.error("GET /api/rooms/[id] error:", error);
    return NextResponse.json(
      { error: error?.message || "Lỗi máy chủ khi lấy chi tiết phòng" },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
