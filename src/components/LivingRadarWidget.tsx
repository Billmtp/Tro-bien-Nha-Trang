"use client";

import { useMemo } from "react";
import { resolveNhaTrangCoords } from "@/lib/scrapers";

interface AmenityPlace {
  id: string;
  name: string;
  category: "study" | "food" | "market" | "bus" | "beach";
  categoryLabel: string;
  icon: string;
  address: string;
  lat: number;
  lng: number;
  note?: string;
}

// Danh sách các tiện ích thực tế, địa điểm nổi bật cho sinh viên & cư dân tại Nha Trang
const NHA_TRANG_AMENITIES: AmenityPlace[] = [
  {
    id: "ntu",
    name: "Đại học Nha Trang (NTU)",
    category: "study",
    categoryLabel: "Trường học",
    icon: "🎓",
    address: "Số 02 Nguyễn Đình Chiểu, Vĩnh Thọ",
    lat: 12.2682,
    lng: 109.2023,
    note: "Khuôn viên trường, thư viện",
  },
  {
    id: "cd_dulich",
    name: "Trường CĐ Du Lịch Nha Trang",
    category: "study",
    categoryLabel: "Trường học",
    icon: "📚",
    address: "Đường Điện Biên Phủ, Vĩnh Hải",
    lat: 12.274,
    lng: 109.195,
  },
  {
    id: "dh_khanhhoa",
    name: "Đại học Khánh Hòa (Cơ sở 1)",
    category: "study",
    categoryLabel: "Trường học",
    icon: "🏛️",
    address: "01 Nguyễn Chánh, Lộc Thọ",
    lat: 12.245,
    lng: 109.195,
  },
  {
    id: "com_doantrannghiep",
    name: "Phố cơm SV Đoàn Trần Nghiệp (25k-30k)",
    category: "food",
    categoryLabel: "Cơm sinh viên",
    icon: "🍱",
    address: "Đoàn Trần Nghiệp, Vĩnh Phước",
    lat: 12.269,
    lng: 109.2005,
    note: "Rất nhiều quán cơm bình dân & trà sữa",
  },
  {
    id: "com_nguyendinhchieu",
    name: "Dãy quán cơm dốc Đại Học NTU (20k-25k)",
    category: "food",
    categoryLabel: "Cơm sinh viên",
    icon: "🍲",
    address: "Dốc Nguyễn Đình Chiểu, Vĩnh Thọ",
    lat: 12.2675,
    lng: 109.2015,
    note: "Cơm phần sinh viên giá rẻ, bún cá",
  },
  {
    id: "com_bachdang",
    name: "Khu ẩm thực bình dân Bạch Đằng",
    category: "food",
    categoryLabel: "Cơm sinh viên",
    icon: "🍜",
    address: "Bạch Đằng, Phước Tiến",
    lat: 12.238,
    lng: 109.191,
  },
  {
    id: "cho_vinhhai",
    name: "Chợ Vĩnh Hải (Chợ dân sinh lớn)",
    category: "market",
    categoryLabel: "Chợ dân sinh",
    icon: "🛒",
    address: "Đường 2/4, Vĩnh Hải",
    lat: 12.277,
    lng: 109.196,
    note: "Hải sản tươi sống, rau củ rẻ",
  },
  {
    id: "cho_dam",
    name: "Chợ Đầm Nha Trang",
    category: "market",
    categoryLabel: "Chợ dân sinh",
    icon: "🛍️",
    address: "Bến Chợ, Vạn Thạnh",
    lat: 12.252,
    lng: 109.1915,
  },
  {
    id: "cho_xommoi",
    name: "Chợ Xóm Mới",
    category: "market",
    categoryLabel: "Chợ dân sinh",
    icon: "🥬",
    address: "Ngô Gia Tự, Tân Lập",
    lat: 12.242,
    lng: 109.188,
  },
  {
    id: "bus_honxen",
    name: "Trạm xe buýt Tuyến 04 (Hòn Xện - Vinpearl)",
    category: "bus",
    categoryLabel: "Giao thông",
    icon: "🚌",
    address: "Trục đường Phạm Văn Đồng / 2/4",
    lat: 12.275,
    lng: 109.201,
    note: "Đi dọc bờ biển & trung tâm",
  },
  {
    id: "bien_honchong",
    name: "Bãi tắm biển Hòn Chồng",
    category: "beach",
    categoryLabel: "Biển & Giải trí",
    icon: "🏖️",
    address: "Đường Phạm Văn Đồng, Vĩnh Phước",
    lat: 12.272,
    lng: 109.206,
    note: "Tắm biển sáng sớm & ngắm hoàng hôn",
  },
  {
    id: "bien_tranphu",
    name: "Công viên bờ biển Trần Phú",
    category: "beach",
    categoryLabel: "Biển & Giải trí",
    icon: "🌊",
    address: "Đường Trần Phú, Lộc Thọ",
    lat: 12.239,
    lng: 109.197,
  },
];

function calcDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straight = R * c;
  // Nhân hệ số đường đi thực tế 1.3
  return Math.round(straight * 1.3 * 10) / 10;
}

interface LivingRadarWidgetProps {
  roomLat?: number | null;
  roomLng?: number | null;
  district?: string | null;
  address?: string | null;
  title?: string | null;
}

export default function LivingRadarWidget({
  roomLat,
  roomLng,
  district,
  address,
  title,
}: LivingRadarWidgetProps) {
  // Xác định tọa độ thực tế của phòng
  const coords = useMemo(() => {
    let lat = roomLat;
    let lng = roomLng;
    if (!lat || !lng || lat < 12.0 || lat > 12.5) {
      const fullText = `${title || ""} ${address || ""}`;
      const resolved = resolveNhaTrangCoords(fullText, district || undefined);
      lat = resolved[0];
      lng = resolved[1];
    }
    return { lat, lng };
  }, [roomLat, roomLng, district, address, title]);

  // Tính khoảng cách đến các tiện ích và sắp xếp gần nhất
  const nearbyAmenities = useMemo(() => {
    if (!coords.lat || !coords.lng) return [];

    const computed = NHA_TRANG_AMENITIES.map((place) => {
      const distanceKm = calcDistanceKm(coords.lat!, coords.lng!, place.lat, place.lng);
      const walkMin = Math.max(2, Math.round((distanceKm / 4.5) * 60));
      const motorbikeMin = Math.max(1, Math.round((distanceKm / 25) * 60));
      return {
        ...place,
        distanceKm,
        walkMin,
        motorbikeMin,
      };
    });

    // Sắp xếp tăng dần theo khoảng cách
    return computed.sort((a, b) => a.distanceKm - b.distanceKm);
  }, [coords]);

  const closest5 = nearbyAmenities.slice(0, 5);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-bold shadow-xs">
            🧭
          </span>
          <div>
            <h4 className="text-xs font-black text-gray-900 tracking-tight">
              Radar Tiện Ích: &ldquo;Quanh trọ có gì?&rdquo;
            </h4>
            <p className="text-[11px] text-gray-500">
              Đo bán kính thực tế đến trường học, chợ dân sinh &amp; quán cơm SV
            </p>
          </div>
        </div>

        <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
          Gần nhất
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {closest5.map((item) => (
          <div
            key={item.id}
            className="p-2.5 rounded-xl bg-gray-50/80 hover:bg-amber-50/50 border border-gray-100 hover:border-amber-200 transition-all flex items-center justify-between gap-2 text-xs"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-base shrink-0">{item.icon}</span>
              <div className="min-w-0">
                <p className="font-bold text-gray-900 truncate text-[11px]">
                  {item.name}
                </p>
                <p className="text-[10px] text-gray-500 truncate">
                  {item.note || item.categoryLabel}
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="font-black text-blue-700 text-xs block">
                {item.distanceKm} km
              </span>
              <span className="text-[9px] text-gray-500 block">
                🛵 ~{item.motorbikeMin}p
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-1 flex items-center justify-between text-[10px] text-gray-500 border-t border-gray-100">
        <span>📍 Vị trí tính theo tọa độ trung tâm phòng</span>
        <span className="text-emerald-700 font-semibold">Tốc độ xe máy 25km/h</span>
      </div>
    </div>
  );
}
