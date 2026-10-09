export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F2EB]">
      <div className="text-center">
        <p className="text-6xl mb-4">🏖️</p>
        <h2 className="text-xl font-bold text-[#1E2D3D]">Không tìm thấy trang</h2>
        <p className="text-[#6B7A8A] mt-2 text-sm">Trang này không tồn tại hoặc đã bị xóa.</p>
        <a
          href="/"
          className="mt-6 inline-block bg-[#1B4F72] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-[#154060] transition-colors"
        >
          Về trang chủ
        </a>
      </div>
    </div>
  );
}
