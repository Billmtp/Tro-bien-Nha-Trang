"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface DownloadAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const APK_DIRECT_URL = "https://expo.dev/artifacts/eas/d9JM0Hb-rMV-NrqSBZRSvxz02X8BI_3UiHvcvfp42FQ.apk";
const EXPO_BUILD_PAGE = "https://expo.dev/accounts/karaken510/projects/karaken/builds/de303f92-03da-489a-998e-29fcedcd498f";
const QR_CODE_URL = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(APK_DIRECT_URL)}`;

export default function DownloadAppModal({ isOpen, onClose }: DownloadAppModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(APK_DIRECT_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-sky-100 flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="bg-linear-to-r from-[#034A75] via-[#026AA7] to-[#01588B] text-white p-4 sm:p-5 relative flex items-center gap-3.5">
          <div className="w-13 h-13 rounded-2xl bg-white p-1.5 shadow-md shrink-0 flex items-center justify-center">
            <Image
              src="/tro-bien-logo.png"
              alt="Logo Trọ Biển"
              width={64}
              height={64}
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-base sm:text-lg font-black tracking-tight text-white truncate">
                Trọ Biển Nha Trang
              </h3>
              <span className="text-[10px] bg-emerald-500 text-white font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">
                APK
              </span>
            </div>
            <p className="text-xs text-sky-100/90 font-medium">
              Ứng dụng di động Android chính thức
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors text-sm cursor-pointer shrink-0"
            title="Đóng"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Badge Thông tin bản build */}
          <div className="bg-sky-50 border border-sky-200/80 rounded-2xl p-3 flex items-center justify-between gap-3 text-xs">
            <div>
              <div className="font-bold text-sky-950 flex items-center gap-1">
                <span>🤖 Phiên bản: v1.0.0 (Bản build mới nhất)</span>
              </div>
              <div className="text-sky-700 text-[11px] mt-0.5">
                Dung lượng: ~88 MB • Gói: vn.trobien.nhatrang
              </div>
            </div>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-1 rounded-full uppercase shrink-0">
              Sẵn sàng tải
            </span>
          </div>

          {/* Primary Action Button: Tải APK trực tiếp */}
          <a
            href={APK_DIRECT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-linear-to-r from-[#FF7A00] via-[#FF6000] to-[#FF4500] hover:from-[#FF8800] hover:to-[#FF5500] text-white font-black text-sm rounded-2xl shadow-lg shadow-orange-500/25 transition-transform active:scale-98"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>TẢI TRỰC TIẾP FILE APK (88 MB)</span>
          </a>

          {/* QR Code Quét Bằng Điện Thoại */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 text-center flex flex-col items-center">
            <p className="text-xs font-bold text-slate-800 mb-2">
              📱 Hoặc mở camera điện thoại quét mã QR để tải ngay:
            </p>
            <div className="p-2 bg-white rounded-xl shadow-xs border border-slate-200 mb-2">
              <img
                src={QR_CODE_URL}
                alt="Mã QR tải APK Trọ Biển Nha Trang"
                className="w-36 h-36 object-contain rounded-lg"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Quét mã bằng Camera Android hoặc Zalo để mở link tải APK
            </p>
          </div>

          {/* Action phụ: Copy link và Xem Expo Build */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={handleCopyLink}
              className="py-2.5 px-3 rounded-xl border border-gray-200 hover:bg-gray-50 font-bold text-gray-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>{copied ? "✅ Đã chép link" : "🔗 Sao chép link APK"}</span>
            </button>
            <a
              href={EXPO_BUILD_PAGE}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 rounded-xl border border-sky-200 hover:bg-sky-50 font-bold text-sky-700 flex items-center justify-center gap-1.5 transition-colors text-center"
            >
              <span>☁️ Xem trên Expo</span>
            </a>
          </div>

          {/* Hướng dẫn cài đặt APK ngắn gọn */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3 text-[11px] text-amber-900 space-y-1">
            <div className="font-bold flex items-center gap-1 text-amber-950">
              <span>💡 Hướng dẫn cài đặt nhanh:</span>
            </div>
            <p>1. Nhấn nút <b>Tải File APK</b> phía trên để tải về điện thoại.</p>
            <p>2. Chạm vào file vừa tải xong trong thanh thông báo hoặc thư mục <i>Download</i>.</p>
            <p>3. Chọn <b>Cài đặt</b> (nếu máy hỏi, bật <i>"Cho phép từ nguồn này"</i>) để hoàn tất.</p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
