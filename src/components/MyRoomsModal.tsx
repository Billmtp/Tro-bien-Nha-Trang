"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { showAppAlert, showAppConfirm } from "./AppNotificationModal";

interface Room {
  id: number;
  title: string;
  price: number | null;
  area: number | null;
  district: string | null;
  images: string[];
  isActive: boolean;
  scrapedAt: string;
}

function formatPrice(price: number | null): string {
  if (!price) return "Thỏa thuận";
  if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(1).replace(".0", "")} tr/tháng`;
  return `${price.toLocaleString("vi")} đ/tháng`;
}

export default function MyRoomsModal({ onClose }: { onClose: () => void }) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyRooms = async () => {
    try {
      const res = await fetch("/api/rooms/my");
      const data = await res.json();
      if (res.ok) setRooms(data.rooms || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRooms();
  }, []);

  const toggleActive = async (id: number, currentActive: boolean) => {
    try {
      const res = await fetch("/api/rooms/my", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !currentActive }),
      });
      if (res.ok) {
        setRooms((prev) =>
          prev.map((r) => (r.id === id ? { ...r, isActive: !currentActive } : r))
        );
      }
    } catch (err) {
      showAppAlert("Lỗi khi cập nhật trạng thái tin.", "Lỗi", "error");
    }
  };

  const handleDelete = async (id: number) => {
    showAppConfirm("Bạn có chắc chắn muốn xóa vĩnh viễn tin đăng này không?", {
      title: "Xác nhận xóa tin",
      confirmText: "Xóa vĩnh viễn",
      type: "error",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/rooms/my?id=${id}`, { method: "DELETE" });
          if (res.ok) {
            setRooms((prev) => prev.filter((r) => r.id !== id));
            showAppAlert("Đã xóa bài đăng thành công.", "Đã xóa", "success");
          }
        } catch {
          showAppAlert("Lỗi khi xóa tin.", "Lỗi", "error");
        }
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4 shrink-0">
          <div>
            <h3 className="font-bold text-lg text-[#222222]">Tin Đăng Của Tôi</h3>
            <p className="text-xs text-gray-500">Quản lý và cập nhật trạng thái các phòng trọ bạn đã đăng</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg font-bold w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        {/* List content */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {loading ? (
            <div className="py-12 text-center text-gray-400 text-sm">Đang tải danh sách tin...</div>
          ) : rooms.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <span className="text-4xl block mb-2">📋</span>
              <p className="text-sm">Bạn chưa đăng tin phòng trọ nào.</p>
              <p className="text-xs text-gray-400 mt-1">Bấm nút "ĐĂNG TIN" màu cam trên thanh menu để tạo bài đăng đầu tiên.</p>
            </div>
          ) : (
            rooms.map((room) => (
              <div
                key={room.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-gray-50 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-16 h-16 relative rounded-lg overflow-hidden bg-gray-200 shrink-0">
                    <Image
                      src={room.images && room.images.length > 0 ? room.images[0] : "/placeholders/default-room.svg"}
                      alt={room.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="min-w-0">
                    <Link
                      href={`/phong/${room.id}`}
                      onClick={onClose}
                      className="font-bold text-xs sm:text-sm text-[#222222] hover:text-[#FF7A00] line-clamp-1 block"
                    >
                      {room.title}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[#D0021B] font-bold text-xs">
                        {formatPrice(room.price)}
                      </span>
                      <span className="text-xs text-gray-400">• {room.district}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          room.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {room.isActive ? "Đang hiển thị" : "Đã cho thuê / Ẩn"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => toggleActive(room.id, room.isActive)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                      room.isActive
                        ? "border-amber-400 bg-amber-50 text-amber-800 hover:bg-amber-100"
                        : "border-green-400 bg-green-50 text-green-800 hover:bg-green-100"
                    }`}
                  >
                    {room.isActive ? "Đánh dấu đã thuê" : "Mở hiển thị lại"}
                  </button>
                  <button
                    onClick={() => handleDelete(room.id)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
