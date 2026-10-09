"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import PostRoomModal from "./PostRoomModal";
import SavedRoomsDrawer from "./SavedRoomsDrawer";
import AuthModal from "./AuthModal";
import MyRoomsModal from "./MyRoomsModal";
import VerifyAccountModal from "./VerifyAccountModal";
import UserProfileModal from "./UserProfileModal";
import UnverifiedFloatingAlert from "./UnverifiedFloatingAlert";
import RoomAlertModal from "./RoomAlertModal";
import { showAppAlert } from "./AppNotificationModal";
import { useTheme } from "./ThemeManager";

export default function HeaderChotot({
  savedCount = 0,
  onRefresh,
}: {
  savedCount?: number;
  onRefresh?: () => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const isDetailPage = pathname?.startsWith("/phong/") ?? false;
  const { toggleMode, setIsCustomizerOpen, resolvedMode } = useTheme();
  const currentCategory = (searchParams.get("category") || "rent") as "rent" | "sale" | "roommate";
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [isPostOpen, setIsPostOpen] = useState(false);
  const [isSavedOpen, setIsSavedOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMyRoomsOpen, setIsMyRoomsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [verifyInitialMethod, setVerifyInitialMethod] = useState<"phone" | "email">("phone");
  const [isVerifyPostRequired, setIsVerifyPostRequired] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Check current user session
  const checkUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      setUser(data.user || null);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    checkUser();
    window.addEventListener("auth_state_changed", checkUser);
    return () => window.removeEventListener("auth_state_changed", checkUser);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setUserMenuOpen(false);
    setIsProfileOpen(false);
    window.dispatchEvent(new Event("auth_state_changed"));
    router.refresh();
  };

  const handleOpenVerify = (method: "phone" | "email" = "phone") => {
    setVerifyInitialMethod(method);
    setIsVerifyOpen(true);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchTerm.trim()) {
      params.set("q", searchTerm.trim());
    } else {
      params.delete("q");
    }
    params.set("page", "1");
    router.push(`/?${params.toString()}`);
  };

  const handleOpenPost = () => {
    if (!user) {
      showAppAlert("Vui lòng đăng nhập tài khoản trước khi đăng bài.", "Đăng tin phòng trọ", "info");
      setIsAuthOpen(true);
      return;
    }
    // CHỈ TÀI KHOẢN ĐÃ XÁC THỰC SĐT HOẶC GMAIL MỚI ĐƯỢC ĐĂNG TIN
    const isEligible = user.role === "admin" || user.isVerified || user.isEmailVerified;
    if (!isEligible) {
      setIsVerifyPostRequired(true);
      setIsVerifyOpen(true);
      return;
    }
    setIsPostOpen(true);
  };

  return (
    <>
      <header className="trobien-header bg-linear-to-r from-[#034A75] via-[#026AA7] to-[#01588B] text-white sticky top-0 z-40 shadow-md border-b border-sky-400/30">
        {/* Main topbar */}
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-4 md:gap-6">
          {/* Brand Logo Trọ Biển Nha Trang - Phóng to nổi bật, rõ nét */}
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 shrink-0 group py-0.5" title="Trọ Biển Nha Trang - Trang chủ">
            <div className="bg-white rounded-2xl p-1 sm:p-1.5 shadow-md border border-white/90 flex items-center justify-center transition-transform group-hover:scale-105 shrink-0">
              <Image
                src="/tro-bien-logo.png"
                alt="Trọ Biển Nha Trang - Tìm phòng gần biển, an tâm giá tốt"
                width={120}
                height={120}
                className="h-10 w-10 xs:h-11 xs:w-11 sm:h-13 sm:w-13 md:h-14 md:w-14 object-contain rounded-xl"
                priority
              />
            </div>
            <div className="flex flex-col justify-center select-none">
              <div className="flex items-center gap-1 sm:gap-1.5 leading-none">
                <span className="font-black text-base xs:text-lg sm:text-xl md:text-2xl text-white tracking-tight drop-shadow-xs font-sans">
                  TRỌ BIỂN
                </span>
                <span className="text-[9px] sm:text-[10px] md:text-xs font-black bg-[#FF7A00] text-white px-1.5 py-0.5 rounded shadow-xs uppercase tracking-wider">
                  Nha Trang
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] font-semibold text-sky-100/90 tracking-tight mt-0.5 hidden xs:block">
                Gần biển • An tâm giá tốt
              </span>
            </div>
          </Link>

          {/* Search bar Trọ Biển - Hiển thị trên Desktop */}
          <form onSubmit={handleSearch} className="hidden md:block flex-1 max-w-xl relative mx-2">
            <div className="flex items-center bg-white rounded-full pl-3.5 sm:pl-4 pr-1 sm:pr-1.5 py-1 border border-white shadow-md focus-within:ring-2 focus-within:ring-[#FF7A00] transition-all">
              <input
                type="text"
                placeholder={
                  currentCategory === "sale"
                    ? "Tìm mua bán nhà, đất, căn hộ Nha Trang..."
                    : currentCategory === "roommate"
                    ? "Tìm bạn ở ghép Nha Trang, SV NTU, Lộc Thọ..."
                    : "Tìm phòng trọ, đường, khu vực Nha Trang..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 outline-none bg-transparent min-w-0"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="p-1 mr-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors shrink-0 cursor-pointer"
                  title="Xóa tìm kiếm"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              <button
                type="submit"
                className="bg-linear-to-r from-[#FF7A00] to-[#FF5500] hover:from-[#E66E00] hover:to-[#E04400] text-white w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all shadow-xs shrink-0 cursor-pointer"
                title="Tìm kiếm"
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Chuyển nhanh Dark / Light Mode */}
            <button
              onClick={toggleMode}
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm text-white bg-white/20 hover:bg-white/30 transition-all border border-white/30 backdrop-blur-md shadow-2xs cursor-pointer active:scale-95"
              title={resolvedMode === "dark" ? "Chuyển sang Chế độ Sáng (Light Mode)" : "Chuyển sang Chế độ Tối (Dark Mode)"}
              aria-label="Chuyển chế độ sáng tối"
            >
              {resolvedMode === "dark" ? "☀️" : "🌙"}
            </button>

            {/* Mở Modal Tùy biến Theme & Màu sắc */}
            <button
              onClick={() => setIsCustomizerOpen(true)}
              className="flex items-center justify-center w-8 h-8 md:w-auto md:px-2.5 md:py-1.5 rounded-full text-xs font-bold text-white bg-white/20 hover:bg-white/30 transition-all border border-white/30 backdrop-blur-md shadow-2xs cursor-pointer active:scale-95"
              title="Tùy biến 5 tông màu biển Nha Trang, Dark mode & giao diện"
            >
              <span>🎨</span>
              <span className="hidden md:inline md:ml-1">Giao diện</span>
            </button>

            {/* Radar Săn Phòng Nóng (Desktop) */}
            <button
              onClick={() => setIsAlertOpen(true)}
              className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold text-white bg-white/20 hover:bg-white/30 transition-colors border border-white/30 backdrop-blur-md shadow-2xs cursor-pointer"
              title="Đặt Radar săn phòng trọ giá rẻ mới nhất tại Nha Trang"
            >
              <span>🔔</span>
              <span>Săn phòng</span>
            </button>

            {/* Nút vào trang Admin (Tablet / Desktop) */}
            <Link
              href="/admin"
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold text-white bg-purple-700/80 hover:bg-purple-600 transition-colors border border-purple-300/40 shadow-2xs"
              title="Trang Quản Trị Viên (Phê duyệt tin & cài đặt)"
            >
              <span>⚙️</span>
              <span>Admin</span>
            </Link>

            {/* Tin đã lưu (Desktop) */}
            <button
              onClick={() => setIsSavedOpen(true)}
              className="hidden md:flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-full text-xs font-semibold text-white hover:bg-white/15 transition-colors relative"
            >
              <svg className="w-5 h-5 text-rose-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              <span>Đã lưu</span>
              {savedCount > 0 && (
                <span className="bg-[#D0021B] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {savedCount}
                </span>
              )}
            </button>

            {/* Tài khoản / Đăng nhập */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-xs font-bold text-white border border-white/30 transition-all shadow-xs cursor-pointer"
                  title="Nhấn để xem ảnh hồ sơ và menu tài khoản"
                >
                  {/* Avatar Tròn Trên Thanh Header */}
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#FF7A00] text-white flex items-center justify-center text-xs font-black overflow-hidden shrink-0 border-2 border-white/80 shadow-2xs">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="max-w-[80px] sm:max-w-[120px] truncate hidden sm:inline text-white font-bold">
                    {user.name}
                  </span>
                  {(user.isVerified || user.isEmailVerified) && (
                    <span className="text-emerald-300 text-xs font-black" title="Tài khoản đã xác thực uy tín">✓</span>
                  )}
                  <span className="text-[10px] text-sky-200">▼</span>
                </button>

                {/* Dropdown Menu với Ảnh Profile Lớn */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                    {/* Thẻ Ảnh Profile Khi Bấm Vào Tên */}
                    <div
                      onClick={() => {
                        setIsProfileOpen(true);
                        setUserMenuOpen(false);
                      }}
                      className="p-3.5 border-b border-gray-100 bg-linear-to-b from-amber-50/80 via-orange-50/30 to-white hover:bg-amber-100/60 cursor-pointer transition-all group"
                      title="Nhấn để xem trang cá nhân & chỉnh sửa ảnh đại diện"
                    >
                      <div className="flex items-center gap-3">
                        {/* Ảnh Profile To Rõ */}
                        <div className="relative shrink-0">
                          <div className="w-13 h-13 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-md bg-amber-100 flex items-center justify-center group-hover:scale-105 group-hover:border-[#FF7A00] transition-all">
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-[#FF7A00] text-white text-xl font-black flex items-center justify-center">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <span className="absolute -bottom-1 -right-1 bg-white text-gray-700 rounded-full p-0.5 shadow-xs text-[10px] border border-gray-200">
                            📷
                          </span>
                        </div>

                        {/* Thông tin tên & số điện thoại */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-xs font-black text-gray-900 truncate group-hover:text-[#FF7A00] transition-colors">
                              {user.name}
                            </p>
                            {(user.isVerified || user.isEmailVerified) ? (
                              <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.2 rounded-full border border-blue-200 shrink-0">
                                ✓
                              </span>
                            ) : (
                              <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-1 py-0.2 rounded-full border border-amber-200 animate-pulse shrink-0">
                                !
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-500 font-mono truncate">{user.phone}</p>
                          <div className="mt-1 flex items-center gap-1 text-[10px] text-[#FF7A00] font-bold group-hover:underline">
                            <span>👤 Xem &amp; đổi ảnh hồ sơ</span>
                            <span>➜</span>
                          </div>
                        </div>
                      </div>

                      {!(user.isVerified || user.isEmailVerified) && (
                        <div className="mt-2.5 w-full py-1 px-2.5 bg-linear-to-r from-amber-100 to-orange-100 border border-amber-300 text-amber-900 text-[11px] font-bold rounded-lg flex items-center justify-between">
                          <span>🛡️ Xác thực SĐT/Gmail (OTP)</span>
                          <span className="text-xs">→</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setIsProfileOpen(true);
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs font-bold text-gray-800 hover:bg-amber-50 hover:text-[#FF7A00] flex items-center justify-between transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <span>👤</span>
                        <span>Trang cá nhân & Tùy biến</span>
                      </span>
                      <span className="text-[10px] bg-amber-100 text-[#FF7A00] px-1.5 py-0.2 rounded font-bold">Mới</span>
                    </button>

                    {user.role === "admin" && (
                      <Link
                        href="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="w-full text-left px-3.5 py-2 text-xs font-bold text-purple-700 bg-purple-50/80 hover:bg-purple-100 flex items-center gap-2"
                      >
                        <span>⚙️</span> Trang Quản Trị (Admin)
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        setIsMyRoomsOpen(true);
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs font-medium text-gray-700 hover:bg-amber-50 hover:text-[#FF7A00] flex items-center gap-2"
                    >
                      <span>📋</span> Tin đăng của tôi
                    </button>
                    <button
                      onClick={() => {
                        setIsSavedOpen(true);
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs font-medium text-gray-700 hover:bg-amber-50 hover:text-[#FF7A00] flex items-center gap-2"
                    >
                      <span>❤️</span> Tin đã lưu ({savedCount})
                    </button>
                    <button
                      onClick={() => {
                        setIsCustomizerOpen(true);
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs font-medium text-gray-700 hover:bg-amber-50 hover:text-[#FF7A00] flex items-center gap-2"
                    >
                      <span>🎨</span> Tùy biến màu sắc &amp; Giao diện
                    </button>
                    <div className="border-t border-gray-100 my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <span>🚪</span> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white bg-white/20 hover:bg-white/30 border border-white/35 transition-colors cursor-pointer shadow-xs"
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Đăng nhập</span>
              </button>
            )}

            {/* Nút ĐĂNG TIN (Desktop) */}
            <button
              onClick={handleOpenPost}
              className="hidden md:flex bg-linear-to-r from-[#FF7A00] via-[#FF6000] to-[#FF4500] hover:from-[#FF8800] hover:to-[#FF5500] text-white font-extrabold text-xs sm:text-sm px-4 py-2 rounded-full shadow-lg shadow-orange-950/25 items-center gap-1 sm:gap-1.5 transition-all transform active:scale-95 shrink-0 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              <span>ĐĂNG TIN</span>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar Row (Hiển thị riêng trên Mobile để ô tìm kiếm full-width, gõ thoáng) */}
        <div className="md:hidden px-3 pb-2.5 pt-0.5">
          <form onSubmit={handleSearch} className="w-full relative">
            <div className="flex items-center bg-white rounded-full pl-3.5 pr-1 py-1 border border-white shadow-md focus-within:ring-2 focus-within:ring-[#FF7A00] transition-all">
              <input
                type="text"
                placeholder={
                  currentCategory === "sale"
                    ? "Tìm mua bán nhà, đất, căn hộ Nha Trang..."
                    : currentCategory === "roommate"
                    ? "Tìm bạn ở ghép Nha Trang, SV NTU..."
                    : "Tìm phòng trọ, đường, khu vực Nha Trang..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs text-gray-900 placeholder:text-gray-400 outline-none bg-transparent min-w-0"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="p-1 mr-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors shrink-0 cursor-pointer"
                  title="Xóa tìm kiếm"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              <button
                type="submit"
                className="bg-linear-to-r from-[#FF7A00] to-[#FF5500] hover:from-[#E66E00] hover:to-[#E04400] text-white w-7 h-7 rounded-full flex items-center justify-center transition-all shadow-xs shrink-0 cursor-pointer"
                title="Tìm kiếm"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>
        </div>

        {/* Category Tabs: Cho thuê phòng trọ vs Mua bán nhà đất */}
        <div className="trobien-category-bar bg-[#025687] text-white text-xs pt-1.5 px-3 sm:px-4 border-t border-sky-400/20">
          <div className="max-w-6xl mx-auto flex items-end justify-between overflow-x-auto whitespace-nowrap scrollbar-none gap-3">
            <div className="flex items-center gap-1.5">
              <Link
                href="/?category=rent"
                className={`flex items-center gap-1.5 px-3.5 py-2 font-bold text-xs rounded-t-xl transition-all ${
                  (searchParams.get("category") || "rent") === "rent"
                    ? "bg-white text-[#026AA7] shadow-md border-t-3 border-[#FF7A00] font-black"
                    : "text-sky-100 hover:text-white hover:bg-white/10 font-semibold"
                }`}
              >
                <span>🏠</span>
                <span>Cho thuê phòng trọ</span>
              </Link>
              <Link
                href="/?category=roommate"
                className={`flex items-center gap-1.5 px-3.5 py-2 font-bold text-xs rounded-t-xl transition-all ${
                  searchParams.get("category") === "roommate"
                    ? "bg-white text-[#026AA7] shadow-md border-t-3 border-[#FF7A00] font-black"
                    : "text-sky-100 hover:text-white hover:bg-white/10 font-semibold"
                }`}
              >
                <span>🤝</span>
                <span>Tìm bạn ở ghép</span>
                <span className="text-[10px] bg-rose-500 text-white px-1.5 py-0.2 rounded-full font-bold ml-0.5 shadow-2xs">Hot</span>
              </Link>
              <Link
                href="/?category=sale"
                className={`flex items-center gap-1.5 px-3.5 py-2 font-bold text-xs rounded-t-xl transition-all ${
                  searchParams.get("category") === "sale"
                    ? "bg-white text-[#026AA7] shadow-md border-t-3 border-[#FF7A00] font-black"
                    : "text-sky-100 hover:text-white hover:bg-white/10 font-semibold"
                }`}
              >
                <span>🏢</span>
                <span>Mua bán nhà đất</span>
              </Link>
            </div>

            <div className="hidden lg:flex items-center gap-2.5 pb-2 text-[11px] font-medium text-sky-200">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Real-time Active</span>
              </span>
              <span>•</span>
              <span className="text-orange-300 font-bold">✨ Tìm phòng gần biển, an tâm giá tốt</span>
            </div>
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      {isAuthOpen && (
        <AuthModal
          onClose={() => setIsAuthOpen(false)}
          onSuccess={(u) => {
            setUser(u);
            setIsAuthOpen(false);
          }}
        />
      )}

      {/* My Rooms Modal */}
      {isMyRoomsOpen && (
        <MyRoomsModal onClose={() => setIsMyRoomsOpen(false)} />
      )}

      {/* Post Room Modal */}
      {isPostOpen && (
        <PostRoomModal
          onClose={() => setIsPostOpen(false)}
          defaultCategory={currentCategory}
          onSuccess={() => {
            setIsPostOpen(false);
            if (onRefresh) onRefresh();
            else router.refresh();
          }}
        />
      )}

      {/* Saved Rooms Drawer */}
      {isSavedOpen && (
        <SavedRoomsDrawer
          onClose={() => setIsSavedOpen(false)}
          onOpenCompare={(toCompare) => {
            try {
              localStorage.setItem("compare_rooms", JSON.stringify(toCompare));
              window.dispatchEvent(new Event("storage_compare_rooms"));
              window.dispatchEvent(new CustomEvent("open_compare_modal", { detail: toCompare }));
            } catch {}
          }}
        />
      )}

      {/* User Profile Modal */}
      {isProfileOpen && user && (
        <UserProfileModal
          user={user}
          savedCount={savedCount}
          onClose={() => setIsProfileOpen(false)}
          onOpenVerify={(method) => {
            setIsProfileOpen(false);
            handleOpenVerify(method);
          }}
          onOpenMyRooms={() => {
            setIsProfileOpen(false);
            setIsMyRoomsOpen(true);
          }}
          onUserUpdated={(updatedUser) => {
            setUser(updatedUser);
          }}
        />
      )}

      {/* Verify Account OTP Modal */}
      {isVerifyOpen && user && (
        <VerifyAccountModal
          userPhone={user.phone}
          userEmail={user.email}
          isPhoneVerified={user.isVerified}
          isEmailVerified={user.isEmailVerified}
          initialMethod={verifyInitialMethod}
          isPostRequired={isVerifyPostRequired}
          onClose={() => {
            setIsVerifyOpen(false);
            setIsVerifyPostRequired(false);
          }}
          onSuccess={() => {
            setIsVerifyOpen(false);
            checkUser();
            if (isVerifyPostRequired) {
              setIsVerifyPostRequired(false);
              setIsPostOpen(true);
            }
          }}
        />
      )}

      {/* Floating Alert docked at edge of screen for unverified accounts */}
      <UnverifiedFloatingAlert
        user={user}
        onOpenVerify={(method) => handleOpenVerify(method || "phone")}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Radar Săn Phòng Nóng Modal */}
      {isAlertOpen && (
        <RoomAlertModal onClose={() => setIsAlertOpen(false)} />
      )}

      {/* ================= MOBILE BOTTOM NAVIGATION BAR ================= */}
      {!isDetailPage && (
        <nav
          className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-md border-t border-gray-200 dark:border-slate-800 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] px-2 py-1 flex items-center justify-around"
          aria-label="Thanh điều hướng di động"
        >
          {/* 1. Trang chủ */}
          <Link
            href="/"
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
              pathname === "/" && !searchParams.get("category")
                ? "text-[#0284C7] dark:text-sky-400 font-black"
                : "text-gray-500 dark:text-slate-400 hover:text-gray-900 font-semibold"
            }`}
          >
            <span className="text-xl">🏠</span>
            <span className="text-[10px] mt-0.5">Trang chủ</span>
          </Link>

          {/* 2. Săn phòng Radar */}
          <button
            type="button"
            onClick={() => setIsAlertOpen(true)}
            className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-gray-500 dark:text-slate-400 hover:text-gray-900 transition-all font-semibold cursor-pointer relative"
          >
            <span className="text-xl">🔔</span>
            <span className="text-[10px] mt-0.5">Săn phòng</span>
            <span className="absolute top-1 right-2.5 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </button>

          {/* 3. Nút ĐĂNG TIN (Chính giữa nhô cao) */}
          <button
            type="button"
            onClick={handleOpenPost}
            className="-mt-5 flex flex-col items-center justify-center group cursor-pointer"
            title="Đăng tin cho thuê hoặc tìm ở ghép"
          >
            <div className="w-12 h-12 rounded-full bg-linear-to-tr from-[#FF7A00] via-[#FF6000] to-[#FF4500] text-white flex items-center justify-center shadow-lg shadow-orange-500/40 border-3 border-white dark:border-[#0f172a] transform active:scale-95 group-hover:scale-105 transition-all">
              <svg className="w-6 h-6 stroke-white" fill="none" viewBox="0 0 24 24" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-[10px] font-black text-[#FF7A00] mt-0.5">ĐĂNG TIN</span>
          </button>

          {/* 4. Tin đã lưu */}
          <button
            type="button"
            onClick={() => setIsSavedOpen(true)}
            className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-gray-500 dark:text-slate-400 hover:text-gray-900 transition-all font-semibold cursor-pointer relative"
          >
            <span className="text-xl">❤️</span>
            <span className="text-[10px] mt-0.5">Đã lưu</span>
            {savedCount > 0 && (
              <span className="absolute top-0.5 right-1.5 bg-[#D0021B] text-white text-[9px] font-black px-1.5 py-0.2 rounded-full min-w-4 text-center">
                {savedCount}
              </span>
            )}
          </button>

          {/* 5. Tài khoản / Cá nhân */}
          <button
            type="button"
            onClick={() => {
              if (user) {
                setIsProfileOpen(true);
              } else {
                setIsAuthOpen(true);
              }
            }}
            className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-gray-500 dark:text-slate-400 hover:text-gray-900 transition-all font-semibold cursor-pointer"
          >
            {user ? (
              <div className="w-6 h-6 rounded-full bg-[#FF7A00] text-white text-[11px] font-black flex items-center justify-center overflow-hidden border border-white shadow-2xs">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
            ) : (
              <span className="text-xl">👤</span>
            )}
            <span className="text-[10px] mt-0.5">{user ? "Cá nhân" : "Đăng nhập"}</span>
          </button>
        </nav>
      )}
    </>
  );
}
