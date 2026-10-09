"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  calculateCommute,
  getNhaTrangFloodInsight,
  detectOwnerType,
  NHA_TRANG_LANDMARKS,
  getStoredCustomDestination,
  CustomDestination,
} from "@/lib/nhatrang-helpers";
import { showAppAlert } from "./AppNotificationModal";
import CustomDestinationModal from "./CustomDestinationModal";

export interface CompareRoomItem {
  id: number;
  title: string;
  price: number | null;
  area: number | null;
  address: string | null;
  district: string | null;
  image: string;
  contact?: string | null;
  sourceSite?: string;
  description?: string | null;
}

function formatPrice(price: number | null): string {
  if (!price) return "Thỏa thuận";
  if (price >= 1_000_000_000) return `${(price / 1_000_000_000).toFixed(2)} tỷ`;
  if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(1).replace(".0", "")} triệu/tháng`;
  return `${(price / 1000).toFixed(0)}k/tháng`;
}

function extractPhone(contact?: string | null): string {
  if (contact && /0\d{8,10}/.test(contact)) {
    const m = contact.match(/0\d{8,10}/);
    if (m) return m[0];
  }
  return "0905 123 456";
}

export default function CompareRoomsModal({
  rooms,
  onClose,
  onRemoveRoom,
  onClearAll,
  onAddRoom,
}: {
  rooms: CompareRoomItem[];
  onClose: () => void;
  onRemoveRoom: (id: number) => void;
  onClearAll: () => void;
  onAddRoom?: (room: CompareRoomItem) => void;
}) {
  // Custom Controls
  const [targetLandmarkId, setTargetLandmarkId] = useState("cd_ktcn");
  const [favoriteRoomId, setFavoriteRoomId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "finance" | "commute" | "specs">("all");
  const [savedRoomsList, setSavedRoomsList] = useState<CompareRoomItem[]>([]);
  const [showAddDrawer, setShowAddDrawer] = useState(false);
  const [copiedZalo, setCopiedZalo] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customDest, setCustomDest] = useState<CustomDestination | null>(null);

  // Tải điểm đến tùy chọn & danh sách phòng đã lưu
  useEffect(() => {
    setCustomDest(getStoredCustomDestination());
    const handleCustomChange = (e: any) => {
      if (e.detail) setCustomDest(e.detail);
      else setCustomDest(getStoredCustomDestination());
    };
    window.addEventListener("nhatrang_custom_destination_changed", handleCustomChange);
    return () => window.removeEventListener("nhatrang_custom_destination_changed", handleCustomChange);
  }, []);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("saved_rooms") || "[]");
      setSavedRoomsList(saved);
    } catch {
      setSavedRoomsList([]);
    }
  }, []);

  if (rooms.length === 0) return null;

  // Tính toán các tiêu chí nổi bật (best price, max area, min distance)
  const highlights = useMemo(() => {
    const validPrices = rooms.filter((r) => r.price && r.price > 0).map((r) => r.price!);
    const minPrice = validPrices.length > 0 ? Math.min(...validPrices) : null;

    const validAreas = rooms.filter((r) => r.area && r.area > 0).map((r) => r.area!);
    const maxArea = validAreas.length > 0 ? Math.max(...validAreas) : null;

    const distances = rooms.map((r) => {
      const c = calculateCommute(null, null, r.district, r.id, targetLandmarkId);
      return { id: r.id, dist: c.distanceKm };
    });
    const minDist = Math.min(...distances.map((d) => d.dist));

    return { minPrice, maxArea, minDist };
  }, [rooms, targetLandmarkId]);

  // Sao chép bảng so sánh gửi Zalo
  const handleCopyZaloComparison = () => {
    const landmark = NHA_TRANG_LANDMARKS.find((l) => l.id === targetLandmarkId) || NHA_TRANG_LANDMARKS[0];
    const targetTitle = targetLandmarkId === "custom" && customDest?.name ? customDest.name : landmark.name;
    let text = `🌊 BẢNG SO SÁNH PHÒNG TRỌ NHA TRANG - TRỌ BIỂN (${rooms.length} phòng)\n`;
    text += `📍 Mốc di chuyển đối chiếu: ${targetTitle}\n`;
    text += `-------------------------------------------\n`;

    rooms.forEach((r, idx) => {
      const commute = calculateCommute(null, null, r.district, r.id, targetLandmarkId);
      const isFav = r.id === favoriteRoomId ? " [⭐ ƯNG Ý NHẤT]" : "";
      text += `\n[Phòng ${idx + 1}]${isFav}: ${r.title}\n`;
      text += `- Giá: ${formatPrice(r.price)} | Diện tích: ${r.area ? `${r.area}m²` : "Chưa rõ"}\n`;
      text += `- Địa chỉ: ${r.address || r.district || "Nha Trang"}\n`;
      text += `- Di chuyển tới ${commute.landmarkName}: ~${commute.distanceKm} km (khoảng ${commute.motorbikeMin} phút xe máy)\n`;
      text += `- Phân loại: ${detectOwnerType(r).label}\n`;
      text += `- SĐT liên hệ: ${extractPhone(r.contact)}\n`;
    });

    text += `\n-------------------------------------------\n`;
    text += `🌐 Tra cứu thêm phòng trọ uy tín tại: https://trobien.vn\n`;
    text += `👉 Cùng xem và chốt phòng nhé!`;

    navigator.clipboard.writeText(text);
    setCopiedZalo(true);
    setTimeout(() => setCopiedZalo(false), 2500);
    showAppAlert("Đã sao chép nội dung so sánh vào bộ nhớ tạm! Bạn có thể dán ngay vào tin nhắn Zalo hoặc Messenger.", "Đã sao chép", "success");
  };

  const availableToAdd = savedRoomsList.filter((sr) => !rooms.some((r) => r.id === sr.id));

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-amber-200 overflow-hidden">
        {/* Header Bar */}
        <div className="bg-linear-to-r from-[#222222] via-[#2d2d2d] to-[#222222] px-5 py-4 text-white flex items-center justify-between shrink-0 border-b border-amber-500/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF7A00] flex items-center justify-center text-xl shadow-sm text-white">
              ⚖️
            </div>
            <div>
              <h2 className="font-black text-sm sm:text-base text-white flex items-center gap-2">
                <span>Bảng So Sánh Phòng Trọ Nha Trang Tùy Biến</span>
                <span className="text-[10px] bg-emerald-500 text-white font-bold px-2 py-0.5 rounded-full uppercase">
                  {rooms.length}/3 phòng
                </span>
              </h2>
              <p className="text-xs text-gray-300">
                Tự do tùy chỉnh mốc di chuyển, lọc tiêu chí và tìm nơi ở tối ưu nhất
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyZaloComparison}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                copiedZalo
                  ? "bg-emerald-600 text-white"
                  : "bg-white/10 hover:bg-white/20 text-white"
              }`}
              title="Sao chép bảng so sánh gửi nhóm Zalo"
            >
              <span>{copiedZalo ? "✓ Đã chép" : "📋 Gửi Zalo"}</span>
            </button>
            <button
              onClick={onClearAll}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-red-600 text-white transition-colors cursor-pointer"
            >
              Xóa hết
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold flex items-center justify-center text-sm transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* CUSTOM CONTROL BAR: Landmark Picker & Tabs */}
        <div className="p-3 sm:px-6 bg-linear-to-r from-amber-50/90 via-orange-50/50 to-amber-50/80 border-b border-amber-200/60 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          {/* Mốc di chuyển */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-extrabold text-gray-800 flex items-center gap-1">
              <span>📍</span> So khoảng cách tới:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {NHA_TRANG_LANDMARKS.map((lm) => {
                const isCustom = lm.id === "custom";
                const isSelected = targetLandmarkId === lm.id;
                const label = isCustom && customDest?.name
                  ? (customDest.name.length > 12 ? customDest.name.slice(0, 12) + "…" : customDest.name)
                  : lm.shortName;

                return (
                  <div key={lm.id} className="inline-flex items-center">
                    <button
                      onClick={() => {
                        setTargetLandmarkId(lm.id);
                        if (isCustom && (!customDest || isSelected)) {
                          setIsCustomModalOpen(true);
                        }
                      }}
                      className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1 ${
                        isSelected
                          ? "bg-[#FF7A00] text-white shadow-xs"
                          : "bg-white hover:bg-amber-100 text-gray-700 border border-gray-200"
                      }`}
                      title={isCustom ? "Tự chọn điểm đến trên bản đồ để đo khoảng cách" : `So sánh khoảng cách tới ${lm.name}`}
                    >
                      <span>{lm.icon}</span>
                      <span>{label}</span>
                    </button>
                    {isCustom && isSelected && (
                      <button
                        onClick={() => setIsCustomModalOpen(true)}
                        className="ml-1 px-1.5 py-1 rounded-md bg-amber-200 hover:bg-amber-300 text-amber-900 text-[10px] font-bold cursor-pointer"
                        title="Đổi điểm ghim trên bản đồ"
                      >
                        ✏️ Sửa
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Lọc tab tiêu chí */}
          <div className="flex items-center gap-1">
            {[
              { id: "all", label: "Tất cả" },
              { id: "finance", label: "💰 Tài chính" },
              { id: "commute", label: "🛵 Di chuyển" },
              { id: "specs", label: "📐 Thông số" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
                  activeTab === t.id
                    ? "bg-[#222222] text-white"
                    : "bg-white/70 hover:bg-white text-gray-600 border border-gray-200"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Comparison Grid */}
        <div className="overflow-x-auto p-4 sm:p-6 flex-1">
          <div
            className="grid gap-4.5"
            style={{
              gridTemplateColumns: `repeat(${rooms.length + (rooms.length < 3 ? 1 : 0)}, minmax(280px, 1fr))`,
            }}
          >
            {rooms.map((room, idx) => {
              const phone = extractPhone(room.contact);
              const commute = calculateCommute(null, null, room.district, room.id, targetLandmarkId);
              const flood = getNhaTrangFloodInsight(room.district, room.address);
              const owner = detectOwnerType(room);

              const isBestPrice = highlights.minPrice !== null && room.price === highlights.minPrice && rooms.length > 1;
              const isLargestArea = highlights.maxArea !== null && room.area === highlights.maxArea && rooms.length > 1;
              const isClosest = highlights.minDist !== null && commute.distanceKm === highlights.minDist && rooms.length > 1;
              const isFavorite = favoriteRoomId === room.id;

              const estTotal = (room.price || 1500000) + 400000;

              return (
                <div
                  key={room.id}
                  className={`bg-white rounded-3xl border flex flex-col justify-between overflow-hidden transition-all relative ${
                    isFavorite
                      ? "border-2 border-amber-500 shadow-xl ring-4 ring-amber-300/40 bg-amber-50/10"
                      : "border-gray-200 shadow-sm hover:border-amber-400"
                  }`}
                >
                  {/* Favorite Top Badge */}
                  {isFavorite && (
                    <div className="bg-linear-to-r from-amber-500 to-[#FF7A00] text-white text-[11px] font-black text-center py-1 uppercase tracking-wider shadow-xs">
                      👑 Phòng bạn ưng ý nhất
                    </div>
                  )}

                  {/* Card Image + Overlay Badges */}
                  <div className="relative aspect-16/10 bg-gray-100 overflow-hidden">
                    <Image
                      src={room.image || "/placeholders/default-room.svg"}
                      alt={room.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />

                    {/* Huy hiệu điểm mạnh */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1 items-start z-10">
                      {isBestPrice && (
                        <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase shadow-md flex items-center gap-1">
                          <span>★</span> Rẻ nhất
                        </span>
                      )}
                      {isLargestArea && (
                        <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase shadow-md flex items-center gap-1">
                          <span>📐</span> Rộng nhất
                        </span>
                      )}
                      {isClosest && (
                        <span className="bg-purple-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase shadow-md flex items-center gap-1">
                          <span>🚀</span> Gần nhất
                        </span>
                      )}
                    </div>

                    {/* Nút đánh dấu Favorite & Bỏ phòng */}
                    <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
                      <button
                        onClick={() => setFavoriteRoomId(isFavorite ? null : room.id)}
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-md cursor-pointer ${
                          isFavorite
                            ? "bg-amber-400 text-white hover:bg-amber-500 scale-110"
                            : "bg-black/60 hover:bg-amber-500 text-white"
                        }`}
                        title={isFavorite ? "Bỏ đánh dấu ưng ý" : "Đánh dấu là phòng tôi ưng nhất"}
                      >
                        ★
                      </button>
                      <button
                        onClick={() => onRemoveRoom(room.id)}
                        className="w-7 h-7 bg-black/60 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold transition-colors shadow-md cursor-pointer"
                        title="Bỏ phòng này khỏi so sánh"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* Comparison Details */}
                  <div className="p-4 space-y-3.5 text-xs flex-1">
                    <div>
                      <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold mb-0.5">
                        <span>CỘT {idx + 1}</span>
                        <span>Mã #{room.id}</span>
                      </div>
                      <h3 className="font-bold text-sm text-gray-900 line-clamp-2 hover:text-[#FF7A00]">
                        {room.title}
                      </h3>
                    </div>

                    {/* Nhóm Tài Chính */}
                    {(activeTab === "all" || activeTab === "finance") && (
                      <div className="space-y-2 pt-1 border-t border-gray-100">
                        <div className="p-2.5 rounded-xl bg-red-50/70 border border-red-100 flex items-center justify-between">
                          <span className="text-gray-600 font-semibold text-[11px]">Giá thuê/tháng:</span>
                          <span className="font-black text-base text-[#D0021B]">
                            {formatPrice(room.price)}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between">
                          <div>
                            <span className="text-gray-700 font-bold block text-[11px]">Dự toán thực tế:</span>
                            <span className="text-[10px] text-gray-500">(Gồm điện + nước + net)</span>
                          </div>
                          <span className="font-extrabold text-xs text-[#FF7A00]">
                            ~{(estTotal / 1_000_000).toFixed(2)} tr/tháng
                          </span>
                        </div>

                        {room.area && room.price && (
                          <div className="flex items-center justify-between py-1 text-[11px] text-gray-600">
                            <span>Đơn giá theo diện tích:</span>
                            <strong className="text-gray-900">
                              {Math.round(room.price / room.area).toLocaleString("vi")} đ/m²
                            </strong>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Nhóm Di Chuyển & Vị Trí */}
                    {(activeTab === "all" || activeTab === "commute") && (
                      <div className="space-y-2 pt-1 border-t border-gray-100">
                        <div className="flex items-center justify-between py-1">
                          <span className="text-gray-500 font-medium text-[11px]">Khu vực:</span>
                          <strong className="text-gray-900 font-bold">{room.district || "Nha Trang"}</strong>
                        </div>

                        <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between">
                          <span className="text-emerald-900 font-bold text-[11px]">
                            Tới {commute.landmarkName}:
                          </span>
                          <span className="text-emerald-800 font-black text-xs">
                            🛵 {commute.distanceKm} km (~{commute.motorbikeMin}p)
                          </span>
                        </div>

                        <div className="flex items-center justify-between py-1">
                          <span className="text-gray-500 font-medium text-[11px]">Địa hình mùa mưa:</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${flood.badgeBg} ${flood.badgeTextColor}`}>
                            {flood.badgeText}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Nhóm Thông Số & Pháp Lý */}
                    {(activeTab === "all" || activeTab === "specs") && (
                      <div className="space-y-2 pt-1 border-t border-gray-100">
                        <div className="flex items-center justify-between py-1">
                          <span className="text-gray-500 font-medium text-[11px]">Diện tích phòng:</span>
                          <strong className="text-gray-900 font-bold">
                            {room.area ? `${room.area} m²` : "Khoảng 20 m²"}
                          </strong>
                        </div>

                        <div className="flex items-center justify-between py-1">
                          <span className="text-gray-500 font-medium text-[11px]">Phân loại người đăng:</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${owner.badgeClass}`}>
                            {owner.label}
                          </span>
                        </div>

                        <div className="flex items-center justify-between py-1">
                          <span className="text-gray-500 font-medium text-[11px]">Nguồn bài đăng:</span>
                          <span className="text-gray-700 capitalize font-medium text-[11px]">
                            {room.sourceSite || "Trọ Biển Nha Trang"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Bottom */}
                  <div className="p-3.5 bg-gray-50 border-t border-gray-100 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <a
                        href={`tel:${phone}`}
                        className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
                      >
                        <span>📞 Gọi ngay</span>
                      </a>
                      <a
                        href={`https://zalo.me/${phone.replace(/\s+/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2.5 px-3 rounded-xl bg-[#0068FF] hover:bg-[#0052CC] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
                      >
                        <span>💬 Zalo</span>
                      </a>
                    </div>

                    <Link
                      href={`/phong/${room.id}`}
                      onClick={onClose}
                      className="block w-full py-2 text-center text-xs font-bold text-gray-700 hover:text-[#FF7A00] bg-white border border-gray-300 rounded-xl hover:border-[#FF7A00] transition-colors"
                    >
                      Xem chi tiết phòng ➔
                    </Link>
                  </div>
                </div>
              );
            })}

            {/* SLOT TRỐNG: THÊM PHÒNG THỨ 2 HOẶC THỨ 3 */}
            {rooms.length < 3 && (
              <div className="border-2 border-dashed border-amber-300 rounded-3xl p-5 flex flex-col items-center justify-center text-center bg-amber-50/20 hover:bg-amber-50/40 transition-colors min-h-[380px]">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-2xl mb-3 shadow-xs">
                  ➕
                </div>
                <h4 className="font-extrabold text-sm text-gray-800 mb-1">
                  Thêm phòng so sánh ({rooms.length + 1}/3)
                </h4>
                <p className="text-[11px] text-gray-500 max-w-[200px] mb-4">
                  So sánh 2 - 3 phòng cạnh nhau để đưa ra quyết định thuê chính xác nhất
                </p>

                {availableToAdd.length > 0 ? (
                  <div className="w-full space-y-2">
                    <span className="text-[10px] font-bold text-amber-900 block uppercase">
                      Chọn nhanh từ tin đã lưu ({availableToAdd.length}):
                    </span>
                    <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 text-left">
                      {availableToAdd.map((sr) => (
                        <button
                          key={sr.id}
                          onClick={() => {
                            if (onAddRoom) onAddRoom(sr);
                          }}
                          className="w-full p-2 bg-white rounded-xl border border-amber-200 hover:border-amber-500 flex items-center justify-between gap-2 text-left cursor-pointer transition-all hover:shadow-xs group"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-[11px] text-gray-900 group-hover:text-[#FF7A00] truncate">
                              {sr.title}
                            </p>
                            <p className="text-[10px] text-gray-500 truncate">
                              {sr.district} • {formatPrice(sr.price)}
                            </p>
                          </div>
                          <span className="text-amber-600 font-extrabold text-xs shrink-0">
                            + Thêm
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    href="/"
                    onClick={onClose}
                    className="px-4 py-2 bg-linear-to-r from-[#FFBA00] to-[#FF7A00] text-gray-900 font-bold rounded-xl text-xs shadow-xs hover:shadow-md transition-all cursor-pointer"
                  >
                    🔍 Ra trang chủ chọn thêm
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer Notes */}
        <div className="p-3.5 bg-amber-50/60 border-t border-amber-200/80 px-6 flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-600">
          <div className="flex items-center gap-1.5">
            <span>💡</span>
            <span>Bấm vào ngôi sao <strong>★</strong> để đánh dấu phòng bạn ưng ý nhất. Bấm <strong>📋 Gửi Zalo</strong> để chia sẻ nhanh.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold transition-colors cursor-pointer"
          >
            Đóng bảng
          </button>
        </div>
      </div>

      {/* Modal chọn điểm đến tùy chọn */}
      <CustomDestinationModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onSelectDestination={(dest) => {
          setCustomDest(dest);
          setTargetLandmarkId("custom");
        }}
      />
    </div>
  );
}
