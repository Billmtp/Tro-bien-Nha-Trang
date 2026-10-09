"use client";

import React from "react";
import { useTheme, THEME_PRESETS, ThemeMode, ThemeAccent, ThemeDensity } from "./ThemeManager";

export default function ThemeCustomizerModal() {
  const {
    theme,
    setTheme,
    resetTheme,
    isCustomizerOpen,
    setIsCustomizerOpen,
    resolvedMode,
  } = useTheme();

  if (!isCustomizerOpen) return null;

  const currentPreset = THEME_PRESETS.find((p) => p.id === theme.accent) || THEME_PRESETS[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#152238] text-slate-800 dark:text-slate-100 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-sky-200 dark:border-slate-700 overflow-hidden">
        {/* Modal Header */}
        <div className="bg-linear-to-r from-[#034A75] via-[#026AA7] to-[#01588B] text-white px-5 py-4 flex items-center justify-between shrink-0 shadow-xs border-b border-sky-400/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shadow-xs border border-white/30">
              🎨
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg text-white flex items-center gap-2">
                <span>Tùy Chỉnh Giao Diện &amp; Màu Sắc</span>
                <span className="text-[10px] bg-orange-500 text-white font-bold px-2 py-0.5 rounded-full uppercase">
                  Trọ Biển
                </span>
              </h3>
              <p className="text-xs text-sky-100">
                Cá nhân hóa chế độ sáng tối, bảng màu và mật độ hiển thị theo sở thích
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCustomizerOpen(false)}
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center font-bold text-base transition-colors cursor-pointer"
            title="Đóng bảng tùy chỉnh"
          >
            ✕
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* 1. CHẾ ĐỘ SÁNG / TỐI (DARK MODE) */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wide">
                <span>🌓</span>
                <span>1. Chế độ hiển thị (Dark Mode)</span>
              </label>
              <span className="text-xs text-sky-600 dark:text-sky-400 font-semibold">
                Đang dùng: {resolvedMode === "dark" ? "🌙 Ban Đêm" : "☀️ Ban Ngày"}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {[
                {
                  id: "light",
                  label: "Ban ngày",
                  sub: "Tươi sáng, rực rỡ",
                  icon: "☀️",
                },
                {
                  id: "dark",
                  label: "Ban đêm (Dark)",
                  sub: "Dịu mắt, êm dịu",
                  icon: "🌙",
                },
                {
                  id: "system",
                  label: "Tự động",
                  sub: "Theo thiết bị",
                  icon: "💻",
                },
              ].map((m) => {
                const isSelected = theme.mode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setTheme({ mode: m.id as ThemeMode })}
                    className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "border-[#0284C7] bg-sky-50/80 dark:bg-sky-950/40 shadow-sm ring-2 ring-sky-300/40"
                        : "border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:border-sky-300 dark:hover:border-slate-600"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xl">{m.icon}</span>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-[#0284C7] text-white text-xs flex items-center justify-center font-bold">
                          ✓
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                        {m.label}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {m.sub}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. BỘ MÀU CHỦ ĐẠO MIỀN BIỂN (COASTAL THEME ACCENTS) */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wide">
                <span>🌊</span>
                <span>2. Bảng màu chủ đạo Nha Trang</span>
              </label>
              <span className="text-xs text-orange-600 dark:text-orange-400 font-semibold">
                {currentPreset.name}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {THEME_PRESETS.map((preset) => {
                const isSelected = theme.accent === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setTheme({ accent: preset.id as ThemeAccent })}
                    className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer relative overflow-hidden group ${
                      isSelected
                        ? "border-[#0284C7] bg-sky-50/90 dark:bg-sky-950/50 shadow-md ring-2 ring-sky-300/40"
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-600"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{preset.icon}</span>
                        <div>
                          <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{preset.name}</span>
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">
                            {preset.subtitle}
                          </p>
                        </div>
                      </div>
                      {isSelected ? (
                        <span className="w-5 h-5 rounded-full bg-[#0284C7] text-white text-xs flex items-center justify-center font-bold shrink-0">
                          ✓
                        </span>
                      ) : (
                        <span className="w-3.5 h-3.5 rounded-full border-2 border-slate-300 dark:border-slate-600 shrink-0" />
                      )}
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-1 mb-2">
                      {preset.description}
                    </p>

                    {/* Dải swatch màu minh họa */}
                    <div className="flex items-center gap-1.5">
                      <div className={`h-2.5 flex-1 rounded-full ${preset.headerBg}`} />
                      <div className={`h-2.5 w-6 rounded-full ${preset.accentBg}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. MẬT ĐỘ HIỂN THỊ & TRỢ NĂNG */}
          <div>
            <label className="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wide mb-2.5">
              <span>📐</span>
              <span>3. Mật độ hiển thị &amp; Trợ năng</span>
            </label>

            <div className="grid grid-cols-3 gap-2 mb-3">
              {[
                { id: "compact", label: "Gọn gàng", icon: "📱", desc: "Xem nhiều tin" },
                { id: "normal", label: "Chuẩn", icon: "⚖️", desc: "Cân đối" },
                { id: "comfortable", label: "Rộng rãi", icon: "🛋️", desc: "Chữ lớn thoáng" },
              ].map((d) => {
                const isSelected = theme.density === d.id;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setTheme({ density: d.id as ThemeDensity })}
                    className={`p-2.5 rounded-xl border-2 text-center transition-all cursor-pointer ${
                      isSelected
                        ? "border-[#0284C7] bg-sky-50 dark:bg-sky-950/40 text-[#0284C7] dark:text-sky-300 font-bold"
                        : "border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <span className="text-base block mb-0.5">{d.icon}</span>
                    <span className="text-xs font-bold block">{d.label}</span>
                    <span className="text-[10px] text-slate-400 block">{d.desc}</span>
                  </button>
                );
              })}
            </div>

            {/* Checkbox Trợ năng */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <input
                  type="checkbox"
                  checked={theme.highContrast}
                  onChange={(e) => setTheme({ highContrast: e.target.checked })}
                  className="w-4 h-4 rounded text-[#0284C7] focus:ring-sky-500 cursor-pointer"
                />
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Độ tương phản cao</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Rõ nét số điện thoại &amp; giá tiền</p>
                </div>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <input
                  type="checkbox"
                  checked={theme.reduceMotion}
                  onChange={(e) => setTheme({ reduceMotion: e.target.checked })}
                  className="w-4 h-4 rounded text-[#0284C7] focus:ring-sky-500 cursor-pointer"
                />
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Giảm chuyển động</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Tắt hiệu ứng nhấp nháy, lướt êm</p>
                </div>
              </label>
            </div>
          </div>

          {/* 4. LIVE PREVIEW CARD MÔ PHỎNG */}
          <div>
            <label className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wide mb-2">
              <span>👁️</span>
              <span>Mô phỏng giao diện thời gian thực (Live Preview)</span>
            </label>

            <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-100/60 dark:bg-slate-900/60">
              {/* Mini mockup Header */}
              <div className={`p-2.5 rounded-xl text-white flex items-center justify-between mb-3 shadow-xs ${currentPreset.headerBg}`}>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-black bg-white text-slate-900 px-2 py-0.5 rounded-md text-[10px]">
                    TRỌ BIỂN
                  </span>
                  <span className="text-[11px] font-bold hidden sm:inline">Nha Trang</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
                    {resolvedMode === "dark" ? "🌙 Ban Đêm" : "☀️ Ban Ngày"}
                  </span>
                  <span className={`text-[10px] text-white px-2.5 py-0.5 rounded-full font-bold ${currentPreset.accentBg}`}>
                    ĐĂNG TIN
                  </span>
                </div>
              </div>

              {/* Mini mockup Room Card */}
              <div className="bg-white dark:bg-[#152238] p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-3 shadow-xs">
                <div className="w-14 h-14 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xl shrink-0">
                  🏖️
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 font-bold px-1.5 py-0.2 rounded">
                      ✓ Chính chủ
                    </span>
                    <span className="text-[10px] text-slate-400 truncate">Vĩnh Hải, Nha Trang</span>
                  </div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    Phòng trọ view biển Trần Phú, có gác lửng, máy lạnh
                  </p>
                  <p className="text-xs font-black text-rose-600 dark:text-rose-400 mt-0.5">
                    2.200.000 đ/tháng <span className="text-[10px] text-slate-400 font-normal">• 25m²</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 text-xs">
          <button
            type="button"
            onClick={resetTheme}
            className="px-3.5 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 font-semibold transition-colors cursor-pointer"
          >
            ↺ Đặt lại mặc định
          </button>

          <button
            type="button"
            onClick={() => setIsCustomizerOpen(false)}
            className="px-5 py-2 rounded-xl bg-linear-to-r from-[#0284C7] to-[#0369A1] hover:from-[#0369A1] hover:to-[#075985] text-white font-bold shadow-md shadow-sky-600/20 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>✓</span>
            <span>Áp dụng &amp; Đóng</span>
          </button>
        </div>
      </div>
    </div>
  );
}
