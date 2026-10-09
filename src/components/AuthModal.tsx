"use client";

import { useState } from "react";
import CaptchaVerification from "./CaptchaVerification";

export default function AuthModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (user: any) => void;
}) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [formData, setFormData] = useState({
    phone: "",
    name: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isCaptchaValid, setIsCaptchaValid] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (mode === "register" && !isCaptchaValid) {
      setError("Vui lòng hoàn thành xác thực mã Captcha bảo mật.");
      return;
    }

    setLoading(true);

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Thao tác không thành công");

      window.dispatchEvent(new Event("auth_state_changed"));
      onSuccess(data.user);
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-lg font-bold w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100"
        >
          ✕
        </button>

        {/* Chotot Brand Icon */}
        <div className="text-center mb-5">
          <div className="bg-[#222222] text-[#FFBA00] font-black text-xl px-3 py-1 rounded inline-block tracking-tight mb-2">
            <span>CHO</span>
            <span className="text-white ml-0.5">TOT</span>
          </div>
          <h3 className="font-bold text-lg text-[#222222]">
            {mode === "login" ? "Đăng nhập tài khoản" : "Tạo tài khoản mới"}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {mode === "login"
              ? "Để đăng tin và quản lý phòng trọ của bạn"
              : "Tham gia cộng đồng phòng trọ Nha Trang"}
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-gray-200 mb-4">
          <button
            type="button"
            onClick={() => { setMode("login"); setError(""); }}
            className={`flex-1 py-2 text-xs font-bold transition-colors border-b-2 ${
              mode === "login"
                ? "border-[#FFBA00] text-[#222222]"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => { setMode("register"); setError(""); }}
            className={`flex-1 py-2 text-xs font-bold transition-colors border-b-2 ${
              mode === "register"
                ? "border-[#FFBA00] text-[#222222]"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            Đăng ký
          </button>
        </div>

        {error && (
          <div className="mb-4 p-2.5 bg-red-50 text-[#D0021B] rounded-lg text-xs font-medium border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === "register" && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Họ và tên
              </label>
              <input
                type="text"
                required
                placeholder="Vd: Nguyễn Văn A"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-[#FF7A00] focus:ring-1 focus:ring-[#FF7A00] outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Số điện thoại
            </label>
            <input
              type="tel"
              required
              placeholder="0912 345 678"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-[#FF7A00] focus:ring-1 focus:ring-[#FF7A00] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Mật khẩu
            </label>
            <input
              type="password"
              required
              placeholder="Ít nhất 6 ký tự"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-[#FF7A00] focus:ring-1 focus:ring-[#FF7A00] outline-none"
            />
          </div>
          {mode === "register" && (
            <div className="pt-1">
              <CaptchaVerification onVerify={(valid) => setIsCaptchaValid(valid)} />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl font-bold text-sm bg-[#FFBA00] hover:bg-[#EAA800] text-[#222222] transition-colors shadow-sm mt-2 disabled:opacity-50"
          >
            {loading ? "Đang xử lý..." : mode === "login" ? "ĐĂNG NHẬP" : "ĐĂNG KÝ NGAY"}
          </button>
        </form>

        <div className="mt-4 text-center text-xs text-gray-400">
          Bằng việc tiếp tục, bạn đồng ý với Quy chế hoạt động của Chợ Tốt Trọ Nha Trang.
        </div>
      </div>
    </div>
  );
}
