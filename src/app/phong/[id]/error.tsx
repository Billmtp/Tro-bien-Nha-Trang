"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function RoomDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Room detail error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#EEF6FB] px-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-sky-100 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-3xl shadow-xs">
          🏖️
        </div>
        <h2 className="text-lg sm:text-xl font-black text-gray-900 mb-2">
          Không thể tải chi tiết phòng trọ
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 mb-6 leading-relaxed">
          Đường truyền máy chủ hoặc cơ sở dữ liệu tạm thời bận. Bạn có thể nhấn thử lại hoặc quay về danh sách phòng trọ Nha Trang.
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="px-5 py-2.5 rounded-full bg-linear-to-r from-[#FF7A00] to-[#E66E00] text-white text-xs font-bold hover:brightness-105 transition-all shadow-md active:scale-95 cursor-pointer"
          >
            🔄 Thử tải lại
          </button>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-full bg-sky-50 text-[#0284C7] hover:bg-sky-100 border border-sky-200 text-xs font-bold transition-all shadow-2xs"
          >
            🏠 Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
