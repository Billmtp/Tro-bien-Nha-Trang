import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import AppNotificationModal from "@/components/AppNotificationModal";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-be-vietnam",
});

export const viewport: Viewport = {
  themeColor: "#FFBA00",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    default: "Chợ Tốt Phòng Trọ Nha Trang - Thuê Phòng Trọ, Nhà Trọ Giá Rẻ",
    template: "%s | Chợ Tốt Phòng Trọ Nha Trang",
  },
  description:
    "Kênh tìm kiếm phòng trọ, nhà trọ cho thuê tại Nha Trang phong cách Chợ Tốt. Cập nhật liên tục 100% dữ liệu thực từ Chợ Tốt, Nhà Tốt, Phongtro123, Mogi.",
  keywords: [
    "phòng trọ nha trang",
    "cho thuê phòng trọ nha trang",
    "chợ tốt nha trang",
    "nhà tốt nha trang",
    "phòng trọ vĩnh hải",
    "phòng trọ vĩnh phước",
    "phòng trọ đại học nha trang",
    "phòng trọ cđ kỹ thuật công nghệ nha trang",
  ],
  authors: [{ name: "Chợ Tốt Nha Trang" }],
  creator: "Chợ Tốt Nha Trang",
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: "https://chotot-nhatrang.vercel.app",
    title: "Chợ Tốt Phòng Trọ Nha Trang - Thuê Phòng Trọ Giá Rẻ",
    description:
      "Tìm kiếm phòng trọ, nhà trọ cho thuê tại Nha Trang phong cách Chợ Tốt. Đo khoảng cách thực tế, cảnh báo ngập lụt mùa mưa, nhận diện chính chủ 100%.",
    siteName: "Chợ Tốt Phòng Trọ Nha Trang",
  },
  twitter: {
    card: "summary_large_image",
    title: "Chợ Tốt Phòng Trọ Nha Trang",
    description: "Tìm kiếm phòng trọ, nhà trọ cho thuê tại Nha Trang phong cách Chợ Tốt.",
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
    <html lang="vi" className={beVietnamPro.variable}>
      <body className="bg-[#F4F4F4] text-[#222222] antialiased min-h-screen">
        {children}
        <AppNotificationModal />
      </body>
    </html>
  );
}
