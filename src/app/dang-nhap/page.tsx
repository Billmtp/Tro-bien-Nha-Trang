import type { Metadata } from "next";
import LoginClient from "./LoginClient";

export const metadata: Metadata = {
  title: "Đăng Nhập & Đăng Ký | Trọ Biển Nha Trang",
  description: "Nền tảng tìm trọ sinh viên & an cư ven biển số 1 Nha Trang. Đăng nhập hoặc đăng ký bằng email trường để nhận Tích Xanh sinh viên.",
};

export default function LoginPage() {
  return <LoginClient />;
}
