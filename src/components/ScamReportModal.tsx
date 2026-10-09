"use client";

import { useState } from "react";

interface ScamReportModalProps {
  roomId: number;
  roomTitle: string;
  sourceUrl?: string;
  onClose: () => void;
}

const COMMON_SCAMS = [
  {
    title: "⚠️ Bắt chuyển khoản tiền cọc 'giữ chỗ' trước khi xem phòng",
    desc: "Kẻ gian lấy lý do 'nhiều người đang hỏi thuê', bắt chuyển cọc 500k-1tr rồi chặn số Zalo/điện thoại ngay sau đó.",
  },
  {
    title: "⚠️ Mạo danh chủ trọ đang đi công tác xa",
    desc: "Bảo bạn tự đến trước cửa nhìn phòng rồi chuyển cọc vào số tài khoản ảo để gửi chìa khóa sau.",
  },
  {
    title: "⚠️ Tin 'mồi câu' giá siêu rẻ để lấy thông tin cá nhân",
    desc: "Đăng hình ảnh căn hộ cao cấp full tiện nghi ở Hòn Chồng hay Trần Phú nhưng để giá 800k - 1.2tr, sau đó gạ đổi sang phòng khác xập xệ giá đắt hơn.",
  },
  {
    title: "⚠️ Mập mờ tiền điện nước & bẫy hợp đồng mất cọc",
    desc: "Không ghi rõ giá điện nước trong hợp đồng, cuối tháng tính 8.000đ - 10.000đ/số hoặc đặt điều khoản vi phạm vô lý để trừ sạch tiền cọc.",
  },
];

export default function ScamReportModal({
  roomId,
  roomTitle,
  sourceUrl,
  onClose,
}: ScamReportModalProps) {
  const [reportReason, setReportReason] = useState<string>("fake_listing");
  const [reportDetail, setReportDetail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const reports = JSON.parse(localStorage.getItem("reported_rooms") || "[]");
      reports.push({
        roomId,
        roomTitle,
        reason: reportReason,
        detail: reportDetail,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem("reported_rooms", JSON.stringify(reports));
    } catch {}

    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative my-6 border border-red-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-linear-to-r from-red-600 via-rose-600 to-red-700 px-5 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-lg">
              🛡️
            </div>
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                <span>Khiên Chống Lừa Đảo &amp; Báo Cáo Tin</span>
              </h3>
              <p className="text-[11px] text-rose-100">
                Bảo vệ cộng đồng sinh viên &amp; người thuê phòng tại Nha Trang
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-white/80 hover:text-white w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10 text-sm font-bold transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
          {submitted ? (
            <div className="py-8 text-center space-y-3 animate-in zoom-in-95 duration-200">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-2xl mx-auto shadow-inner">
                ✓
              </div>
              <h4 className="text-base font-bold text-gray-900">
                Đã gửi báo cáo thành công!
              </h4>
              <p className="text-xs text-gray-600 max-w-xs mx-auto">
                Cảm ơn bạn đã đóng góp để xây dựng cộng đồng phòng trọ Nha Trang an toàn, minh bạch. Đội ngũ kiểm duyệt sẽ xử lý tin này ngay.
              </p>
            </div>
          ) : (
            <>
              {/* Cảnh báo chiêu trò lừa đảo */}
              <div className="bg-amber-50 rounded-xl p-3.5 border border-amber-200 space-y-2">
                <h4 className="font-extrabold text-amber-950 text-xs flex items-center gap-1.5">
                  <span>🚨</span> 4 Bẫy lừa đảo thuê phòng cần cảnh giác ở Nha Trang:
                </h4>
                <div className="space-y-1.5 text-[11px] text-amber-900">
                  {COMMON_SCAMS.map((s, idx) => (
                    <div key={idx} className="bg-white/80 p-2 rounded-lg border border-amber-200/60">
                      <strong className="block text-gray-900 font-bold">{s.title}</strong>
                      <span className="text-gray-600 leading-tight block mt-0.5">{s.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form báo cáo bài đăng này */}
              <form onSubmit={handleSubmit} className="space-y-3 pt-1">
                <h4 className="font-extrabold text-gray-900 text-xs">
                  Báo cáo tin đăng này:
                </h4>
                <p className="text-[11px] text-gray-500 font-medium line-clamp-1">
                  Phòng: &ldquo;{roomTitle}&rdquo;
                </p>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-700 block">
                    Lý do báo cáo:
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    {[
                      { id: "fake_listing", label: "Tin ảo / Không có thật" },
                      { id: "scam_deposit", label: "Có dấu hiệu lừa cọc" },
                      { id: "rented_out", label: "Phòng đã cho thuê rồi" },
                      { id: "wrong_price", label: "Sai giá / Môi giới đội giá" },
                    ].map((item) => (
                      <label
                        key={item.id}
                        className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                          reportReason === item.id
                            ? "bg-rose-50 border-rose-400 font-bold text-rose-900"
                            : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <input
                          type="radio"
                          name="reason"
                          value={item.id}
                          checked={reportReason === item.id}
                          onChange={(e) => setReportReason(e.target.value)}
                        />
                        <span>{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">
                    Ghi chú chi tiết thêm (nếu có):
                  </label>
                  <textarea
                    rows={3}
                    placeholder="VD: Gọi chủ trọ bảo phòng đã hết tuần trước, hoặc đòi cọc trước không cho xem..."
                    value={reportDetail}
                    onChange={(e) => setReportDetail(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:outline-hidden focus:border-red-500"
                  ></textarea>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-sm transition-colors cursor-pointer"
                  >
                    Gửi báo cáo vi phạm
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
