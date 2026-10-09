"use client";

import { useEffect, useRef, useState } from "react";
import {
  CustomDestination,
  getStoredCustomDestination,
  saveCustomDestination,
  DISTRICT_COORDS,
} from "@/lib/nhatrang-helpers";

// Import Leaflet CSS
import "leaflet/dist/leaflet.css";

interface CustomDestinationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDestination?: (dest: CustomDestination) => void;
}

const PRESET_LOCATIONS = [
  { name: "Vincom Plaza Trần Phú", lat: 12.2425, lng: 109.197, icon: "🏢" },
  { name: "ĐH Tôn Đức Thắng (Nha Trang)", lat: 12.2858, lng: 109.1895, icon: "🏫" },
  { name: "Ga xe lửa Nha Trang", lat: 12.2483, lng: 109.1834, icon: "🚉" },
  { name: "BV Quân Y 87 (Dã Tượng)", lat: 12.2162, lng: 109.2025, icon: "🏥" },
  { name: "Khu đô thị Vĩnh Điềm Trung (Go!)", lat: 12.246, lng: 109.168, icon: "🛍️" },
  { name: "Bến xe phía Bắc (Vĩnh Hải)", lat: 12.2805, lng: 109.189, icon: "🚌" },
  { name: "Bến xe phía Nam (23/10)", lat: 12.245, lng: 109.155, icon: "🚌" },
  { name: "KCN Diên Phú / Vĩnh Phương", lat: 12.278, lng: 109.125, icon: "🏭" },
];

