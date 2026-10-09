"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  NHA_TRANG_LANDMARKS,
  getStoredCustomDestination,
  CustomDestination,
} from "@/lib/nhatrang-helpers";
import CustomDestinationModal from "@/components/CustomDestinationModal";

const DISTRICTS = [
  "Tất cả khu vực",
  "Vĩnh Hải", "Vĩnh Phước", "Vĩnh Thọ", "Xương Huân", "Vạn Thắng",
  "Phước Hòa", "Phước Long", "Phước Tiến", "Ngọc Hiệp", "Phương Sài",
  "Phương Sơn", "Lộc Thọ", "Tân Lập", "Vĩnh Nguyên", "Vĩnh Trường",
  "Vĩnh Thạnh", "Vĩnh Lương", "Phước Đồng",
];

const PRICE_RANGES_RENT = [
  { label: "Tất cả mức giá", min: 0, max: 0 },
  { label: "Dưới 1.5 triệu", min: 0, max: 1_500_000 },
  { label: "1.5 – 3 triệu", min: 1_500_000, max: 3_000_000 },
  { label: "3 – 5 triệu", min: 3_000_000, max: 5_000_000 },
  { label: "Trên 5 triệu", min: 5_000_000, max: 0 },
];

const PRICE_RANGES_SALE = [
  { label: "Tất cả mức giá", min: 0, max: 0 },
  { label: "Dưới 1.5 tỷ", min: 0, max: 1_500_000_000 },
  { label: "1.5 – 3 tỷ", min: 1_500_000_000, max: 3_000_000_000 },
  { label: "3 – 6 tỷ", min: 3_000_000_000, max: 6_000_000_000 },
  { label: "Trên 6 tỷ", min: 6_000_000_000, max: 0 },
];

const SORTS = [
  { label: "Tin mới đăng nhất", value: "newest" },
  { label: "Giá thấp đến cao", value: "price_asc" },
  { label: "Giá cao đến thấp", value: "price_desc" },
];

const SOURCES = [
  { label: "Tất cả nguồn tin", value: "" },
  { label: "👥 Nhóm Facebook Nha Trang", value: "facebook" },
  { label: "🏢 Batdongsan.com.vn", value: "batdongsan" },
  { label: "🏡 Alonhadat Nha Trang", value: "alonhadat" },
  { label: "🌐 Homedy Nha Trang", value: "homedy" },
  { label: "🗺️ Google Maps Địa Điểm", value: "google_maps" },
  { label: "Nhà Tốt / Chợ Tốt", value: "nhatot" },
  { label: "Phongtro123", value: "phongtro123" },
  { label: "👤 Thành viên tự đăng", value: "nguoidang" },
];

