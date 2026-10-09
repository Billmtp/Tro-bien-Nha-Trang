"use client";

import { useState } from "react";

interface UnverifiedFloatingAlertProps {
  user: {
    name: string;
    phone: string;
    email?: string | null;
    isVerified?: boolean;
    isEmailVerified?: boolean;
    role?: string;
  } | null;
  onOpenVerify: (method?: "phone" | "email") => void;
  onOpenProfile: () => void;
}

export default function UnverifiedFloatingAlert({
  user,
  onOpenVerify,
  onOpenProfile,
}: UnverifiedFloatingAlertProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // If no user, or user is already verified (phone or email), or is admin, do not render
  if (
    !user ||
    isDismissed ||
    user.role === "admin" ||
    user.isVerified ||
    user.isEmailVerified
  ) {
    return null;
  }

  return (
    <aside aria-label="Thông báo xác thực tài khoản" className="fixed bottom-18 right-4 sm:bottom-6 sm:right-6 z-40 select-none max-w-[calc(100vw-2rem)]">
      {isMinimized ? (
        /* Minimized State: Floating Pulsing Warning Button */
        <button
          onClick={() => setIsMinimized(false)}
          className="group relative flex items-center gap-2 bg-[#FF7A00] hover:bg-[#E66E00] text-white px-3.5 py-2.5 rounded-full shadow-xl transition-all transform hover:scale-105 active:scale-95 border-2 border-white cursor-pointer"
          title="Nhấn để mở thông báo xác thực tài khoản"
        >
          {/* Pulsing ring indicator */}
          <span className="relative flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-200"></span>
          </span>

          <span className="w-5 h-5 rounded-full bg-white text-[#FF7A00] font-black text-xs flex items-center justify-center shadow-xs">
            !
          </span>

          <span className="text-xs font-bold whitespace-nowrap">
            Xác thực tài khoản !
          </span>
        </button>
      ) : (
        /* Expanded Floating Card */
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border-2 border-amber-400 p-4 w-76 sm:w-84 animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-linear-to-tr from-[#FF7A00] to-amber-400 text-white flex items-center justify-center font-black text-sm shadow-xs animate-bounce">
                  !
                </div>
                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></span>
              </div>
              <div>
                <h4 className="text-xs font-black text-gray-900 tracking-tight flex items-center gap-1">
                  <span>Chưa xác thực tài khoản!</span>
                </h4>
                <p className="text-[10px] text-amber-600 font-semibold">
                  Chỉ cần xác thực 1 lần duy nhất
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-gray-400">
              <button
                onClick={() => setIsMinimized(true)}
                className="hover:text-gray-700 w-5 h-5 rounded flex items-center justify-center text-xs hover:bg-gray-100 font-bold"
                title="Thu nhỏ lại góc màn hình"
              >
                —
              </button>
              <button
                onClick={() => setIsDismissed(true)}
                className="hover:text-red-600 w-5 h-5 rounded flex items-center justify-center text-xs hover:bg-gray-100 font-bold"
                title="Tạm ẩn"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-gray-600 mb-3 leading-relaxed">
            Chào <strong className="text-gray-800">{user.name}</strong>! Hãy xác thực Số điện thoại hoặc Gmail để mở khóa <strong>quyền đăng tin phòng trọ</strong> và nhận <strong>Tích Xanh uy tín</strong>.
          </p>

          {/* Action buttons */}
          <div className="space-y-1.5">
            <button
              onClick={() => onOpenVerify("phone")}
              className="w-full bg-[#FF7A00] hover:bg-[#E66E00] text-white text-xs font-bold py-2 px-3 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>🛡️ Xác thực ngay (OTP)</span>
              <span>→</span>
            </button>

            <div className="flex items-center justify-between pt-1 text-[11px]">
              <button
                onClick={() => onOpenVerify("email")}
                className="text-purple-700 hover:text-purple-900 font-semibold hover:underline"
              >
                ✉️ Xác thực qua Gmail
              </button>

              <button
                onClick={onOpenProfile}
                className="text-gray-500 hover:text-gray-900 font-medium hover:underline"
              >
                Xem chi tiết hồ sơ
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
