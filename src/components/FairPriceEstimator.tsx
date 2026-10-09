"use client";

import { useMemo } from "react";

// Đơn giá trung bình thị trường Nha Trang (VNĐ/m²) theo từng phường
const NHA_TRANG_WARD_BENCHMARKS: Record<string, { avgPerM2: number; label: string }> = {
  "Lộc Thọ": { avgPerM2: 125_000, label: "Trung tâm phố Tây / Sát biển" },
  "Tân Lập": { avgPerM2: 110_000, label: "Trung tâm thương mại / Sầm uất" },
  "Phước Tiến": { avgPerM2: 100_000, label: "Trung tâm hành chính" },
  "Phước Tân": { avgPerM2: 95_000, label: "Khu dân cư bàn cờ trung tâm" },
  "Phước Hòa": { avgPerM2: 90_000, label: "Gần đường Lê Hồng Phong" },
  "Phương Sài": { avgPerM2: 85_000, label: "Khu Chợ Phương Sài" },
  "Phương Sơn": { avgPerM2: 80_000, label: "Gần Ga Nha Trang" },
  "Vạn Thạnh": { avgPerM2: 95_000, label: "Gần Chợ Đầm" },
  "Vạn Thắng": { avgPerM2: 85_000, label: "Gần đường 2/4" },
  "Xương Huân": { avgPerM2: 90_000, label: "Gần biển cầu Trần Phú" },
  "Vĩnh Hải": { avgPerM2: 75_000, label: "Làng đại học NTU / Gần biển Hòn Chồng" },
  "Vĩnh Phước": { avgPerM2: 72_000, label: "Khu sinh viên ĐH NTU & Tháp Bà" },
  "Vĩnh Thọ": { avgPerM2: 80_000, label: "Đồi La San / Gần biển Hòn Chồng" },
  "Vĩnh Hòa": { avgPerM2: 75_000, label: "Khu bến du thuyền Ana Marina" },
  "Phước Long": { avgPerM2: 75_000, label: "Khu đô thị phía Nam" },
  "Phước Hải": { avgPerM2: 80_000, label: "Khu đô thị VCN Phước Hải" },
  "Ngọc Hiệp": { avgPerM2: 65_000, label: "Ven sông Cái" },
  "Vĩnh Hiệp": { avgPerM2: 60_000, label: "Trục 23/10" },
  "Vĩnh Thái": { avgPerM2: 65_000, label: "Gần trung tâm hành chính mới" },
  "Vĩnh Thạnh": { avgPerM2: 55_000, label: "Ngoại ô ven Chợ Ga" },
  "Vĩnh Phương": { avgPerM2: 50_000, label: "Ven đô Quốc lộ 1" },
  "Vĩnh Lương": { avgPerM2: 45_000, label: "Khu vực Cảng Cá Vĩnh Lương" },
  "Phước Đồng": { avgPerM2: 55_000, label: "Phía Nam gần Cù Hin" },
  "Nha Trang": { avgPerM2: 80_000, label: "Mặt bằng chung TP. Nha Trang" },
};

interface FairPriceEstimatorProps {
  price?: number | null;
  area?: number | null;
  district?: string | null;
  className?: string;
  compact?: boolean;
}

