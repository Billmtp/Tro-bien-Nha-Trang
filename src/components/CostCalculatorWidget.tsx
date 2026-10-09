"use client";

import { useState } from "react";

export default function CostCalculatorWidget({
  basePrice,
}: {
  basePrice: number | null;
}) {
  const roomPrice = basePrice || 1_800_000;
  const isSale = roomPrice >= 100_000_000; // nếu là mua bán thì không tính tiền trọ

  const [peopleCount, setPeopleCount] = useState<number>(1);
  const [hasAC, setHasAC] = useState<boolean>(roomPrice >= 2_000_000);
  const [cooking, setCooking] = useState<"often" | "rare">("often");
  const [motorbikes, setMotorbikes] = useState<number>(1);
  const [electricRate, setElectricRate] = useState<number>(3500); // 3.5k/kwh
  const [waterRate, setWaterRate] = useState<number>(60000); // 60k/người

  if (isSale) {
    return null; // Không hiện với tin mua bán nhà đất
  }

  // Ước tính số điện tiêu thụ (kWh)
  let kwh = 40 * peopleCount; // tủ lạnh, quạt, đèn, laptop, sạc
  if (hasAC) {
    kwh += peopleCount === 1 ? 90 : 140; // máy lạnh mùa nóng Nha Trang
  }
  if (cooking === "often") {
    kwh += 25; // bếp từ, nồi cơm
  }

  const electricCost = Math.round(kwh * electricRate);
  const waterCost = Math.round(peopleCount * waterRate);
  const wifiGarbageCost = 100_000; // wifi + rác
  const parkingCost = motorbikes > 1 ? (motorbikes - 1) * 50_000 : 0;

  const totalMonthlyCost = roomPrice + electricCost + waterCost + wifiGarbageCost + parkingCost;

  return (
    <div className="bg-white rounded-2xl border border-amber-200/90 p-4 sm:p-5 shadow-sm space-y-4">
      {/* Widget Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-[#FF7A00] flex items-center justify-center text-lg font-bold">
            🧮
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-gray-900">
              Dự Toán Chi Phí Hàng Tháng Thực Tế
            </h3>
            <p className="text-[11px] text-gray-500">
              Tránh bị hớ tiền điện nước, phí dịch vụ phát sinh
            </p>
          </div>
        </div>

        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
          Chợ Tốt Tool
        </span>
      </div>

      {/* Interactive Inputs */}
      <div className="space-y-3 text-xs">
        {/* Số người ở */}
        <div>
          <label className="font-bold text-gray-700 block mb-1.5">
            1. Số lượng người ở cùng:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setPeopleCount(num)}
                className={`py-1.5 px-3 rounded-lg font-bold transition-all text-xs ${
                  peopleCount === num
                    ? "bg-[#FF7A00] text-white shadow-xs"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                {num} người {num === 1 ? "(Một mình)" : num === 2 ? "(Ở ghép 2)" : "(Ở ghép 3)"}
              </button>
            ))}
          </div>
        </div>

        {/* Dùng máy lạnh (Điều hòa) */}
        <div>
          <label className="font-bold text-gray-700 block mb-1.5">
            2. Có sử dụng máy lạnh (điều hòa) không?
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setHasAC(true)}
              className={`py-1.5 px-3 rounded-lg font-bold transition-all text-xs flex items-center justify-center gap-1.5 ${
                hasAC
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              <span>❄️</span> Có dùng máy lạnh
            </button>
            <button
              type="button"
              onClick={() => setHasAC(false)}
              className={`py-1.5 px-3 rounded-lg font-bold transition-all text-xs flex items-center justify-center gap-1.5 ${
                !hasAC
                  ? "bg-gray-800 text-white shadow-xs"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              <span>💨</span> Chỉ dùng quạt gió
            </button>
          </div>
        </div>

        {/* Nấu ăn & Xe máy */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <div>
            <label className="font-semibold text-gray-600 block mb-1 text-[11px]">
              Tần suất nấu ăn:
            </label>
            <select
              value={cooking}
              onChange={(e) => setCooking(e.target.value as any)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-1.5 text-xs text-gray-800 outline-none"
            >
              <option value="often">🍳 Nấu thường xuyên</option>
              <option value="rare">🥡 Ít nấu / Ăn ngoài</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-gray-600 block mb-1 text-[11px]">
              Số lượng xe máy:
            </label>
            <select
              value={motorbikes}
              onChange={(e) => setMotorbikes(Number(e.target.value))}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-1.5 text-xs text-gray-800 outline-none"
            >
              <option value={0}>Không có xe</option>
              <option value={1}>1 xe máy</option>
              <option value={2}>2 xe máy</option>
            </select>
          </div>
        </div>
      </div>

      {/* Itemized Cost Breakdown */}
      <div className="bg-gray-50/90 rounded-xl p-3 border border-gray-200 space-y-2 text-xs">
        <p className="font-bold text-gray-800 text-[11px] uppercase tracking-wider">
          Bảng kê chi phí ước tính mỗi tháng:
        </p>
        <div className="space-y-1.5 text-gray-600">
          <div className="flex justify-between items-center">
            <span>• Tiền phòng trọ cố định:</span>
            <span className="font-bold text-gray-900">{roomPrice.toLocaleString("vi")} đ</span>
          </div>
          <div className="flex justify-between items-center">
            <span>• Tiền điện (~{kwh} kWh × {electricRate.toLocaleString("vi")}đ):</span>
            <span className="font-bold text-orange-700">{electricCost.toLocaleString("vi")} đ</span>
          </div>
          <div className="flex justify-between items-center">
            <span>• Tiền nước ({peopleCount} người):</span>
            <span className="font-bold text-blue-700">{waterCost.toLocaleString("vi")} đ</span>
          </div>
          <div className="flex justify-between items-center">
            <span>• Wifi &amp; Thu gom rác:</span>
            <span className="font-bold text-gray-700">{wifiGarbageCost.toLocaleString("vi")} đ</span>
          </div>
          {parkingCost > 0 && (
            <div className="flex justify-between items-center">
              <span>• Phí gửi thêm xe:</span>
              <span className="font-bold text-gray-700">{parkingCost.toLocaleString("vi")} đ</span>
            </div>
          )}
        </div>

        {/* Tổng kết thực tế */}
        <div className="pt-2.5 mt-2 border-t border-gray-200 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-500 font-semibold block">
              Tổng chi phí thực tế / tháng:
            </span>
            {peopleCount > 1 && (
              <span className="text-[10px] text-emerald-600 font-bold block">
                (~{Math.round(totalMonthlyCost / peopleCount).toLocaleString("vi")} đ / người)
              </span>
            )}
          </div>
          <div className="text-right">
            <span className="text-base sm:text-lg font-black text-[#D0021B]">
              ~{totalMonthlyCost.toLocaleString("vi")} đ
            </span>
          </div>
        </div>
      </div>

      {/* Mẹo tiết kiệm cho người thuê Nha Trang */}
      <div className="bg-amber-50/80 rounded-xl p-2.5 border border-amber-200/80 text-[11px] text-amber-900 space-y-1">
        <p className="font-bold flex items-center gap-1">
          <span>💡</span> Mẹo thuê trọ Nha Trang:
        </p>
        <p className="leading-relaxed opacity-90">
          Nên hỏi rõ chủ trọ giá điện tính theo đồng hồ riêng hay chia đầu người. Mùa nắng tháng 5-8 tại Nha Trang tiền điện máy lạnh có thể tăng thêm 150k - 200k.
        </p>
      </div>
    </div>
  );
}
