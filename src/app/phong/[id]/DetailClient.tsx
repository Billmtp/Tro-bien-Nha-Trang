"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import RoomCard from "@/components/RoomCard";
import CostCalculatorWidget from "@/components/CostCalculatorWidget";
import RoomMultiSourceReviews from "@/components/RoomMultiSourceReviews";
import RentalContractModal from "@/components/RentalContractModal";
import RoomChecklistModal from "@/components/RoomChecklistModal";
import FairPriceEstimator from "@/components/FairPriceEstimator";
import LivingRadarWidget from "@/components/LivingRadarWidget";
import RoommateBillSplitterModal from "@/components/RoommateBillSplitterModal";
import ScamReportModal from "@/components/ScamReportModal";
import CompareRoomsModal, { CompareRoomItem } from "@/components/CompareRoomsModal";
import FloatingCompareBar from "@/components/FloatingCompareBar";
import { showAppAlert } from "@/components/AppNotificationModal";
import { filterRealImages, getSourcePlaceholder } from "@/lib/room-images";
import {
  calculateCommute,
  getNhaTrangFloodInsight,
  detectOwnerType,
  getStoredCustomDestination,
  CustomDestination,
} from "@/lib/nhatrang-helpers";
import CustomDestinationModal from "@/components/CustomDestinationModal";

interface RoomDetail {
  id: number;
  title: string;
  price: number | null;
  area: number | null;
  address: string | null;
  district: string | null;
  description: string | null;
  images: string[];
  sourceUrl: string;
  sourceSite: string;
  contact?: string | null;
  scrapedAt: string;
  updatedAt: string;
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

// Trích xuất số điện thoại từ contact hoặc nội dung mô tả
function extractPhone(contact?: string | null, desc?: string | null): string {
  if (contact && /0\d{8,10}/.test(contact)) {
    const m = contact.match(/0\d{8,10}/);
    if (m) return m[0];
  }
  if (desc && /0\d{8,10}/.test(desc)) {
    const m = desc.match(/0\d{8,10}/);
    if (m) return m[0];
  }
  return "0905 123 456";
}

export default function DetailClient({
  room,
  similarRooms,
}: {
  room: RoomDetail;
  similarRooms: any[];
}) {
  const [selectedImg, setSelectedImg] = useState(0);
  const [showPhone, setShowPhone] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isCompared, setIsCompared] = useState(false);
  const [isContractOpen, setIsContractOpen] = useState(false);
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const [isBillSplitterOpen, setIsBillSplitterOpen] = useState(false);
  const [isScamReportOpen, setIsScamReportOpen] = useState(false);
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

  const images = filterRealImages(room.images, room.sourceSite);
  const phone = extractPhone(room.contact, room.description);

