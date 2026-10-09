"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { calculateCommute, getNhaTrangFloodInsight, detectOwnerType } from "@/lib/nhatrang-helpers";
import { showAppAlert, showAppConfirm } from "./AppNotificationModal";

interface SavedRoom {
  id: number;
  title: string;
  price: number | null;
  area: number | null;
  district: string | null;
  address?: string | null;
  image: string;
  contact?: string | null;
  sourceSite?: string;
  description?: string | null;
  savedAt?: string;
}

function formatPrice(price: number | null): string {
  if (!price) return "Liên hệ";
  if (price >= 1_000_000_000) return `${(price / 1_000_000_000).toFixed(2)} tỷ`;
  if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(1).replace(".0", "")} tr/tháng`;
  return `${(price / 1000).toFixed(0)}k/tháng`;
}

function extractPhone(contact?: string | null): string {
  if (contact && /0\d{8,10}/.test(contact)) {
    const m = contact.match(/0\d{8,10}/);
    if (m) return m[0];
  }
  return "0905 123 456";
}

export default function SavedRoomsDrawer({
  onClose,
  onOpenCompare,
}: {
  onClose: () => void;
  onOpenCompare?: (rooms: SavedRoom[]) => void;
}) {
  const [savedRooms, setSavedRooms] = useState<SavedRoom[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [sortBy, setSortBy] = useState<"newest" | "price_asc" | "price_desc">("newest");
  const [selectedForCompare, setSelectedForCompare] = useState<number[]>([]);
  const [copiedAlert, setCopiedAlert] = useState(false);

  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem("saved_rooms") || "[]");
      setSavedRooms(data);
    } catch {
      setSavedRooms([]);
    }
  }, []);

  const handleRemove = (id: number) => {
    const updated = savedRooms.filter((r) => r.id !== id);
    setSavedRooms(updated);
    setSelectedForCompare((prev) => prev.filter((item) => item !== id));
    localStorage.setItem("saved_rooms", JSON.stringify(updated));
    window.dispatchEvent(new Event("storage_saved_rooms"));
  };

  const handleClearAll = () => {
    showAppConfirm("Bạn có chắc chắn muốn xóa tất cả tin phòng trọ đã lưu?", {
      title: "Xóa danh sách tin đã lưu",
      confirmText: "Xóa tất cả",
      onConfirm: () => {
        localStorage.removeItem("saved_rooms");
        setSavedRooms([]);
        setSelectedForCompare([]);
        window.dispatchEvent(new Event("storage_saved_rooms"));
      },
    });
  };

  const toggleCompareItem = (id: number) => {
    setSelectedForCompare((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= 3) {
        showAppAlert("Bạn chỉ có thể so sánh tối đa 3 phòng cùng lúc.", "Đạt giới hạn so sánh", "warning");
        return prev;
      }
      return [...prev, id];
    });
  };

  // Lọc và sắp xếp
  const filteredRooms = useMemo(() => {
    return savedRooms
      .filter((r) => {
        const matchesQuery =
          !searchQuery.trim() ||
          r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (r.district && r.district.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesDistrict =
          selectedDistrict === "all" ||
          (r.district && r.district.toLowerCase().includes(selectedDistrict.toLowerCase()));
        return matchesQuery && matchesDistrict;
      })
      .sort((a, b) => {
        if (sortBy === "price_asc") return (a.price || 0) - (b.price || 0);
        if (sortBy === "price_desc") return (b.price || 0) - (a.price || 0);
        return 0; // newest
      });
  }, [savedRooms, searchQuery, selectedDistrict, sortBy]);

  // Thống kê nhanh
  const stats = useMemo(() => {
    if (savedRooms.length === 0) return null;
    const prices = savedRooms.map((r) => r.price).filter((p): p is number => !!p && p > 0);
    const avgPrice = prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0;
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

    return {
      avgPrice,
      minPrice,
      maxPrice,
      total: savedRooms.length,
    };
  }, [savedRooms]);

  // Danh sách các phường có trong tin đã lưu
  const districts = useMemo(() => {
    const set = new Set<string>();
    savedRooms.forEach((r) => {
      if (r.district) set.add(r.district);
    });
    return Array.from(set);
  }, [savedRooms]);

  // Sao chép tóm tắt danh sách phòng để chia sẻ qua Zalo/Mess
  const handleCopySummary = () => {
    if (savedRooms.length === 0) return;
    const textLines = savedRooms.map((r, idx) => {
      return `${idx + 1}. ${r.title}\n- Giá: ${formatPrice(r.price)} | Khu vực: ${r.district || "Nha Trang"}\n- SĐT: ${extractPhone(r.contact)}\n- Xem chi tiết: ${window.location.origin}/phong/${r.id}`;
    });
    const content = `📋 DANH SÁCH PHÒNG TRỌ NHA TRANG ĐÃ LƯU (${savedRooms.length} phòng):\n\n${textLines.join("\n\n")}\n\n(Nguồn: Chợ Tốt Trọ Nha Trang)`;

    navigator.clipboard.writeText(content).then(() => {
      setCopiedAlert(true);
      setTimeout(() => setCopiedAlert(false), 3000);
    });
  };

  // Khởi động so sánh từ danh sách đã chọn
  const handleStartCompare = () => {
    const toCompare = savedRooms.filter((r) => selectedForCompare.includes(r.id));
    if (toCompare.length < 2) {
      showAppAlert("Vui lòng tick chọn ít nhất 2 phòng để so sánh đối chiếu.", "Chọn phòng so sánh", "info");
      return;
    }
    // Gửi sự kiện storage_compare_rooms hoặc mở modal
    try {
      localStorage.setItem("compare_rooms", JSON.stringify(toCompare));
      window.dispatchEvent(new Event("storage_compare_rooms"));
    } catch {}
    if (onOpenCompare) {
      onOpenCompare(toCompare);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-[#F8F9FA] h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 border-l border-amber-200">
        {/* Header với Gradient sang trọng */}
        <div className="bg-linear-to-r from-[#FFBA00] via-[#FF8800] to-[#FF7A00] px-5 py-4 flex items-center justify-between text-white shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-xl shadow-inner">
              ❤️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg">Bộ Sưu Tập Đã Lưu</h3>
                <span className="bg-white text-[#D0021B] text-xs font-black px-2 py-0.5 rounded-full shadow-2xs">
                  {savedRooms.length} tin
                </span>
              </div>
              <p className="text-[11px] text-amber-100">
                Lưu trữ trên thiết bị của bạn • Không lo trôi tin
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white text-lg font-bold flex items-center justify-center transition-colors cursor-pointer"
            title="Đóng"
          >
            ✕
          </button>
        </div>

        {/* Thông báo sao chép thành công */}
        {copiedAlert && (
          <div className="bg-emerald-600 text-white text-xs px-4 py-2 font-bold text-center flex items-center justify-center gap-2 animate-in slide-in-from-top duration-150">
            <span>✓</span>
            <span>Đã sao chép danh sách phòng! Bạn có thể dán vào Zalo/Facebook để gửi bạn bè.</span>
          </div>
        )}

        {/* Thanh Thống Kê & Dự Toán Tổng Thể */}
        {stats && (
          <div className="bg-white border-b border-gray-200 px-5 py-3 shrink-0">
            <div className="grid grid-cols-3 gap-2 text-center divide-x divide-gray-100 text-xs">
              <div>
                <span className="text-[10px] text-gray-500 block font-medium">Giá trung bình</span>
                <strong className="text-amber-700 font-bold text-sm">
                  {stats.avgPrice > 0 ? formatPrice(stats.avgPrice) : "---"}
                </strong>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 block font-medium">Thấp nhất</span>
                <strong className="text-emerald-600 font-bold text-sm">
                  {stats.minPrice > 0 ? formatPrice(stats.minPrice) : "---"}
                </strong>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 block font-medium">Cao nhất</span>
                <strong className="text-[#D0021B] font-bold text-sm">
                  {stats.maxPrice > 0 ? formatPrice(stats.maxPrice) : "---"}
                </strong>
              </div>
            </div>
          </div>
        )}

        {/* Bộ Lọc & Tìm Kiếm Nội Bộ */}
        {savedRooms.length > 0 && (
          <div className="p-3.5 bg-white border-b border-gray-200 space-y-2 shrink-0">
            {/* Input tìm kiếm */}
            <div className="flex items-center bg-gray-100 rounded-xl px-3 py-1.5 border border-gray-200 focus-within:border-amber-400 focus-within:bg-white transition-all text-xs">
              <span className="text-gray-400 mr-2">🔍</span>
              <input
                type="text"
                placeholder="Tìm nhanh theo tên phòng hoặc phường..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent outline-none text-gray-800 placeholder:text-gray-400 text-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-gray-400 hover:text-gray-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter buttons & sort */}
            <div className="flex items-center justify-between gap-2 text-xs">
              {/* Lọc theo phường */}
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-700 font-medium rounded-lg px-2.5 py-1 text-xs outline-none cursor-pointer"
              >
                <option value="all">📍 Tất cả khu vực ({savedRooms.length})</option>
                {districts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>

              {/* Sắp xếp */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-700 font-medium rounded-lg px-2.5 py-1 text-xs outline-none cursor-pointer"
              >
                <option value="newest">🕒 Mới lưu nhất</option>
                <option value="price_asc">💰 Giá tăng dần</option>
                <option value="price_desc">💎 Giá giảm dần</option>
              </select>
            </div>
          </div>
        )}

        {/* Danh sách phòng đã lưu */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {savedRooms.length === 0 ? (
            <div className="h-80 flex flex-col items-center justify-center text-center p-6 bg-white rounded-3xl border border-dashed border-gray-300">
              <div className="w-16 h-16 rounded-full bg-amber-50 text-[#FF7A00] flex items-center justify-center text-3xl mb-3 shadow-xs">
                🏷️
              </div>
              <h4 className="font-extrabold text-base text-gray-800">
                Chưa có phòng nào trong danh sách
              </h4>
              <p className="text-xs text-gray-500 max-w-xs mt-1 leading-relaxed">
                Khi lướt tìm phòng trọ, hãy bấm vào biểu tượng <strong>trái tim ❤️</strong> trên bất kỳ tin nào để lưu lại so sánh và gọi điện sau nhé!
              </p>
              <button
                onClick={onClose}
                className="mt-4 px-4 py-2 bg-[#FF7A00] hover:bg-[#E66E00] text-white font-bold text-xs rounded-xl shadow-xs transition-transform active:scale-95"
              >
                Khám phá phòng trọ ngay ➔
              </button>
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-xs bg-white rounded-2xl">
              Không tìm thấy phòng trọ nào khớp với bộ lọc &ldquo;{searchQuery}&rdquo;.
            </div>
          ) : (
            filteredRooms.map((room) => {
              const phone = extractPhone(room.contact);
              const isCheckedForCompare = selectedForCompare.includes(room.id);
              const commute = calculateCommute(null, null, room.district, room.id, "cd_ktcn");
              const flood = getNhaTrangFloodInsight(room.district, room.address);
              const owner = detectOwnerType(room);

              return (
                <div
                  key={room.id}
                  className={`bg-white rounded-2xl border transition-all p-3.5 shadow-2xs relative flex flex-col justify-between ${
                    isCheckedForCompare
                      ? "border-[#FF7A00] ring-2 ring-amber-300/60 bg-amber-50/20"
                      : "border-gray-200 hover:border-amber-300 hover:shadow-sm"
                  }`}
                >
                  <div className="flex gap-3 items-start">
                    {/* Checkbox So sánh */}
                    <div className="pt-1">
                      <input
                        type="checkbox"
                        checked={isCheckedForCompare}
                        onChange={() => toggleCompareItem(room.id)}
                        className="w-4 h-4 text-[#FF7A00] rounded border-gray-300 focus:ring-amber-400 cursor-pointer"
                        title="Chọn để so sánh"
                      />
                    </div>

                    {/* Ảnh đại diện */}
                    <Link
                      href={`/phong/${room.id}`}
                      onClick={onClose}
                      className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100 group"
                    >
                      <Image
                        src={room.image || "/placeholders/default-room.svg"}
                        alt={room.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                        unoptimized
                      />
                      <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] px-1 rounded">
                        #{room.id}
                      </span>
                    </Link>

                    {/* Nội dung chi tiết */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <Link
                          href={`/phong/${room.id}`}
                          onClick={onClose}
                          className="font-bold text-xs sm:text-sm text-gray-900 hover:text-[#FF7A00] line-clamp-2 leading-snug transition-colors"
                        >
                          {room.title}
                        </Link>
                        <button
                          onClick={() => handleRemove(room.id)}
                          className="text-gray-300 hover:text-red-500 p-1 transition-colors shrink-0"
                          title="Xóa khỏi tin đã lưu"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Mức giá & diện tích */}
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-[#D0021B] font-black text-sm">
                          {formatPrice(room.price)}
                        </span>
                        {room.area && (
                          <span className="text-gray-600 text-xs font-semibold">
                            • {room.area} m²
                          </span>
                        )}
                      </div>

                      {/* Địa chỉ & Khoảng cách */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px] text-gray-600">
                        <span className="truncate max-w-[140px] text-gray-700 font-medium">
                          📍 {room.district || "Nha Trang"}
                        </span>
                        <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                          🛵 {commute.distanceKm}km {commute.landmarkName}
                        </span>
                      </div>

                      {/* Badges ngập & chính chủ */}
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${flood.badgeBg} ${flood.badgeTextColor}`}>
                          {flood.badgeText}
                        </span>
                        <span className={`text-[10px] font-medium px-1.5 py-0.2 rounded border ${owner.badgeClass}`}>
                          {owner.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Nút hành động nhanh phía dưới */}
                  <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <a
                        href={`tel:${phone}`}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs transition-colors"
                      >
                        <span>📞 Gọi</span>
                      </a>
                      <a
                        href={`https://zalo.me/${phone.replace(/\s+/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 bg-[#0068FF] hover:bg-[#0052CC] text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs transition-colors"
                      >
                        <span>💬 Zalo</span>
                      </a>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleCompareItem(room.id)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg border transition-colors ${
                          isCheckedForCompare
                            ? "bg-[#FF7A00] text-white border-[#FF7A00]"
                            : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
                        }`}
                      >
                        {isCheckedForCompare ? "✓ Đã chọn SS" : "⚖️ So sánh"}
                      </button>

                      <Link
                        href={`/phong/${room.id}`}
                        onClick={onClose}
                        className="text-xs font-bold text-[#FF7A00] hover:underline"
                      >
                        Chi tiết ➔
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        {savedRooms.length > 0 && (
          <div className="p-3.5 bg-white border-t border-gray-200 space-y-2 shrink-0 shadow-lg">
            {/* Khi có tick chọn so sánh */}
            {selectedForCompare.length > 0 && (
              <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-300 flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900">
                  Đã tick chọn {selectedForCompare.length}/3 phòng
                </span>
                <button
                  onClick={handleStartCompare}
                  className="px-3 py-1.5 bg-[#FF7A00] hover:bg-[#E66E00] text-white font-black text-xs rounded-lg shadow-xs transition-transform active:scale-95"
                >
                  ⚖️ Mở bảng so sánh ➔
                </button>
              </div>
            )}

            <div className="flex items-center justify-between text-xs">
              <button
                onClick={handleCopySummary}
                className="text-gray-700 hover:text-[#FF7A00] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Sao chép toàn bộ danh sách phòng đã lưu kèm link để chia sẻ"
              >
                <span>📋 Chia sẻ danh sách</span>
              </button>

              <button
                onClick={handleClearAll}
                className="text-red-500 hover:text-red-700 font-semibold transition-colors cursor-pointer"
              >
                🗑️ Xóa tất cả ({savedRooms.length})
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
