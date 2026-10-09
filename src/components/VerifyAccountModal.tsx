"use client";

import { useState } from "react";

export default function VerifyAccountModal({
  userPhone,
  userEmail,
  isPhoneVerified = false,
  isEmailVerified = false,
  initialMethod = "email",
  isPostRequired = false,
  onClose,
  onSuccess,
}: {
  userPhone: string;
  userEmail?: string;
  isPhoneVerified?: boolean;
  isEmailVerified?: boolean;
  initialMethod?: "phone" | "email";
  isPostRequired?: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"phone" | "email">(
    isEmailVerified && !isPhoneVerified ? "phone" : initialMethod
  );

  // Phone State
  const [phoneStep, setPhoneStep] = useState<"send" | "verify">("send");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [phoneDemoCode, setPhoneDemoCode] = useState<string | null>(null);

  // Email State
  const [emailInput, setEmailInput] = useState(userEmail || "");
  const [emailStep, setEmailStep] = useState<"send" | "verify">("send");
  const [emailOtp, setEmailOtp] = useState("");
  const [emailDemoCode, setEmailDemoCode] = useState<string | null>(null);

  // Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const isEligible = isPhoneVerified || isEmailVerified;

  // 1. Send Phone OTP
  const handleSendPhoneOtp = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không thể gửi mã OTP.");

      setPhoneDemoCode(data.otpDemo || null);
      setPhoneStep("verify");
    } catch (err: any) {
      setError(err.message || "Lỗi khi gửi OTP tới số điện thoại.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Verify Phone OTP
  const handleVerifyPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!phoneOtp.trim() || phoneOtp.trim().length !== 6) {
      setError("Vui lòng nhập đủ 6 chữ số mã OTP.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp: phoneOtp.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Mã OTP không hợp lệ.");

      setSuccessMsg(data.message || "Xác thực Số điện thoại thành công!");
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Xác thực số điện thoại thất bại.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Send Email OTP
  const handleSendEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!emailInput.trim() || !emailInput.includes("@")) {
      setError("Vui lòng nhập địa chỉ Gmail/Email hợp lệ.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-email-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không thể gửi mã xác thực email.");

      setEmailDemoCode(data.otpDemo || null);
      setEmailStep("verify");
    } catch (err: any) {
      setError(err.message || "Lỗi khi gửi mã xác thực tới Gmail.");
    } finally {
      setLoading(false);
    }
  };

  // 4. Verify Email OTP
  const handleVerifyEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!emailOtp.trim() || emailOtp.trim().length !== 6) {
      setError("Vui lòng nhập đủ 6 chữ số mã OTP.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-email-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp: emailOtp.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Mã OTP email không hợp lệ.");

      setSuccessMsg(data.message || "Xác thực Gmail thành công!");
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Xác thực Gmail thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative my-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 font-bold"
        >
          ✕
        </button>

        {/* Header Alert */}
        <div className="text-center mb-5">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-2 shadow-inner ${
              isPostRequired
                ? "bg-amber-100 text-amber-600 border border-amber-200"
                : "bg-blue-100 text-blue-600 border border-blue-200"
            }`}
          >
            {isPostRequired ? "⚠️" : "🛡️"}
          </div>

          <h3 className="text-lg font-black text-gray-900">
            {isPostRequired
              ? "Yêu Cầu Xác Thực Tài Khoản Để Đăng Tin"
              : "Xác Thực Danh Tính Tài Khoản"}
          </h3>

          <p className="text-xs text-gray-600 mt-1 max-w-sm mx-auto leading-relaxed">
            {isPostRequired ? (
              <span>
                Quy định hệ thống: Chỉ những tài khoản đã xác thực{" "}
                <b className="text-blue-600">Số điện thoại (SĐT)</b> hoặc{" "}
                <b className="text-red-600">Gmail</b> mới đủ tư cách đăng tin phòng trọ.
              </span>
            ) : (
              <span>
                Xác thực tài khoản để nhận huy hiệu <b className="text-blue-600">Tích Xanh Uy Tín ✓</b> và đủ điều kiện đăng tin.
              </span>
            )}
          </p>

          <div className="mt-2 text-[11px] font-semibold text-emerald-700 bg-emerald-50 py-1 px-3 rounded-full border border-emerald-200 inline-block">
            💡 Bạn chỉ cần hoàn thành 1 trong 2 phương thức là đủ điều kiện!
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-xs font-semibold border border-red-200 flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {successMsg ? (
          <div className="p-6 text-center bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 space-y-2 animate-in zoom-in-95">
            <div className="text-4xl">🎉</div>
            <p className="font-black text-base">{successMsg}</p>
            <p className="text-xs text-emerald-600">Tài khoản của bạn đã đủ tư cách đăng tin phòng trọ!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Tabs Switcher: Gmail vs Phone */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("email");
                  setError("");
                }}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === "email"
                    ? "bg-white text-rose-700 shadow-sm font-black"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <span>📧 Tài Khoản Gmail</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold hidden xs:inline">
                  {isEmailVerified ? "✓" : "Free"}
                </span>
                {isEmailVerified && (
                  <span className="text-[10px] bg-rose-100 text-rose-700 px-1 rounded font-black">✓</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("phone");
                  setError("");
                }}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === "phone"
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <span>📱 Số Điện Thoại</span>
                {isPhoneVerified && (
                  <span className="text-[10px] bg-blue-100 text-blue-700 px-1 rounded font-black">✓</span>
                )}
              </button>
            </div>

            {/* TAB 1: SỐ ĐIỆN THOẠI */}
            {activeTab === "phone" && (
              <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-200 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700">Xác thực qua Số Điện Thoại (SMS OTP)</span>
                  {isPhoneVerified ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      ✓ Đã xác thực
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                      Chưa xác thực
                    </span>
                  )}
                </div>

                {isPhoneVerified ? (
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 space-y-1">
                    <p className="font-bold flex items-center gap-1">
                      <span>✓</span> Số điện thoại <b>{userPhone}</b> đã được xác thực chính chủ.
                    </p>
                    <p className="text-[11px] text-emerald-600">
                      Tài khoản của bạn đã đủ điều kiện đăng tin phòng trọ.
                    </p>
                  </div>
                ) : phoneStep === "send" ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-white rounded-xl border border-gray-200 text-xs">
                      <span className="text-gray-500 block text-[11px]">Số điện thoại đăng ký:</span>
                      <span className="font-black text-sm text-gray-900 tracking-wider">{userPhone}</span>
                    </div>

                    <button
                      onClick={handleSendPhoneOtp}
                      disabled={loading}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? "Đang gửi mã..." : "GỬI MÃ OTP XÁC THỰC SĐT"}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleVerifyPhoneOtp} className="space-y-3">
                    {phoneDemoCode && (
                      <div className="p-2.5 bg-amber-50 text-amber-900 border border-amber-300 rounded-xl text-xs">
                        <span className="font-bold">🔔 Mã OTP thử nghiệm (Localhost Demo):</span>{" "}
                        <span className="font-mono font-black text-sm text-[#FF7A00] tracking-widest bg-white px-2 py-0.5 rounded border border-amber-200 ml-1">
                          {phoneDemoCode}
                        </span>
                      </div>
                    )}

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1 text-center">
                        Nhập 6 chữ số mã OTP gửi đến {userPhone}
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        autoFocus
                        placeholder="000000"
                        value={phoneOtp}
                        onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, ""))}
                        className="w-full text-center tracking-[0.5em] text-lg font-mono font-black py-2 border-2 border-blue-400 rounded-xl focus:border-blue-600 outline-none bg-white"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleSendPhoneOtp}
                        disabled={loading}
                        className="w-1/3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-200 bg-white border border-gray-200 rounded-xl transition-colors"
                      >
                        Gửi lại mã
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-2/3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {loading ? "Đang kiểm tra..." : "XÁC NHẬN SĐT ✓"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* TAB 2: GMAIL / EMAIL */}
            {activeTab === "email" && (
              <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-200 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700">Xác thực qua Tài Khoản Gmail (Email OTP)</span>
                  {isEmailVerified ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      ✓ Đã xác thực
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                      Chưa xác thực
                    </span>
                  )}
                </div>

                {isEmailVerified ? (
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 space-y-1">
                    <p className="font-bold flex items-center gap-1">
                      <span>✓</span> Địa chỉ Gmail <b>{userEmail || emailInput}</b> đã được xác thực.
                    </p>
                    <p className="text-[11px] text-emerald-600">
                      Tài khoản của bạn đã đủ điều kiện đăng tin phòng trọ.
                    </p>
                  </div>
                ) : emailStep === "send" ? (
                  <form onSubmit={handleSendEmailOtp} className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                        Nhập địa chỉ Gmail của bạn
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="vidu@gmail.com"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs sm:text-sm bg-white outline-none focus:border-rose-500 font-medium"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? "Đang gửi mã..." : "GỬI MÃ OTP XÁC THỰC GMAIL"}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyEmailOtp} className="space-y-3">
                    {emailDemoCode && (
                      <div className="p-2.5 bg-amber-50 text-amber-900 border border-amber-300 rounded-xl text-xs">
                        <span className="font-bold">🔔 Mã OTP thử nghiệm (Localhost Demo):</span>{" "}
                        <span className="font-mono font-black text-sm text-[#FF7A00] tracking-widest bg-white px-2 py-0.5 rounded border border-amber-200 ml-1">
                          {emailDemoCode}
                        </span>
                      </div>
                    )}

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1 text-center">
                        Nhập 6 chữ số mã OTP gửi đến {emailInput}
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        autoFocus
                        placeholder="000000"
                        value={emailOtp}
                        onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ""))}
                        className="w-full text-center tracking-[0.5em] text-lg font-mono font-black py-2 border-2 border-rose-400 rounded-xl focus:border-rose-600 outline-none bg-white"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleSendEmailOtp}
                        disabled={loading}
                        className="w-1/3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-200 bg-white border border-gray-200 rounded-xl transition-colors"
                      >
                        Gửi lại mã
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-2/3 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {loading ? "Đang kiểm tra..." : "XÁC NHẬN GMAIL ✓"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
