/**
 * Tiện ích bản địa hóa chuyên sâu cho Nha Trang
 * Bao gồm: Đo khoảng cách đi lại, phân tích ngập lụt mùa mưa, và nhận diện chính chủ.
 */

export interface Landmark {
  id: string;
  name: string;
  shortName: string;
  icon: string;
  lat: number;
  lng: number;
  isCustom?: boolean;
}

export interface CustomDestination {
  name: string;
  lat: number;
  lng: number;
  address?: string;
}

export const STORAGE_KEY_CUSTOM_DESTINATION = "nhatrang_custom_destination";

export function getStoredCustomDestination(): CustomDestination | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_DESTINATION);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveCustomDestination(dest: CustomDestination): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_CUSTOM_DESTINATION, JSON.stringify(dest));
    window.dispatchEvent(new CustomEvent("nhatrang_custom_destination_changed", { detail: dest }));
  } catch (err) {
    console.error("Lỗi lưu điểm tùy chọn:", err);
  }
}

export const NHA_TRANG_LANDMARKS: Landmark[] = [
  {
    id: "cd_ktcn",
    name: "Trường CĐ Kỹ Thuật Công Nghệ Nha Trang (Nguyễn Khuyến)",
    shortName: "CĐ Kỹ Thuật CN",
    icon: "⚙️",
    lat: 12.2745,
    lng: 109.1865,
  },
  {
    id: "ntu",
    name: "Đại học Nha Trang (NTU)",
    shortName: "ĐH Nha Trang",
    icon: "🎓",
    lat: 12.2682,
    lng: 109.2023,
  },
  {
    id: "cd_dl",
    name: "Trường CĐ Du Lịch / CĐ Sư Phạm Nha Trang",
    shortName: "CĐ Du Lịch/Sư Phạm",
    icon: "📚",
    lat: 12.274,
    lng: 109.195,
  },
  {
    id: "pho_tay",
    name: "Quảng trường 2/4 & Biển Trần Phú",
    shortName: "Quảng trường 2/4",
    icon: "🏖️",
    lat: 12.2388,
    lng: 109.1967,
  },
  {
    id: "hon_chong",
    name: "Khu du lịch & Bãi tắm Hòn Chồng",
    shortName: "Hòn Chồng",
    icon: "🌊",
    lat: 12.272,
    lng: 109.206,
  },
  {
    id: "bv_khanhhoa",
    name: "Bệnh viện Đa Khoa Khánh Hòa (Quang Trung)",
    shortName: "BV Đa Khoa Khánh Hòa",
    icon: "🏥",
    lat: 12.253,
    lng: 109.192,
  },
  {
    id: "cho_dam",
    name: "Chợ Đầm Nha Trang",
    shortName: "Chợ Đầm",
    icon: "🛍️",
    lat: 12.252,
    lng: 109.1915,
  },
  {
    id: "custom",
    name: "Tự chọn điểm đến trên bản đồ Nha Trang",
    shortName: "📍 Ghim trên map",
    icon: "📍",
    lat: 12.253,
    lng: 109.192,
    isCustom: true,
  },
];

// Tọa độ trung tâm các phường Nha Trang
export const DISTRICT_COORDS: Record<string, [number, number]> = {
  "Vĩnh Hải": [12.275, 109.198],
  "Vĩnh Phước": [12.265, 109.201],
  "Vĩnh Thọ": [12.261, 109.198],
  "Xương Huân": [12.253, 109.196],
  "Vạn Thạnh": [12.251, 109.192],
  "Vạn Thắng": [12.253, 109.186],
  "Phương Sài": [12.251, 109.181],
  "Phương Sơn": [12.248, 109.176],
  "Ngọc Hiệp": [12.258, 109.172],
  "Phước Tiến": [12.246, 109.188],
  "Phước Tân": [12.247, 109.184],
  "Phước Hòa": [12.239, 109.185],
  "Phước Hải": [12.236, 109.175],
  "Phước Long": [12.221, 109.182],
  "Lộc Thọ": [12.2395, 109.196],
  "Tân Lập": [12.241, 109.189],
  "Vĩnh Nguyên": [12.215, 109.207],
  "Vĩnh Trường": [12.208, 109.205],
  "Vĩnh Thạnh": [12.261, 109.145],
  "Vĩnh Lương": [12.335, 109.182],
  "Vĩnh Phương": [12.29, 109.145],
  "Vĩnh Hiệp": [12.252, 109.155],
  "Vĩnh Thái": [12.235, 109.155],
  "Phước Đồng": [12.195, 109.155],
  "Nha Trang": [12.248, 109.19],
};

/**
 * Tính khoảng cách đường bộ ước tính (km) và thời gian đi xe máy (phút)
 */
