"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ScanRoomsModal from "./ScanRoomsModal";

export default function LiveUpdateBanner({ category = "rent" }: { category?: string }) {
  const router = useRouter();
  const [newCount, setNewCount] = useState(0);
  const [initialTime, setInitialTime] = useState<string>("");
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [lastCheckText, setLastCheckText] = useState("Vừa xong");

  useEffect(() => {
    // Lưu mốc thời gian khi người dùng mở trang
    const now = new Date().toISOString();
    setInitialTime(now);

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/rooms/live-feed?since=${encodeURIComponent(now)}&category=${category}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.newCount > 0) {
          setNewCount(data.newCount);
        }
        setLastCheckText("Vừa xong");
      } catch {}
    }, 25_000); // Kiểm tra mỗi 25 giây

    return () => clearInterval(interval);
  }, [category]);

  const handleRefresh = () => {
    setNewCount(0);
    setInitialTime(new Date().toISOString());
    router.refresh();
  };

  return (
    <div className="space-y-2 mb-3">
      {/* Real-time Status Strip */}
      <div className="flex items-center justify-between bg-linear-to-r from-sky-50/90 via-white to-teal-50/80 px-4 py-2.5 rounded-xl border border-sky-200/90 text-xs text-sky-950 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="font-bold text-sky-950">Cập nhật trực tiếp (Real-time)</span>
          <span className="text-sky-300 hidden sm:inline">•</span>
          <span className="text-sky-800 text-[11px] font-medium hidden sm:inline">
            Tự động đồng bộ tin mới đa nguồn khắp toàn Nha Trang mỗi 4 phút
          </span>
        </div>

        <button
          onClick={() => setIsScanModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-linear-to-r from-[#0284C7] to-[#0369A1] hover:from-[#0369A1] hover:to-[#075985] text-white border border-sky-300 font-bold transition-all text-[11px] shadow-xs cursor-pointer transform active:scale-95"
          title="Mở bộ quét tin đa nguồn thời gian thực"
        >
          <span className="text-xs">📡</span>
          <span>Quét ngay</span>
        </button>
      </div>

      {/* Floating Alert Banner khi có tin mới */}
      {newCount > 0 && (
        <div className="bg-[#FFF4D6] border-2 border-[#FFBA00] text-[#7A4B00] px-4 py-3 rounded-xl flex items-center justify-between gap-3 shadow-md animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold">
            <span className="text-base animate-bounce">⚡</span>
            <span>
              Có <span className="text-[#D0021B] font-extrabold text-sm sm:text-base">{newCount}</span> bài đăng mới vừa xuất hiện tại Nha Trang!
            </span>
          </div>
          <button
            onClick={handleRefresh}
            className="px-3.5 py-1.5 bg-[#FF7A00] hover:bg-[#E66E00] text-white font-bold text-xs rounded-lg shadow-sm transition-all transform active:scale-95 shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <span>Tải tin mới</span>
            <span>↻</span>
          </button>
        </div>
      )}

      {/* Modal Quét Tin Đa Nguồn */}
      {isScanModalOpen && (
        <ScanRoomsModal
          category={category}
          onClose={() => setIsScanModalOpen(false)}
          onSuccess={() => {
            setInitialTime(new Date().toISOString());
            setLastCheckText("Vừa xong");
          }}
        />
      )}
    </div>
  );
}