  // Commute distance, flood risk & owner classification
  const commuteCD = calculateCommute(null, null, room.district, room.id, "cd_ktcn");
  const commuteNTU = calculateCommute(null, null, room.district, room.id, "ntu");
  const commuteBeach = calculateCommute(null, null, room.district, room.id, "pho_tay");
  const commuteCustom = calculateCommute(null, null, room.district, room.id, "custom", customDest);
  const flood = getNhaTrangFloodInsight(room.district, room.address);
  const owner = detectOwnerType(room);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("saved_rooms") || "[]");
      setIsSaved(saved.some((r: any) => r.id === room.id));
    } catch {
      setIsSaved(false);
    }
  }, [room.id]);

  useEffect(() => {
    try {
      const compare = JSON.parse(localStorage.getItem("compare_rooms") || "[]");
      setIsCompared(compare.some((r: any) => r.id === room.id));
    } catch {
      setIsCompared(false);
    }
  }, [room.id]);

  const toggleSave = () => {
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
            image: images[0],
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

  const [compareRooms, setCompareRooms] = useState<CompareRoomItem[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  useEffect(() => {
    const updateCompare = () => {
      try {
        const data = JSON.parse(localStorage.getItem("compare_rooms") || "[]");
        setCompareRooms(data);
        setIsCompared(data.some((r: any) => r.id === room.id));
      } catch {
        setCompareRooms([]);
        setIsCompared(false);
      }
    };
    updateCompare();

    const handleOpenCompareModal = (e: any) => {
      if (e.detail) {
        setCompareRooms(e.detail);
      }
      setIsCompareModalOpen(true);
    };

    window.addEventListener("storage_compare_rooms", updateCompare);
    window.addEventListener("open_compare_modal", handleOpenCompareModal);
    return () => {
      window.removeEventListener("storage_compare_rooms", updateCompare);
      window.removeEventListener("open_compare_modal", handleOpenCompareModal);
    };
  }, [room.id]);

  const handleOpenOrToggleCompare = () => {
    try {
      const data: CompareRoomItem[] = JSON.parse(localStorage.getItem("compare_rooms") || "[]");
      const alreadyIn = data.some((r) => r.id === room.id);

      if (!alreadyIn) {
        if (data.length >= 3) {
          showAppAlert(
            "Bạn đã chọn 3 phòng trong bảng so sánh. Bảng so sánh sẽ mở ngay để bạn đối chiếu hoặc thay thế.",
            "Danh sách đã đủ 3 phòng",
            "info"
          );
          setIsCompareModalOpen(true);
          return;
        }

        const next = [
          ...data,
          {
            id: room.id,
            title: room.title,
            price: room.price,
            area: room.area,
            district: room.district,
            address: room.address,
            image: images[0],
            contact: room.contact,
            sourceSite: room.sourceSite,
            description: room.description,
          },
        ];
        localStorage.setItem("compare_rooms", JSON.stringify(next));
        setCompareRooms(next);
        setIsCompared(true);
        window.dispatchEvent(new Event("storage_compare_rooms"));
      }

      // MỞ NGAY BẢNG SO SÁNH
      setIsCompareModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveCompareRoom = (id: number) => {
    const next = compareRooms.filter((r) => r.id !== id);
    setCompareRooms(next);
    localStorage.setItem("compare_rooms", JSON.stringify(next));
    if (id === room.id) setIsCompared(false);
    window.dispatchEvent(new Event("storage_compare_rooms"));
    if (next.length === 0) setIsCompareModalOpen(false);
  };

  const handleClearAllCompare = () => {
    setCompareRooms([]);
    localStorage.setItem("compare_rooms", "[]");
    setIsCompared(false);
    window.dispatchEvent(new Event("storage_compare_rooms"));
    setIsCompareModalOpen(false);
  };

  const handleAddCompareRoom = (newRoom: CompareRoomItem) => {
    if (compareRooms.length >= 3) {
      showAppAlert("Bạn chỉ có thể so sánh tối đa 3 phòng cùng lúc.", "Đạt giới hạn", "warning");
      return;
    }
    const next = [...compareRooms, newRoom];
    setCompareRooms(next);
    localStorage.setItem("compare_rooms", JSON.stringify(next));
    if (newRoom.id === room.id) setIsCompared(true);
    window.dispatchEvent(new Event("storage_compare_rooms"));
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4">
      {/* Breadcrumb */}
      <nav className="text-xs text-[#777777] mb-3 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap">
        <Link href="/" className="hover:text-[#FF7A00]">Trang chủ</Link>
        <span>›</span>
        <Link href={`/?district=${encodeURIComponent(room.district || "")}`} className="hover:text-[#FF7A00]">
          {room.district || "Nha Trang"}
        </Link>
        <span>›</span>
        <span className="text-[#222222] font-medium truncate max-w-xs">{room.title}</span>
      </nav>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Cột Trái: Chi tiết tin (2 phần) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Card Hình Ảnh */}
          <div className="bg-white rounded-2xl border border-[#E8E8E8] overflow-hidden shadow-xs">
            {/* Ảnh lớn */}
            <div className="relative aspect-[16/10] bg-black">
              <Image
                src={images[selectedImg] || getSourcePlaceholder(room.sourceSite)}
                alt={room.title}
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 66vw"
                unoptimized
                priority
              />
              <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2.5 py-1 rounded-full">
                📷 {selectedImg + 1} / {images.length}
              </div>
            </div>

            {/* Thumbnail list */}
            {images.length > 1 && (
              <div className="p-3 bg-gray-50 flex gap-2 overflow-x-auto border-t border-gray-100">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImg(idx)}
                    className={`relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                      selectedImg === idx ? "border-[#FF7A00] scale-95 shadow" : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image src={img} alt={`Ảnh ${idx + 1}`} fill className="object-cover" unoptimized />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Card Thông tin cơ bản */}
          <div className="bg-white rounded-2xl border border-[#E8E8E8] p-5 shadow-xs">
            <h1 className="text-lg sm:text-xl font-bold text-[#222222] leading-snug">
              {room.title}
            </h1>

            {/* Mức giá & diện tích banner */}
            <div className="flex flex-wrap items-baseline gap-3 my-3 pb-3 border-b border-gray-100">
              <span className="text-2xl font-black text-[#D0021B]">
                {formatPrice(room.price)}
              </span>
              {room.area && (
                <span className="text-sm font-semibold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-md">
                  {room.area} m²
                </span>
              )}
              <span className="text-xs text-gray-400 ml-auto">
                Mã tin: #{room.id}
              </span>
            </div>

            {/* Địa chỉ */}
            <div className="flex items-start gap-2 text-xs sm:text-sm text-gray-600 mb-4">
              <span className="text-base text-[#FF7A00]">📍</span>
              <div>
                <strong>Địa chỉ: </strong>
                <span>{room.address || `${room.district}, TP. Nha Trang, Khánh Hòa`}</span>
              </div>
            </div>

            {/* Bảng đặc điểm phòng trọ chuẩn Chợ Tốt */}
            <div className="bg-[#FAF8F5] rounded-xl p-4 border border-[#F0EBE1] mb-5">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#A66D00] mb-3">
                Đặc điểm phòng trọ
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-gray-500 block">Khu vực:</span>
                  <strong className="text-gray-800">{room.district || "Nha Trang"}</strong>
                </div>
                <div>
                  <span className="text-gray-500 block">Diện tích:</span>
                  <strong className="text-gray-800">{room.area ? `${room.area} m²` : "20 m²"}</strong>
                </div>
                <div>
                  <span className="text-gray-500 block">Tiền đặt cọc:</span>
                  <strong className="text-gray-800">1 tháng tiền phòng</strong>
                </div>
                <div>
                  <span className="text-gray-500 block">Tình trạng:</span>
                  <strong className="text-green-600">Đang trống, ở ngay</strong>
                </div>
                <div>
                  <span className="text-gray-500 block">Thời gian đăng:</span>
                  <strong className="text-gray-800">{new Date(room.scrapedAt).toLocaleDateString("vi-VN")}</strong>
                </div>
                <div>
                  <span className="text-gray-500 block">Nguồn tin:</span>
                  <strong className="text-gray-800 capitalize">{room.sourceSite}</strong>
                </div>
              </div>
            </div>

            {/* Phân tích định giá phòng AI Nha Trang */}
            <FairPriceEstimator
              price={room.price}
              area={room.area}
              district={room.district}
              className="mb-5"
            />

            {/* Phân tích di chuyển & Địa hình Nha Trang */}
            <div className="bg-linear-to-r from-amber-500/10 via-orange-500/5 to-emerald-500/10 rounded-2xl p-4 border border-amber-300/70 mb-5">
              <h3 className="font-bold text-xs uppercase tracking-wider text-amber-900 mb-3 flex items-center justify-between gap-1.5 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <span>🛵</span> Thông tin di chuyển & Đánh giá khu vực Nha Trang
                </span>
                <button
                  type="button"
                  onClick={() => setIsCustomModalOpen(true)}
                  className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 bg-white px-2.5 py-1 rounded-lg border border-emerald-300 shadow-2xs flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>📍</span>
                  <span>{customDest ? `Ghim: ${customDest.name}` : "Tự ghim điểm đến"}</span>
                </button>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                {/* Khoảng cách CĐ Kỹ Thuật Công Nghệ */}
                <div className="bg-white p-3 rounded-xl border border-amber-200/60 shadow-2xs">
                  <span className="text-gray-500 block mb-0.5 text-[11px] font-semibold">⚙️ Tới CĐ Kỹ Thuật CN:</span>
                  <strong className="text-orange-700 font-extrabold text-sm block">
                    {commuteCD.distanceKm} km
                  </strong>
                  <span className="text-[11px] text-gray-500">
                    ~{commuteCD.motorbikeMin} phút xe máy • {commuteCD.walkMin} phút đi bộ
                  </span>
                </div>

                {/* Khoảng cách ĐH Nha Trang */}
                <div className="bg-white p-3 rounded-xl border border-amber-200/60 shadow-2xs">
                  <span className="text-gray-500 block mb-0.5 text-[11px] font-semibold">🎓 Tới ĐH Nha Trang (NTU):</span>
                  <strong className="text-emerald-700 font-extrabold text-sm block">
                    {commuteNTU.distanceKm} km
                  </strong>
                  <span className="text-[11px] text-gray-500">
                    ~{commuteNTU.motorbikeMin} phút xe máy • {commuteNTU.walkMin} phút đi bộ
                  </span>
                </div>

                {/* Khoảng cách Bãi biển */}
                <div className="bg-white p-3 rounded-xl border border-amber-200/60 shadow-2xs">
                  <span className="text-gray-500 block mb-0.5 text-[11px] font-semibold">🏖️ Tới Biển Trần Phú:</span>
                  <strong className="text-blue-700 font-extrabold text-sm block">
                    {commuteBeach.distanceKm} km
                  </strong>
                  <span className="text-[11px] text-gray-500">
                    ~{commuteBeach.motorbikeMin} phút xe máy
                  </span>
                </div>

                {/* Điểm ghim tùy chọn của bạn */}
                <div className="bg-white p-3 rounded-xl border border-amber-200/60 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="text-gray-500 text-[11px] font-semibold truncate">
                        📍 {customDest?.name ? customDest.name : "Điểm ghim của bạn:"}
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsCustomModalOpen(true)}
                        className="text-[10px] text-emerald-700 hover:text-emerald-900 font-bold underline shrink-0 cursor-pointer"
                      >
                        {customDest ? "Đổi" : "Ghim"}
                      </button>
                    </div>
                    {customDest ? (
                      <>
                        <strong className="text-red-600 font-extrabold text-sm block">
                          {commuteCustom.distanceKm} km
                        </strong>
                        <span className="text-[11px] text-gray-500">
                          ~{commuteCustom.motorbikeMin} phút xe máy
                        </span>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsCustomModalOpen(true)}
                        className="w-full mt-1 py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg text-emerald-800 font-bold text-[11px] transition-colors cursor-pointer text-center"
                      >
                        + Ghim điểm trên map
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Đánh giá ngập úng mùa mưa */}
              <div className="mt-3 bg-white p-3 rounded-xl border border-amber-200/60 shadow-2xs flex items-center justify-between flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className={`font-bold text-xs px-2.5 py-1 rounded-lg ${flood.badgeBg} ${flood.badgeTextColor} shrink-0`}>
                    {flood.badgeText}
                  </span>
                  <p className="text-[11px] text-gray-600 leading-tight">
                    {flood.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Tiện ích phòng trọ (Tags phong cách Chợ Tốt) */}
            <div className="mb-5">
              <h3 className="font-bold text-xs uppercase tracking-wider text-gray-500 mb-2">
                Tiện ích & Tiện nghi đi kèm
              </h3>
              <div className="flex flex-wrap gap-2 text-xs">
                {["Gác lửng", "Vệ sinh khép kín", "Chỗ để xe máy", "Không chung chủ", "Giờ giấc tự do", "Wifi tốc độ cao", "Khu an ninh"].map((tag) => (
                  <span key={tag} className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 font-medium flex items-center gap-1.5">
                    <span className="text-green-600 font-bold">✓</span> {tag}
                  </span>
                ))}
              </div>
            </div>

              {/* Nội dung mô tả */}
              <div>
                <h3 className="font-bold text-sm text-[#222222] mb-2">
                  Mô tả chi tiết
                </h3>
                <div className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50 p-4 rounded-xl border border-gray-100">
                  {room.description || "Phòng trọ sạch sẽ, thoáng mát, khu dân cư an ninh tại Nha Trang. Gần chợ, trường học, trạm xe buýt. Vui lòng liên hệ số điện thoại để xem phòng trực tiếp."}
                </div>
              </div>

              {/* Nhóm Facebook Source Banner */}
              {room.sourceSite === "facebook" && (
                <div className="mt-4 p-3.5 bg-[#E7F3FF] border border-[#BBD7FF] rounded-xl flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs text-[#1877F2] font-semibold">
                    <span className="text-base">👥</span>
                    <span>Tin đăng từ Nhóm Cộng Đồng Facebook Phòng Trọ Nha Trang</span>
                  </div>
                  <a
                    href={room.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-[#1877F2] text-white text-xs font-bold rounded-lg hover:bg-[#166FE5] transition-colors shrink-0"
                  >
                    Xem bài đăng trên Facebook ↗
                  </a>
                </div>
              )}

              {/* Vị trí trên Google Maps */}
              <div className="mt-5 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="font-bold text-sm text-[#222222] flex items-center gap-1.5">
                    <span>🗺️</span> Vị trí & Chỉ đường Google Maps
                  </h3>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(room.address || `${room.district}, Nha Trang`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#1967D2] font-semibold hover:underline flex items-center gap-1"
                  >
                    Mở Google Maps chỉ đường ↗
                  </a>
                </div>
                <div className="w-full h-56 rounded-xl overflow-hidden border border-gray-200 shadow-inner">
                  <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(room.address || `${room.district}, Nha Trang`)}&hl=vi&z=15&output=embed`}
                  />
                </div>
              </div>

              {/* Radar Tiện Ích: Quanh trọ có gì? */}
              <div className="mt-5">
                <LivingRadarWidget
                  district={room.district}
                  address={room.address}
                  title={room.title}
                />
              </div>
            </div>

          {/* Cảnh báo an toàn Chợ Tốt */}
          <div className="bg-[#FFF9E6] border border-[#FFE8A3] rounded-2xl p-4 text-xs text-[#8A6000] flex gap-3 items-start">
            <span className="text-xl">⚠️</span>
            <div>
              <strong className="font-bold block mb-0.5">Lưu ý an toàn từ Chợ Tốt:</strong>
              <p className="leading-relaxed text-[11px]">
                KHÔNG chuyển khoản hoặc đặt cọc tiền giữ phòng khi chưa đến xem phòng trực tiếp và chưa ký kết hợp đồng rõ ràng. Cẩn thận với các phòng trọ có giá thuê quá rẻ so với mặt bằng chung.
              </p>
            </div>
          </div>

          {/* Bình luận & Đánh giá từ cộng đồng (Facebook, Google Maps, NTU) */}
          <RoomMultiSourceReviews
            roomId={room.id}
            roomDistrict={room.district}
            roomAddress={room.address}
            roomTitle={room.title}
          />
        </div>

        {/* Cột Phải: Thông tin người bán & Liên hệ (Sticky Card) */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[#E8E8E8] p-5 shadow-xs sticky top-20">
            {/* Người đăng card */}
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <div className="w-12 h-12 rounded-full bg-[#FFBA00] text-[#222222] font-black text-lg flex items-center justify-center shrink-0">
                {room.contact ? room.contact.charAt(0).toUpperCase() : "C"}
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-sm text-[#222222] truncate">
                  {room.contact || "Chủ phòng trọ Nha Trang"}
                </h4>
                <div className="flex items-center gap-1.5 text-[11px] text-green-600 mt-0.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span>Đang hoạt động</span>
                </div>
              </div>
            </div>

            {/* Các nút liên hệ hành động */}
            <div className="pt-4 space-y-2.5">
              {/* Nút Hiện SĐT / Gọi ngay */}
              <button
                onClick={() => setShowPhone(!showPhone)}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-[#26A69A] hover:bg-[#1E8E83] text-white flex items-center justify-center gap-2 shadow-sm transition-all transform active:scale-98"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {showPhone ? (
                  <a href={`tel:${phone}`} className="hover:underline">
                    {phone} • GỌI NGAY
                  </a>
                ) : (
                  <span>HIỆN SỐ ĐIỆN THOẠI</span>
                )}
              </button>

              {/* Nút Chat Zalo */}
              <a
                href={`https://zalo.me/${phone.replace(/\s+/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-[#0068FF] hover:bg-[#0052CC] text-white flex items-center justify-center gap-2 shadow-sm transition-all text-center block"
              >
                <span>💬 CHAT QUA ZALO</span>
              </a>

              {/* Nút Lưu tin & Xem tin gốc */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={toggleSave}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-colors ${
                    isSaved
                      ? "border-[#D0021B] text-[#D0021B] bg-red-50"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <svg className="w-4 h-4" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth={isSaved ? 0 : 2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {isSaved ? "Đã lưu tin" : "Lưu tin"}
                </button>

                <a
                  href={room.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-3 rounded-xl text-xs font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-1 text-center"
                >
                  <span>Tin gốc ↗</span>
                </a>
              </div>

              {/* Nút So sánh phòng & Mở bảng trực tiếp */}
              <button
                onClick={handleOpenOrToggleCompare}
                className={`w-full py-2.5 px-3 rounded-xl text-xs font-black border flex items-center justify-center gap-1.5 transition-all transform active:scale-98 cursor-pointer ${
                  isCompared
                    ? "bg-[#FF7A00] hover:bg-[#E66E00] text-white border-[#FF7A00] shadow-md ring-2 ring-amber-300/60"
                    : "bg-amber-50 hover:bg-amber-100 text-[#FF7A00] hover:text-[#E66E00] border-amber-300 shadow-2xs"
                }`}
              >
                <span>⚖️</span>
                <span>{isCompared ? "MỞ BẢNG SO SÁNH PHÒNG NÀY (ĐÃ LƯU ✓)" : "BẬT BẢNG SO SÁNH PHÒNG NÀY ➔"}</span>
              </button>

              {/* Nút Tạo Hợp đồng & Cọc 1-click */}
              <button
                onClick={() => setIsContractOpen(true)}
                className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>📄</span>
                <span>TẠO HỢP ĐỒNG &amp; CỌC 1-CLICK</span>
              </button>

              {/* Nút Checklist khi đi xem trọ */}
              <button
                onClick={() => setIsChecklistOpen(true)}
                className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>📋</span>
                <span>CHECKLIST KHI ĐI XEM PHÒNG</span>
              </button>

              {/* Nút Chia tiền phòng & VietQR */}
              <button
                onClick={() => setIsBillSplitterOpen(true)}
                className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>🧮</span>
                <span>CHIA TIỀN PHÒNG &amp; MÃ VIETQR</span>
              </button>

              {/* Nút Khiên chống lừa đảo & Báo cáo tin ảo */}
              <button
                onClick={() => setIsScamReportOpen(true)}
                className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>🛡️</span>
                <span>KHIÊN BẢO VỆ &amp; BÁO CÁO TIN</span>
              </button>
            </div>

            {/* Thông tin hỗ trợ */}
            <div className="mt-4 pt-3 border-t border-gray-100 text-[11px] text-gray-400 text-center">
              Tin được xác thực tự động trên hệ thống Nha Trang
            </div>
          </div>

          {/* Dự toán chi phí hàng tháng thực tế */}
          <CostCalculatorWidget basePrice={room.price} />
        </div>
      </div>

      {/* Tin đăng tương tự */}
      {similarRooms.length > 0 && (
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base text-[#222222]">
              Phòng trọ tương tự tại Nha Trang
            </h3>
            <Link href="/" className="text-xs text-[#FF7A00] font-semibold hover:underline">
              Xem tất cả →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {similarRooms.map((sr) => (
              <RoomCard key={sr.id} room={sr} viewMode="grid" />
            ))}
          </div>
        </div>
      )}

      {/* Modal Hợp đồng */}
      {isContractOpen && (
        <RentalContractModal
          onClose={() => setIsContractOpen(false)}
          initialData={{
            roomTitle: room.title,
            roomAddress: room.address || `${room.district}, Nha Trang`,
            roomPrice: room.price,
            ownerContact: phone,
          }}
        />
      )}

      {/* Modal Checklist */}
      {isChecklistOpen && (
        <RoomChecklistModal onClose={() => setIsChecklistOpen(false)} />
      )}

      {/* Modal Chia tiền phòng & VietQR */}
      {isBillSplitterOpen && (
        <RoommateBillSplitterModal
          roomTitle={room.title}
          defaultRoomPrice={room.price}
          onClose={() => setIsBillSplitterOpen(false)}
        />
      )}

      {/* Modal Khiên chống lừa đảo */}
      {isScamReportOpen && (
        <ScamReportModal
          roomId={room.id}
          roomTitle={room.title}
          sourceUrl={room.sourceUrl}
          onClose={() => setIsScamReportOpen(false)}
        />
      )}

      {/* Thanh so sánh nổi ở góc màn hình */}
      <FloatingCompareBar
        compareRooms={compareRooms}
        onOpenModal={() => setIsCompareModalOpen(true)}
        onClearAll={handleClearAllCompare}
        onRemoveRoom={handleRemoveCompareRoom}
      />

      {/* Modal Bảng So Sánh Tùy Biến Nha Trang */}
      {isCompareModalOpen && (
        <CompareRoomsModal
          rooms={compareRooms}
          onClose={() => setIsCompareModalOpen(false)}
          onRemoveRoom={handleRemoveCompareRoom}
          onClearAll={handleClearAllCompare}
          onAddRoom={handleAddCompareRoom}
        />
      )}

      {/* Modal Chọn Điểm Đến Tùy Chọn Trên Map */}
      <CustomDestinationModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onSelectDestination={(dest) => setCustomDest(dest)}
      />
    </div>
  );
}
