import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "vn.trobien.nhatrang",
  appName: "Trọ Biển Nha Trang",
  webDir: "public",
  server: {
    url: "https://tro-bien-nha-trang.vercel.app",
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
    backgroundColor: "#FFFFFF",
  },
};

export default config;
