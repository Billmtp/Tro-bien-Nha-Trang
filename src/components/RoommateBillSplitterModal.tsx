"use client";

import { useState, useMemo } from "react";
import Image from "next/image";

interface RoommateBillSplitterModalProps {
  roomTitle?: string;
  defaultRoomPrice?: number | null;
  onClose: () => void;
}

const POPULAR_BANKS = [
  { id: "MB", name: "MB Bank (Quân Đội)" },
  { id: "VCB", name: "Vietcombank" },
  { id: "TCB", name: "Techcombank" },
  { id: "BIDV", name: "BIDV" },
  { id: "ACB", name: "ACB (Á Châu)" },
  { id: "VPB", name: "VPBank" },
  { id: "TPB", name: "TPBank" },
  { id: "VIB", name: "VIB" },
  { id: "VIETINBANK", name: "VietinBank" },
];

export default function RoommateBillSplitterModal({
  roomTitle,
  defaultRoomPrice,
  onClose,
}: RoommateBillSplitterModalProps) {
  // 1. Các khoản chi phí
  const [rentPrice, setRentPrice] = useState<number>(defaultRoomPrice || 2_000_000);
  const [numPeople, setNumPeople] = useState<number>(2);

  const [electricType, setElectricType] = useState<"kwh" | "fixed">("kwh");
  const [kwhUsed, setKwhUsed] = useState<number>(120);
  const [kwhPrice, setKwhPrice] = useState<number>(3500);
  const [electricFixed, setElectricFixed] = useState<number>(400_000);

  const [waterType, setWaterType] = useState<"per_person" | "m3">("per_person");
  const [waterPerPerson, setWaterPerPerson] = useState<number>(50_000);
  const [m3Used, setM3Used] = useState<number>(8);
  const [m3Price, setM3Price] = useState<number>(15_000);

  const [wifiPrice, setWifiPrice] = useState<number>(100_000);
  const [garbagePrice, setGarbagePrice] = useState<number>(30_000);
  const [otherPrice, setOtherPrice] = useState<number>(0);

  // 2. Thông tin thanh toán VietQR
  const [bank, setBank] = useState("MB");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [transferNote, setTransferNote] = useState(`Tien phong thang ${new Date().getMonth() + 1}`);

  const [copied, setCopied] = useState(false);

  // Tính toán tổng chi phí
  const billSummary = useMemo(() => {
    const totalElectric = electricType === "kwh" ? kwhUsed * kwhPrice : electricFixed;
    const totalWater = waterType === "per_person" ? waterPerPerson * numPeople : m3Used * m3Price;
    const totalServices = wifiPrice + garbagePrice + otherPrice;
    const grandTotal = rentPrice + totalElectric + totalWater + totalServices;
    const perPerson = Math.round(grandTotal / Math.max(1, numPeople));

    return {
      rent: rentPrice,
      electric: totalElectric,
      water: totalWater,
      services: totalServices,
      grandTotal,
      perPerson,
    };
  }, [
    rentPrice,
    numPeople,
    electricType,
    kwhUsed,
    kwhPrice,
    electricFixed,
    waterType,
    waterPerPerson,
    m3Used,
    m3Price,
    wifiPrice,
    garbagePrice,
    otherPrice,
  ]);

  // Sinh URL ảnh VietQR
  const qrUrl = useMemo(() => {
    if (!accountNumber.trim()) return null;
    const cleanAcc = accountNumber.replace(/\s/g, "");
    const cleanBank = bank.trim();
    const cleanAmount = billSummary.perPerson;
    const cleanMemo = encodeURIComponent(transferNote.trim());
    const cleanName = encodeURIComponent(accountName.trim().toUpperCase());

    return `https://img.vietqr.io/image/${cleanBank}-${cleanAcc}-compact2.png?amount=${cleanAmount}&addInfo=${cleanMemo}&accountName=${cleanName}`;
  }, [accountNumber, bank, billSummary.perPerson, transferNote, accountName]);

  // Copy tin nhắn gửi nhóm
  const handleCopyMessage = () => {
    const text = `📢 BẢNG TÍNH TIỀN PHÒNG THÁNG ${new Date().getMonth() + 1}
${roomTitle ? `📍 Phòng: ${roomTitle}\n` : ""}--------------------------
🏠 Tiền phòng: ${billSummary.rent.toLocaleString("vi")} đ
⚡ Tiền điện: ${billSummary.electric.toLocaleString("vi")} đ
💧 Tiền nước: ${billSummary.water.toLocaleString("vi")} đ
📶 Wifi & Rác: ${billSummary.services.toLocaleString("vi")} đ
--------------------------
💰 TỔNG CỘNG: ${billSummary.grandTotal.toLocaleString("vi")} đ
👥 Chia ${numPeople} người: ${billSummary.perPerson.toLocaleString("vi")} đ / người

💳 Chuyển khoản:
- Ngân hàng: ${bank}
- STK: ${accountNumber || "(Chưa nhập)"}
- Chủ TK: ${accountName.toUpperCase() || "(Chưa nhập)"}
- Nội dung: ${transferNote}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl relative my-6 border border-amber-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-linear-to-r from-[#222222] via-[#2f2f2f] to-[#222222] px-5 py-4 text-white flex items-center justify-between border-b border-amber-500/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FF7A00] flex items-center justify-center text-base shadow-sm">
              🧮
            </div>
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                <span>Chia Tiền Phòng &amp; Mã VietQR 1-Chạm</span>
                <span className="text-[10px] bg-emerald-500 text-white font-bold px-1.5 py-0.2 rounded-full uppercase">
                  Napas 247
                </span>
              </h3>
              <p className="text-[11px] text-gray-300">
                Tự động tính điện nước, chia đầu người và sinh mã QR chuyển khoản ngay
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10 text-sm font-bold transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cột 1: Nhập chi phí phòng */}
            <div className="space-y-3.5 bg-gray-50/70 p-3.5 rounded-2xl border border-gray-200">
              <h4 className="font-extrabold text-gray-900 text-xs flex items-center gap-1">
                <span>🏠</span> Chi phí phòng tháng này:
              </h4>

              {/* Tiền phòng & Số người */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-gray-600 font-semibold block text-[11px] mb-1">
                    Tiền phòng (VNĐ):
                  </label>
                  <input
                    type="number"
                    value={rentPrice}
                    onChange={(e) => setRentPrice(Number(e.target.value))}
                    step={100_000}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 font-bold text-gray-900 focus:outline-hidden focus:border-[#FF7A00]"
                  />
                </div>
                <div>
                  <label className="text-gray-600 font-semibold block text-[11px] mb-1">
                    Số người ở ghép:
                  </label>
                  <select
                    value={numPeople}
                    onChange={(e) => setNumPeople(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 font-bold text-gray-900 focus:outline-hidden focus:border-[#FF7A00]"
                  >
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>
                        {n} người
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tiền điện */}
              <div className="pt-2 border-t border-gray-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-gray-700">⚡ Tiền điện:</span>
                  <div className="flex gap-2 text-[10px]">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        checked={electricType === "kwh"}
                        onChange={() => setElectricType("kwh")}
                      />
                      Theo số kg
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        checked={electricType === "fixed"}
                        onChange={() => setElectricType("fixed")}
                      />
                      Khoán gọn
                    </label>
                  </div>
                </div>

                {electricType === "kwh" ? (
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Số kWh"
                      value={kwhUsed}
                      onChange={(e) => setKwhUsed(Number(e.target.value))}
                      className="px-2.5 py-1 rounded-lg border border-gray-300 text-[11px]"
                    />
                    <input
                      type="number"
                      placeholder="Đơn giá/kWh"
                      value={kwhPrice}
                      onChange={(e) => setKwhPrice(Number(e.target.value))}
                      className="px-2.5 py-1 rounded-lg border border-gray-300 text-[11px]"
                    />
                  </div>
                ) : (
                  <input
                    type="number"
                    value={electricFixed}
                    onChange={(e) => setElectricFixed(Number(e.target.value))}
                    className="w-full px-2.5 py-1 rounded-lg border border-gray-300 text-[11px]"
                  />
                )}
              </div>

              {/* Tiền nước */}
              <div className="pt-2 border-t border-gray-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-gray-700">💧 Tiền nước:</span>
                  <div className="flex gap-2 text-[10px]">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        checked={waterType === "per_person"}
                        onChange={() => setWaterType("per_person")}
                      />
                      Theo người
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        checked={waterType === "m3"}
                        onChange={() => setWaterType("m3")}
                      />
                      Theo khối m³
                    </label>
                  </div>
                </div>

                {waterType === "per_person" ? (
                  <input
                    type="number"
                    value={waterPerPerson}
                    onChange={(e) => setWaterPerPerson(Number(e.target.value))}
                    placeholder="Đơn giá/người"
                    className="w-full px-2.5 py-1 rounded-lg border border-gray-300 text-[11px]"
                  />
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Số khối m³"
                      value={m3Used}
                      onChange={(e) => setM3Used(Number(e.target.value))}
                      className="px-2.5 py-1 rounded-lg border border-gray-300 text-[11px]"
                    />
                    <input
                      type="number"
                      placeholder="Đơn giá/m³"
                      value={m3Price}
                      onChange={(e) => setM3Price(Number(e.target.value))}
                      className="px-2.5 py-1 rounded-lg border border-gray-300 text-[11px]"
                    />
                  </div>
                )}
              </div>

              {/* Wifi & Rác */}
              <div className="pt-2 border-t border-gray-200 grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-gray-500 block mb-0.5">Wifi / Net:</label>
                  <input
                    type="number"
                    value={wifiPrice}
                    onChange={(e) => setWifiPrice(Number(e.target.value))}
                    className="w-full px-2 py-1 rounded-lg border border-gray-300 text-[11px]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 block mb-0.5">Tiền Rác / Vệ sinh:</label>
                  <input
                    type="number"
                    value={garbagePrice}
                    onChange={(e) => setGarbagePrice(Number(e.target.value))}
                    className="w-full px-2 py-1 rounded-lg border border-gray-300 text-[11px]"
                  />
                </div>
              </div>
            </div>

            {/* Cột 2: Thông tin thanh toán VietQR & Kết quả */}
            <div className="space-y-3.5 flex flex-col justify-between">
              {/* Box Tổng kết chia tiền */}
              <div className="p-4 rounded-2xl bg-linear-to-br from-amber-50 via-orange-50 to-amber-100 border-2 border-amber-300 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 font-bold">Tổng chi phí cả phòng:</span>
                  <span className="text-gray-900 font-black text-sm">
                    {billSummary.grandTotal.toLocaleString("vi")} đ
                  </span>
                </div>

                <div className="pt-2 border-t border-amber-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black text-amber-900 block">
                      MỖI NGƯỜI ĐÓNG:
                    </span>
                    <span className="text-[10px] text-gray-600">
                      (Chia đều cho {numPeople} người)
                    </span>
                  </div>
                  <span className="text-xl font-black text-[#D0021B]">
                    {billSummary.perPerson.toLocaleString("vi")} đ
                  </span>
                </div>
              </div>

              {/* Form nhập Ngân hàng nhận tiền */}
              <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 space-y-2.5">
                <h4 className="font-bold text-gray-900 text-xs flex items-center gap-1">
                  <span>💳</span> Tài khoản nhận tiền:
                </h4>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-gray-500 block mb-0.5">Ngân hàng:</label>
                    <select
                      value={bank}
                      onChange={(e) => setBank(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border border-gray-300 font-semibold text-[11px]"
                    >
                      {POPULAR_BANKS.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 block mb-0.5">Số tài khoản:</label>
                    <input
                      type="text"
                      placeholder="VD: 0905123456"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border border-gray-300 font-bold text-[11px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-gray-500 block mb-0.5">Tên chủ tài khoản:</label>
                  <input
                    type="text"
                    placeholder="VD: NGUYEN VAN A"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    className="w-full px-2 py-1 rounded-lg border border-gray-300 uppercase text-[11px]"
                  />
                </div>
              </div>

              {/* Hiển thị mã QR VietQR */}
              {qrUrl ? (
                <div className="p-3 bg-white rounded-xl border border-emerald-300 text-center space-y-2">
                  <p className="text-[11px] font-bold text-emerald-800">
                    ✨ Quét mã bằng App ngân hàng để bắn tiền ngay:
                  </p>
                  <div className="w-36 h-36 mx-auto relative bg-white p-1 rounded-lg border shadow-xs">
                    <img
                      src={qrUrl}
                      alt="Mã VietQR chia tiền phòng"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 text-center text-blue-800 text-[11px]">
                  💡 Nhập <strong>Số tài khoản</strong> ở trên để tự động tạo mã QR Napas 247 gửi cho bạn cùng phòng!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={handleCopyMessage}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              copied
                ? "bg-emerald-600 text-white"
                : "bg-gray-800 hover:bg-black text-white"
            }`}
          >
            <span>{copied ? "✓ Đã sao chép!" : "📋 Sao chép tin nhắn gửi nhóm Zalo"}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-xs transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
