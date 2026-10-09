"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type ThemeMode = "light" | "dark" | "system";
export type ThemeAccent = "ocean" | "sunset" | "emerald" | "midnight" | "rose";
export type ThemeDensity = "normal" | "compact" | "comfortable";

export interface ThemeSettings {
  mode: ThemeMode;
  accent: ThemeAccent;
  density: ThemeDensity;
  reduceMotion: boolean;
  highContrast: boolean;
}

export interface ThemePreset {
  id: ThemeAccent;
  name: string;
  subtitle: string;
  icon: string;
  headerBg: string;
  accentBg: string;
  previewRing: string;
  description: string;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "ocean",
    name: "Biển Xanh Nha Trang",
    subtitle: "Mặc định • Ocean Blue",
    icon: "🌊",
    headerBg: "bg-linear-to-r from-[#034A75] via-[#026AA7] to-[#01588B]",
    accentBg: "bg-[#FF7A00]",
    previewRing: "ring-[#0284C7]",
    description: "Sắc xanh đại dương Trần Phú phối cùng ánh cam san hô hoàng hôn rực rỡ.",
  },
  {
    id: "sunset",
    name: "Hoàng Hôn Bãi Dài",
    subtitle: "Ấm áp • Sunset Coral",
    icon: "🌅",
    headerBg: "bg-linear-to-r from-[#7C2D12] via-[#C2410C] to-[#EA580C]",
    accentBg: "bg-[#F59E0B]",
    previewRing: "ring-[#EA580C]",
    description: "Ánh nắng vàng cam chiều tà buông trên bờ cát Bãi Dài ấm cúng.",
  },
  {
    id: "emerald",
    name: "Đảo Xanh Hòn Tằm",
    subtitle: "Tươi mát • Island Emerald",
    icon: "🌿",
    headerBg: "bg-linear-to-r from-[#064E3B] via-[#047857] to-[#0D9488]",
    accentBg: "bg-[#F59E0B]",
    previewRing: "ring-[#059669]",
    description: "Màu xanh ngọc bích nước biển đảo ngọc và hàng dừa miền nhiệt đới.",
  },
  {
    id: "midnight",
    name: "Biển Đêm Trần Phú",
    subtitle: "Huyền bí • Midnight Cyan",
    icon: "🌌",
    headerBg: "bg-linear-to-r from-[#0B192C] via-[#1E3E62] to-[#008170]",
    accentBg: "bg-[#00D26A]",
    previewRing: "ring-[#00D26A]",
    description: "Không gian biển đêm lung linh ánh đèn vịnh ngọc và sắc xanh neon công nghệ.",
  },
  {
    id: "rose",
    name: "Hoa Giấy Phố Biển",
    subtitle: "Lãng mạn • Coastal Rose",
    icon: "🌸",
    headerBg: "bg-linear-to-r from-[#881337] via-[#BE123C] to-[#E11D48]",
    accentBg: "bg-[#FB923C]",
    previewRing: "ring-[#E11D48]",
    description: "Sắc hoa giấy đỏ hồng nở rộ dọc các cung đường biển Nha Trang đầy lãng mạn.",
  },
];

const DEFAULT_THEME: ThemeSettings = {
  mode: "light",
  accent: "ocean",
  density: "normal",
  reduceMotion: false,
  highContrast: false,
};

const THEME_STORAGE_KEY = "trobien_theme_settings";

interface ThemeContextType {
  theme: ThemeSettings;
  setTheme: (newTheme: Partial<ThemeSettings>) => void;
  toggleMode: () => void;
  resetTheme: () => void;
  isCustomizerOpen: boolean;
  setIsCustomizerOpen: (open: boolean) => void;
  resolvedMode: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeSettings>(DEFAULT_THEME);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [resolvedMode, setResolvedMode] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  // Khởi tạo từ LocalStorage khi mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setThemeState((prev) => ({ ...prev, ...parsed }));
      }
    } catch (e) {
      console.warn("Failed to read theme settings from localStorage", e);
    }
    setMounted(true);
  }, []);

  // Tính toán và áp dụng theme lên DOM
  useEffect(() => {
    if (!mounted) return;

    // 1. Xác định resolved mode (nếu system thì đọc prefers-color-scheme)
    let isDark = theme.mode === "dark";
    if (theme.mode === "system") {
      isDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    setResolvedMode(isDark ? "dark" : "light");

    const root = document.documentElement;

    // 2. Cập nhật class dark & attribute
    if (isDark) {
      root.classList.add("dark");
      root.setAttribute("data-theme-mode", "dark");
    } else {
      root.classList.remove("dark");
      root.setAttribute("data-theme-mode", "light");
    }

    // 3. Cập nhật accent
    root.setAttribute("data-theme-accent", theme.accent);

    // 4. Cập nhật density
    root.setAttribute("data-density", theme.density);

    // 5. Cập nhật high contrast & reduce motion
    if (theme.highContrast) root.setAttribute("data-high-contrast", "true");
    else root.removeAttribute("data-high-contrast");

    if (theme.reduceMotion) root.setAttribute("data-reduce-motion", "true");
    else root.removeAttribute("data-reduce-motion");

    // 6. Lưu vào LocalStorage
    try {
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme));
    } catch (e) {
      console.warn("Failed to save theme settings", e);
    }

    // Phát sự kiện để các widget khác có thể phản ứng
    window.dispatchEvent(new CustomEvent("trobien_theme_changed", { detail: theme }));
  }, [theme, mounted]);

  // Lắng nghe thay đổi system dark mode nếu mode === "system"
  useEffect(() => {
    if (!mounted || theme.mode !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = (e: MediaQueryListEvent) => {
      setResolvedMode(e.matches ? "dark" : "light");
      if (e.matches) {
        document.documentElement.classList.add("dark");
        document.documentElement.setAttribute("data-theme-mode", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        document.documentElement.setAttribute("data-theme-mode", "light");
      }
    };
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [theme.mode, mounted]);

  const setTheme = (newTheme: Partial<ThemeSettings>) => {
    setThemeState((prev) => ({ ...prev, ...newTheme }));
  };

  const toggleMode = () => {
    setThemeState((prev) => {
      let nextMode: ThemeMode = "dark";
      if (prev.mode === "dark") nextMode = "light";
      else if (prev.mode === "light") nextMode = "dark";
      else {
        // System -> toggle sang ngược lại của resolved
        nextMode = resolvedMode === "dark" ? "light" : "dark";
      }
      return { ...prev, mode: nextMode };
    });
  };

  const resetTheme = () => {
    setThemeState(DEFAULT_THEME);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleMode,
        resetTheme,
        isCustomizerOpen,
        setIsCustomizerOpen,
        resolvedMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
