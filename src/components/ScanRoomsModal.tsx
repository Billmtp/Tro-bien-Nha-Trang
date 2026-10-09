"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ScannedRoomItem {
  id: number;
  title: string;
  price: number | null;
  area?: number | null;
  district: string | null;
  address?: string | null;
  sourceSite: string;
  category?: string;
  scrapedAt: string;
}

interface ScanRoomsModalProps {
  category?: string;
  onClose: () => void;
  onSuccess?: (stats: any) => void;
}

function formatPrice(price: number | null): string {
  if (!price) return "Thỏa thuận";
  if (price >= 1_000_000_000) {
    return `${(price / 1_000_000_000).toFixed(2).replace(/\.?0+$/, "")} tỷ`;
  }
  if (price >= 1_000_000) {
    return `${(price / 1_000_000).toFixed(1).replace(".0", "")} tr/tháng`;
  }
  return `${price.toLocaleString("vi")} đ`;
}

export default function ScanRoomsModal({
  category = "rent",
  onClose,
  onSuccess,
}: ScanRoomsModalProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<"scanning" | "completed" | "error">("scanning");
  const [progress, setProgress] = useState(15);
  const [currentStepText, setCurrentStepText] = useState("Đang kết nối kho dữ liệu Nha Trang...");
  const [logs, setLogs] = useState<string[]>([
    "Khởi động tiến trình quét đối chiếu tin tức thời...",
  ]);

  const [comparisonStats, setComparisonStats] = useState<{
    totalExistingInDb: number;
    totalScanned: number;
    existingMatched: number;
    newInserted: number;
  }>({
    totalExistingInDb: 0,
    totalScanned: 0,
    existingMatched: 0,
    newInserted: 0,
  });

  const [newRoomsList, setNewRoomsList] = useState<ScannedRoomItem[]>([]);

  useEffect(() => {
    let isMounted = true;

    const runCrawler = async () => {
      try {
        // Step 1: Simulated radar visual
        await new Promise((r) => setTimeout(r, 500));
        if (!isMounted) return;
        setProgress(30);
        setCurrentStepText("Đang kết nối Chợ Tốt Nha Trang, Phongtro123 & Mogi...");
        setLogs((prev) => [
          ...prev,
          "📡 Đang kết nối Chợ Tốt Nha Trang (region 7044), Phongtro123 & Mogi...",
        ]);

        // Step 2
        await new Promise((r) => setTimeout(r, 600));
        if (!isMounted) return;
        setProgress(60);
        setCurrentStepText("Đang so sánh đối chiếu URL & số điện thoại với kho dữ liệu...");
        setLogs((prev) => [
          ...prev,
          "🔍 Rà soát & phân loại tin CŨ (đã có) vs tin MỚI (chưa có)...",
        ]);

        // GỌI API QUÉT THỰC TẾ CÓ SO SÁNH CŨ - MỚI
        const res = await fetch("/api/rooms/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ category }),
        });

        // Step 3
        setProgress(85);
        setCurrentStepText("Đang định vị tọa độ & lưu các bài đăng MỚI vào hệ thống...");
        setLogs((prev) => [
          ...prev,
          "📍 Lưu bài đăng mới vào cơ sở dữ liệu với mốc thời gian tức thời...",
        ]);

        const data = await res.json();

        await new Promise((r) => setTimeout(r, 500));
        if (!isMounted) return;

        setProgress(100);
        setPhase("completed");

        if (data.comparison) {
          setComparisonStats(data.comparison);
        }
        if (Array.isArray(data.newRooms)) {
          setNewRoomsList(data.newRooms);
          if (data.newRooms.length > 0) {
            const newIds = data.newRooms.map((r: any) => r.id);
            try {
              sessionStorage.setItem(
                "just_scanned_room_ids",
                JSON.stringify({ ids: newIds, timestamp: Date.now() })
              );
              window.dispatchEvent(
                new CustomEvent("rooms_just_scanned", { detail: { ids: newIds } })
              );
            } catch {}
          }
        }

        setLogs((prev) => [
          ...prev,
          `✅ Quét hoàn tất! Đã đối chiếu ${data.comparison?.totalScanned || 0} bài đăng, thêm mới ${data.comparison?.newInserted || 0} bài chưa từng có.`,
        ]);

        if (onSuccess) onSuccess(data);
      } catch (err: any) {
        if (!isMounted) return;
        console.error("Scan error:", err);
        setPhase("error");
        setLogs((prev) => [...prev, `❌ Lỗi khi quét: ${err.message}`]);
      }
    };

    runCrawler();

    return () => {
      isMounted = false;
    };
  }, [category, onSuccess]);

  const handleRefreshAndClose = () => {
    onClose();
    // Buộc reload trang để tải trực tiếp dữ liệu mới nhất từ server
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative my-6 border border-amber-200 flex flex-col max-h-[90vh]">
        {/* Modal Top Header */}
        <div className="bg-linear-to-r from-[#222222] via-[#333333] to-[#222222] px-5 py-4 text-white flex items-center justify-between border-b border-amber-500/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FF7A00] flex items-center justify-center text-base shadow-sm">
              📡
            </div>
            <div>
              <h3 className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
                <span>Bộ Quét Tin Đa Nguồn &amp; So Sánh Dữ Liệu</span>
                <span className="text-[10px] bg-emerald-500 text-white font-bold px-1.5 py-0.2 rounded-full uppercase">
                  Nha Trang
                </span>
              </h3>
              <p className="text-[11px] text-gray-300">
                Tự động kiểm tra trùng lặp và nhận diện bài đăng thực sự mới
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10 text-sm font-bold transition-colors cursor-pointer"
            title="Đóng cửa sổ"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {phase === "scanning" ? (
            /* SCANNING STATE: High-tech Radar & Steps */
            <div className="text-center py-2 space-y-4">
              {/* Animated Radar Visual */}
              <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-amber-300 animate-[spin_8s_linear_infinite]"></div>
                <div className="absolute inset-2 rounded-full border border-amber-400/40 animate-ping"></div>
                <div className="absolute inset-5 rounded-full bg-amber-500/10"></div>

                <div className="absolute inset-0 rounded-full overflow-hidden">
                  <div className="w-1/2 h-1/2 bg-linear-to-br from-amber-400/40 to-transparent absolute top-0 right-0 origin-bottom-left animate-[spin_2s_linear_infinite]"></div>
                </div>

                <div className="relative w-12 h-12 rounded-full bg-[#FF7A00] text-white flex items-center justify-center text-xl shadow-lg border-2 border-white">
                  🔍
                </div>
              </div>

              {/* Status Text & Progress */}
              <div className="space-y-1.5">
                <h4 className="text-sm font-bold text-gray-900 animate-pulse">
                  {currentStepText}
                </h4>
                <p className="text-xs text-gray-500">
                  Đang đối chiếu URL bài đăng với cơ sở dữ liệu... ({progress}%)
                </p>

                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden shadow-inner mt-2">
                  <div
                    className="h-full bg-linear-to-r from-[#FFBA00] to-[#FF7A00] transition-all duration-300 rounded-full"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Step Logs Ticker Box */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-left space-y-1.5 max-h-32 overflow-y-auto font-mono text-[11px] text-gray-600">
                {logs.map((log, index) => (
                  <div key={index} className="flex items-center gap-1.5">
                    <span className="text-[#FF7A00]">›</span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : phase === "completed" ? (
            /* COMPLETED STATE: Accurate Comparison Report */
            <div className="space-y-4 animate-in zoom-in-95 duration-200">
              {/* Header Status Banner */}
              <div
                className={`p-4 rounded-2xl text-center space-y-1 border-2 ${
                  comparisonStats.newInserted > 0
                    ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                    : "bg-amber-50 border-amber-300 text-amber-950"
                }`}
              >
                <div
                  className={`w-11 h-11 text-white rounded-full flex items-center justify-center text-xl mx-auto shadow-md mb-1.5 ${
                    comparisonStats.newInserted > 0 ? "bg-emerald-600" : "bg-amber-500"
                  }`}
                >
                  {comparisonStats.newInserted > 0 ? "✓" : "ℹ️"}
                </div>
                <h4 className="text-sm sm:text-base font-extrabold">
                  {comparisonStats.newInserted > 0
                    ? `🎉 Tìm thấy +${comparisonStats.newInserted} bài đăng MỚI chưa từng có!`
                    : "ℹ️ Tất cả tin quét được đều đã tồn tại trong kho"}
                </h4>
                <p className="text-xs opacity-90">
                  {comparisonStats.newInserted > 0
                    ? "Các bài đăng mới này đã được đẩy lên đầu trang chủ để bạn dễ dàng xem ngay."
                    : "Hệ thống đã đối chiếu đầy đủ và không phát hiện tin mới phát sinh tại thời điểm này."}
                </p>
              </div>

              {/* BẢNG SO SÁNH CHI TIẾT CŨ - MỚI */}
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 text-xs space-y-2">
                <p className="font-bold text-gray-800 text-[11px] uppercase tracking-wider flex items-center gap-1">
                  <span>📊</span> Kết quả đối chiếu cơ sở dữ liệu:
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white p-2.5 rounded-lg border border-gray-200">
                    <span className="text-gray-500 text-[11px]">Tổng tin trong kho:</span>
                    <p className="font-bold text-gray-800 text-sm">
                      {comparisonStats.totalExistingInDb} tin
                    </p>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-gray-200">
                    <span className="text-gray-500 text-[11px]">Tin đã rà soát:</span>
                    <p className="font-bold text-blue-700 text-sm">
                      {comparisonStats.totalScanned} tin
                    </p>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-gray-200">
                    <span className="text-gray-500 text-[11px]">Trùng khớp (Tin Cũ):</span>
                    <p className="font-bold text-gray-600 text-sm">
                      {comparisonStats.existingMatched} tin
                    </p>
                  </div>
                  <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-300">
                    <span className="text-emerald-700 text-[11px] font-semibold">
                      THỰC SỰ MỚI:
                    </span>
                    <p className="font-extrabold text-emerald-800 text-sm">
                      +{comparisonStats.newInserted} tin mới
                    </p>
                  </div>
                </div>
              </div>

              {/* DANH SÁCH CÁC PHÒNG MỚI VỪA TÌM THẤY */}
              {newRoomsList.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-800 flex items-center justify-between">
                    <span>⚡ Các bài đăng mới vừa được thêm lên đầu trang chủ:</span>
                    <span className="text-[10px] text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                      Vừa xong
                    </span>
                  </p>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {newRoomsList.map((room) => (
                      <Link
                        key={room.id}
                        href={`/phong/${room.id}`}
                        onClick={onClose}
                        className="group/item p-3 bg-linear-to-r from-emerald-50/80 via-teal-50/40 to-white hover:from-emerald-100 hover:to-amber-50 rounded-xl border border-emerald-300 hover:border-emerald-500 hover:shadow-md transition-all flex items-center justify-between gap-2.5 text-xs cursor-pointer block transform active:scale-98"
                        title="Bấm để xem ngay chi tiết bài đăng này"
                      >
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider animate-pulse">
                              VỪA TÌM RA ✨
                            </span>
                            <span className="text-[10px] text-gray-500 font-medium">
                              {room.sourceSite?.startsWith("facebook") ? "👥 Facebook" : room.sourceSite}
                            </span>
                          </div>
                          <p className="font-bold text-gray-900 group-hover/item:text-emerald-800 line-clamp-1 leading-snug">
                            {room.title}
                          </p>
                          <p className="text-[11px] text-gray-500 truncate">
                            📍 {room.address || room.district || "Nha Trang"}
                          </p>
                        </div>
                        <div className="text-right shrink-0 flex flex-col items-end">
                          <span className="font-extrabold text-[#D0021B] text-sm">
                            {formatPrice(room.price)}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 group-hover/item:bg-emerald-200 px-2 py-0.5 rounded-lg transition-colors mt-1">
                            <span>Xem phòng</span>
                            <span>➜</span>
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ERROR STATE */
            <div className="text-center py-6 space-y-3">
              <span className="text-4xl">⚠️</span>
              <h4 className="text-sm font-bold text-red-600">
                Đã xảy ra lỗi khi quét dữ liệu
              </h4>
              <p className="text-xs text-gray-500">
                Vui lòng thử lại sau giây lát hoặc kiểm tra kết nối mạng.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="bg-gray-50 px-5 py-3 border-t border-gray-200 flex items-center justify-between gap-2 shrink-0">
          <span className="text-[11px] text-gray-400">
            {phase === "scanning" ? "Đang xử lý đối chiếu..." : "Cập nhật lúc: Vừa xong"}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              Đóng
            </button>

            {phase === "completed" && (
              <button
                onClick={handleRefreshAndClose}
                className="px-4 py-1.5 bg-[#FF7A00] hover:bg-[#E66E00] text-white rounded-lg text-xs font-bold shadow-xs transition-all transform active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <span>{newRoomsList.length > 0 ? "🚀 Tải lại xem tin mới ngay" : "↻ Làm mới trang"}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
