"use client";

import { useState, useEffect } from "react";
import { showAppAlert } from "./AppNotificationModal";

export default function RoomAlertModal({ onClose }: { onClose: () => void }) {
  const [district, setDistrict] = useState("Vĩnh Hải");
  const [maxPrice, setMaxPrice] = useState(2000000);
  const [hasAC, setHasAC] = useState(false);
  const [hasMezzanine, setHasMezzanine] = useState(true);
  const [phoneNotify, setPhoneNotify] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("user_room_radar");
      if (saved) {
        const parsed = JSON.parse(saved);
        setDistrict(parsed.district || "Vĩnh Hải");
        setMaxPrice(parsed.maxPrice || 2000000);
        setHasAC(!!parsed.hasAC);
        setHasMezzanine(!!parsed.hasMezzanine);
        setPhoneNotify(parsed.phoneNotify || "");
        setIsSaved(true);
      }
    } catch {}
  }, []);

  const handleSaveRadar = (e: React.FormEvent) => {
    e.preventDefault();
    const config = {
      district,
      maxPrice,
      hasAC,
      hasMezzanine,
      phoneNotify,
      createdAt: new Date().toISOString(),
      active: true,
    };
    try {
      localStorage.setItem("user_room_radar", JSON.stringify(config));
      setIsSaved(true);
      showAppAlert("🎉 Đã kích hoạt Radar săn phòng! Hệ thống sẽ rung chuông và thông báo ngay khi có phòng mới khớp với tiêu chí của bạn.", "Kích hoạt thành công", "success");
      onClose();
    } catch {
      showAppAlert("Lỗi khi lưu cài đặt.", "Lỗi", "error");
    }
  };

  const handleTurnOff = () => {
    localStorage.removeItem("user_room_radar");
    setIsSaved(false);
    showAppAlert("Đã tắt radar săn phòng.", "Đã tắt", "info");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-amber-300 overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-amber-500 via-[#FF7A00] to-orange-500 px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-xl shadow-inner animate-pulse">
              🔔
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg">
                Radar Săn Phòng Trọ Nha Trang
              </h3>
              <p className="text-xs text-amber-100">
                Nhận chuông báo tức thì ngay khi có phòng giá rẻ vừa xuất hiện
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white font-bold flex items-center justify-center text-sm transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSaveRadar} className="p-5 sm:p-6 space-y-4 text-xs">
          {/* Khu vực */}
          <div>
            <label className="font-bold text-gray-700 block mb-1">
              1. Khu vực bạn muốn thuê:
            </label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 font-semibold text-gray-900 outline-none focus:border-[#FF7A00]"
            >
              {[
                "Vĩnh Hải (Gần ĐH Nha Trang)",
                "Vĩnh Phước (Gần biển Hòn Chồng)",
                "Vĩnh Thọ",
                "Lộc Thọ (Trung tâm Phố Tây)",
                "Tân Lập",
                "Phước Long",
                "Phước Hải",
                "Ngọc Hiệp",
              ].map((d) => (
                <option key={d} value={d.split(" ")[0]}>
                  📍 {d}
                </option>
              ))}
            </select>
          </div>

          {/* Mức giá tối đa */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-gray-700">
                2. Mức giá thuê tối đa:
              </label>
              <strong className="text-base text-[#D0021B] font-black">
                {(maxPrice / 1000000).toFixed(1)} triệu / tháng
              </strong>
            </div>
            <input
              type="range"
              min={1000000}
              max={6000000}
              step={100000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[#FF7A00] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
              <span>1 triệu</span>
              <span>3 triệu</span>
              <span>6 triệu</span>
            </div>
          </div>

          {/* Tiện nghi bắt buộc */}
          <div>
            <label className="font-bold text-gray-700 block mb-2">
              3. Tiện nghi bắt buộc phải có:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setHasAC(!hasAC)}
                className={`p-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                  hasAC
                    ? "bg-blue-50 border-blue-400 text-blue-700 shadow-2xs"
                    : "bg-gray-50 border-gray-200 text-gray-600"
                }`}
              >
                <span>❄️</span>
                <span>Có máy lạnh: {hasAC ? "Bắt buộc" : "Không cần"}</span>
              </button>

              <button
                type="button"
                onClick={() => setHasMezzanine(!hasMezzanine)}
                className={`p-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                  hasMezzanine
                    ? "bg-amber-50 border-amber-400 text-amber-800 shadow-2xs"
                    : "bg-gray-50 border-gray-200 text-gray-600"
                }`}
              >
                <span>🪜</span>
                <span>Có gác lửng: {hasMezzanine ? "Bắt buộc" : "Không cần"}</span>
              </button>
            </div>
          </div>

          {/* Số điện thoại / Zalo để nhận thông báo */}
          <div>
            <label className="font-bold text-gray-700 block mb-1">
              4. Số điện thoại Zalo nhận tin nhanh (Tùy chọn):
            </label>
            <input
              type="tel"
              placeholder="VD: 0905 123 456 (để nhận tin khi đóng trình duyệt)"
              value={phoneNotify}
              onChange={(e) => setPhoneNotify(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 font-mono text-gray-900 outline-none focus:border-[#FF7A00]"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-between gap-2">
            {isSaved && (
              <button
                type="button"
                onClick={handleTurnOff}
                className="text-red-500 hover:text-red-700 font-bold text-xs py-2 px-3 rounded-xl transition-colors cursor-pointer"
              >
                Tắt radar
              </button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 font-bold transition-colors cursor-pointer"
              >
                Đóng
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 bg-linear-to-r from-[#FF7A00] to-orange-500 hover:brightness-105 text-white font-black text-xs rounded-xl shadow-md transition-transform active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <span>🔔 Kích hoạt săn phòng</span>
                <span>➔</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
