import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Lấy danh sách tin đăng của tôi
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  const rooms = await prisma.room.findMany({
    where: { userId: user.id },
    orderBy: { scrapedAt: "desc" },
  });

  return NextResponse.json({ rooms });
}

// Cập nhật trạng thái tin (ẩn/hiện, đã cho thuê)
export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  const { id, isActive } = await request.json();
  const room = await prisma.room.findFirst({
    where: { id: parseInt(id), userId: user.id },
  });

  if (!room) {
    return NextResponse.json({ error: "Không tìm thấy tin đăng" }, { status: 404 });
  }

  const updated = await prisma.room.update({
    where: { id: room.id },
    data: { isActive: Boolean(isActive) },
  });

  return NextResponse.json({ success: true, room: updated });
}

// Xóa tin đăng của tôi
export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = parseInt(searchParams.get("id") || "");

  const room = await prisma.room.findFirst({
    where: { id, userId: user.id },
  });

  if (!room) {
    return NextResponse.json({ error: "Không tìm thấy tin đăng" }, { status: 404 });
  }

  await prisma.room.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
