"use client";

import { useState, useEffect, useMemo } from "react";
import SearchFilter from "./SearchFilter";
import RoomCard from "./RoomCard";
import HeaderChotot from "./HeaderChotot";
import LiveUpdateBanner from "./LiveUpdateBanner";
import NhaTrangInteractiveMap from "./NhaTrangInteractiveMap";
import SmartRoomAssistant from "./SmartRoomAssistant";
import FloatingCompareBar from "./FloatingCompareBar";
import CompareRoomsModal, { CompareRoomItem } from "./CompareRoomsModal";
import { detectOwnerType } from "@/lib/nhatrang-helpers";
import Link from "next/link";

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

interface Stats {
  total: number;
  todayCount: number;
  lastUpdate?: string | null;
}

export default function RoomListClient({
  rooms,
  mapRooms = [],
  total,
  page,
  totalPages,
  stats,
  searchParams,
  category = "rent",
}: {
  rooms: Room[];
  mapRooms?: any[];
  total: number;
  page: number;
  totalPages: number;
  stats: Stats;
  searchParams: Record<string, string | undefined>;
  category?: string;
}) {
  const [viewMode, setViewMode] = useState<"list" | "grid" | "map">("list");
  const [savedCount, setSavedCount] = useState(0);
  const [targetLandmarkId, setTargetLandmarkId] = useState("cd_ktcn");
  const [ownerOnly, setOwnerOnly] = useState(false);

  // So sánh phòng
  const [compareRooms, setCompareRooms] = useState<CompareRoomItem[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  useEffect(() => {
    const updateSaved = () => {
      try {
        const saved = JSON.parse(localStorage.getItem("saved_rooms") || "[]");
        setSavedCount(saved.length);
      } catch {
        setSavedCount(0);
      }
    };
    updateSaved();
    window.addEventListener("storage_saved_rooms", updateSaved);
    return () => window.removeEventListener("storage_saved_rooms", updateSaved);
  }, []);

  useEffect(() => {
    const updateCompare = () => {
      try {
        const data = JSON.parse(localStorage.getItem("compare_rooms") || "[]");
        setCompareRooms(data);
      } catch {
        setCompareRooms([]);
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
  }, []);

  const handleRemoveCompareRoom = (id: number) => {
    const next = compareRooms.filter((r) => r.id !== id);
    setCompareRooms(next);
    localStorage.setItem("compare_rooms", JSON.stringify(next));
    window.dispatchEvent(new Event("storage_compare_rooms"));
  };

  const handleClearCompareAll = () => {
    setCompareRooms([]);
    localStorage.setItem("compare_rooms", JSON.stringify([]));
    window.dispatchEvent(new Event("storage_compare_rooms"));
    setIsCompareModalOpen(false);
  };

  function buildUrl(p: number) {
    const sp = new URLSearchParams();
    Object.entries(searchParams).forEach(([k, v]) => {
      if (v) sp.set(k, v);
    });
    sp.set("page", String(p));
    return `/?${sp.toString()}`;
  }

  const queryTerm = searchParams.q || "";
  const currentDistrict = searchParams.district || "";

  // Lọc theo "Chính chủ 100%" nếu user bật
  const displayedRooms = useMemo(() => {
    if (!ownerOnly) return rooms;
    return rooms.filter((r) => detectOwnerType(r).isOwner);
  }, [rooms, ownerOnly]);

  return (
    <div className="min-h-screen bg-[#F4F4F4]">
      {/* Header Chợ Tốt */}
      <HeaderChotot savedCount={savedCount} />

      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-4">
        {/* Banner giới thiệu kiểu Chợ Tốt */}
        <div className="bg-gradient-to-r from-[#FFF4D6] to-[#FFE8A3] rounded-2xl p-4 sm:p-5 mb-4 border border-[#FFDC73] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-white text-[11px] font-black px-2 py-0.5 rounded-full uppercase ${category === "roommate" ? "bg-rose-600" : "bg-[#FF7A00]"}`}>
                {category === "sale" ? "Nhà Đất Nha Trang" : category === "roommate" ? "🤝 Tìm Bạn Ở Ghép" : "Phòng Trọ Nha Trang"}
              </span>
              <span className="text-xs text-[#666666]">Cập nhật liên tục 24/7</span>
            </div>
            <h1 className="text-base sm:text-lg font-bold text-[#222222]">
              {category === "sale"
                ? "Mua bán nhà đất, nhà phố, căn hộ Nha Trang mới nhất 2026"
                : category === "roommate"
                ? "Tìm bạn ở ghép Nha Trang - Tiết kiệm chi phí, an toàn & vui vẻ"
                : "Tìm phòng trọ, nhà trọ giá rẻ tại Nha Trang mới nhất 2026"}
            </h1>
            <p className="text-xs text-[#555555] mt-0.5">
              {category === "sale"
                ? "Tổng hợp nhà mặt tiền, nhà hẻm, căn hộ, đất nền Nha Trang từ Chợ Tốt & Nhà Tốt. 100% ảnh thật, liên hệ chính chủ."
                : category === "roommate"
                ? "Kết nối sinh viên ĐH Nha Trang, CĐ Sư Phạm, nhân viên văn phòng tìm bạn ở cùng chia sẻ tiền phòng, điện nước an toàn."
                : "Tổng hợp từ Chợ Tốt, Nhà Tốt, Google Maps, Nhóm Facebook Nha Trang & Phongtro123. Đầy đủ hình ảnh, số điện thoại chủ nhà."}
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold shrink-0 bg-white/80 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-amber-200">
            <div>
              <span className="text-base font-extrabold text-[#D0021B] block">{stats.total}</span>
              <span className="text-gray-500 text-[11px]">{category === "sale" ? "Tin đang bán" : category === "roommate" ? "Tin ở ghép" : "Tin đang thuê"}</span>
            </div>
            <div className="w-[1px] h-7 bg-amber-200" />
            <div>
              <span className="text-base font-extrabold text-[#FF7A00] block">{stats.todayCount}</span>
              <span className="text-gray-500 text-[11px]">Mới hôm nay</span>
            </div>
          </div>
        </div>

        {/* Trợ lý tìm nhanh phòng trọ thông minh */}
        <SmartRoomAssistant />

        {/* Bộ lọc Chợ Tốt */}
        <SearchFilter
          viewMode={viewMode}
          onViewModeChange={(m) => setViewMode(m)}
          targetLandmarkId={targetLandmarkId}
          onTargetLandmarkChange={(id) => setTargetLandmarkId(id)}
          ownerOnly={ownerOnly}
          onOwnerOnlyChange={(val) => setOwnerOnly(val)}
        />

        {/* Real-time Live Update Banner */}
        <LiveUpdateBanner category={category} />

        {/* Thanh tiêu đề danh sách */}
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="text-xs sm:text-sm text-[#444444]">
            Tìm thấy <strong className="text-[#222222] font-bold">{displayedRooms.length}</strong> {ownerOnly ? "tin chính chủ" : "tin đăng"}
            {currentDistrict && <span> tại <strong>{currentDistrict}</strong></span>}
            {ownerOnly && <span className="ml-1 text-emerald-700 font-bold">(Đang lọc: Chỉ chính chủ 100%)</span>}
            {searchParams.site && (
              <span className="ml-1 text-[#1967D2] font-semibold">
                (nguồn: {searchParams.site === "google_maps" ? "Google Maps" : searchParams.site === "facebook" ? "Nhóm Facebook" : searchParams.site})
              </span>
            )}
            {queryTerm && <span> theo từ khóa &ldquo;<strong>{queryTerm}</strong>&rdquo;</span>}
          </div>

          {stats.lastUpdate && (
            <div className="text-[11px] text-[#888888]">
              Cập nhật lúc:{" "}
              {new Date(stats.lastUpdate).toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          )}
        </div>

        {/* Danh sách phòng */}
        {displayedRooms.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center my-6">
            <span className="text-5xl mb-3 block">🔍</span>
            <h3 className="font-bold text-gray-700 text-base">Không tìm thấy phòng trọ phù hợp</h3>
            <p className="text-gray-500 text-xs mt-1 max-w-sm mx-auto">
              {ownerOnly
                ? "Không có bài đăng chính chủ nào khớp với khu vực này. Thử tắt bộ lọc chính chủ để xem thêm."
                : "Thử xóa bớt bộ lọc khu vực hoặc khoảng giá để xem thêm nhiều phòng trọ khác tại Nha Trang."}
            </p>
            {ownerOnly ? (
              <button
                onClick={() => setOwnerOnly(false)}
                className="mt-4 inline-block bg-[#FFBA00] hover:bg-[#EAA800] text-[#222222] font-bold text-xs px-4 py-2 rounded-lg transition-colors cursor-pointer"
              >
                Tắt bộ lọc chính chủ
              </button>
            ) : (
              <Link
                href="/"
                className="mt-4 inline-block bg-[#FFBA00] hover:bg-[#EAA800] text-[#222222] font-bold text-xs px-4 py-2 rounded-lg transition-colors"
              >
                Xem tất cả phòng trọ
              </Link>
            )}
          </div>
        ) : viewMode === "map" ? (
          /* Dạng Bản Đồ Tương Tác Nha Trang */
          <div className="space-y-4">
            <NhaTrangInteractiveMap
              rooms={mapRooms && mapRooms.length > 0 ? mapRooms : displayedRooms}
              selectedDistrict={currentDistrict}
            />

            <div className="pt-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-gray-500 mb-2.5">
                Danh sách phòng hiển thị trên bản đồ ({mapRooms && mapRooms.length > 0 ? mapRooms.length : displayedRooms.length} phòng thực tế):
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {(mapRooms && mapRooms.length > 0 ? mapRooms.slice(0, 24) : displayedRooms).map((room) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    viewMode="grid"
                    targetLandmarkId={targetLandmarkId}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : viewMode === "list" ? (
          /* Dạng Danh Sách Ngang Chuẩn Chợ Tốt */
          <div className="space-y-2.5">
            {displayedRooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                viewMode="list"
                targetLandmarkId={targetLandmarkId}
              />
            ))}
          </div>
        ) : (
          /* Dạng Lưới Grid */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {displayedRooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                viewMode="grid"
                targetLandmarkId={targetLandmarkId}
              />
            ))}
          </div>
        )}

        {/* Phân trang Chợ Tốt */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-2">
            {page > 1 && (
              <Link
                href={buildUrl(page - 1)}
                className="px-3.5 py-1.5 text-xs font-semibold bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
              >
                ← Trang trước
              </Link>
            )}

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = i + 1;
                const active = p === page;
                return (
                  <Link
                    key={p}
                    href={buildUrl(p)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${
                      active
                        ? "bg-[#FFBA00] text-[#222222]"
                        : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {p}
                  </Link>
                );
              })}
            </div>

            {page < totalPages && (
              <Link
                href={buildUrl(page + 1)}
                className="px-3.5 py-1.5 text-xs font-semibold bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
              >
                Trang sau →
              </Link>
            )}
          </div>
        )}
      </main>

      {/* Floating Comparison Bottom Bar */}
      <FloatingCompareBar
        compareRooms={compareRooms}
        onOpenModal={() => setIsCompareModalOpen(true)}
        onClearAll={handleClearCompareAll}
        onRemoveRoom={handleRemoveCompareRoom}
      />

      {/* Comparison Modal */}
      {isCompareModalOpen && (
        <CompareRoomsModal
          rooms={compareRooms}
          onClose={() => setIsCompareModalOpen(false)}
          onRemoveRoom={handleRemoveCompareRoom}
          onClearAll={handleClearCompareAll}
        />
      )}

      {/* Footer chuẩn Chợ Tốt */}
      <footer className="mt-12 bg-white border-t border-[#E8E8E8] py-8 text-xs text-[#777777]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <div className="bg-[#222222] text-[#FFBA00] font-black text-sm px-2 py-1 rounded inline-block mb-2">
                CHO TOT TRỌ NHA TRANG
              </div>
              <p className="text-[11px] leading-relaxed text-[#666666]">
                Hệ thống tìm kiếm phòng trọ, nhà trọ cho thuê tại thành phố Nha Trang, tỉnh Khánh Hòa. Dữ liệu tổng hợp và phân loại tự động.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-[#222222] mb-2 uppercase text-[11px]">Khu vực phổ biến</h4>
              <ul className="space-y-1 text-[11px]">
                <li><Link href="/?district=Vĩnh+Hải" className="hover:text-[#FF7A00]">Thuê phòng trọ Vĩnh Hải (gần ĐH Nha Trang)</Link></li>
                <li><Link href="/?district=Phước+Long" className="hover:text-[#FF7A00]">Thuê phòng trọ Phước Long</Link></li>
                <li><Link href="/?district=Lộc+Thọ" className="hover:text-[#FF7A00]">Thuê căn hộ, phòng trọ Lộc Thọ (trung tâm)</Link></li>
                <li><Link href="/?district=Vĩnh+Phước" className="hover:text-[#FF7A00]">Thuê phòng trọ Vĩnh Phước</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-[#222222] mb-2 uppercase text-[11px]">Nguồn dữ liệu</h4>
              <p className="text-[11px] text-[#666666]">
                Tin đăng được cập nhật tự động từ Chợ Tốt, Nhà Tốt, Phongtro123, Mogi và thành viên cộng đồng tự đăng tải.
              </p>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-4 text-center text-[11px] text-gray-400">
            © 2026 Chợ Tốt Trọ Nha Trang • Thiết kế & vận hành trên Localhost
          </div>
        </div>
      </footer>
    </div>
  );
}
