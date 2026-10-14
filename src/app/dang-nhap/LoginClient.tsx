"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { showAppAlert } from "@/components/AppNotificationModal";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";

  // Auth User Session
  const [user, setUser] = useState<any>(null);
  const [checkingUser, setCheckingUser] = useState(true);
  const [savedCount, setSavedCount] = useState(0);
  const [myRoomsCount, setMyRoomsCount] = useState(0);

  // Auth Form State
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [fullName, setFullName] = useState("");
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Social Auth State
  const [socialLoading, setSocialLoading] = useState(false);

  const isStudentEmail = identity.toLowerCase().includes(".edu.vn");

  const checkUserSession = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        // Load user posted rooms count
        fetch("/api/rooms/my")
          .then((r) => r.json())
          .then((d) => {
            if (Array.isArray(d)) setMyRoomsCount(d.length);
          })
          .catch(() => {});
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setCheckingUser(false);
    }

    try {
      const saved = JSON.parse(localStorage.getItem("saved_rooms") || "[]");
      setSavedCount(saved.length);
    } catch {}
  };

  useEffect(() => {
    checkUserSession();
    window.addEventListener("auth_state_changed", checkUserSession);

    // Xử lý kết quả trả về sau khi đăng nhập Google OAuth chính thức
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("oauth_success")) {
        showAppAlert("Đăng nhập tài khoản Google thành công!", "Google OAuth", "success");
        checkUserSession();
        window.dispatchEvent(new Event("auth_state_changed"));
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
        setTimeout(() => {
          router.push("/");
        }, 500);
      } else if (params.get("error")) {
        showAppAlert(params.get("error") || "Đăng nhập Google thất bại.", "Lỗi xác thực", "error");
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      }
    }

    return () => window.removeEventListener("auth_state_changed", checkUserSession);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const cleanIdentity = identity.trim();
    if (!cleanIdentity) {
      setErrorMessage("Vui lòng nhập số điện thoại hoặc email trường.");
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
    if (authMode === "register" && !fullName.trim()) {
      setErrorMessage("Vui lòng nhập họ và tên của bạn.");
      return;
    }

    setLoading(true);

    try {
      const endpoint = authMode === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload: Record<string, string> = {
        phone: cleanIdentity,
        password: password,
      };
      if (authMode === "register") {
        payload.name = fullName.trim();
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Thao tác xác thực không thành công.");
      }

      window.dispatchEvent(new Event("auth_state_changed"));

      const studentBonus = isStudentEmail
        ? " 🎉 Tài khoản của bạn đã được cấp Tích Xanh sinh viên Nha Trang!"
        : "";

      showAppAlert(
        `${authMode === "login" ? "Đăng nhập thành công!" : "Đăng ký tài khoản thành công!"}${studentBonus}`,
        "Trọ Biển Nha Trang",
        "success"
      );

      if (data.user) {
        setUser(data.user);
      } else {
        await checkUserSession();
      }

      // Tự động chuyển hướng về trang chủ hoặc trang chuyển hướng mong muốn
      const targetDestination = redirectUrl && redirectUrl !== "/dang-nhap" ? redirectUrl : "/";
      setTimeout(() => {
        router.push(targetDestination);
      }, 500);
    } catch (err: any) {
      setErrorMessage(err?.message || "Đã xảy ra lỗi, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      window.dispatchEvent(new Event("auth_state_changed"));
      showAppAlert("Bạn đã đăng xuất tài khoản thành công.", "Đăng xuất", "info");
    } catch (err) {
      console.error("Logout error", err);
    }
  };

  const handleGoogleOAuth = () => {
    setSocialLoading(true);
    // Chuyển hướng trực tiếp tới luồng Google OAuth 2.0 chính thức
    const oauthUrl = `/api/auth/oauth/google?platform=web${
      redirectUrl && redirectUrl !== "/dang-nhap"
        ? `&redirect=${encodeURIComponent(redirectUrl)}`
        : ""
    }`;
    window.location.href = oauthUrl;
  };

  const handleZaloClick = () => {
    showAppAlert(
      "Hệ thống đăng nhập Zalo đang chờ phê duyệt Zalo App ID từ developers.zalo.me. Quý khách vui lòng đăng nhập trực tiếp qua Google (xác thực chính thức 100%) hoặc dùng Số điện thoại/Email!",
      "Zalo Authentication",
      "info"
    );
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden font-sans">
      {/* Top Bar with Home Link & Status */}
      <header className="relative z-10 w-full max-w-xl mx-auto px-4 pt-4 sm:pt-6 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 hover:bg-white text-[#006194] text-xs sm:text-sm font-semibold shadow-sm backdrop-blur-md transition-all active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Trang chủ</span>
        </Link>

        {user ? (
          <button
            onClick={handleLogout}
            className="text-[11px] sm:text-xs font-bold px-3 py-1 rounded-full bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 backdrop-blur-md transition-all cursor-pointer flex items-center gap-1"
          >
            <span>🚪</span>
            <span>Đăng xuất</span>
          </button>
        ) : (
          <span className="text-[11px] sm:text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-800 border border-emerald-500/30 backdrop-blur-md">
            🛡️ Bảo mật SSL 256-bit
          </span>
        )}
      </header>

      {/* Main Interactive Canvas */}
      <main className="relative z-10 w-full max-w-md mx-auto px-4 py-4 sm:py-6 flex flex-col items-center">
        {/* Brand Sun Crest Emblem */}
        <div className="flex flex-col items-center text-center mb-4 sm:mb-5">
          <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-white/95 shadow-md backdrop-blur-md mb-2 group">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-[#fd761a]/30 to-[#007bb9]/30 blur-sm" />
            <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-[#006194] via-[#007bb9] to-[#fd761a] flex items-center justify-center shadow-inner">
              <span className="text-white text-2xl">🌊</span>
            </div>
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#fd761a] text-white text-[10px] font-bold shadow-sm">
              ☀️
            </span>
          </div>

          <div className="flex items-center gap-1.5 justify-center">
            <h1 className="text-2xl sm:text-[26px] font-extrabold text-[#131b2e] tracking-tight">
              Trọ Biển Nha Trang
            </h1>
            <span
              className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#6ffbbe] text-[#002113] shadow-sm text-xs font-bold"
              title="Hệ thống xác thực chính chủ"
            >
              ✓
            </span>
          </div>
          <p className="text-xs sm:text-[13px] text-slate-600 max-w-[300px] mt-1 leading-snug">
            {user
              ? "Tài khoản &amp; Hồ sơ cá nhân sinh viên chính chủ"
              : "Nền tảng tìm trọ sinh viên & an cư ven biển số 1 Nha Trang"}
          </p>
        </div>

        {/* ================= VIEW 1: AUTHENTICATED USER ACCOUNT DASHBOARD ================= */}
        {user ? (
          <div className="w-full bg-white/92 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl border border-white/70 p-5 sm:p-6 flex flex-col gap-4">
            {/* User Profile Info Card */}
            <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#006194] to-[#007bb9] text-white flex items-center justify-center text-2xl font-black shadow-md border-2 border-white shrink-0">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-full" />
                ) : (
                  (user.name || "U").charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 truncate">
                  {user.name || "Người dùng Trọ Biển"}
                </h2>
                <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                  📱 {user.phone || user.email || "Đã đăng nhập"}
                </p>
                {user.email && user.email !== user.phone && (
                  <p className="text-[11px] text-slate-400 truncate">✉️ {user.email}</p>
                )}

                {/* Verification Pill */}
                <div className="mt-1.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <span>🛡️</span>
                  <span>
                    {user.isEmailVerified || (user.email && user.email.includes(".edu.vn"))
                      ? "Tích Xanh Sinh Viên Nha Trang"
                      : "Thành viên chính thức"}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-2 bg-slate-50/80 rounded-2xl p-3 border border-slate-100">
              <div className="text-center">
                <span className="block text-lg font-extrabold text-[#006194]">{savedCount}</span>
                <span className="text-[11px] text-slate-500 font-medium">❤️ Đã lưu</span>
              </div>
              <div className="text-center border-x border-slate-200">
                <span className="block text-lg font-extrabold text-[#006194]">{myRoomsCount}</span>
                <span className="text-[11px] text-slate-500 font-medium">📋 Tin đăng</span>
              </div>
              <div className="text-center">
                <span className="block text-lg font-extrabold text-[#fd761a]">VIP</span>
                <span className="text-[11px] text-slate-500 font-medium">Đặc quyền</span>
              </div>
            </div>

            {/* Actions List */}
            <div className="flex flex-col gap-2.5">
              <Link
                href="/?open_post=true"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FF5500] hover:from-[#FF8800] hover:to-[#FF6600] text-white shadow-md shadow-orange-500/20 font-bold text-xs sm:text-sm transition-all transform active:scale-98"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-sm">➕</span>
                  <div>
                    <span className="block font-bold">Đăng tin cho thuê mới</span>
                    <span className="block text-[11px] text-orange-100 font-normal">Tiếp cận 15,000+ sinh viên Nha Trang</span>
                  </div>
                </div>
                <span>→</span>
              </Link>

              <Link
                href="/"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/90 text-slate-800 font-semibold text-xs sm:text-sm transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-sky-100 text-[#0284C7] flex items-center justify-center text-sm">🏖️</span>
                  <div>
                    <span className="block font-bold">Khám phá phòng trọ quanh trường</span>
                    <span className="block text-[11px] text-slate-500 font-normal">Đo km ĐH Nha Trang &amp; CĐ Kỹ Thuật</span>
                  </div>
                </div>
                <span>→</span>
              </Link>

              {user.role === "admin" && (
                <Link
                  href="/admin"
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 font-bold text-xs sm:text-sm transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-purple-200 text-purple-900 flex items-center justify-center text-sm">⚙️</span>
                    <div>
                      <span className="block font-bold">Trang Quản Trị Hệ Thống (Admin)</span>
                      <span className="block text-[11px] text-purple-600 font-normal">Quản lý duyệt tin, crawler &amp; người dùng</span>
                    </div>
                  </div>
                  <span>→</span>
                </Link>
              )}
            </div>

            {/* Student Privileges Banner */}
            <div className="rounded-xl p-3 bg-emerald-50/90 border border-emerald-200/80 flex flex-col gap-1.5 text-xs text-emerald-900">
              <div className="flex items-center justify-between font-bold text-emerald-950">
                <span>🎓 Đặc quyền sinh viên Nha Trang</span>
                <span className="text-[10px] bg-emerald-200 px-1.5 py-0.5 rounded font-black">2026</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-800">
                <span>✓</span>
                <span>Miễn cọc giữ chỗ qua nền tảng Trọ Biển</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-800">
                <span>✓</span>
                <span>Cam kết chuẩn giá điện nước nhà nước</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-800">
                <span>✓</span>
                <span>Xem bản đồ cốt nền &amp; điểm ngập trước khi thuê</span>
              </div>
            </div>

            {/* Full Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full py-2.5 rounded-xl border border-red-200 bg-red-50/70 hover:bg-red-100 text-red-600 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>🚪</span>
              <span>Đăng xuất khỏi thiết bị này</span>
            </button>
          </div>
        ) : (
          /* ================= VIEW 2: STITCH LOGIN & REGISTER FORM ================= */
          <div className="w-full bg-white/92 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl border border-white/70 p-5 sm:p-6 flex flex-col gap-4">
            {/* Segmented Tab Switcher */}
            <div className="grid grid-cols-2 p-1 bg-slate-100/90 rounded-full relative">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("login");
                  setErrorMessage("");
                }}
                className={`w-full py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 flex items-center justify-center gap-1.5 ${
                  authMode === "login"
                    ? "bg-[#006194] text-white shadow-md"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span>Đăng Nhập</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode("register");
                  setErrorMessage("");
                }}
                className={`w-full py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 flex items-center justify-center gap-1.5 ${
                  authMode === "register"
                    ? "bg-[#006194] text-white shadow-md"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <span>Đăng Ký</span>
              </button>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <span>⚠️</span>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Input Form Fields */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
              {authMode === "register" && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700">Họ và tên của bạn</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-slate-400">👤</span>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Nguyễn Văn An"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white/80 focus:bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006194] transition-all"
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    Số điện thoại hoặc Email trường
                  </label>
                  {isStudentEmail && (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      ✨ Tích Xanh Sinh Viên
                    </span>
                  )}
                </div>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-slate-400">📱</span>
                  <input
                    type="text"
                    required
                    placeholder="0912... hoặc tensv@ntu.edu.vn"
                    value={identity}
                    onChange={(e) => setIdentity(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white/80 focus:bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006194] transition-all"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  💡 Nhập email trường (.edu.vn) để nhận ngay Tích Xanh sinh viên &amp; miễn cọc.
                </p>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700">Mật khẩu</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-slate-400">🔒</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Tối thiểu 6 ký tự"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white/80 focus:bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006194] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              {authMode === "login" && (
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded text-[#006194] focus:ring-[#006194]"
                    />
                    <span>Ghi nhớ đăng nhập</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      showAppAlert("Vui lòng liên hệ ban quản trị qua Zalo hoặc nhập email trường để nhận mã OTP khôi phục mật khẩu.", "Quên mật khẩu", "info");
                    }}
                    className="text-[#006194] font-semibold hover:underline"
                  >
                    Quên mật khẩu?
                  </button>
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 rounded-xl bg-linear-to-r from-[#006194] via-[#007bb9] to-[#006194] hover:from-[#004d77] hover:to-[#006194] text-white font-bold text-sm shadow-md shadow-sky-900/20 flex items-center justify-center gap-2 transition-all transform active:scale-98 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{authMode === "login" ? "Đăng Nhập Ngay" : "Đăng Ký & Nhận Tích Xanh"}</span>
                    <span>→</span>
                  </>
                )}
              </button>
            </form>

            {/* Social Logins */}
            <div className="relative flex py-1 items-center">
              <div className="grow border-t border-slate-200"></div>
              <span className="shrink mx-3 text-slate-400 text-[11px] font-semibold">Hoặc tiếp tục với</span>
              <div className="grow border-t border-slate-200"></div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleGoogleOAuth}
                disabled={socialLoading}
                className="h-10 px-3 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center gap-2 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {socialLoading ? (
                  <span className="w-4 h-4 border-2 border-[#006194] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Google OAuth</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleZaloClick}
                className="h-10 px-3 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center gap-2 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-all active:scale-95 cursor-pointer"
              >
                <span className="text-[#0068ff] font-black">Zalo</span>
                <span>Chat</span>
              </button>
            </div>
          </div>
        )}

        {/* Coastal Trust & Verification Notice */}
        <div className="mt-4 sm:mt-5 flex flex-col items-center text-center gap-1.5">
          <div className="flex items-center gap-1.5 text-slate-600 text-[11px] sm:text-xs font-medium">
            <span className="text-emerald-600 text-sm">🛡️</span>
            <span>Cam kết minh bạch giá điện nước &amp; An tâm mùa mưa bão Nha Trang</span>
          </div>
          <p className="text-[11px] text-slate-500 max-w-[320px]">
            Bằng việc tiếp tục, bạn đồng ý với{" "}
            <Link href="/" className="underline text-[#006194]">
              Điều khoản sử dụng
            </Link>{" "}
            &amp;{" "}
            <Link href="/" className="underline text-[#006194]">
              Chính sách bảo mật Trọ Biển
            </Link>
            .
          </p>
        </div>
      </main>

      {/* Footer minimal safe area */}
      <footer className="relative z-10 w-full text-center py-3 text-[11px] text-slate-400 safe-bottom">
        Trọ Biển Nha Trang © 2026 • Đồng hành cùng sinh viên Khánh Hòa
      </footer>
    </div>
  );
}
