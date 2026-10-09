"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface PresetChip {
  id: string;
  label: string;
  badge?: string;
  href: string;
  icon: string;
}

const PRESET_CHIPS: PresetChip[] = [
  {
    id: "ntu-student",
    label: "SV NTU dưới 2tr",
    badge: "Phổ biến",
    href: "/?district=Vĩnh+Hải&maxPrice=2000000&category=rent",
    icon: "🎓",
  },
  {
    id: "near-beach",
    label: "Gần biển Hòn Chồng có gác",
    href: "/?q=Hòn+Chồng+gác&category=rent",
    icon: "🏖️",
  },
  {
    id: "ac-loc-tho",
    label: "Có máy lạnh Lộc Thọ",
    badge: "Trung tâm",
    href: "/?district=Lộc+Thọ&q=máy+lạnh&category=rent",
    icon: "❄️",
  },
  {
    id: "roommate-female",
    label: "Tìm bạn nữ ở ghép",
    badge: "Hot",
    href: "/?category=roommate&q=nữ",
    icon: "🤝",
  },
  {
    id: "freedom-247",
    label: "Giờ giấc tự do, không chung chủ",
    href: "/?q=tự+do+không+chung+chủ&category=rent",
    icon: "🔑",
  },
  {
    id: "budget-1m5",
    label: "Phòng giá rẻ dưới 1.5tr",
    href: "/?maxPrice=1500000&category=rent",
    icon: "💰",
  },
];

export default function SmartRoomAssistant() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleNaturalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsProcessing(true);
    const lower = query.toLowerCase().trim();
    const params = new URLSearchParams();

    // 1. Phân tích loại danh mục (ở ghép vs phòng thuê)
    if (lower.includes("ở ghép") || lower.includes("tìm bạn") || lower.includes("share phòng")) {
      params.set("category", "roommate");
    } else {
      params.set("category", "rent");
    }

    // 2. Phân tích khu vực Nha Trang
    if (lower.includes("vĩnh hải") || lower.includes("ntu") || lower.includes("đại học nha trang")) {
      params.set("district", "Vĩnh Hải");
    } else if (lower.includes("lộc thọ")) {
      params.set("district", "Lộc Thọ");
    } else if (lower.includes("vĩnh phước")) {
      params.set("district", "Vĩnh Phước");
    } else if (lower.includes("vĩnh thọ")) {
      params.set("district", "Vĩnh Thọ");
    } else if (lower.includes("phước long")) {
      params.set("district", "Phước Long");
    } else if (lower.includes("phước hải")) {
      params.set("district", "Phước Hải");
    } else if (lower.includes("tân lập")) {
      params.set("district", "Tân Lập");
    }

    // 3. Phân tích mức giá
    if (lower.includes("dưới 1.5") || lower.includes("dưới 1tr5") || lower.includes("dưới 1,5")) {
      params.set("maxPrice", "1500000");
    } else if (lower.includes("dưới 2") || lower.includes("dưới 2tr") || lower.includes("tầm 2tr")) {
      params.set("maxPrice", "2000000");
    } else if (lower.includes("dưới 2.5") || lower.includes("dưới 2tr5") || lower.includes("dưới 2,5")) {
      params.set("maxPrice", "2500000");
    } else if (lower.includes("dưới 3") || lower.includes("dưới 3tr") || lower.includes("tầm 3tr")) {
      params.set("maxPrice", "3000000");
    } else if (lower.includes("dưới 1") || lower.includes("dưới 1tr")) {
      params.set("maxPrice", "1000000");
    }

    // 4. Từ khóa tìm kiếm còn lại
    let cleanedQ = query
      .replace(/dưới \d+(\.\d+)?(tr|triệu)?/gi, "")
      .replace(/(ở ghép|phòng trọ|nha trang|thuê phòng)/gi, "")
      .trim();

    if (cleanedQ) {
      params.set("q", cleanedQ);
    }

    params.set("page", "1");
    router.push(`/?${params.toString()}`);
    setIsProcessing(false);
  };

  return (
    <div className="bg-gradient-to-r from-[#FFFBEB] via-[#FEF3C7] to-[#E0F2FE] rounded-2xl border-2 border-amber-300/90 p-3.5 sm:p-4 mb-4 shadow-sm">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#FF7A00] to-amber-400 text-white flex items-center justify-center text-sm shadow-xs font-bold">
            ⚡
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1.5">
              <span>Trợ Lý Tìm Nhanh Phòng Trọ Nha Trang</span>
              <span className="text-[10px] bg-[#0284C7] text-white px-2 py-0.2 rounded-full font-bold uppercase tracking-wider shadow-2xs">
                Smart AI
              </span>
            </h2>
          </div>
        </div>

        <span className="text-[11px] text-amber-950 font-medium hidden sm:inline">
          Gõ tự nhiên theo nhu cầu hoặc chọn gợi ý bên dưới
        </span>
      </div>

      {/* Natural Search Input Form */}
      <form onSubmit={handleNaturalSearch} className="relative mb-3">
        <div className="flex items-center bg-white rounded-xl pl-3.5 pr-1.5 py-1.5 border border-amber-300 focus-within:border-[#0284C7] focus-within:ring-2 focus-within:ring-sky-200/60 shadow-xs transition-all">
          <span className="text-gray-400 text-sm mr-2 shrink-0">🔍</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ví dụ: 'Phòng gần ĐH Nha Trang dưới 2 triệu có máy lạnh' hoặc 'Tìm bạn nữ ở ghép'..."
            className="w-full text-xs sm:text-sm text-gray-800 placeholder:text-gray-400 outline-none bg-transparent"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="p-1 mr-1 text-gray-400 hover:text-gray-600 rounded-full text-xs"
            >
              ✕
            </button>
          )}
          <button
            type="submit"
            disabled={isProcessing}
            className="bg-linear-to-r from-[#FF7A00] to-[#E66E00] hover:brightness-105 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg shadow-xs flex items-center gap-1 shrink-0 transition-transform active:scale-95 cursor-pointer disabled:opacity-60"
          >
            <span>{isProcessing ? "Đang lọc..." : "Tìm ngay"}</span>
            <span>➜</span>
          </button>
        </div>
      </form>

      {/* Preset Chips Carousel / Quick Links */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        <span className="text-[11px] font-bold text-amber-900 shrink-0 flex items-center gap-1">
          <span>Gợi ý:</span>
        </span>
        {PRESET_CHIPS.map((chip) => (
          <button
            key={chip.id}
            type="button"
            onClick={() => router.push(chip.href)}
            className="group flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/90 hover:bg-white border border-amber-200 hover:border-[#FF7A00] text-gray-700 hover:text-[#FF7A00] font-semibold shrink-0 text-xs shadow-2xs transition-all hover:scale-[1.02] cursor-pointer"
          >
            <span>{chip.icon}</span>
            <span>{chip.label}</span>
            {chip.badge && (
              <span className="text-[9px] font-black px-1 py-0.2 rounded-full bg-amber-100 text-[#FF7A00] group-hover:bg-[#FF7A00] group-hover:text-white transition-colors">
                {chip.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