export default function SearchFilter({
  viewMode,
  onViewModeChange,
  targetLandmarkId = "ntu",
  onTargetLandmarkChange,
  ownerOnly = false,
  onOwnerOnlyChange,
}: {
  viewMode?: "list" | "grid" | "map";
  onViewModeChange?: (mode: "list" | "grid" | "map") => void;
  targetLandmarkId?: string;
  onTargetLandmarkChange?: (id: string) => void;
  ownerOnly?: boolean;
  onOwnerOnlyChange?: (val: boolean) => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSale = searchParams.get("category") === "sale";
  const currentPriceRanges = isSale ? PRICE_RANGES_SALE : PRICE_RANGES_RENT;

  const [district, setDistrict] = useState(searchParams.get("district") || "Tất cả khu vực");
  const [site, setSite] = useState(searchParams.get("site") || "");
  const [priceIndex, setPriceIndex] = useState(0);
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");
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

  const applyFilters = useCallback(
    (newDistrict?: string, newPriceIdx?: number, newSort?: string, newSite?: string) => {
      const d = newDistrict !== undefined ? newDistrict : district;
      const pIdx = newPriceIdx !== undefined ? newPriceIdx : priceIndex;
      const s = newSort !== undefined ? newSort : sort;
      const st = newSite !== undefined ? newSite : site;

      const params = new URLSearchParams(searchParams.toString());
      if (d && d !== "Tất cả khu vực") params.set("district", d);
      else params.delete("district");

      if (st) params.set("site", st);
      else params.delete("site");

      const priceObj = currentPriceRanges[pIdx] || currentPriceRanges[0];
      if (priceObj.min > 0) params.set("minPrice", String(priceObj.min));
      else params.delete("minPrice");

      if (priceObj.max > 0) params.set("maxPrice", String(priceObj.max));
      else params.delete("maxPrice");

      if (s && s !== "newest") params.set("sort", s);
      else params.delete("sort");

      params.set("page", "1");
      router.push(`/?${params.toString()}`);
    },
    [district, priceIndex, sort, site, router, searchParams, currentPriceRanges]
  );

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-[#E8E8E8] p-3 md:p-4 mb-4">
      {/* Top Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#F0F0F0]">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Khu vực Dropdown */}
          <div className="relative">
            <select
              value={district}
              onChange={(e) => {
                setDistrict(e.target.value);
                applyFilters(e.target.value, undefined, undefined);
              }}
              className="bg-[#F4F4F4] hover:bg-[#EAEAEA] text-[#222222] text-xs md:text-sm font-medium py-2 px-3 rounded-xl border border-transparent focus:border-[#FFBA00] outline-none cursor-pointer transition-colors"
            >
              {DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  📍 {d}
                </option>
              ))}
            </select>
          </div>

          {/* Mức giá Dropdown */}
          <div className="relative">
            <select
              value={priceIndex}
              onChange={(e) => {
                const idx = Number(e.target.value);
                setPriceIndex(idx);
                applyFilters(undefined, idx, undefined);
              }}
              className="bg-[#F4F4F4] hover:bg-[#EAEAEA] text-[#222222] text-xs md:text-sm font-medium py-2 px-3 rounded-xl border border-transparent focus:border-[#FFBA00] outline-none cursor-pointer transition-colors"
            >
              {currentPriceRanges.map((r, i) => (
                <option key={i} value={i}>
                  💰 {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sắp xếp */}
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                applyFilters(undefined, undefined, e.target.value, undefined);
              }}
              className="bg-[#F4F4F4] hover:bg-[#EAEAEA] text-[#222222] text-xs md:text-sm font-medium py-2 px-3 rounded-xl border border-transparent focus:border-[#FFBA00] outline-none cursor-pointer transition-colors"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  ⇅ {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Nguồn tin */}
          <div className="relative">
            <select
              value={site}
              onChange={(e) => {
                setSite(e.target.value);
                applyFilters(undefined, undefined, undefined, e.target.value);
              }}
              className="bg-[#F4F4F4] hover:bg-[#EAEAEA] text-[#222222] text-xs md:text-sm font-medium py-2 px-3 rounded-xl border border-transparent focus:border-[#FFBA00] outline-none cursor-pointer transition-colors"
            >
              {SOURCES.map((sc) => (
                <option key={sc.value} value={sc.value}>
                  {sc.label}
                </option>
              ))}
            </select>
          </div>

          {/* Đo khoảng cách đến Địa danh Nha Trang */}
          {onTargetLandmarkChange && (
            <div className="flex items-center gap-1.5">
              <div className="relative">
                <select
                  value={targetLandmarkId}
                  onChange={(e) => {
                    const val = e.target.value;
                    onTargetLandmarkChange(val);
                    if (val === "custom") {
                      setIsCustomModalOpen(true);
                    }
                  }}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs md:text-sm font-bold py-2 px-3 rounded-xl outline-none cursor-pointer transition-colors shadow-2xs"
                  title="Chọn điểm đến để đo khoảng cách và thời gian đi xe máy"
                >
                  {NHA_TRANG_LANDMARKS.map((lm) => (
                    <option key={lm.id} value={lm.id}>
                      {lm.id === "custom" && customDest?.name
                        ? `📍 Đến ${customDest.name.length > 18 ? customDest.name.slice(0, 18) + "…" : customDest.name}`
                        : `${lm.icon} Đến ${lm.shortName}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Nút sửa / chọn lại điểm ghim trên map */}
              {targetLandmarkId === "custom" && (
                <button
                  type="button"
                  onClick={() => setIsCustomModalOpen(true)}
                  className="py-2 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 transition-all shadow-xs cursor-pointer"
                  title="Mở bản đồ để đổi vị trí điểm ghim của bạn"
                >
                  <span>📍</span>
                  <span className="hidden sm:inline">Đổi ghim</span>
                </button>
              )}
            </div>
          )}

          {/* Bộ lọc Chính chủ */}
          {onOwnerOnlyChange && (
            <button
              type="button"
              onClick={() => onOwnerOnlyChange(!ownerOnly)}
              className={`py-2 px-3 rounded-xl text-xs md:text-sm font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                ownerOnly
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                  : "bg-[#F4F4F4] hover:bg-emerald-50 text-gray-700 border-gray-200 hover:text-emerald-800"
              }`}
              title="Chỉ hiển thị bài đăng từ chính chủ 100%"
            >
              <span>{ownerOnly ? "✓" : "🛡️"}</span>
              <span>Chính chủ 100%</span>
            </button>
          )}
        </div>

        {/* View Mode Switcher (List vs Grid vs Map) */}
        {onViewModeChange && (
          <div className="flex items-center gap-1 bg-[#F4F4F4] p-1 rounded-xl shrink-0">
            <button
              onClick={() => onViewModeChange("list")}
              className={`p-1.5 px-2 rounded-lg flex items-center justify-center transition-all ${
                viewMode === "list"
                  ? "bg-white text-[#FF7A00] shadow-xs font-bold"
                  : "text-[#777777] hover:text-black"
              }`}
              title="Dạng danh sách (Chợ Tốt)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={() => onViewModeChange("grid")}
              className={`p-1.5 px-2 rounded-lg flex items-center justify-center transition-all ${
                viewMode === "grid"
                  ? "bg-white text-[#FF7A00] shadow-xs font-bold"
                  : "text-[#777777] hover:text-black"
              }`}
              title="Dạng lưới"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => onViewModeChange("map")}
              className={`p-1.5 px-2.5 rounded-lg flex items-center gap-1 justify-center transition-all ${
                viewMode === "map"
                  ? "bg-white text-[#FF7A00] shadow-xs font-bold"
                  : "text-[#777777] hover:text-black"
              }`}
              title="Bản đồ phòng trọ Nha Trang"
            >
              <span className="text-xs">🗺️</span>
              <span className="text-[11px] font-bold hidden sm:inline">Bản đồ</span>
            </button>
          </div>
        )}
      </div>

      {/* Quick Location Pills */}
      <div className="pt-2.5 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none text-xs">
        <span className="text-[#888888] font-medium shrink-0 mr-1">Khu vực nổi bật:</span>
        {["Tất cả khu vực", "Vĩnh Hải", "Vĩnh Phước", "Phước Long", "Lộc Thọ", "Ngọc Hiệp", "Vĩnh Thọ"].map((d) => {
          const active = district === d;
          return (
            <button
              key={d}
              onClick={() => {
                setDistrict(d);
                applyFilters(d, undefined, undefined);
              }}
              className={`px-2.5 py-1 rounded-full text-xs transition-colors shrink-0 ${
                active
                  ? "bg-[#FFBA00] text-[#222222] font-bold shadow-xs"
                  : "bg-[#F4F4F4] text-[#555555] hover:bg-[#EAEAEA]"
              }`}
            >
              {d}
            </button>
          );
        })}
      </div>

      {/* Modal chọn điểm đến tùy chọn trên map */}
      <CustomDestinationModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onSelectDestination={(dest) => {
          setCustomDest(dest);
          if (onTargetLandmarkChange) {
            onTargetLandmarkChange("custom");
          }
        }}
      />
    </div>
  );
}