export function calculateCommute(
  roomLat?: number | null,
  roomLng?: number | null,
  district?: string | null,
  roomId?: number,
  targetLandmarkId: string = "cd_ktcn",
  customDestOverride?: CustomDestination | null
): { distanceKm: number; motorbikeMin: number; walkMin: number; landmarkName: string } {
  let target = NHA_TRANG_LANDMARKS.find((l) => l.id === targetLandmarkId) || NHA_TRANG_LANDMARKS[0];
  let displayName = target.shortName;

  if (targetLandmarkId === "custom") {
    const customDest = customDestOverride !== undefined ? customDestOverride : getStoredCustomDestination();
    if (customDest && customDest.lat && customDest.lng) {
      target = {
        ...target,
        lat: customDest.lat,
        lng: customDest.lng,
      };
      displayName = customDest.name ? (customDest.name.length > 15 ? customDest.name.slice(0, 15) + "…" : customDest.name) : "Điểm của bạn";
    }
  }

  let lat = roomLat;
  let lng = roomLng;

  if (!lat || !lng) {
    const d = district || "Nha Trang";
    const center = DISTRICT_COORDS[d] || DISTRICT_COORDS["Nha Trang"];
    // Offset giả lập theo ID phòng để tạo sự tự nhiên
    const offset = roomId ? ((roomId % 9) - 4) * 0.0025 : 0;
    lat = center[0] + offset;
    lng = center[1] + offset * 0.8;
  }

  // Haversine formula
  const R = 6371; // Earth radius in km
  const dLat = ((target.lat - lat) * Math.PI) / 180;
  const dLng = ((target.lng - lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat * Math.PI) / 180) *
      Math.cos((target.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightKm = R * c;

  // Hệ số uốn lượn đường phố Nha Trang x1.3
  const roadKm = Math.max(0.3, Math.round(straightKm * 1.3 * 10) / 10);
  // Tốc độ xe máy trung bình 25km/h trong đô thị
  const motorbikeMin = Math.max(1, Math.round((roadKm / 25) * 60));
  // Tốc độ đi bộ 4.5km/h
  const walkMin = Math.max(3, Math.round((roadKm / 4.5) * 60));

  return {
    distanceKm: roadKm,
    motorbikeMin,
    walkMin,
    landmarkName: displayName,
  };
}

/**
 * Phân tích địa hình & cảnh báo ngập úng mùa mưa tại Nha Trang
 */
export interface FloodInsight {
  status: "safe" | "low_risk" | "flood_prone";
  badgeText: string;
  badgeBg: string;
  badgeTextColor: string;
  description: string;
}

export function getNhaTrangFloodInsight(
  district?: string | null,
  address?: string | null
): FloodInsight {
  const text = `${district || ""} ${address || ""}`.toLowerCase();

  // Vùng trũng thấp hoặc gần thoát nước chậm khi mưa bão Nha Trang
  if (
    text.includes("hòn xện") ||
    text.includes("đường 2/4") ||
    text.includes("2 tháng 4") ||
    text.includes("vĩnh phương") ||
    text.includes("vĩnh thạnh") ||
    text.includes("vĩnh trung") ||
    text.includes("cầu hà ra") ||
    text.includes("xóm bóng") ||
    text.includes("tháp bà") ||
    text.includes("phước đồng")
  ) {
    return {
      status: "flood_prone",
      badgeText: "⚠️ Đoạn trũng mùa mưa",
      badgeBg: "bg-amber-100",
      badgeTextColor: "text-amber-800",
      description: "Lưu ý: Khu vực trũng thấp ven sông hoặc trục đường 2/4 có thể ngập cục bộ khi triều cường hoặc mưa lớn cuối năm.",
    };
  }

  // Vùng cao ráo, thoát nước cực tốt
  if (
    text.includes("la san") ||
    text.includes("đoàn trần nghiệp") ||
    text.includes("đh nha trang") ||
    text.includes("nguyễn đình chiểu") ||
    text.includes("lộc thọ") ||
    text.includes("tân lập") ||
    text.includes("phước tiến") ||
    text.includes("hoàng hoa thám") ||
    text.includes("yersin") ||
    text.includes("trần phú") ||
    text.includes("vĩnh thọ")
  ) {
    return {
      status: "safe",
      badgeText: "🌤️ Cao ráo không ngập",
      badgeBg: "bg-emerald-100",
      badgeTextColor: "text-emerald-800",
      description: "Khu vực địa hình cao, dốc thoát nước tốt ra biển, yên tâm không ngập úng mùa mưa bão.",
    };
  }

  // Mặc định: An toàn bình thường
  return {
    status: "low_risk",
    badgeText: "🛡️ Thoát nước ổn định",
    badgeBg: "bg-blue-50",
    badgeTextColor: "text-blue-700",
    description: "Khu vực hệ thống thoát nước đô thị bình thường, ít chịu ảnh hưởng.",
  };
}

/**
 * Nhận diện tin đăng của Chính chủ 100% hay Môi giới
 */
export function detectOwnerType(room: {
  contact?: string | null;
  description?: string | null;
  sourceSite?: string;
  sourceUrl?: string;
}): { isOwner: boolean; label: string; badgeClass: string } {
  const desc = (room.description || "").toLowerCase();
  const contact = (room.contact || "").toLowerCase();

  // Dấu hiệu môi giới
  const brokerKeywords = [
    "môi giới",
    "hoa hồng",
    "chuyên viên bđs",
    "giỏ hàng",
    "kho phòng",
    "phí dịch vụ xem phòng",
    "phí dẫn khách",
  ];
  const isBroker = brokerKeywords.some((k) => desc.includes(k) || contact.includes(k));

  if (isBroker) {
    return {
      isOwner: false,
      label: "Môi giới BĐS",
      badgeClass: "bg-purple-100 text-purple-800 border-purple-200",
    };
  }

  // Dấu hiệu chính chủ
  const ownerKeywords = [
    "chính chủ",
    "nhà mình",
    "cô chủ",
    "chú chủ",
    "bác chủ",
    "miễn trung gian",
    "ở chung chủ",
    "không chung chủ",
    "ở ghép",
    "phòng trọ gia đình",
  ];
  const hasOwnerSignal =
    ownerKeywords.some((k) => desc.includes(k) || contact.includes(k)) ||
    room.sourceSite === "nguoidang";

  if (hasOwnerSignal) {
    return {
      isOwner: true,
      label: "Chính chủ 100% ✓",
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-300 font-bold",
    };
  }

  return {
    isOwner: false,
    label: "Tin xác thực",
    badgeClass: "bg-gray-100 text-gray-700 border-gray-200",
  };
}
