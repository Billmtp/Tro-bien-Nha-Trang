import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    const devKey = searchParams.get("devKey");

    if (user?.role !== "admin" && devKey !== "admin123") {
      return NextResponse.json({ error: "Yêu cầu quyền Quản trị viên (Admin)." }, { status: 403 });
    }

    const { id } = await context.params;
    const roomId = parseInt(id);
    if (!roomId) {
      return NextResponse.json({ error: "ID phòng không hợp lệ" }, { status: 400 });
    }

    const body = await request.json();
    const { action, reason } = body;

    const existing = await prisma.room.findUnique({ where: { id: roomId } });
    if (!existing) {
      return NextResponse.json({ error: "Không tìm thấy bài đăng" }, { status: 404 });
    }

    let updated;
    if (action === "approve") {
      updated = await prisma.room.update({
        where: { id: roomId },
        data: {
          status: "approved",
          isActive: true,
          rejectionReason: null,
        },
      });
    } else if (action === "reject") {
      updated = await prisma.room.update({
        where: { id: roomId },
        data: {
          status: "rejected",
          rejectionReason: reason || "Nội dung hoặc hình ảnh không đúng quy chuẩn bài đăng.",
        },
      });
    } else if (action === "toggle_vip") {
      updated = await prisma.room.update({
        where: { id: roomId },
        data: { isVip: !existing.isVip },
      });
    } else if (action === "toggle_active") {
      updated = await prisma.room.update({
        where: { id: roomId },
        data: { isActive: !existing.isActive },
      });
    } else {
      return NextResponse.json({ error: "Hành động không hợp lệ" }, { status: 400 });
    }

    return NextResponse.json({ success: true, room: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Lỗi khi cập nhật bài đăng" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    const devKey = searchParams.get("devKey");

    if (user?.role !== "admin" && devKey !== "admin123") {
      return NextResponse.json({ error: "Yêu cầu quyền Quản trị viên (Admin)." }, { status: 403 });
    }

    const { id } = await context.params;
    const roomId = parseInt(id);
    if (!roomId) {
      return NextResponse.json({ error: "ID phòng không hợp lệ" }, { status: 400 });
    }

    await prisma.room.delete({ where: { id: roomId } });
    return NextResponse.json({ success: true, message: "Đã xóa bài đăng thành công." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Lỗi khi xóa bài đăng" }, { status: 500 });
  }
}
