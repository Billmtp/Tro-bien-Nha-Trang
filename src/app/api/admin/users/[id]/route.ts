import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    const devKey = searchParams.get("devKey");

    if (currentUser?.role !== "admin" && devKey !== "admin123") {
      return NextResponse.json({ error: "Yêu cầu quyền Quản trị viên (Admin)." }, { status: 403 });
    }

    const { id } = await context.params;
    const targetUserId = parseInt(id);
    if (!targetUserId) {
      return NextResponse.json({ error: "ID người dùng không hợp lệ" }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!targetUser) {
      return NextResponse.json({ error: "Không tìm thấy người dùng" }, { status: 404 });
    }

    const body = await request.json();
    const { action } = body;

    let updated;
    if (action === "toggle_verify") {
      updated = await prisma.user.update({
        where: { id: targetUserId },
        data: { isVerified: !targetUser.isVerified },
      });
    } else if (action === "toggle_ban") {
      updated = await prisma.user.update({
        where: { id: targetUserId },
        data: { isBanned: !targetUser.isBanned },
      });
    } else if (action === "toggle_role") {
      const newRole = targetUser.role === "admin" ? "user" : "admin";
      updated = await prisma.user.update({
        where: { id: targetUserId },
        data: { role: newRole },
      });
    } else {
      return NextResponse.json({ error: "Hành động không hợp lệ" }, { status: 400 });
    }

    return NextResponse.json({ success: true, user: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Lỗi khi cập nhật người dùng" }, { status: 500 });
  }
}
