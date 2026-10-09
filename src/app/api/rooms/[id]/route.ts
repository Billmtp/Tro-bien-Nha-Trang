import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const room = await prisma.room.findUnique({
    where: { id: parseInt(id) },
  });

  if (!room) {
    return NextResponse.json({ error: "Không tìm thấy phòng" }, { status: 404 });
  }

  return NextResponse.json(room);
}
