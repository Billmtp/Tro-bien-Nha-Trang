"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getSourcePlaceholder } from "@/lib/room-images";

// Import Leaflet CSS in client
import "leaflet/dist/leaflet.css";
import {
  NHA_TRANG_LANDMARKS,
  getStoredCustomDestination,
  CustomDestination,
} from "@/lib/nhatrang-helpers";
import CustomDestinationModal from "./CustomDestinationModal";

interface MapRoom {
  id: number;
  title: string;
  price: number | null;
  area: number | null;
  address: string | null;
  district: string | null;
  images: string[];
  sourceSite: string;
  lat?: number | null;
  lng?: number | null;
  category?: string;
}

// Bảng tọa độ trung tâm các khu vực Nha Trang để gán nếu bài đăng chưa có lat/lng
const DISTRICT_COORDS: Record<string, [number, number]> = {
  "Vĩnh Hải": [12.2785, 109.1995],
  "Vĩnh Phước": [12.2620, 109.1930],
  "Vĩnh Thọ": [12.2680, 109.2010],
  "Xương Huân": [12.2530, 109.1950],
  "Vạn Thắng": [12.2510, 109.1880],
  "Vạn Phước": [12.2480, 109.1860],
  "Phước Hòa": [12.2315, 109.1860],
  "Phước Long": [12.2130, 109.1880],
  "Phước Tiến": [12.2380, 109.1880],
  "Phước Tân": [12.2420, 109.1840],
  "Ngọc Hiệp": [12.2530, 109.1760],
  "Phương Sài": [12.2480, 109.1810],
  "Phương Sơn": [12.2450, 109.1770],
  "Lộc Thọ": [12.2395, 109.1960],
  "Tân Lập": [12.2410, 109.1890],
  "Vĩnh Nguyên": [12.2150, 109.2070],
  "Vĩnh Trường": [12.2080, 109.2050],
  "Vĩnh Thạnh": [12.2610, 109.1450],
  "Vĩnh Lương": [12.3350, 109.1820],
  "Vĩnh Phương": [12.2900, 109.1450],
  "Vĩnh Hiệp": [12.2520, 109.1550],
  "Vĩnh Thái": [12.2350, 109.1550],
  "Phước Đồng": [12.1950, 109.1550],
  "Nha Trang": [12.2480, 109.1900],
};



