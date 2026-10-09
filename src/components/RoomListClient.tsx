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
import Image from "next/image";

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
    <div className="min-h-screen bg-[#EEF6FB] pb-16 md:pb-0">
      {/* Header Chợ Tốt */}
      <HeaderChotot savedCount={savedCount} />

      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-4">
        {/* Banner giới thiệu Trọ Biển Nha Trang */}
        <div className="relative bg-gradient-to-br from-[#0284C7] via-[#0369A1] to-[#0A4D68] text-white rounded-3xl p-5 sm:p-6 mb-4 shadow-xl shadow-sky-900/15 border border-sky-400/40 overflow-hidden">
          {/* Decorative glowing ambient beach lights */}
          <div className="absolute -right-12 -top-12 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute right-1/4 -bottom-16 w-56 h-56 bg-teal-400/20 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute left-1/3 -top-10 w-40 h-40 bg-orange-500/20 rounded-full blur-2xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`text-white text-[11px] font-black px-3 py-0.5 rounded-full uppercase shadow-sm tracking-wide ${category === "roommate" ? "bg-rose-500" : category === "sale" ? "bg-emerald-500" : "bg-gradient-to-r from-[#FF7A00] to-[#FF5500]"}`}>
                  {category === "sale" ? "🏖️ Nhà Đất Biển Nha Trang" : category === "roommate" ? "🤝 Tìm Bạn Ở Ghép" : "🌊 Trọ Biển Nha Trang"}
                </span>
                <span className="text-xs font-semibold text-sky-200 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  Cập nhật liên tục 24/7
                </span>
              </div>

              <h1 className="text-lg sm:text-2xl font-black text-white tracking-tight drop-shadow-xs">
                {category === "sale"
                  ? "Mua bán nhà đất, nhà phố, căn hộ Nha Trang mới nhất 2026"
                  : category === "roommate"
                  ? "Tìm bạn ở ghép Nha Trang - Tiết kiệm chi phí, kết nối thân thiện"
                  : "Tìm phòng gần biển, an tâm giá tốt - Trọ Biển Nha Trang 2026"}
              </h1>

              <p className="text-xs sm:text-sm text-sky-100 mt-1 leading-relaxed">
                {category === "sale"
                  ? "Tổng hợp nhà mặt tiền, nhà hẻm, căn hộ, đất nền toàn thành phố biển Nha Trang. 100% hình ảnh thực, liên hệ chính chủ."
                  : category === "roommate"
                  ? "Kết nối sinh viên ĐH Nha Trang, CĐ Kỹ Thuật Công Nghệ, nhân viên văn phòng tìm bạn ở ghép chia sẻ chi phí an toàn."
                  : "Hệ sinh thái tìm kiếm phòng trọ số 1 Nha Trang. Đo khoảng cách thực tế, cảnh báo ngập lụt mùa mưa và xác thực chính chủ."}
              </p>

              {/* Colorful feature chips */}
              <div className="flex flex-wrap gap-2 mt-3 text-[11px] font-semibold">
                <span className="bg-white/15 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 text-white flex items-center gap-1 shadow-2xs">
                  <span>🏖️</span> Gần biển mát mẻ
                </span>
                <span className="bg-white/15 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 text-white flex items-center gap-1 shadow-2xs">
                  <span>🛡️</span> Xác thực chính chủ 100%
                </span>
                <span className="bg-white/15 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 text-white flex items-center gap-1 shadow-2xs">
                  <span>📍</span> Đo km ĐH Nha Trang &amp; CĐ KTCN
                </span>
              </div>
            </div>

            {/* Stat Box */}
            <div className="flex items-center gap-4 text-xs font-semibold shrink-0 bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/80 shadow-xl text-gray-800">
              <div>
                <span className="text-xl font-black text-[#D0021B] block">{stats.total}</span>
                <span className="text-gray-500 text-[11px] font-medium">{category === "sale" ? "Tin đang bán" : category === "roommate" ? "Tin ở ghép" : "Tin đang thuê"}</span>
              </div>
              <div className="w-[1px] h-9 bg-sky-200" />
              <div>
                <span className="text-xl font-black text-[#FF7A00] block">{stats.todayCount}</span>
                <span className="text-gray-500 text-[11px] font-medium">Mới hôm nay</span>
              </div>
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

      {/* Footer chuẩn Trọ Biển Nha Trang */}
      <footer className="mt-14 bg-gradient-to-b from-[#0F1E36] to-[#0A1628] text-slate-300 border-t-4 border-[#0284C7] py-10 text-xs">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-white rounded-2xl p-1.5 shadow-md border border-white/90 inline-flex items-center justify-center shrink-0">
                  <Image
                    src="/tro-bien-logo.png"
                    alt="Trọ Biển Nha Trang"
                    width={100}
                    height={100}
                    className="h-14 w-14 object-contain rounded-xl"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 leading-none">
                    <span className="font-black text-xl text-white tracking-tight">TRỌ BIỂN</span>
                    <span className="text-[10px] font-black bg-[#FF7A00] text-white px-1.5 py-0.5 rounded uppercase">Nha Trang</span>
                  </div>
                  <p className="text-orange-400 font-bold text-xs mt-1">
                    Tìm phòng gần biển, an tâm giá tốt
                  </p>
                </div>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-300">
                Nền tảng tìm kiếm và kết nối phòng trọ, căn hộ, nhà ở uy tín hàng đầu thành phố biển Nha Trang. Bảo vệ người thuê với Khiên chống lừa đảo, Bản đồ ngập lụt &amp; Định giá AI.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-3 uppercase text-xs tracking-wider">Khu vực phổ biến</h4>
              <ul className="space-y-1.5 text-[11px]">
                <li><Link href="/?district=Vĩnh+Hải" className="text-slate-300 hover:text-sky-300 transition-colors">Thuê phòng trọ Vĩnh Hải (gần ĐH Nha Trang)</Link></li>
                <li><Link href="/?district=Vĩnh+Hòa" className="text-slate-300 hover:text-sky-300 transition-colors">Thuê phòng trọ Vĩnh Hòa (gần CĐ KTCN Nha Trang)</Link></li>
                <li><Link href="/?district=Lộc+Thọ" className="text-slate-300 hover:text-sky-300 transition-colors">Thuê căn hộ, phòng trọ Lộc Thọ (trung tâm biển)</Link></li>
                <li><Link href="/?district=Vĩnh+Phước" className="text-slate-300 hover:text-sky-300 transition-colors">Thuê phòng trọ Vĩnh Phước (gần biển Hòn Chồng)</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-3 uppercase text-xs tracking-wider">Cam kết dịch vụ</h4>
              <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
                100% tin đăng được xác minh thực tế, phân loại chính chủ minh bạch và cập nhật tự động liên tục phục vụ cộng đồng sinh viên, người lao động tại Nha Trang.
              </p>
              <div className="flex flex-wrap gap-1.5">
                <span className="bg-sky-900/60 text-sky-200 border border-sky-700/50 text-[10px] px-2 py-0.5 rounded-full font-bold">🛡️ Khiên lừa đảo</span>
                <span className="bg-amber-900/60 text-amber-200 border border-amber-700/50 text-[10px] px-2 py-0.5 rounded-full font-bold">🌧️ Radar ngập lụt</span>
                <span className="bg-emerald-900/60 text-emerald-200 border border-emerald-700/50 text-[10px] px-2 py-0.5 rounded-full font-bold">🤖 Định giá AI</span>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-4 text-center text-[11px] text-slate-400">
            © 2026 Trọ Biển Nha Trang (trobien.vn) • Nền tảng tìm kiếm phòng trọ số 1 thành phố biển Nha Trang
          </div>
        </div>
      </footer>
    </div>
  );
}
