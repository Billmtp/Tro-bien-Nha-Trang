"use client";

import { useState, useEffect } from "react";

export type AlertType = "info" | "success" | "warning" | "error";

interface AlertData {
  id: number;
  title?: string;
  message: string;
  type?: AlertType;
  confirmText?: string;
  cancelText?: string;
  isConfirm?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
}

// Hàm gọi Alert đẹp mắt không dùng window.alert
export function showAppAlert(
  message: string,
  title: string = "Thông báo",
  type: AlertType = "info"
) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("app_notify_event", {
      detail: {
        id: Date.now(),
        title,
        message,
        type,
        confirmText: "Đã hiểu",
        isConfirm: false,
      },
    })
  );
}

// Hàm gọi Confirm đẹp mắt không dùng window.confirm
export function showAppConfirm(
  message: string,
  options: {
    title?: string;
    confirmText?: string;
    cancelText?: string;
    type?: AlertType;
    onConfirm: () => void;
    onCancel?: () => void;
  }
) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("app_notify_event", {
      detail: {
        id: Date.now(),
        title: options.title || "Xác nhận thao tác",
        message,
        type: options.type || "warning",
        confirmText: options.confirmText || "Đồng ý",
        cancelText: options.cancelText || "Hủy bỏ",
        isConfirm: true,
        onConfirm: options.onConfirm,
        onCancel: options.onCancel,
      },
    })
  );
}

export default function AppNotificationModal() {
  const [currentAlert, setCurrentAlert] = useState<AlertData | null>(null);

  useEffect(() => {
    const handleNotify = (e: any) => {
      if (e.detail) {
        setCurrentAlert(e.detail);
      }
    };

    window.addEventListener("app_notify_event", handleNotify);
    return () => window.removeEventListener("app_notify_event", handleNotify);
  }, []);

  if (!currentAlert) return null;

  const handleConfirm = () => {
    if (currentAlert.onConfirm) {
      currentAlert.onConfirm();
    }
    setCurrentAlert(null);
  };

  const handleCancel = () => {
    if (currentAlert.onCancel) {
      currentAlert.onCancel();
    }
    setCurrentAlert(null);
  };

  const isError = currentAlert.type === "error";
  const isSuccess = currentAlert.type === "success";
  const isWarning = currentAlert.type === "warning";

  const icon = isSuccess ? "✅" : isError ? "❌" : isWarning ? "⚠️" : "💡";
  const headerBg = isSuccess
    ? "from-emerald-600 to-teal-600"
    : isError
    ? "from-red-600 to-rose-600"
    : isWarning
    ? "from-amber-500 to-orange-500"
    : "from-[#FF7A00] to-[#E66E00]";

  return (
    <div className="fixed inset-0 z-9999 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl relative border border-gray-100 flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className={`bg-linear-to-r ${headerBg} px-5 py-4 text-white flex items-center gap-3`}>
          <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-xl shadow-inner shrink-0">
            {icon}
          </div>
          <div className="min-w-0">
            <h3 className="font-extrabold text-sm sm:text-base tracking-tight truncate">
              {currentAlert.title || "Thông báo hệ thống"}
            </h3>
            <p className="text-[10px] text-white/80">
              Phòng Trọ Nha Trang
            </p>
          </div>
        </div>

        {/* Message Body */}
        <div className="p-5 sm:p-6 text-xs text-gray-700 leading-relaxed space-y-3">
          <p className="whitespace-pre-line font-medium text-gray-800 text-xs sm:text-[13px]">
            {currentAlert.message}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-2.5">
          {currentAlert.isConfirm && (
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors cursor-pointer"
            >
              {currentAlert.cancelText || "Hủy bỏ"}
            </button>
          )}

          <button
            type="button"
            onClick={handleConfirm}
            className={`px-5 py-2.5 rounded-xl text-xs font-extrabold text-white shadow-sm transition-all transform active:scale-98 cursor-pointer ${
              isError
                ? "bg-red-600 hover:bg-red-700 shadow-red-200"
                : isSuccess
                ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200"
                : "bg-linear-to-r from-[#FFBA00] to-[#FF7A00] hover:from-[#FFA500] hover:to-[#E66E00] text-gray-900 shadow-amber-200"
            }`}
          >
            {currentAlert.confirmText || "Đã hiểu"}
          </button>
        </div>
      </div>
    </div>
  );
}
