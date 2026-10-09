import { NextResponse } from "next/server";
import { getCurrentUser, hashPassword, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// Lấy thông tin chi tiết và thống kê tài khoản
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  // Thống kê tin đăng của người dùng
  const rooms = await prisma.room.findMany({
    where: { userId: user.id },
    select: {
      id: true,
      status: true,
      isActive: true,
      category: true,
    },
  });

  const totalPosts = rooms.length;
  const approvedPosts = rooms.filter((r) => r.status === "approved").length;
  const pendingPosts = rooms.filter((r) => r.status === "pending").length;
  const rejectedPosts = rooms.filter((r) => r.status === "rejected").length;
  const activePosts = rooms.filter((r) => r.isActive).length;

  const isEligibleToPost =
    user.role === "admin" || user.isVerified || user.isEmailVerified;

  return NextResponse.json({
    user,
    stats: {
      totalPosts,
      approvedPosts,
      pendingPosts,
      rejectedPosts,
      activePosts,
    },
    isEligibleToPost,
  });
}

// Cập nhật thông tin profile (tên, avatar, bio, đổi mật khẩu)
export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, avatar, bio, currentPassword, newPassword } = body;

    const dataToUpdate: any = {};

    if (typeof name === "string") {
      const trimmed = name.trim();
      if (trimmed.length < 2) {
        return NextResponse.json(
          { error: "Tên hiển thị phải có ít nhất 2 ký tự" },
          { status: 400 }
        );
      }
      dataToUpdate.name = trimmed;
    }

    if (typeof avatar === "string") {
      dataToUpdate.avatar = avatar.trim();
    }

    if (typeof bio === "string") {
      dataToUpdate.bio = bio.trim().slice(0, 300); // giới hạn 300 ký tự
    }

    // Đổi mật khẩu nếu có gửi
    if (newPassword) {
      if (typeof newPassword !== "string" || newPassword.length < 6) {
        return NextResponse.json(
          { error: "Mật khẩu mới phải có ít nhất 6 ký tự" },
          { status: 400 }
        );
      }

      // Lấy mật khẩu hiện tại trong DB để so sánh
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { password: true },
      });

      if (!dbUser) {
        return NextResponse.json({ error: "Người dùng không tồn tại" }, { status: 404 });
      }

      if (!currentPassword || !verifyPassword(currentPassword, dbUser.password)) {
        return NextResponse.json(
          { error: "Mật khẩu hiện tại không chính xác" },
          { status: 400 }
        );
      }

      dataToUpdate.password = hashPassword(newPassword);
    }

    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json({ message: "Không có thông tin nào thay đổi" });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        phone: true,
        avatar: true,
        bio: true,
        role: true,
        isVerified: true,
        email: true,
        isEmailVerified: true,
        isBanned: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Cập nhật thông tin tài khoản thành công!",
      user: updated,
    });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống khi cập nhật hồ sơ" },
      { status: 500 }
    );
  }
}
