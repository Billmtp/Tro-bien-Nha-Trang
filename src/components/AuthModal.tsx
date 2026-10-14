"use client";

import { useState } from "react";
import Image from "next/image";
import { showAppAlert } from "./AppNotificationModal";

export default function AuthModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (user: any) => void;
}) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [fullName, setFullName] = useState("");
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isStudentEmail = identity.toLowerCase().includes(".edu.vn");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const cleanIdentity = identity.trim();
    if (!cleanIdentity) {
      setError("Vui lòng nhập số điện thoại hoặc email trường.");
      return;
    }
    if (!password || password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
    if (mode === "register" && !fullName.trim()) {
      setError("Vui lòng nhập họ và tên của bạn.");
      return;
    }

    setLoading(true);

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload: Record<string, string> = {
        phone: cleanIdentity,
        password,
      };
      if (mode === "register") {
        payload.name = fullName.trim();
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Thao tác không thành công");

      window.dispatchEvent(new Event("auth_state_changed"));
      onSuccess(data.user);
    } catch (err: any) {
      setError(err?.message || "Đã xảy ra lỗi.");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = (provider: string) => {
    showAppAlert(
      `Đang liên kết xác thực nhanh qua ${provider}... Vui lòng cấp quyền truy cập để tiếp tục.`,
      `Xác thực ${provider}`,
      "info"
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm sm:max-w-md bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/80 overflow-hidden flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Coastal ambient banner bar */}
        <div className="relative h-24 w-full overflow-hidden shrink-0">
          <Image
            src="/images/coastal-login-bg.png"
            alt="Nha Trang Coastal"
            fill
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#006194]/40 via-[#006194]/60 to-white/95" />

          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Đóng"
            className="absolute top-3 right-3 text-white/90 hover:text-white bg-black/30 hover:bg-black/50 text-base font-bold w-8 h-8 rounded-full flex items-center justify-center transition-all z-10"
          >
            ✕
          </button>
        </div>

        {/* Brand Sun Crest Emblem overlapping banner */}
        <div className="relative px-5 pt-0 pb-5 sm:px-6 flex flex-col items-center">
          <div className="-mt-10 relative flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-md border-2 border-white mb-2 shrink-0">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#006194] via-[#007bb9] to-[#fd761a] flex items-center justify-center shadow-inner text-xl">
              🌊
            </div>
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#fd761a] text-white text-[10px] font-bold shadow-xs">
              ☀️
            </span>
          </div>

          <div className="text-center mb-3">
            <div className="flex items-center gap-1.5 justify-center">
              <h3 className="font-extrabold text-lg sm:text-xl text-slate-900">
                Trọ Biển Nha Trang
              </h3>
              <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center">
                ✓
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Nền tảng tìm trọ sinh viên &amp; an cư ven biển Nha Trang
            </p>
          </div>

          {/* Tab Switcher (Stitch Pill Style) */}
          <div className="w-full grid grid-cols-2 p-1 bg-slate-100 rounded-full mb-3 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError("");
              }}
              className={`py-1.5 rounded-full transition-all flex items-center justify-center gap-1 ${
                mode === "login"
                  ? "bg-[#006194] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>Đăng nhập</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError("");
              }}
              className={`py-1.5 rounded-full transition-all flex items-center justify-center gap-1 ${
                mode === "register"
                  ? "bg-[#006194] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>Đăng ký mới</span>
            </button>
          </div>

          {error && (
            <div className="w-full mb-3 p-2.5 bg-red-50 text-red-700 rounded-xl text-xs font-medium border border-red-200 flex items-start gap-1.5">
              <span className="font-bold">⚠️</span>
              <span className="flex-1">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="w-full space-y-3">
            {mode === "register" && (
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                  Họ và tên
                </label>
                <input
                  type="text"
                  required
                  placeholder="Vd: Nguyễn Văn An"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm bg-slate-50 focus:bg-white focus:border-[#006194] outline-hidden transition-all shadow-2xs"
                />
              </div>
            )}

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  {mode === "login" ? "Số điện thoại hoặc Email trường" : "Email sinh viên hoặc Số điện thoại"}
                </label>
                {isStudentEmail && (
                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1 rounded-sm">
                    ✓ Nhận Tích Xanh
                  </span>
                )}
              </div>
              <input
                type="text"
                required
                placeholder="0912... hoặc an.nv@ntu.edu.vn"
                value={identity}
                onChange={(e) => setIdentity(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm bg-slate-50 focus:bg-white focus:border-[#006194] outline-hidden transition-all shadow-2xs"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  Mật khẩu
                </label>
                {mode === "register" && (
                  <span className="text-[10px] text-emerald-600 font-semibold">Tối thiểu 6 ký tự</span>
                )}
              </div>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Nhập mật khẩu an toàn"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl pl-3 pr-9 py-2 text-xs sm:text-sm bg-slate-50 focus:bg-white focus:border-[#006194] outline-hidden transition-all shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Ẩn hiện mật khẩu"
                  className="absolute right-2.5 text-slate-400 hover:text-slate-600 text-xs p-1"
                >
                  {showPassword ? "👁️" : "🙈"}
                </button>
              </div>
            </div>

            {mode === "login" && (
              <div className="flex items-center justify-between pt-0.5 text-xs text-slate-600">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-[#006194] accent-[#006194]"
                  />
                  <span>Ghi nhớ</span>
                </label>
                <button
                  type="button"
                  onClick={() =>
                    showAppAlert(
                      "Vui lòng nhập Email hoặc SĐT trường đã đăng ký để nhận mã OTP lấy lại mật khẩu tức thì!",
                      "Quên mật khẩu",
                      "info"
                    )
                  }
                  className="text-[#006194] font-semibold hover:underline"
                >
                  Quên mật khẩu?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-full font-bold text-xs sm:text-sm bg-gradient-to-r from-[#006194] via-[#007bb9] to-[#0284C7] hover:from-[#00527c] hover:to-[#0274b0] text-white shadow-md active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60"
            >
              {loading ? "Đang xử lý..." : mode === "login" ? "ĐĂNG NHẬP NGAY →" : "TẠO TÀI KHOẢN MỚI ✓"}
            </button>
          </form>

          {/* Student Verification Benefit Ribbon */}
          <div className="w-full mt-3 rounded-xl p-2.5 bg-emerald-50 border border-emerald-200/80 flex items-start gap-2.5 text-left">
            <span className="text-base">🎓</span>
            <div className="text-[11px] leading-tight text-emerald-900">
              <span className="font-bold">Đặc quyền Sinh viên NTU, UKH, CĐSP:</span> Đăng ký bằng email trường để tự động nhận <strong>Tích Xanh</strong> &amp; miễn phí cọc giữ phòng.
            </div>
          </div>

          {/* Social login buttons */}
          <div className="w-full mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSocialAuth("Google")}
              className="flex-1 py-1.5 px-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-all shadow-2xs"
            >
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
              </svg>
              <span>Google</span>
            </button>
            <button
              type="button"
              onClick={() => handleSocialAuth("Zalo")}
              className="flex-1 py-1.5 px-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-all shadow-2xs"
            >
              <div className="w-4 h-4 rounded-xs bg-[#0068ff] flex items-center justify-center text-white font-black text-[8px]">
                Z
              </div>
              <span>Zalo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
