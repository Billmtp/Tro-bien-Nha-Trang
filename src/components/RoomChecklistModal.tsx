"use client";

import { useState } from "react";

interface CheckItem {
  id: string;
  category: string;
  title: string;
  desc: string;
  weight: number; // Điểm số
}

const CHECKLIST_ITEMS: CheckItem[] = [
  {
    id: "water_pressure",
    category: "Hệ thống nước",
    title: "Mở thử vòi nước & xả bồn cầu",
    desc: "Xem nước máy có mạnh vào giờ cao điểm không, bồn cầu thoát nhanh hay nghẹt, vòi có bị rò rỉ nước không.",
    weight: 10,
  },
  {
    id: "signal_phone",
    category: "Mạng & Sóng",
    title: "Kiểm tra sóng 4G/5G điện thoại",
    desc: "Cầm điện thoại vào tận góc trong phòng và nhà vệ sinh xem có bị mất sóng hoặc mạng chập chờn không.",
    weight: 10,
  },
  {
    id: "electric_meter",
    category: "Điện năng",
    title: "Đồng hồ công tơ điện riêng",
    desc: "Kiểm tra xem phòng có đồng hồ điện riêng không. Tránh ở phòng dùng chung đồng hồ tổng dễ bị tính khống.",
    weight: 15,
  },
  {
    id: "lock_security",
    category: "An ninh",
    title: "Khóa cổng, camera & chỗ để xe",
    desc: "Cổng ra vào dùng khóa từ/vân tay hay khóa cơ? Chỗ để xe máy ban đêm có camera an ninh quan sát không?",
    weight: 15,
  },
  {
    id: "rain_flood",
    category: "Môi trường Nha Trang",
    title: "Kiểm tra trần dột & ngập mùa mưa",
    desc: "Xem trần nhà và chân tường có vết ố ẩm mốc/thấm dột không. Hỏi thăm người xung quanh đường có ngập mùa mưa không.",
    weight: 10,
  },
  {
    id: "curfew_rules",
    category: "Giờ giấc",
    title: "Quy định giờ đóng cổng ban đêm",
    desc: "Giờ giấc tự do 24/7 hay đóng cửa lúc 23h? Có chìa khóa cổng riêng để đi làm/học nhóm về muộn không?",
    weight: 10,
  },
  {
    id: "ac_socket",
    category: "Tiện nghi",
    title: "Vị trí lắp điều hòa & thông gió",
    desc: "Mùa hè Nha Trang khá nóng. Xem phòng có cửa sổ thông thoáng, quạt hút mùi hoặc vị trí lắp máy lạnh không.",
    weight: 10,
  },
  {
    id: "cooking_area",
    category: "Nấu ăn",
    title: "Khu vực bếp nấu & chống mùi",
    desc: "Có kệ bếp riêng biệt không? Thoát khói tốt không để tránh ám mùi thức ăn vào giường nệm và quần áo.",
    weight: 10,
  },
  {
    id: "extra_fees",
    category: "Chi phí",
    title: "Minh bạch các khoản phí dịch vụ",
    desc: "Hỏi kỹ giá điện (3.5k hay 4k), nước (50k hay 100k), tiền rác, tiền wifi, tiền gửi xe máy có bị thu thêm không.",
    weight: 10,
  },
];

export default function RoomChecklistModal({ onClose }: { onClose: () => void }) {
  const [checkedIds, setCheckedIds] = useState<string[]>([
    "water_pressure",
    "electric_meter",
    "lock_security",
  ]);

  const toggleCheck = (id: string) => {
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Tính tổng điểm
  const totalScore = CHECKLIST_ITEMS.filter((item) =>
    checkedIds.includes(item.id)
  ).reduce((acc, cur) => acc + cur.weight, 0);

  const getEvaluation = () => {
    if (totalScore >= 80) {
      return {
        label: "Xuất sắc • Phòng rất an tâm để thuê!",
        color: "text-emerald-700 bg-emerald-50 border-emerald-300",
        advice: "Phòng đáp ứng gần như trọn vẹn các tiêu chí quan trọng. Bạn có thể tự tin đặt cọc giữ chỗ!",
      };
    }
    if (totalScore >= 50) {
      return {
        label: "Khá ổn • Cần thương lượng thêm",
        color: "text-amber-800 bg-amber-50 border-amber-300",
        advice: "Phòng cơ bản ổn nhưng còn vài điểm chưa đạt. Hãy hỏi kỹ chủ trọ về những tiêu chí chưa đạt trước khi ký cọc.",
      };
    }
    return {
      label: "Cảnh báo • Cân nhắc kỹ trước khi cọc!",
      color: "text-red-700 bg-red-50 border-red-300",
      advice: "Phòng thiếu nhiều tiêu chuẩn quan trọng về điện nước hoặc an ninh. Bạn nên tham khảo thêm phòng khác.",
    };
  };

  const evalResult = getEvaluation();

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-amber-200 overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-emerald-600 via-teal-600 to-cyan-600 px-5 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-xl shadow-inner">
              📋
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg">
                Checklist Kiểm Tra Phòng Trọ Nha Trang
              </h3>
              <p className="text-xs text-emerald-100">
                Mở sẵn trên điện thoại khi đi xem phòng thực tế để không bị hớ
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white font-bold flex items-center justify-center text-sm transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Thanh điểm đánh giá */}
        <div className="bg-gray-50 px-5 py-3.5 border-b border-gray-200 flex items-center justify-between gap-3 shrink-0">
          <div>
            <span className="text-[11px] text-gray-500 font-bold uppercase tracking-wider block">
              Điểm độ tin cậy phòng:
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="font-black text-2xl text-emerald-600">{totalScore}</span>
              <span className="text-xs text-gray-400 font-bold">/ 100 điểm</span>
              <span className="text-xs text-gray-500 ml-2">({checkedIds.length}/{CHECKLIST_ITEMS.length} tiêu chuẩn)</span>
            </div>
          </div>

          <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold text-center ${evalResult.color}`}>
            {evalResult.label}
          </div>
        </div>

        {/* Danh sách tiêu chí kiểm tra */}
        <div className="overflow-y-auto p-4 sm:p-5 flex-1 space-y-2.5">
          {CHECKLIST_ITEMS.map((item) => {
            const isChecked = checkedIds.includes(item.id);

            return (
              <div
                key={item.id}
                onClick={() => toggleCheck(item.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                  isChecked
                    ? "bg-emerald-50/50 border-emerald-300 ring-1 ring-emerald-200"
                    : "bg-white border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => {}}
                  className="w-4 h-4 mt-0.5 text-emerald-600 rounded border-gray-300 focus:ring-emerald-400 cursor-pointer"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-xs sm:text-sm text-gray-900">
                      {item.title}
                    </span>
                    <span className="text-[10px] bg-gray-100 text-gray-600 font-semibold px-2 py-0.5 rounded-full shrink-0">
                      {item.category} (+{item.weight}đ)
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Advice */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-3 text-xs shrink-0">
          <p className="text-gray-600 text-[11px] leading-tight">
            💡 <strong>Lời khuyên:</strong> {evalResult.advice}
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shrink-0 transition-transform active:scale-95 cursor-pointer shadow-xs"
          >
            Xong
          </button>
        </div>
      </div>
    </div>
  );
}