export default function CustomDestinationModal({
  isOpen,
  onClose,
  onSelectDestination,
}: CustomDestinationModalProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const [selectedCoord, setSelectedCoord] = useState<{ lat: number; lng: number }>({
    lat: 12.253,
    lng: 109.192,
  });
  const [customName, setCustomName] = useState("Chỗ làm việc của tôi");
  const [nearestDistrict, setNearestDistrict] = useState("Vạn Thạnh");

  // Load điểm đã lưu nếu có
  useEffect(() => {
    if (!isOpen) return;
    const stored = getStoredCustomDestination();
    if (stored) {
      setSelectedCoord({ lat: stored.lat, lng: stored.lng });
      if (stored.name) setCustomName(stored.name);
    }
  }, [isOpen]);

  // Tìm phường gần nhất
  useEffect(() => {
    let minD = 9999;
    let closest = "Nha Trang";
    for (const [distName, [dLat, dLng]] of Object.entries(DISTRICT_COORDS)) {
      const dist = Math.hypot(dLat - selectedCoord.lat, dLng - selectedCoord.lng);
      if (dist < minD) {
        minD = dist;
        closest = distName;
      }
    }
    setNearestDistrict(closest);
  }, [selectedCoord]);

  // Khởi tạo bản đồ Leaflet
  useEffect(() => {
    if (!isOpen || typeof window === "undefined") return;

    let isSubscribed = true;
    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      import("leaflet").then((L) => {
        if (!isSubscribed || !mapContainerRef.current) return;

        // Xóa map cũ nếu có
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        const map = L.map(mapContainerRef.current, {
          center: [selectedCoord.lat, selectedCoord.lng],
          zoom: 14,
          zoomControl: true,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map);

        // Marker tùy chọn điểm đến
        const pinIcon = L.divIcon({
          className: "custom-selected-pin",
          html: `
            <div class="relative flex items-center justify-center">
              <span class="absolute -top-7 px-2.5 py-0.5 bg-red-600 text-white font-black text-[11px] rounded-full shadow-lg border-2 border-white whitespace-nowrap animate-bounce flex items-center gap-1">
                📍 Điểm của bạn
              </span>
              <div class="w-5 h-5 bg-red-600 rounded-full border-2 border-white shadow-md"></div>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const marker = L.marker([selectedCoord.lat, selectedCoord.lng], {
          icon: pinIcon,
          draggable: true,
        }).addTo(map);

        markerRef.current = marker;
        mapInstanceRef.current = map;

        // Sự kiện click lên bản đồ để dời ghim
        map.on("click", (e: any) => {
          const { lat, lng } = e.latlng;
          setSelectedCoord({ lat, lng });
          marker.setLatLng([lat, lng]);
        });

        // Sự kiện kéo ghim thả ra
        marker.on("dragend", () => {
          const pos = marker.getLatLng();
          setSelectedCoord({ lat: pos.lat, lng: pos.lng });
        });

        // Invalidate size sau khi render modal
        setTimeout(() => {
          map.invalidateSize();
        }, 200);
      });
    }, 100);

    return () => {
      isSubscribed = false;
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, [isOpen]);

  // Cập nhật vị trí marker khi chọn preset
  const handleSelectPreset = (preset: (typeof PRESET_LOCATIONS)[0]) => {
    setSelectedCoord({ lat: preset.lat, lng: preset.lng });
    setCustomName(preset.name);
    if (markerRef.current && mapInstanceRef.current) {
      markerRef.current.setLatLng([preset.lat, preset.lng]);
      mapInstanceRef.current.flyTo([preset.lat, preset.lng], 15, { duration: 0.8 });
    }
  };

  // Lưu điểm đến
  const handleSave = () => {
    const finalDest: CustomDestination = {
      name: customName.trim() || "Điểm đã ghim",
      lat: selectedCoord.lat,
      lng: selectedCoord.lng,
      address: `Khu vực gần ${nearestDistrict}, Nha Trang`,
    };

    saveCustomDestination(finalDest);
    if (onSelectDestination) {
      onSelectDestination(finalDest);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl shadow-2xl border border-gray-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:px-6 bg-linear-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl p-1.5 bg-white/20 rounded-xl">📍</span>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg leading-tight">
                Tự chọn điểm đến trên bản đồ Nha Trang
              </h2>
              <p className="text-white/80 text-xs">
                Chạm hoặc click vị trí làm việc, trường học của bạn để hệ thống tự động đo khoảng cách
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold flex items-center justify-center text-sm transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 flex-1 text-xs sm:text-sm">
          {/* Quick presets */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-gray-700 text-xs flex items-center gap-1">
                <span>⚡</span> Gợi ý điểm đến phổ biến tại Nha Trang:
              </span>
              <span className="text-[11px] text-gray-400">Hoặc nhấp bản đồ bên dưới</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {PRESET_LOCATIONS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className="px-2.5 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-[11px] font-bold whitespace-nowrap cursor-pointer transition-colors shadow-2xs flex items-center gap-1 shrink-0"
                >
                  <span>{preset.icon}</span>
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Map picker */}
          <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-300 shadow-inner">
            <div className="absolute top-2 left-2 z-20 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-xl shadow-xs border border-gray-200 text-[11px] font-bold text-gray-700 flex items-center gap-1.5 pointer-events-none">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>Chạm / Click hoặc kéo ghim đỏ để chọn vị trí</span>
            </div>
            <div ref={mapContainerRef} className="w-full h-64 sm:h-72 z-10" />
          </div>

          {/* Form inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-200">
            <div>
              <label className="block font-bold text-gray-700 text-xs mb-1">
                🏷️ Đặt tên gợi nhớ cho điểm này:
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="VD: Chỗ làm việc, Công ty FPT, Nhà người thân..."
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                maxLength={40}
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 text-xs mb-1">
                📌 Vị trí & Tọa độ đã chọn:
              </label>
              <div className="bg-white px-3 py-2 rounded-xl border border-gray-300 flex items-center justify-between text-xs font-semibold text-gray-600">
                <span className="truncate">Gần Phường {nearestDistrict}</span>
                <span className="font-mono text-[11px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded shrink-0">
                  {selectedCoord.lat.toFixed(4)}, {selectedCoord.lng.toFixed(4)}
                </span>
              </div>
            </div>
          </div>

          {/* Info note */}
          <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
            <span className="text-base shrink-0">💡</span>
            <p>
              Sau khi lưu, tất cả các tin phòng trọ, danh sách so sánh và bản đồ sẽ tự động tính toán
              khoảng cách (km) và thời gian đi xe máy theo vị trí ghim của bạn!
            </p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-3 sm:px-6 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-white bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-500/20 transition-all cursor-pointer flex items-center gap-1.5 transform active:scale-95"
          >
            <span>✓</span>
            <span>Lưu vị trí & Bắt đầu đo khoảng cách</span>
          </button>
        </div>
      </div>
    </div>
  );
}
