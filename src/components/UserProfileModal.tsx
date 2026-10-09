"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { showAppAlert } from "./AppNotificationModal";

interface UserProfile {
  id: number;
  name: string;
  phone: string;
  email?: string | null;
  avatar?: string | null;
  bio?: string | null;
  role: string;
  isVerified: boolean;
  isEmailVerified: boolean;
  isBanned: boolean;
  createdAt: string;
}

interface UserStats {
  totalPosts: number;
  approvedPosts: number;
  pendingPosts: number;
  rejectedPosts: number;
  activePosts: number;
}

const PRESET_AVATARS = [
  {
    name: "Chủ trọ thân thiện",
    url: "https://api.dicebear.com/7.x/avataaars/svg?seed=HungChutro&backgroundColor=ffdfbf",
  },
  {
    name: "Môi giới nhiệt huyết",
    url: "https://api.dicebear.com/7.x/avataaars/svg?seed=LanNhaTrang&backgroundColor=c0aede",
  },
  {
    name: "Cư dân phố biển",
    url: "https://api.dicebear.com/7.x/avataaars/svg?seed=MinhNhaTrang&backgroundColor=b6e3f4",
  },
  {
    name: "Sinh viên Nha Trang",
    url: "https://api.dicebear.com/7.x/lorelei/svg?seed=ThaoSea&backgroundColor=ffd5dc",
  },
  {
    name: "Chuyên gia BĐS",
    url: "https://api.dicebear.com/7.x/avataaars/svg?seed=HoangBDS&backgroundColor=d1d4f9",
  },
  {
    name: "Robot Thông minh",
    url: "https://api.dicebear.com/7.x/bottts/svg?seed=NhaTrangBot&backgroundColor=ffeb3b",
  },
];

