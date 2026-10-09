"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { filterRealImages, getSourcePlaceholder } from "@/lib/room-images";
import { calculateCommute, getNhaTrangFloodInsight, detectOwnerType } from "@/lib/nhatrang-helpers";
import FairPriceEstimator from "./FairPriceEstimator";
import { showAppAlert } from "./AppNotificationModal";

interface Room {
  id: number;
  title: string;
  price: number | null;
  area: number | null;
  address: string | null;
  district: string | null;
  images: string[];
  sourceUrl: string;
  sourceSite: string;
  contact?: string | null;
  description?: string | null;
  scrapedAt: string;
  lat?: number | null;
  lng?: number | null;
}

function formatPrice(price: number | null): string {
  if (!price) return "Thỏa thuận";
  if (price >= 1_000_000_000) {
    const val = (price / 1_000_000_000).toFixed(2).replace(/\.?0+$/, "");
    return `${val} tỷ`;
  }
  if (price >= 1_000_000) {
    const val = (price / 1_000_000).toFixed(1).replace(".0", "");
    return `${val} triệu/tháng`;
  }
  if (price >= 1_000) return `${(price / 1_000).toFixed(0)}k/tháng`;
  return `${price.toLocaleString("vi")} đ`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 60) return `${Math.max(1, minutes)} phút trước`;
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ngày trước`;
  return "Gần đây";
}

const SITE_LABELS: Record<string, { label: string; bg: string; text: string }> = {
  nhatot: { label: "Nhà Tốt / Chợ Tốt", bg: "bg-[#FFF4D6]", text: "text-[#A66D00]" },
  google_maps: { label: "🗺️ Google Maps", bg: "bg-[#E8F0FE]", text: "text-[#1967D2]" },
  facebook: { label: "👥 Nhóm Facebook", bg: "bg-[#E7F3FF]", text: "text-[#1877F2]" },
  facebook_group_tro: { label: "👥 Hội Tìm Trọ NT (45k)", bg: "bg-[#E7F3FF]", text: "text-[#1877F2]" },
  facebook_group_ntu: { label: "🎓 SV ĐH Nha Trang", bg: "bg-[#E0F2FE]", text: "text-[#0284C7]" },
  facebook_group_giare: { label: "🏷️ Trọ Giá Rẻ NT", bg: "bg-[#ECFDF5]", text: "text-[#059669]" },
  facebook_group_matbang: { label: "🏪 Thuê Mặt Bằng NT", bg: "bg-[#FEF3C7]", text: "text-[#D97706]" },
  facebook_group_homestay: { label: "🏖️ Căn Hộ/Homestay NT", bg: "bg-[#F3E8FF]", text: "text-[#9333EA]" },
  facebook_group_bds_nhatrang: { label: "🏢 BĐS Nha Trang", bg: "bg-[#FCE7F3]", text: "text-[#DB2777]" },
  batdongsan: { label: "🏢 Batdongsan.com.vn", bg: "bg-[#FEE2E2]", text: "text-[#DC2626]" },
  alonhadat: { label: "🏡 Alonhadat.com.vn", bg: "bg-[#DCFCE7]", text: "text-[#16A34A]" },
  homedy: { label: "🌐 Homedy Nha Trang", bg: "bg-[#E0F2FE]", text: "text-[#0284C7]" },
  phongtro123: { label: "Phongtro123", bg: "bg-[#E6F4EA]", text: "text-[#137333]" },
  mogi: { label: "Mogi", bg: "bg-[#FCE8E6]", text: "text-[#C5221F]" },
  nguoidang: { label: "Thành viên đăng", bg: "bg-[#FEF7E0]", text: "text-[#B06000]" },
};

export default function RoomCard({
  room,
  viewMode = "list",
  targetLandmarkId = "cd_ktcn",
}: {
  room: Room;
  viewMode?: "list" | "grid";
  targetLandmarkId?: string;
}) {
  const realImages = filterRealImages(room.images, room.sourceSite);
  const [isSaved, setIsSaved] = useState(false);
  const [isCompared, setIsCompared] = useState(false);
  const [imgError, setImgError] = useState(false);
  const img = imgError ? getSourcePlaceholder(room.sourceSite) : realImages[0];
  const photoCount = realImages.length;
  const isNew = Date.now() - new Date(room.scrapedAt).getTime() < 24 * 3_600_000;
  const [isJustScanned, setIsJustScanned] = useState(false);
  const [, setCustomVersion] = useState(0);

  useEffect(() => {
    const handler = () => setCustomVersion((v) => v + 1);
    window.addEventListener("nhatrang_custom_destination_changed", handler);
    return () => window.removeEventListener("nhatrang_custom_destination_changed", handler);
  }, []);

  // Commute distance, flood risk & owner classification
  const commute = calculateCommute(room.lat, room.lng, room.district, room.id, targetLandmarkId);
  const flood = getNhaTrangFloodInsight(room.district, room.address);
  const owner = detectOwnerType(room);

  useEffect(() => {
    const checkJustScanned = () => {
      try {
        const raw = sessionStorage.getItem("just_scanned_room_ids");
        if (raw) {
          const data = JSON.parse(raw);
          const ids: number[] = Array.isArray(data) ? data : data.ids || [];
          setIsJustScanned(ids.includes(room.id));
        }
      } catch {
        setIsJustScanned(false);
      }
    };
    checkJustScanned();
    window.addEventListener("rooms_just_scanned", checkJustScanned);
    return () => window.removeEventListener("rooms_just_scanned", checkJustScanned);
  }, [room.id]);

  useEffect(() => {
    const checkSaved = () => {
      try {
        const saved = JSON.parse(localStorage.getItem("saved_rooms") || "[]");
        setIsSaved(saved.some((r: any) => r.id === room.id));
      } catch {
        setIsSaved(false);
      }
    };
    checkSaved();
    window.addEventListener("storage_saved_rooms", checkSaved);
    return () => window.removeEventListener("storage_saved_rooms", checkSaved);
  }, [room.id]);

  useEffect(() => {
    const checkCompare = () => {
      try {
        const data = JSON.parse(localStorage.getItem("compare_rooms") || "[]");
        setIsCompared(data.some((r: any) => r.id === room.id));
      } catch {
        setIsCompared(false);
      }
    };
    checkCompare();
    window.addEventListener("storage_compare_rooms", checkCompare);
    return () => window.removeEventListener("storage_compare_rooms", checkCompare);
  }, [room.id]);

  const toggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const saved = JSON.parse(localStorage.getItem("saved_rooms") || "[]");
      let nextSaved;
      if (isSaved) {
        nextSaved = saved.filter((r: any) => r.id !== room.id);
      } else {
        nextSaved = [
          ...saved,
          {
            id: room.id,
            title: room.title,
            price: room.price,
            area: room.area,
            district: room.district,
            address: room.address,
            image: img,
            contact: room.contact,
            sourceSite: room.sourceSite,
            description: room.description,
            savedAt: new Date().toISOString(),
          },
        ];
      }
      localStorage.setItem("saved_rooms", JSON.stringify(nextSaved));
      setIsSaved(!isSaved);
      window.dispatchEvent(new Event("storage_saved_rooms"));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const data = JSON.parse(localStorage.getItem("compare_rooms") || "[]");
      let next;
      if (isCompared) {
        next = data.filter((r: any) => r.id !== room.id);
      } else {
        if (data.length >= 3) {
          showAppAlert(
            "Bạn chỉ có thể so sánh tối đa 3 phòng cùng lúc. Hãy bấm vào thanh so sánh bên dưới để xem hoặc thay thế phòng.",
            "Đạt giới hạn so sánh",
            "warning"
          );
          return;
        }
        next = [
          ...data,
          {
            id: room.id,
            title: room.title,
            price: room.price,
            area: room.area,
            district: room.district,
            address: room.address,
            image: img,
            contact: room.contact,
            sourceSite: room.sourceSite,
            description: room.description,
          },
        ];
      }
      localStorage.setItem("compare_rooms", JSON.stringify(next));
      setIsCompared(!isCompared);
      window.dispatchEvent(new Event("storage_compare_rooms"));
    } catch (err) {
      console.error(err);
    }
  };

  // ================= LIST VIEW (CLASSIC CHỢ TỐT) =================
  if (viewMode === "list") {
    return (
      <Link
        href={`/phong/${room.id}`}
        className={`group flex bg-white rounded-2xl transition-all duration-200 overflow-hidden relative ${
          isJustScanned
            ? "border-2 border-emerald-500 bg-emerald-50/20 shadow-md ring-2 ring-emerald-300/60"
            : isCompared
            ? "border-2 border-[#FF7A00] shadow-md ring-2 ring-amber-300/60 bg-amber-50/15"
            : "border border-[#E8E8E8] hover:border-[#FFBA00] hover:shadow-md"
        }`}
      >
        {/* Thumbnail bên trái */}
        <div className="relative w-36 sm:w-48 h-32 sm:h-36 bg-[#F4F4F4] shrink-0 overflow-hidden">
          <Image
            src={img}
            alt={room.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="200px"
            unoptimized
            onError={() => setImgError(true)}
          />

          {/* Badge số ảnh */}
          {photoCount > 1 && (
            <span className="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-[10px] font-medium px-1.5 py-0.5 rounded flex items-center gap-1">
              📷 {photoCount}
            </span>
          )}

          {/* Badge mới / Vừa tìm ra */}
          {isJustScanned ? (
            <span className="absolute top-1.5 left-1.5 bg-linear-to-r from-emerald-600 to-teal-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-md animate-pulse border border-white/60 flex items-center gap-1 z-10">
              <span className="w-1.5 h-1.5 bg-yellow-300 rounded-full animate-ping"></span>
              <span>VỪA TÌM RA ✨</span>
            </span>
          ) : isNew ? (
            <span className="absolute top-1.5 left-1.5 bg-[#FF7A00] text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase z-10">
              Mới
            </span>
          ) : null}
        </div>

        {/* Nội dung bên phải */}
        <div className="flex-1 p-2.5 sm:p-3.5 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-start justify-between gap-1.5">
              <h3 className="font-semibold text-xs sm:text-sm text-[#222222] group-hover:text-[#FF7A00] line-clamp-2 leading-snug mb-1 transition-colors">
                {room.title}
              </h3>

              {/* Nhãn chính chủ */}
              {owner.isOwner && (
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border shrink-0 ${owner.badgeClass}`}>
                  ✓ Chính chủ
                </span>
              )}
            </div>

            {/* Giá + Diện tích + Định giá AI */}
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[#D0021B] font-bold text-sm sm:text-base">
                {formatPrice(room.price)}
              </span>
              {room.area && (
                <span className="text-[#777777] text-xs font-medium">
                  • {room.area} m²
                </span>
              )}
              <FairPriceEstimator
                price={room.price}
                area={room.area}
                district={room.district}
                compact
              />
            </div>

            {/* Địa chỉ & Khoảng cách */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#777777] mb-1.5">
              <span className="truncate max-w-[150px] sm:max-w-xs flex items-center gap-0.5">
                <span>📍</span>
                <span>{room.address || room.district || "Nha Trang"}</span>
              </span>

              {/* Commute distance badge */}
              <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 shrink-0">
                🛵 {commute.distanceKm} km ({commute.motorbikeMin}p {commute.landmarkName})
              </span>
            </div>

            {/* Thẻ ngập lụt mùa mưa */}
            <div className="flex items-center gap-1.5">
              <span className={`text-[9px] sm:text-[10px] font-semibold px-1.5 py-0.2 rounded ${flood.badgeBg} ${flood.badgeTextColor}`}>
                {flood.badgeText}
              </span>
            </div>
          </div>

          {/* Footer thông tin người đăng & các nút chức năng */}
          <div className="flex items-center justify-between pt-2 border-t border-[#F8F8F8] text-[11px] text-[#999999] mt-2">
            <div className="flex items-center gap-1.5 truncate">
              {(() => {
                const s = SITE_LABELS[room.sourceSite] || { label: "Nha Trang", bg: "bg-gray-100", text: "text-gray-700" };
                return (
                  <span className={`${s.bg} ${s.text} text-[10px] font-bold px-1.5 py-0.5 rounded`}>
                    {s.label}
                  </span>
                );
              })()}
              {isJustScanned && (
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-1.5 py-0.2 rounded border border-emerald-300 animate-pulse">
                  ⚡ Vừa quét
                </span>
              )}
              <span>• {timeAgo(room.scrapedAt)}</span>
            </div>

            {/* Các nút hành động: So sánh & Lưu tin */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={toggleCompare}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-colors flex items-center gap-0.5 ${
                  isCompared
                    ? "bg-[#FF7A00] text-white border-[#FF7A00]"
                    : "bg-gray-50 hover:bg-amber-100 text-gray-600 border-gray-200"
                }`}
                title={isCompared ? "Bỏ so sánh phòng này" : "Thêm vào danh sách so sánh"}
              >
                <span>⚖️</span>
                <span className="hidden sm:inline">{isCompared ? "Đã SS" : "So sánh"}</span>
              </button>

              <button
                type="button"
                onClick={toggleSave}
                className={`p-1.5 rounded-full transition-colors ${
                  isSaved ? "text-[#D0021B]" : "text-gray-300 hover:text-[#D0021B]"
                }`}
                title={isSaved ? "Bỏ lưu tin" : "Lưu tin này"}
              >
                <svg className="w-4 h-4" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth={isSaved ? 0 : 2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // ================= GRID VIEW =================
  return (
    <Link
      href={`/phong/${room.id}`}
      className={`group block bg-white rounded-2xl transition-all duration-200 overflow-hidden relative ${
        isJustScanned
          ? "border-2 border-emerald-500 bg-emerald-50/20 shadow-md ring-2 ring-emerald-300/60"
          : isCompared
          ? "border-2 border-[#FF7A00] shadow-md ring-2 ring-amber-300/60 bg-amber-50/15"
          : "border border-[#E8E8E8] hover:border-[#FFBA00] hover:shadow-md"
      }`}
    >
      <div className="relative aspect-[4/3] bg-[#F4F4F4] overflow-hidden">
        <Image
          src={img}
          alt={room.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          unoptimized
          onError={() => setImgError(true)}
        />

        {photoCount > 1 && (
          <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] font-medium px-1.5 py-0.5 rounded">
            📷 {photoCount}
          </span>
        )}

        {isJustScanned ? (
          <span className="absolute top-2 left-2 bg-linear-to-r from-emerald-600 to-teal-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-md animate-pulse border border-white/60 flex items-center gap-1 z-10">
            <span className="w-1.5 h-1.5 bg-yellow-300 rounded-full animate-ping"></span>
            <span>VỪA TÌM RA ✨</span>
          </span>
        ) : isNew ? (
          <span className="absolute top-2 left-2 bg-[#FF7A00] text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase z-10">
            Mới
          </span>
        ) : null}

        {/* Nút hành động nổi góc trên phải */}
        <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
          <button
            type="button"
            onClick={toggleCompare}
            className={`p-1.5 rounded-full backdrop-blur-xs transition-colors ${
              isCompared
                ? "bg-[#FF7A00] text-white shadow-sm"
                : "bg-white/80 text-gray-700 hover:bg-white"
            }`}
            title={isCompared ? "Bỏ so sánh" : "Thêm vào so sánh"}
          >
            <span className="text-xs">⚖️</span>
          </button>

          <button
            type="button"
            onClick={toggleSave}
            className={`p-1.5 bg-white/80 backdrop-blur-xs rounded-full transition-colors ${
              isSaved ? "text-[#D0021B]" : "text-gray-400 hover:text-[#D0021B]"
            }`}
            title={isSaved ? "Bỏ lưu tin" : "Lưu tin này"}
          >
            <svg className="w-4 h-4" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth={isSaved ? 0 : 2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="p-3 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-1 mb-1">
            <h3 className="font-semibold text-xs sm:text-sm text-[#222222] group-hover:text-[#FF7A00] line-clamp-2 leading-snug transition-colors">
              {room.title}
            </h3>
            {owner.isOwner && (
              <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border shrink-0 ${owner.badgeClass}`}>
                ✓ Chính chủ
              </span>
            )}
          </div>

          <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[#D0021B] font-bold text-sm sm:text-base">
                {formatPrice(room.price)}
              </span>
              {room.area && (
                <span className="text-[#777777] text-xs font-medium">
                  • {room.area} m²
                </span>
              )}
            </div>
            <FairPriceEstimator
              price={room.price}
              area={room.area}
              district={room.district}
              compact
            />
          </div>

          {/* Vị trí & Khoảng cách */}
          <div className="flex items-center justify-between text-[11px] text-[#777777] mb-1.5">
            <span className="truncate">📍 {room.district || "Nha Trang"}</span>
            <span className="text-emerald-700 font-bold bg-emerald-50 px-1 py-0.2 rounded text-[10px]">
              🛵 {commute.distanceKm}km {commute.landmarkName}
            </span>
          </div>

          {/* Cảnh báo ngập */}
          <div className="mb-2">
            <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded ${flood.badgeBg} ${flood.badgeTextColor}`}>
              {flood.badgeText}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#F8F8F8] text-[10px] text-[#999999]">
          {(() => {
            const s = SITE_LABELS[room.sourceSite] || { label: "Nha Trang", bg: "bg-gray-100", text: "text-gray-700" };
            return (
              <span className={`${s.bg} ${s.text} font-bold px-1.5 py-0.5 rounded`}>
                {s.label}
              </span>
            );
          })()}
          <span>{timeAgo(room.scrapedAt)}</span>
        </div>
      </div>
    </Link>
  );
}
