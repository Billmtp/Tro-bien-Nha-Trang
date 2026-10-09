"use client";

import { useState } from "react";

export default function RentalContractModal({
  onClose,
  initialData,
}: {
  onClose: () => void;
  initialData?: {
    roomTitle?: string;
    roomAddress?: string;
    roomPrice?: number | null;
    ownerContact?: string | null;
  };
}) {
  const [docType, setDocType] = useState<"contract" | "deposit">("contract");

  // Bên A (Chủ cho thuê)
  const [landlordName, setLandlordName] = useState("Nguyễn Văn An");
  const [landlordPhone, setLandlordPhone] = useState(
    initialData?.ownerContact || "0905 123 456"
  );
  const [landlordIdCard, setLandlordIdCard] = useState("056095001234");
  const [landlordAddress, setLandlordAddress] = useState(
    initialData?.roomAddress || "Đường Đoàn Trần Nghiệp, Vĩnh Hải, Nha Trang"
  );

  // Bên B (Người thuê phòng)
  const [tenantName, setTenantName] = useState("Trần Thị Bích Ngọc");
  const [tenantPhone, setTenantPhone] = useState("0912 345 678");
  const [tenantIdCard, setTenantIdCard] = useState("056199009876");
  const [tenantSchool, setTenantSchool] = useState("Sinh viên ĐH Nha Trang (NTU)");

  // Điều khoản tiền & thời hạn
  const defaultRent = initialData?.roomPrice || 1800000;
  const [rentPrice, setRentPrice] = useState(defaultRent);
  const [depositAmount, setDepositAmount] = useState(defaultRent);
  const [electricPrice, setElectricPrice] = useState("3.500");
  const [waterPrice, setWaterPrice] = useState("50.000");
  const [wifiPrice, setWifiPrice] = useState("50.000");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [durationMonths, setDurationMonths] = useState(6);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-amber-300 overflow-hidden print:max-h-none print:shadow-none print:border-none print:w-full">
        {/* Header - Ẩn khi In */}
        <div className="bg-linear-to-r from-amber-500 via-[#FF7A00] to-orange-500 px-5 py-4 text-white flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-xl shadow-inner">
              📄
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg">
                Máy Tạo Hợp Đồng &amp; Giấy Đặt Cọc Trọ Chuẩn Pháp Lý
              </h3>
              <p className="text-xs text-amber-100">
                Theo mẫu Bộ Xây Dựng • Bảo vệ tiền cọc &amp; quyền lợi người thuê Nha Trang
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-white text-[#FF7A00] font-black text-xs hover:bg-amber-50 transition-colors shadow-xs flex items-center gap-1 cursor-pointer"
            >
              <span>🖨️ In / Tải PDF</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white font-bold flex items-center justify-center text-sm transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tab switcher: Hợp đồng vs Biên nhận cọc - Ẩn khi in */}
        <div className="bg-amber-50 px-5 py-2.5 border-b border-amber-200 flex items-center justify-between print:hidden text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDocType("contract")}
              className={`py-1.5 px-3 rounded-xl font-bold transition-all ${
                docType === "contract"
                  ? "bg-[#222222] text-[#FFBA00] shadow-2xs"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              📜 1. Hợp đồng thuê phòng trọ
            </button>
            <button
              onClick={() => setDocType("deposit")}
              className={`py-1.5 px-3 rounded-xl font-bold transition-all ${
                docType === "deposit"
                  ? "bg-[#222222] text-[#FFBA00] shadow-2xs"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              🎫 2. Giấy biên nhận đặt cọc giữ chỗ
            </button>
          </div>

          <span className="text-gray-500 hidden sm:inline text-[11px]">
            Có thể chỉnh sửa thông tin trực tiếp trong các ô bên dưới
          </span>
        </div>

        {/* Body content scrollable */}
        <div className="overflow-y-auto p-5 sm:p-8 flex-1 space-y-6 print:p-0 print:overflow-visible">
          {/* Quick Input Bar - Ẩn khi in */}
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3 print:hidden text-xs">
            <span className="font-bold text-gray-800 uppercase tracking-wider text-[11px] block">
              ⚡ Điền nhanh thông tin hợp đồng:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="text-gray-500 block mb-0.5">Tên chủ trọ (Bên A):</label>
                <input
                  type="text"
                  value={landlordName}
                  onChange={(e) => setLandlordName(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg p-1.5 font-semibold text-xs"
                />
              </div>
              <div>
                <label className="text-gray-500 block mb-0.5">Tên người thuê (Bên B):</label>
                <input
                  type="text"
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg p-1.5 font-semibold text-xs"
                />
              </div>
              <div>
                <label className="text-gray-500 block mb-0.5">Giá thuê/tháng (đ):</label>
                <input
                  type="number"
                  value={rentPrice}
                  onChange={(e) => setRentPrice(Number(e.target.value))}
                  className="w-full bg-white border border-gray-300 rounded-lg p-1.5 font-bold text-red-600 text-xs"
                />
              </div>
              <div>
                <label className="text-gray-500 block mb-0.5">Tiền đặt cọc (đ):</label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                  className="w-full bg-white border border-gray-300 rounded-lg p-1.5 font-bold text-[#FF7A00] text-xs"
                />
              </div>
            </div>
          </div>

          {/* VĂN BẢN CHÍNH THỨC HIỂN THỊ / IN ẤN */}
          <div className="bg-white p-6 sm:p-10 border border-gray-300 shadow-sm print:border-none print:shadow-none print:p-0 font-serif text-gray-900 text-sm leading-relaxed space-y-5">
            {/* Quốc hiệu tiêu ngữ */}
            <div className="text-center space-y-1 pb-4 border-b border-gray-300">
              <h2 className="font-black text-base uppercase tracking-wider">
                CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
              </h2>
              <p className="font-semibold text-xs italic underline">
                Độc lập – Tự do – Hạnh phúc
              </p>
              <p className="text-xs text-gray-500 pt-2 font-sans italic">
                Nha Trang, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}
              </p>
            </div>

            {docType === "contract" ? (
              /* ================== HỢP ĐỒNG THUÊ TRỌ ================== */
              <div className="space-y-4">
                <h1 className="text-center font-black text-lg uppercase tracking-wide pt-2">
                  HỢP ĐỒNG THUÊ PHÒNG TRỌ
                </h1>
                <p className="text-xs text-center italic text-gray-600">
                  (Căn cứ theo Bộ Luật Dân sự &amp; Luật Nhà ở hiện hành)
                </p>

                {/* Bên A */}
                <div className="space-y-1 pt-2">
                  <h4 className="font-bold text-sm uppercase">I. BÊN CHO THUÊ (BÊN A):</h4>
                  <p>• Họ và tên: <strong>{landlordName}</strong></p>
                  <p>• Số CCCD/CMND: <strong>{landlordIdCard}</strong></p>
                  <p>• Số điện thoại liên hệ: <strong>{landlordPhone}</strong></p>
                  <p>• Địa chỉ phòng cho thuê: <strong>{landlordAddress}</strong></p>
                </div>

                {/* Bên B */}
                <div className="space-y-1 pt-2">
                  <h4 className="font-bold text-sm uppercase">II. BÊN THUÊ PHÒNG (BÊN B):</h4>
                  <p>• Họ và tên: <strong>{tenantName}</strong></p>
                  <p>• Số CCCD/CMND: <strong>{tenantIdCard}</strong></p>
                  <p>• Số điện thoại: <strong>{tenantPhone}</strong></p>
                  <p>• Trường / Đơn vị công tác: <strong>{tenantSchool}</strong></p>
                </div>

                {/* Điều khoản */}
                <div className="space-y-2 pt-2 text-xs leading-normal">
                  <h4 className="font-bold text-sm uppercase">III. NỘI DUNG VÀ ĐIỀU KHOẢN THỎA THUẬN:</h4>
                  <p>
                    <strong>Điều 1. Giá thuê và phương thức thanh toán:</strong><br />
                    - Tiền thuê phòng: <strong>{rentPrice.toLocaleString("vi-VN")} VNĐ/tháng</strong> (cố định không tăng trong suốt thời hạn hợp đồng).<br />
                    - Tiền đặt cọc giữ phòng và đảm bảo tài sản: <strong>{depositAmount.toLocaleString("vi-VN")} VNĐ</strong>.<br />
                    - Tiền điện: <strong>{electricPrice} đ/kWh</strong> (tính theo chỉ số công tơ điện riêng).<br />
                    - Tiền nước: <strong>{waterPrice} đ/người/tháng</strong>.<br />
                    - Tiền internet/rác: <strong>{wifiPrice} đ/tháng</strong>.<br />
                    - Thanh toán tiền phòng định kỳ từ ngày 01 đến ngày 05 hàng tháng.
                  </p>

                  <p>
                    <strong>Điều 2. Thời hạn hợp đồng:</strong><br />
                    - Hợp đồng có giá trị trong vòng <strong>{durationMonths} tháng</strong>, bắt đầu từ ngày <strong>{startDate}</strong>.
                  </p>

                  <p>
                    <strong>Điều 3. Trách nhiệm Bên A (Chủ trọ):</strong><br />
                    - Bàn giao phòng trọ sạch sẽ, hệ thống điện nước, khóa cửa an toàn hoạt động tốt.<br />
                    - Cam kết bảo đảm an ninh chung, hỗ trợ đăng ký tạm trú theo quy định công an phường.<br />
                    - <strong>Hoàn trả 100% tiền đặt cọc</strong> cho Bên B khi kết thúc hợp đồng nếu Bên B báo trước tối thiểu 30 ngày và không làm hư hỏng tài sản.
                  </p>

                  <p>
                    <strong>Điều 4. Trách nhiệm Bên B (Người thuê):</strong><br />
                    - Giữ gìn an ninh trật tự, vệ sinh chung, không chứa chấp chất cấm hoặc gây ồn ào sau 23h đêm.<br />
                    - Thanh toán tiền phòng và điện nước đúng thời hạn thỏa thuận.
                  </p>
                </div>
              </div>
            ) : (
              /* ================== GIẤY BIÊN NHẬN ĐẶT CỌC ================== */
              <div className="space-y-4">
                <h1 className="text-center font-black text-lg uppercase tracking-wide pt-2">
                  GIẤY BIÊN NHẬN TIỀN ĐẶT CỌC GIỮ PHÒNG
                </h1>

                <div className="space-y-2 text-xs leading-relaxed pt-2">
                  <p>Hôm nay, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}, tại Nha Trang, chúng tôi gồm có:</p>
                  <p><strong>Bên nhận đặt cọc (Bên A):</strong> Ông/Bà <strong>{landlordName}</strong> - SĐT: <strong>{landlordPhone}</strong></p>
                  <p><strong>Bên đặt cọc (Bên B):</strong> Ông/Bà <strong>{tenantName}</strong> - SĐT: <strong>{tenantPhone}</strong></p>

                  <p className="pt-2">
                    Bên A đã nhận đủ từ Bên B số tiền đặt cọc giữ phòng là: <strong>{depositAmount.toLocaleString("vi-VN")} VNĐ</strong>
                    (Bằng chữ: ........................................................................................).
                  </p>

                  <p>
                    <strong>Mục đích đặt cọc:</strong> Giữ phòng trọ tại địa chỉ <strong>{landlordAddress}</strong> với mức giá thuê cố định là <strong>{rentPrice.toLocaleString("vi-VN")} VNĐ/tháng</strong>.
                  </p>

                  <p>
                    <strong>Cam kết:</strong><br />
                    - Bên A cam kết giữ phòng cho Bên B đến ngày <strong>{startDate}</strong>, không cho người khác thuê.<br />
                    - Số tiền cọc này sẽ được chuyển thành tiền cọc hợp đồng khi ký kết chính thức.<br />
                    - Nếu Bên A đơn phương đổi ý không cho thuê, Bên A phải hoàn trả 100% tiền cọc cho Bên B.
                  </p>
                </div>
              </div>
            )}

            {/* Chữ ký 2 bên */}
            <div className="grid grid-cols-2 pt-8 text-center text-xs">
              <div>
                <p className="font-bold uppercase">ĐẠI DIỆN BÊN B (NGƯỜI THUÊ)</p>
                <p className="italic text-[11px] text-gray-500">(Ký và ghi rõ họ tên)</p>
                <div className="h-20" />
                <p className="font-bold">{tenantName}</p>
              </div>

              <div>
                <p className="font-bold uppercase">ĐẠI DIỆN BÊN A (CHỦ TRỌ)</p>
                <p className="italic text-[11px] text-gray-500">(Ký và ghi rõ họ tên)</p>
                <div className="h-20" />
                <p className="font-bold">{landlordName}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
