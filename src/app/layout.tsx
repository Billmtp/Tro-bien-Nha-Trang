import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import AppNotificationModal from "@/components/AppNotificationModal";
import { ThemeProvider } from "@/components/ThemeManager";
import ThemeCustomizerModal from "@/components/ThemeCustomizerModal";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-be-vietnam",
});

export const viewport: Viewport = {
  themeColor: "#0284C7",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://trobien.vn"),
  title: {
    default: "Trọ Biển Nha Trang - Tìm Phòng Gần Biển, An Tâm Giá Tốt",
    template: "%s | Trọ Biển Nha Trang",
  },
  description:
    "Kênh tìm kiếm phòng trọ, căn hộ, nhà thuê tại thành phố biển Nha Trang. Tích hợp cảnh báo ngập lụt, đo khoảng cách trường học, khiên bảo vệ người thuê và định giá AI minh bạch.",
  keywords: [
    "trọ biển nha trang",
    "phòng trọ nha trang",
    "cho thuê phòng trọ nha trang",
    "phòng trọ gần biển nha trang",
    "phòng trọ đại học nha trang",
    "phòng trọ cđ kỹ thuật công nghệ nha trang",
    "phòng trọ vĩnh hải",
    "phòng trọ vĩnh phước",
    "phòng trọ phước long",
    "trobien.vn",
  ],
  authors: [{ name: "Trọ Biển Nha Trang" }],
  creator: "Trọ Biển Nha Trang",
  icons: {
    icon: "/tro-bien-logo.png",
    shortcut: "/tro-bien-logo.png",
    apple: "/tro-bien-logo.png",
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: "https://trobien.vn",
    title: "Trọ Biển Nha Trang - Tìm Phòng Gần Biển, An Tâm Giá Tốt",
    description:
      "Tìm kiếm phòng trọ, căn hộ gần biển Nha Trang giá tốt. Đo khoảng cách thực tế, cảnh báo ngập lụt mùa mưa, nhận diện chính chủ 100%.",
    siteName: "Trọ Biển Nha Trang",
    images: [
      {
        url: "/tro-bien-logo.png",
        width: 800,
        height: 400,
        alt: "Logo Trọ Biển Nha Trang",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Trọ Biển Nha Trang - Tìm Phòng Gần Biển, An Tâm Giá Tốt",
    description: "Kênh tìm kiếm phòng trọ, nhà thuê uy tín hàng đầu tại Nha Trang.",
    images: ["/tro-bien-logo.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={beVietnamPro.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const s = localStorage.getItem("trobien_theme_settings");
                if (s) {
                  const p = JSON.parse(s);
                  const isDark = p.mode === "dark" || (p.mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
                  if (isDark) {
                    document.documentElement.classList.add("dark");
                    document.documentElement.setAttribute("data-theme-mode", "dark");
                  }
                  if (p.accent) document.documentElement.setAttribute("data-theme-accent", p.accent);
                  if (p.density) document.documentElement.setAttribute("data-density", p.density);
                  if (p.highContrast) document.documentElement.setAttribute("data-high-contrast", "true");
                  if (p.reduceMotion) document.documentElement.setAttribute("data-reduce-motion", "true");
                }
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body className="bg-[#EEF6FB] text-[#1E293B] antialiased min-h-screen selection:bg-[#0284C7] selection:text-white transition-colors duration-150">
        <ThemeProvider>
          {children}
          <AppNotificationModal />
          <ThemeCustomizerModal />
        </ThemeProvider>
      </body>
    </html>
  );
}