export default function UserProfileModal({
  user: initialUser,
  savedCount = 0,
  onClose,
  onOpenVerify,
  onOpenMyRooms,
  onUserUpdated,
}: {
  user: UserProfile;
  savedCount?: number;
  onClose: () => void;
  onOpenVerify: (method: "phone" | "email") => void;
  onOpenMyRooms: () => void;
  onUserUpdated?: (user: UserProfile) => void;
}) {
  const [activeTab, setActiveTab] = useState<"overview" | "edit">("overview");
  const [user, setUser] = useState<UserProfile>(initialUser);
  const [stats, setStats] = useState<UserStats>({
    totalPosts: 0,
    approvedPosts: 0,
    pendingPosts: 0,
    rejectedPosts: 0,
    activePosts: 0,
  });
  const [loading, setLoading] = useState(true);

  // Edit form state
  const [editName, setEditName] = useState(initialUser.name || "");
  const [editBio, setEditBio] = useState(initialUser.bio || "");
  const [editAvatar, setEditAvatar] = useState(initialUser.avatar || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  const isEligible =
    user.role === "admin" || user.isVerified || user.isEmailVerified;

  // Fetch full stats
  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/profile");
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          setEditName(data.user.name || "");
          setEditBio(data.user.bio || "");
          setEditAvatar(data.user.avatar || "");
          if (onUserUpdated) onUserUpdated(data.user);
        }
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error("Error fetching profile stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  // Handle avatar upload via FileReader
  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showAppAlert("Kích thước ảnh đại diện tối đa là 2MB.", "Ảnh quá lớn", "warning");
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64 = uploadEvent.target?.result as string;
      setEditAvatar(base64);
    };
    reader.readAsDataURL(file);
  };

  // Submit profile updates
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError("");
    setSaveSuccess("");

    if (!editName.trim() || editName.trim().length < 2) {
      setSaveError("Tên hiển thị phải có ít nhất 2 ký tự.");
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setSaveError("Mật khẩu mới phải có từ 6 ký tự trở lên.");
      return;
    }

    setSaving(true);
    try {
      const payload: any = {
        name: editName.trim(),
        bio: editBio.trim(),
        avatar: editAvatar,
      };

      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Không thể cập nhật hồ sơ");
      }

      setSaveSuccess("Đã lưu thông tin hồ sơ thành công! 🎉");
      setUser(data.user);
      if (onUserUpdated) onUserUpdated(data.user);
      window.dispatchEvent(new Event("auth_state_changed"));

      // Clear password fields
      setCurrentPassword("");
      setNewPassword("");

      // Switch back to overview tab after 1.2s
      setTimeout(() => {
        setActiveTab("overview");
        setSaveSuccess("");
      }, 1200);
    } catch (err: any) {
      setSaveError(err.message || "Đã xảy ra lỗi khi lưu.");
    } finally {
      setSaving(false);
    }
  };

  const formattedDate = new Date(user.createdAt).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl relative my-6 border border-amber-100 flex flex-col max-h-[90vh]">
        {/* Cover Header Banner */}
        <div className="relative bg-linear-to-r from-[#FF7A00] via-[#FF9800] to-[#FFBA00] px-6 pt-7 pb-16 text-white shrink-0">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-white/80 hover:text-white bg-black/20 hover:bg-black/30 w-8 h-8 rounded-full flex items-center justify-center font-bold transition-colors cursor-pointer"
            title="Đóng hồ sơ"
          >
            ✕
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xl">👤</span>
            <span className="text-sm font-semibold tracking-wide uppercase text-amber-100">
              Hồ Sơ Thành Viên Chợ Tốt Nha Trang
            </span>
          </div>
        </div>

        {/* Profile Card Header Info */}
        <div className="relative px-5 sm:px-6 pb-4 pt-0 -mt-12 shrink-0">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4">
            {/* Avatar & Main Info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-3.5 text-center sm:text-left">
              <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-2xl border-4 border-white shadow-md overflow-hidden bg-amber-100 flex items-center justify-center shrink-0">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#FF7A00] text-white font-black text-3xl flex items-center justify-center">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                {user.isVerified && (
                  <div
                    className="absolute bottom-1 right-1 bg-blue-600 text-white rounded-full p-1 shadow-md text-[10px] leading-none"
                    title="Đã xác minh chính chủ"
                  >
                    ✓
                  </div>
                )}
              </div>

              <div className="space-y-0.5">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                  <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                  {user.role === "admin" && (
                    <span className="bg-purple-100 text-purple-800 text-[10px] font-black px-2 py-0.5 rounded-full border border-purple-200">
                      ADMIN QUẢN TRỊ
                    </span>
                  )}
                  {user.isVerified && user.isEmailVerified && (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                      <span>👑</span> Tích Xanh Uy Tín
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-500 flex items-center justify-center sm:justify-start gap-2">
                  <span>📅 Tham gia: {formattedDate}</span>
                  <span>•</span>
                  <span>📍 Nha Trang, Khánh Hòa</span>
                </p>

                {user.bio ? (
                  <p className="text-xs text-gray-700 italic pt-1 max-w-md line-clamp-2">
                    &ldquo;{user.bio}&rdquo;
                  </p>
                ) : (
                  <p className="text-[11px] text-gray-400 italic pt-0.5">
                    Chưa có tiểu sử giới thiệu. Nhấn &quot;Chỉnh sửa&quot; để thêm lời giới thiệu.
                  </p>
                )}
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab(activeTab === "overview" ? "edit" : "overview")}
                className="px-3.5 py-1.5 rounded-xl border border-gray-300 hover:border-amber-500 bg-white hover:bg-amber-50 text-xs font-bold text-gray-700 transition-colors flex items-center gap-1 shadow-2xs"
              >
                <span>{activeTab === "overview" ? "✏️ Chỉnh sửa hồ sơ" : "👁️ Xem tổng quan"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-3 px-5 sm:px-6 border-b border-gray-100 bg-gray-50/70 shrink-0">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "overview"
                ? "border-[#FF7A00] text-[#FF7A00]"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            <span>🛡️</span>
            <span>Xác thực & Thống kê</span>
          </button>
          <button
            onClick={() => setActiveTab("edit")}
            className={`py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "edit"
                ? "border-[#FF7A00] text-[#FF7A00]"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            <span>⚙️</span>
            <span>Cài đặt & Tùy biến Avatar</span>
          </button>
        </div>

        {/* Tab Content Body (Scrollable) */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-5 flex-1">
          {activeTab === "overview" ? (
            <>
              {/* Quyền Đăng Tin Banner */}
              <div
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                  isEligible
                    ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                    : "bg-amber-50 border-amber-300 text-amber-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{isEligible ? "✅" : "⚠️"}</span>
                  <div>
                    <h4 className="text-xs font-bold">
                      {isEligible
                        ? "Tài khoản đủ điều kiện đăng tin"
                        : "Chưa đủ điều kiện đăng tin phòng trọ"}
                    </h4>
                    <p className="text-[11px] opacity-90">
                      {isEligible
                        ? "Bạn đã xác thực tài khoản thành công và có toàn quyền đăng tin phòng trọ/nhà đất."
                        : "Hệ thống yêu cầu xác thực Số điện thoại (OTP) hoặc Gmail để đảm bảo an toàn & chống spam."}
                    </p>
                  </div>
                </div>

                {!isEligible && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenVerify("phone");
                    }}
                    className="shrink-0 px-3 py-1.5 bg-[#FF7A00] hover:bg-[#E66E00] text-white text-xs font-bold rounded-lg shadow-xs transition-all animate-pulse"
                  >
                    Xác thực ngay ➜
                  </button>
                )}
              </div>

              {/* KHU VỰC CÁC NÚT XÁC THỰC CHI TIẾT */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Trung Tâm Xác Minh Danh Tính (Tích Xanh)
                  </h3>
                  <span className="text-[11px] text-gray-400">
                    Xác thực 1 trong 2 để đăng tin
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Card 1: Số điện thoại */}
                  <div
                    className={`p-4 rounded-xl border transition-all ${
                      user.isVerified
                        ? "bg-blue-50/60 border-blue-200"
                        : "bg-white border-amber-200 hover:border-amber-400 shadow-2xs"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">📱</span>
                        <div>
                          <p className="text-xs font-bold text-gray-900">
                            Số điện thoại
                          </p>
                          <p className="text-xs font-mono font-semibold text-gray-700">
                            {user.phone}
                          </p>
                        </div>
                      </div>

                      {user.isVerified ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                          <span>✓</span> Đã xác thực
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                          <span>!</span> Chưa xác thực
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-gray-500 mt-2 mb-3">
                      {user.isVerified
                        ? "Số điện thoại của bạn đã được kiểm duyệt chính chủ bằng OTP SMS."
                        : "Xác minh bằng mã OTP gửi về máy để tạo độ tin cậy với người tìm phòng."}
                    </p>

                    {!user.isVerified ? (
                      <button
                        onClick={() => {
                          onClose();
                          onOpenVerify("phone");
                        }}
                        className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                      >
                        <span>📲</span>
                        <span>Xác thực SĐT (Nhận OTP)</span>
                      </button>
                    ) : (
                      <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                        <span>🛡️</span>
                        <span>Đã kích hoạt bảo mật số điện thoại</span>
                      </div>
                    )}
                  </div>

                  {/* Card 2: Gmail / Email */}
                  <div
                    className={`p-4 rounded-xl border transition-all ${
                      user.isEmailVerified
                        ? "bg-purple-50/60 border-purple-200"
                        : "bg-white border-amber-200 hover:border-amber-400 shadow-2xs"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">✉️</span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-900">
                            Gmail / Email
                          </p>
                          <p className="text-xs font-semibold text-gray-700 truncate max-w-[130px] sm:max-w-[160px]">
                            {user.email || "Chưa liên kết Email"}
                          </p>
                        </div>
                      </div>

                      {user.isEmailVerified ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                          <span>✓</span> Đã xác thực
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                          <span>!</span> Chưa xác thực
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-gray-500 mt-2 mb-3">
                      {user.isEmailVerified
                        ? "Hòm thư Gmail đã xác nhận để nhận thông báo duyệt tin & liên hệ."
                        : "Nhập Gmail để nhận mã OTP xác thực và thông báo khi phòng có người quan tâm."}
                    </p>

                    {!user.isEmailVerified ? (
                      <button
                        onClick={() => {
                          onClose();
                          onOpenVerify("email");
                        }}
                        className="w-full py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                      >
                        <span>📧</span>
                        <span>Xác thực Gmail (Gửi OTP)</span>
                      </button>
                    ) : (
                      <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                        <span>🛡️</span>
                        <span>Đã bảo vệ bằng Gmail chính chủ</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Thống kê hoạt động */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Thống Kê Hoạt Động Của Bạn
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="bg-gray-50 border border-gray-200/80 rounded-xl p-3 text-center">
                    <p className="text-lg font-black text-gray-800">
                      {loading ? "..." : stats.totalPosts}
                    </p>
                    <p className="text-[11px] text-gray-500 font-medium">Tổng tin đăng</p>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-3 text-center">
                    <p className="text-lg font-black text-emerald-700">
                      {loading ? "..." : stats.approvedPosts}
                    </p>
                    <p className="text-[11px] text-emerald-600 font-medium">Đã duyệt hiển thị</p>
                  </div>

                  <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 text-center">
                    <p className="text-lg font-black text-amber-700">
                      {loading ? "..." : stats.pendingPosts}
                    </p>
                    <p className="text-[11px] text-amber-600 font-medium">Đang chờ duyệt</p>
                  </div>

                  <div className="bg-rose-50 border border-rose-200/80 rounded-xl p-3 text-center">
                    <p className="text-lg font-black text-rose-700">{savedCount}</p>
                    <p className="text-[11px] text-rose-600 font-medium">Tin đã lưu</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-end">
                  <button
                    onClick={() => {
                      onClose();
                      onOpenMyRooms();
                    }}
                    className="text-xs font-bold text-[#FF7A00] hover:underline flex items-center gap-1"
                  >
                    <span>Quản lý danh sách tin đã đăng của bạn</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* TAB CHỈNH SỬA & CUSTOM HỒ SƠ */
            <form onSubmit={handleSaveProfile} className="space-y-4">
              {saveError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{saveError}</span>
                </div>
              )}

              {saveSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
                  <span>🎉</span>
                  <span>{saveSuccess}</span>
                </div>
              )}

              {/* 1. Tùy biến Avatar */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  1. Chọn ảnh đại diện tùy biến (Avatar)
                </label>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {PRESET_AVATARS.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setEditAvatar(item.url)}
                      className={`relative w-12 h-12 rounded-xl overflow-hidden border-2 transition-transform transform active:scale-95 ${
                        editAvatar === item.url
                          ? "border-[#FF7A00] ring-2 ring-amber-300"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                      title={item.name}
                    >
                      <img
                        src={item.url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="text"
                    placeholder="Hoặc dán URL ảnh đại diện tùy thích..."
                    value={editAvatar}
                    onChange={(e) => setEditAvatar(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7A00] focus:border-transparent outline-none"
                  />
                  <label className="shrink-0 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg cursor-pointer border border-gray-300 text-center transition-colors">
                    <span>📁 Tải ảnh từ máy</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFile}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* 2. Tên hiển thị */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  2. Tên hiển thị / Danh xưng
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Ví dụ: Anh Nam - Chủ trọ Vĩnh Hải"
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7A00] focus:border-transparent outline-none"
                  required
                />
              </div>

              {/* 3. Tiểu sử Bio */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  3. Tiểu sử giới thiệu (Bio)
                </label>
                <textarea
                  rows={2}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Giới thiệu bản thân, số Zalo hoặc khu vực trọ bạn đang quản lý tại Nha Trang..."
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7A00] focus:border-transparent outline-none"
                  maxLength={300}
                />
                <span className="text-[10px] text-gray-400 block text-right">
                  {editBio.length}/300 ký tự
                </span>
              </div>

              {/* 4. Đổi mật khẩu (Tùy chọn) */}
              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs font-bold text-gray-700 mb-2">
                  4. Đổi mật khẩu đăng nhập (Bỏ trống nếu không đổi)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="password"
                    placeholder="Mật khẩu hiện tại..."
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7A00] outline-none"
                  />
                  <input
                    type="password"
                    placeholder="Mật khẩu mới (tối thiểu 6 ký tự)..."
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7A00] outline-none"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("overview")}
                  className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#FF7A00] hover:bg-[#E66E00] text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {saving && <span className="animate-spin">⏳</span>}
                  <span>Lưu thay đổi</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 sm:px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Hệ thống Chợ Tốt Trọ Nha Trang</span>
          </div>

          <button
            onClick={onClose}
            className="text-xs font-bold text-gray-600 hover:text-gray-900 px-3 py-1 rounded-md hover:bg-gray-200 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
