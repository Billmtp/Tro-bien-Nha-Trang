import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Trọ Biển Nha Trang - Phòng Trọ Nha Trang",
    short_name: "Trọ Biển",
    description: "Kênh tìm kiếm phòng trọ, căn hộ, nhà thuê tại TP. Nha Trang chính chủ, nhanh chóng & uy tín",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#0284C7",
    orientation: "portrait",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