function formatPriceShort(price: number | null): string {
  if (!price) return "Thỏa thuận";
  if (price >= 1_000_000_000) return `${(price / 1_000_000_000).toFixed(1)} tỷ`;
  if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(1).replace(".0", "")} tr`;
  return `${(price / 1_000).toFixed(0)}k`;
}

export default function NhaTrangInteractiveMap({
  rooms,
  selectedDistrict,
  onSelectRoom,
}: {
  rooms: MapRoom[];
  selectedDistrict?: string;
  onSelectRoom?: (id: number) => void;
}) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const [activeRoom, setActiveRoom] = useState<MapRoom | null>(null);
  const [filterPrice, setFilterPrice] = useState<"all" | "low" | "mid" | "high">("all");
  const [isMapReady, setIsMapReady] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customDest, setCustomDest] = useState<CustomDestination | null>(null);

  useEffect(() => {
    setCustomDest(getStoredCustomDestination());
    const handleCustomChange = (e: any) => {
      if (e.detail) setCustomDest(e.detail);
      else setCustomDest(getStoredCustomDestination());
    };
    window.addEventListener("nhatrang_custom_destination_changed", handleCustomChange);
    return () => window.removeEventListener("nhatrang_custom_destination_changed", handleCustomChange);
  }, []);

  // Bảng tọa độ các tuyến đường lớn thực tế tại Nha Trang
  const STREET_COORDS: Record<string, [number, number]> = {
    "đặng tất": [12.2785, 109.1995],
    "nguyễn đình chiểu": [12.2682, 109.2023],
    "đoàn trần nghiệp": [12.2690, 109.2005],
    "củ chi": [12.2760, 109.1980],
    "mai xuân thưởng": [12.2840, 109.1980],
    "điện biên phủ": [12.2820, 109.1970],
    "nguyễn khuyến": [12.2750, 109.1870],
    "2/4": [12.2640, 109.1940],
    "2 tháng 4": [12.2640, 109.1940],
    "hòn chồng": [12.2720, 109.2060],
    "trần phú": [12.2420, 109.1970],
    "hùng vương": [12.2390, 109.1960],
    "lê hồng phong": [12.2350, 109.1830],
    "vân đồn": [12.2380, 109.1850],
    "hoàng diệu": [12.2190, 109.2010],
    "dã tượng": [12.2150, 109.2030],
    "thống nhất": [12.2510, 109.1890],
    "yersin": [12.2500, 109.1910],
    "quang trung": [12.2530, 109.1920],
    "bạch đằng": [12.2370, 109.1920],
    "nguyễn trãi": [12.2450, 109.1880],
    "phước long": [12.2180, 109.1850],
  };

  // Gán tọa độ tính toán cho phòng: ưu tiên tọa độ GPS thật từ scraper
  const localizedRooms = rooms.map((room) => {
    let lat = room.lat;
    let lng = room.lng;

    // Nếu bài viết chưa có lat/lng thật, kiểm tra tên đường trong tiêu đề và địa chỉ
    if (!lat || !lng || lat < 12.0 || lat > 12.5 || lng < 109.0 || lng > 109.4) {
      const fullText = `${room.address || ""} ${room.title || ""}`.toLowerCase();
      let matchedCoord: [number, number] | null = null;
      for (const [st, coord] of Object.entries(STREET_COORDS)) {
        if (fullText.includes(st)) {
          matchedCoord = coord;
          break;
        }
      }

      const baseCoord = matchedCoord || (room.district && DISTRICT_COORDS[room.district]) || DISTRICT_COORDS["Nha Trang"];
      // Phân bổ nhẹ theo id để các phòng cùng đường/phường không đè khít lên nhau
      const offsetLat = ((room.id % 11) - 5) * 0.0018;
      const offsetLng = (((room.id * 3) % 11) - 5) * 0.0018;
      lat = baseCoord[0] + offsetLat;
      lng = baseCoord[1] + offsetLng;
    }

    return { ...room, computedLat: lat, computedLng: lng };
  });

  // Lọc theo khoảng giá
  const filteredRooms = localizedRooms.filter((r) => {
    if (!r.price) return filterPrice === "all";
    if (filterPrice === "low") return r.price <= 1_800_000;
    if (filterPrice === "mid") return r.price > 1_800_000 && r.price <= 3_500_000;
    if (filterPrice === "high") return r.price > 3_500_000;
    return true;
  });

  // Khởi tạo Leaflet Map
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let isSubscribed = true;

    import("leaflet").then((L) => {
      if (!isSubscribed || !mapContainerRef.current) return;

      if (!mapInstanceRef.current) {
        // Center Nha Trang
        const map = L.map(mapContainerRef.current, {
          center: [12.2530, 109.1920],
          zoom: 13,
          zoomControl: true,
        });

        // OpenStreetMap Layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map);

        markersLayerRef.current = L.layerGroup().addTo(map);
        mapInstanceRef.current = map;
        setIsMapReady(true);
      }
    });

    return () => {
      isSubscribed = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersLayerRef.current = null;
      }
    };
  }, []);

  // Cập nhật Markers khi filteredRooms thay đổi
  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current || !markersLayerRef.current) return;

    import("leaflet").then((L) => {
      const markersLayer = markersLayerRef.current;
      markersLayer.clearLayers();

      // 1. Thêm các địa danh Nha Trang
      NHA_TRANG_LANDMARKS.forEach((lm) => {
        if (lm.id === "custom") return;

        const icon = L.divIcon({
          className: "custom-landmark-icon",
          html: `<div class="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md border border-white whitespace-nowrap flex items-center gap-1">${lm.icon} ${lm.shortName}</div>`,
          iconSize: [120, 24],
          iconAnchor: [60, 12],
        });

        L.marker([lm.lat, lm.lng], { icon }).addTo(markersLayer);
      });

      // 1b. Thêm marker cho điểm đến tùy chọn của người dùng nếu có
      if (customDest && customDest.lat && customDest.lng) {
        const customPinIcon = L.divIcon({
          className: "custom-user-dest-icon",
          html: `<div class="bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg border-2 border-white whitespace-nowrap flex items-center gap-1 animate-bounce">📍 ${customDest.name || "Điểm của bạn"}</div>`,
          iconSize: [140, 24],
          iconAnchor: [70, 12],
        });

        L.marker([customDest.lat, customDest.lng], { icon: customPinIcon }).addTo(markersLayer);
      }

      // 2. Thêm phòng trọ
      filteredRooms.forEach((room) => {
        const isLow = (room.price || 0) <= 1_800_000;
        const isMid = (room.price || 0) > 1_800_000 && (room.price || 0) <= 3_500_000;
        const colorClass = isLow
          ? "bg-emerald-600 hover:bg-emerald-700"
          : isMid
          ? "bg-[#FF7A00] hover:bg-[#E66E00]"
          : "bg-purple-600 hover:bg-purple-700";

        const priceText = formatPriceShort(room.price);

        const customIcon = L.divIcon({
          className: "custom-price-marker",
          html: `
            <div class="${colorClass} text-white font-black text-[11px] px-2 py-1 rounded-full shadow-md border-2 border-white cursor-pointer transition-all transform hover:scale-110 flex items-center gap-0.5 whitespace-nowrap">
              <span>🏠</span>
              <span>${priceText}</span>
            </div>
          `,
          iconSize: [60, 26],
          iconAnchor: [30, 13],
        });

        const marker = L.marker([room.computedLat, room.computedLng], {
          icon: customIcon,
        }).addTo(markersLayer);

        marker.on("click", () => {
          setActiveRoom(room);
          if (onSelectRoom) onSelectRoom(room.id);
        });
      });
    });
  }, [isMapReady, filteredRooms, onSelectRoom, customDest]);

  // Bay tới địa danh khi bấm nút
  const handleFlyToLandmark = (lat: number, lng: number) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], 15, { duration: 1.2 });
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-4">
      {/* Top Filter & Landmark Bar */}
      <div className="p-3 bg-linear-to-r from-amber-50/80 via-white to-orange-50/50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2.5 text-xs">
        {/* Lọc khoảng giá trên bản đồ */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-bold text-gray-700">Mức giá:</span>
          <button
            onClick={() => setFilterPrice("all")}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
              filterPrice === "all"
                ? "bg-[#222222] text-white"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
          >
            Tất cả ({localizedRooms.length})
          </button>
          <button
            onClick={() => setFilterPrice("low")}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
              filterPrice === "low"
                ? "bg-emerald-600 text-white"
                : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
            }`}
          >
            Dưới 1.8tr (Xanh)
          </button>
          <button
            onClick={() => setFilterPrice("mid")}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
              filterPrice === "mid"
                ? "bg-[#FF7A00] text-white"
                : "bg-orange-50 text-orange-800 hover:bg-orange-100"
            }`}
          >
            1.8 - 3.5tr (Cam)
          </button>
          <button
            onClick={() => setFilterPrice("high")}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
              filterPrice === "high"
                ? "bg-purple-600 text-white"
                : "bg-purple-50 text-purple-800 hover:bg-purple-100"
            }`}
          >
            Trên 3.5tr (Tím)
          </button>
        </div>

        {/* Địa danh nhanh */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
          <span className="font-semibold text-gray-500 text-[11px]">📍 Đến nhanh:</span>
          {NHA_TRANG_LANDMARKS.filter((lm) => lm.id !== "custom").map((lm) => (
            <button
              key={lm.id}
              onClick={() => handleFlyToLandmark(lm.lat, lm.lng)}
              className="px-2 py-0.5 rounded-full bg-white hover:bg-amber-100 text-[11px] font-bold text-gray-700 border border-gray-300 transition-colors whitespace-nowrap cursor-pointer shadow-2xs"
            >
              <span>{lm.icon}</span> <span>{lm.shortName}</span>
            </button>
          ))}

          {/* Điểm ghim tùy chọn của user */}
          <button
            onClick={() => {
              if (customDest && customDest.lat && customDest.lng) {
                handleFlyToLandmark(customDest.lat, customDest.lng);
              } else {
                setIsCustomModalOpen(true);
              }
            }}
            className="px-2.5 py-0.5 rounded-full bg-red-50 hover:bg-red-100 text-[11px] font-bold text-red-700 border border-red-300 transition-colors whitespace-nowrap cursor-pointer shadow-2xs flex items-center gap-1"
            title={customDest ? `Bay tới ${customDest.name}` : "Tự chọn điểm đến trên bản đồ"}
          >
            <span>📍</span>
            <span>{customDest ? (customDest.name.length > 12 ? customDest.name.slice(0, 12) + "…" : customDest.name) : "Tự chọn điểm"}</span>
          </button>
          {customDest && (
            <button
              onClick={() => setIsCustomModalOpen(true)}
              className="px-1.5 py-0.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 text-[10px] font-bold cursor-pointer"
              title="Đổi điểm ghim trên bản đồ"
            >
              ✏️ Sửa
            </button>
          )}
        </div>
      </div>

      {/* Map Container & Floating Detail Card */}
      <div className="relative w-full h-[480px] sm:h-[540px]">
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Floating Active Room Preview Card */}
        {activeRoom && (
          <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:w-84 z-20 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border-2 border-[#FFBA00] p-3 animate-in slide-in-from-bottom-3 duration-200">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                {activeRoom.district || "Nha Trang"}
              </span>
              <button
                onClick={() => setActiveRoom(null)}
                className="text-gray-400 hover:text-gray-700 w-5 h-5 rounded flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <div className="flex gap-2.5">
              <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                <img
                  src={activeRoom.images?.[0] || getSourcePlaceholder(activeRoom.sourceSite)}
                  alt={activeRoom.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <h4 className="font-bold text-xs text-gray-900 line-clamp-2 leading-tight">
                  {activeRoom.title}
                </h4>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-[#D0021B] text-sm">
                    {formatPriceShort(activeRoom.price)}
                  </span>
                  {activeRoom.area && (
                    <span className="text-gray-500 text-[11px]">
                      • {activeRoom.area} m²
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-gray-500 truncate">
                  📍 {activeRoom.address || activeRoom.district}
                </p>
              </div>
            </div>

            <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[10px] text-gray-400">
                Nguồn: {activeRoom.sourceSite}
              </span>
              <Link
                href={`/phong/${activeRoom.id}`}
                className="px-3 py-1 bg-[#FF7A00] hover:bg-[#E66E00] text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1 shadow-xs"
              >
                <span>Xem chi tiết</span>
                <span>➜</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Chú giải màu sắc bản đồ */}
      <div className="px-3.5 py-2 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-500">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-gray-700">Chú giải giá:</span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> Dưới 1.8tr
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF7A00]"></span> 1.8 - 3.5tr
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span> Trên 3.5tr
          </span>
        </div>
        <span className="italic text-gray-400">
          Bấm vào ghim phòng trên bản đồ để xem chi tiết
        </span>
      </div>

      {/* Modal chọn điểm đến tùy chọn */}
      <CustomDestinationModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onSelectDestination={(dest) => {
          setCustomDest(dest);
          handleFlyToLandmark(dest.lat, dest.lng);
        }}
      />
    </div>
  );
}
