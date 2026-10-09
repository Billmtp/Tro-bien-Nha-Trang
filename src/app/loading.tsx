"use client";

import { useState, useEffect } from "react";

const NHA_TRANG_TIPS = [
  "🌴 Đang rà soát phòng trọ tại các phường: Vĩnh Hải, Vĩnh Phước, Lộc Thọ, Phước Hải...",
  "📡 Đang kết nối dữ liệu trực tiếp từ 6 Hội nhóm Facebook Nha Trang & Chợ Tốt...",
  "🛡️ Hệ thống tự động lọc tin trùng lặp và xác minh số điện thoại chính chủ...",
  "💡 Mẹo: Những bài đăng có Tích Xanh đã được xác thực danh tính qua OTP SMS hoặc Gmail.",
  "🌊 Khu vực gần biển Trần Phú & Đại học Nha Trang đang có nhiều phòng giá tốt mới cập nhật...",
];

export default function Loading() {
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % NHA_TRANG_TIPS.length);
    }, 2400);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#F4F4F4]">
      {/* Header Skeleton */}
      <div className="bg-[#FFBA00] sticky top-0 z-40 border-b border-[#EAA800] px-4 py-2.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-[#222222] text-[#FFBA00] font-black text-lg px-2.5 py-1 rounded">
              CHO<span className="text-white ml-0.5">TOT</span>
              <span className="text-[10px] ml-1.5 px-1 bg-[#FF7A00] text-white rounded font-bold uppercase">
                Trọ Nha Trang
              </span>
            </div>
          </div>
          <div className="flex-1 max-w-xl hidden sm:block">
            <div className="h-9 bg-white/70 rounded-full animate-pulse"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-18 h-8 bg-white/50 rounded-full animate-pulse"></div>
            <div className="w-24 h-8 bg-[#FF7A00]/70 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-4 space-y-4">
        {/* Engaging Central Interactive Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-amber-200/80 text-center relative overflow-hidden">
          {/* Background subtle coastal waves */}
          <div className="absolute inset-0 bg-linear-to-b from-amber-50/50 via-white to-orange-50/30 pointer-events-none"></div>

          <div className="relative z-10 max-w-lg mx-auto flex flex-col items-center">
            {/* Animated Radar Scanning Element */}
            <div className="relative mb-5">
              {/* Outer pulsing ripples */}
              <div className="absolute -inset-4 rounded-full bg-amber-400/20 animate-ping"></div>
              <div className="absolute -inset-2 rounded-full bg-[#FF7A00]/20 animate-pulse"></div>

              {/* Central Radar Circle */}
              <div className="relative w-20 h-20 rounded-full bg-linear-to-tr from-[#FF7A00] to-[#FFBA00] flex items-center justify-center text-white text-3xl shadow-lg border-3 border-white">
                <span className="animate-bounce">🏠</span>
              </div>

              {/* Floating Nha Trang Sea Emoji Badges */}
              <div className="absolute -top-1 -right-2 bg-white rounded-full p-1 shadow-md text-sm animate-bounce" style={{ animationDelay: "150ms" }}>
                🌊
              </div>
              <div className="absolute -bottom-1 -left-2 bg-white rounded-full p-1 shadow-md text-sm animate-bounce" style={{ animationDelay: "300ms" }}>
                🔍
              </div>
            </div>

            {/* Title & Subtitle */}
            <h2 className="text-base sm:text-lg font-black text-gray-900 tracking-tight mb-1 flex items-center gap-2">
              <span>Đang dò tìm phòng trọ tại Nha Trang</span>
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-[#FF7A00] rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="w-1.5 h-1.5 bg-[#FF7A00] rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="w-1.5 h-1.5 bg-[#FF7A00] rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
              </span>
            </h2>

            <p className="text-xs text-gray-500 mb-4">
              Kết nối hệ thống thời gian thực • Dữ liệu cập nhật từ các nguồn uy tín
            </p>

            {/* Smooth Progress Bar */}
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden mb-4 shadow-inner">
              <div className="h-full bg-linear-to-r from-[#FFBA00] via-[#FF7A00] to-[#E65100] rounded-full animate-[indeterminate_1.5s_infinite_linear]"></div>
            </div>

            {/* Rotating Nha Trang Discovery Tip */}
            <div className="bg-amber-50/80 border border-amber-200/90 rounded-xl px-4 py-2.5 text-xs text-amber-900 font-medium transition-all duration-300 min-h-[46px] flex items-center justify-center">
              <span>{NHA_TRANG_TIPS[tipIndex]}</span>
            </div>
          </div>
        </div>

        {/* Skeleton Filters */}
        <div className="bg-white rounded-xl p-3.5 border border-gray-200/80 shadow-2xs space-y-2.5">
          <div className="flex flex-wrap gap-2">
            <div className="h-8 w-32 bg-gray-200/80 rounded-lg animate-pulse"></div>
            <div className="h-8 w-28 bg-gray-200/80 rounded-lg animate-pulse"></div>
            <div className="h-8 w-28 bg-gray-200/80 rounded-lg animate-pulse"></div>
            <div className="h-8 w-36 bg-gray-200/80 rounded-lg animate-pulse"></div>
          </div>
        </div>

        {/* Skeleton Room Cards List */}
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200/80 shadow-2xs flex flex-col sm:flex-row gap-3 sm:gap-4 animate-pulse"
            >
              {/* Thumbnail skeleton */}
              <div className="w-full sm:w-44 h-36 bg-gray-200 rounded-lg shrink-0"></div>

              {/* Content skeleton */}
              <div className="flex-1 space-y-2.5 py-1">
                <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                <div className="h-4 bg-gray-200 rounded w-3/5"></div>
                <div className="flex items-center gap-3 pt-2">
                  <div className="h-5 bg-amber-200/60 rounded w-28"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="h-3 bg-gray-100 rounded w-2/3 pt-2"></div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Tailwind indeterminate animation style */}
      <style jsx>{`
        @keyframes indeterminate {
          0% {
            margin-left: 0%;
            width: 30%;
          }
          50% {
            margin-left: 40%;
            width: 60%;
          }
          100% {
            margin-left: 100%;
            width: 10%;
          }
        }
      `}</style>
    </div>
  );
}