export default function FairPriceEstimator({
  price,
  area,
  district,
  className = "",
  compact = false,
}: FairPriceEstimatorProps) {
  const analysis = useMemo(() => {
    if (!price || !area || price <= 0 || area <= 0) {
      return null;
    }

    const d = district && NHA_TRANG_WARD_BENCHMARKS[district] ? district : "Nha Trang";
    const benchmark = NHA_TRANG_WARD_BENCHMARKS[d] || NHA_TRANG_WARD_BENCHMARKS["Nha Trang"];

    const actualPerM2 = Math.round(price / area);
    const expectedPrice = Math.round(area * benchmark.avgPerM2);
    const diffPercent = Math.round(((actualPerM2 - benchmark.avgPerM2) / benchmark.avgPerM2) * 100);

    let level: "bargain" | "fair" | "premium";
    let badgeText: string;
    let badgeBg: string;
    let badgeTextColor: string;
    let explanation: string;

    if (diffPercent <= -15) {
      level = "bargain";
      badgeText = "🟢 Kèo thơm (Rẻ hơn mặt bằng)";
      badgeBg = "bg-emerald-50 border-emerald-300";
      badgeTextColor = "text-emerald-800";
      explanation = `Rẻ hơn ~${Math.abs(diffPercent)}% so với mức phổ biến tại ${d}. Rất thích hợp để thuê sớm!`;
    } else if (diffPercent <= 15) {
      level = "fair";
      badgeText = "🟡 Đúng giá thị trường";
      badgeBg = "bg-amber-50 border-amber-300";
      badgeTextColor = "text-amber-800";
      explanation = `Đơn giá sát mức trung bình tại ${d} (~${benchmark.avgPerM2.toLocaleString("vi")} đ/m²).`;
    } else {
      level = "premium";
      badgeText = "🔴 Cao hơn trung bình";
      badgeBg = "bg-purple-50 border-purple-300";
      badgeTextColor = "text-purple-800";
      explanation = `Cao hơn ~${diffPercent}% so với trung bình phòng cơ bản. Nên kiểm tra xem có đủ full nội thất/máy giặt/view biển.`;
    }

    return {
      actualPerM2,
      benchmarkPerM2: benchmark.avgPerM2,
      expectedPrice,
      diffPercent,
      level,
      badgeText,
      badgeBg,
      badgeTextColor,
      explanation,
      wardLabel: benchmark.label,
      districtName: d,
    };
  }, [price, area, district]);

  if (!analysis) return null;

  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${analysis.badgeBg} ${analysis.badgeTextColor} ${className}`}
        title={`Đơn giá: ${analysis.actualPerM2.toLocaleString("vi")} đ/m² - Mặt bằng ${analysis.districtName}: ${analysis.benchmarkPerM2.toLocaleString("vi")} đ/m²`}
      >
        <span>{analysis.badgeText}</span>
      </span>
    );
  }

  return (
    <div className={`p-3.5 rounded-2xl border ${analysis.badgeBg} text-xs space-y-2.5 ${className}`}>
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 font-bold">
          <span className="text-base">🤖</span>
          <span className="text-gray-900 font-extrabold">Định giá phòng AI Nha Trang:</span>
        </div>
        <span className={`px-2.5 py-0.5 rounded-full font-black text-[11px] border ${analysis.badgeBg} ${analysis.badgeTextColor}`}>
          {analysis.badgeText}
        </span>
      </div>

      <p className="text-[11px] text-gray-700 leading-relaxed">
        {analysis.explanation}
      </p>

      {/* Thông số chi tiết */}
      <div className="grid grid-cols-3 gap-2 text-center bg-white/80 p-2.5 rounded-xl border border-gray-200/70 text-[11px]">
        <div>
          <span className="text-gray-500 block text-[10px]">Đơn giá phòng</span>
          <strong className="text-gray-900 font-bold block mt-0.5">
            {analysis.actualPerM2.toLocaleString("vi")} đ/m²
          </strong>
        </div>
        <div className="border-x border-gray-200">
          <span className="text-gray-500 block text-[10px]">Mặt bằng {analysis.districtName}</span>
          <strong className="text-gray-900 font-bold block mt-0.5">
            {analysis.benchmarkPerM2.toLocaleString("vi")} đ/m²
          </strong>
        </div>
        <div>
          <span className="text-gray-500 block text-[10px]">Giá ước tính chuẩn</span>
          <strong className="text-blue-700 font-bold block mt-0.5">
            {(analysis.expectedPrice / 1_000_000).toFixed(1)} triệu
          </strong>
        </div>
      </div>
    </div>
  );
}
