"use client";

import Image from "next/image";
import { CompareRoomItem } from "./CompareRoomsModal";

export default function FloatingCompareBar({
  compareRooms,
  onOpenModal,
  onClearAll,
  onRemoveRoom,
}: {
  compareRooms: CompareRoomItem[];
  onOpenModal: () => void;
  onClearAll: () => void;
  onRemoveRoom: (id: number) => void;
}) {
  if (compareRooms.length === 0) return null;

  return (
    <div className="fixed bottom-18 md:bottom-5 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl px-3 animate-in slide-in-from-bottom duration-200">
      <div className="bg-[#222222]/95 backdrop-blur-md text-white rounded-2xl p-3 sm:p-3.5 shadow-2xl border border-amber-400/40 flex items-center justify-between gap-3">
        {/* Left: Room Thumbnails & Info */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex -space-x-2 shrink-0">
            {compareRooms.map((r) => (
              <div
                key={r.id}
                className="relative w-10 h-10 rounded-xl overflow-hidden border-2 border-white bg-gray-800 shadow-md group"
              >
                <Image
                  src={r.image || "/placeholders/default-room.svg"}
                  alt={r.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={() => onRemoveRoom(r.id)}
                  className="absolute inset-0 bg-red-600/80 text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                  title="Bỏ phòng"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-black text-amber-300">
                So sánh {compareRooms.length}/3 phòng
              </span>
              <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1.5 py-0.2 rounded-full font-bold">
                Mới
              </span>
            </div>
            <p className="text-[11px] text-gray-300 truncate hidden sm:block">
              {compareRooms.length === 1
                ? "Chọn thêm 1-2 phòng nữa để bắt đầu so sánh"
                : "Bấm nút bên cạnh để xem bảng phân tích chi tiết"}
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onClearAll}
            className="text-gray-400 hover:text-white text-xs px-2 py-1.5 rounded-lg transition-colors"
            title="Hủy bỏ"
          >
            Bỏ chọn
          </button>

          <button
            type="button"
            onClick={onOpenModal}
            className="bg-linear-to-r from-[#FF7A00] to-amber-500 hover:from-[#E66E00] hover:to-amber-600 text-white font-black text-xs sm:text-sm px-4 py-2 rounded-xl shadow-md transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <span>⚖️ So sánh ngay</span>
            <span className="text-xs">➜</span>
          </button>
        </div>
      </div>
    </div>
  );
}
