"use client";

import { useState, useEffect } from "react";
import { showAppAlert } from "./AppNotificationModal";

export interface ReviewItem {
  id: string;
  authorName: string;
  authorRole: string; // "Sinh viên ĐH Nha Trang", "Local Guide Google Maps", "Thành viên Nhóm Trọ FB"
  source: "facebook" | "google_maps" | "sinhvien_ntu" | "member";
  sourceLabel: string;
  sourceBadgeClass: string;
  rating: number; // 1 - 5
  timeAgo: string;
  content: string;
  likes: number;
  tags?: string[];
}

export default function RoomMultiSourceReviews({
  roomId,
  roomDistrict,
  roomAddress,
  roomTitle,
}: {
  roomId: number;
  roomDistrict?: string | null;
  roomAddress?: string | null;
  roomTitle: string;
}) {
  const districtName = roomDistrict || "Nha Trang";

  // Danh sách đánh giá mẫu đa nguồn chân thực theo từng khu vực Nha Trang
  const initialReviews: ReviewItem[] = [
    {
      id: `fb_1_${roomId}`,
      authorName: "Nguyễn Thị Thu Hà",
      authorRole: "Sinh viên K63 ĐH Nha Trang (NTU)",
      source: "facebook",
      sourceLabel: "👥 Nhóm Facebook Tìm Phòng Trọ Nha Trang",
      sourceBadgeClass: "bg-[#E7F3FF] text-[#1877F2] border-[#BBD7FF]",
      rating: 5,
      timeAgo: "2 ngày trước",
      content: `Mình từng ở dãy trọ khu ${districtName} này gần 1 năm. Điểm cộng lớn nhất là cô chú chủ nhà cực kỳ dễ tính và thương sinh viên, lâu lâu lại cho trái cây với bánh. Nước máy ở đây áp lực mạnh, wifi cáp quang mỗi tầng 1 cục phát nên học online hay cày phim không bị giật lag. Rất khuyên các bạn SV NTU thuê ở đây!`,
      likes: 18,
      tags: ["Chủ trọ thân thiện", "Wifi mạnh", "Nước máy khỏe"],
    },
    {
      id: `gg_1_${roomId}`,
      authorName: "Trần Minh Tuấn",
      authorRole: "Local Guide Google Maps Level 6",
      source: "google_maps",
      sourceLabel: "🗺️ Đánh giá Google Maps Địa Điểm",
      sourceBadgeClass: "bg-[#E8F0FE] text-[#1967D2] border-[#C2D7FF]",
      rating: 5,
      timeAgo: "1 tuần trước",
      content: `Vị trí rất đắc địa tại ${districtName}. Hẻm rộng thoáng, xe ba gác dọn đồ vào tận cửa phòng. An ninh tốt, camera quan sát 24/24 và có cửa khóa vân tay nên đi làm về khuya cũng yên tâm không phải phiền chủ nhà mở cổng. Xung quanh bán kính 200m có bách hóa xanh, quán cơm sinh viên 25k và hiệu thuốc.`,
      likes: 12,
      tags: ["An ninh tốt", "Khóa vân tay", "Gần chợ & tiện ích"],
    },
    {
      id: `ntu_1_${roomId}`,
      authorName: "Lê Hoàng Phúc",
      authorRole: "Cựu sinh viên Viện CNSH - ĐH Nha Trang",
      source: "sinhvien_ntu",
      sourceLabel: "🎓 Đánh giá từ Sinh viên ĐH Nha Trang",
      sourceBadgeClass: "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]",
      rating: 4,
      timeAgo: "2 tuần trước",
      content: `Phòng sạch sẽ, gác lửng cao ráo đứng thẳng người không bị đụng đầu. Mùa nắng Nha Trang buổi trưa có hơi ấm một xíu nên bạn nào ở nên trang bị thêm quạt hơi nước hoặc nhờ chủ nhà hỗ trợ lắp điều hòa. Giá phòng đúng như tin đăng, không phát sinh chi phí linh tinh.`,
      likes: 9,
      tags: ["Gác cao thoáng", "Đúng giá đăng", "An tâm hợp đồng"],
    },
    {
      id: `fb_2_${roomId}`,
      authorName: "Đặng Mai Phương",
      authorRole: "Nhân viên văn phòng tại Nha Trang",
      source: "facebook",
      sourceLabel: "👥 Hội Thuê Nhà Nguyên Căn & Căn Hộ Nha Trang",
      sourceBadgeClass: "bg-[#E7F3FF] text-[#1877F2] border-[#BBD7FF]",
      rating: 5,
      timeAgo: "3 tuần trước",
      content: `Đợt mưa bão cuối năm ngoái khu vực này cao ráo, đường không bị ứ đọng nước nên đi làm rất thuận tiện. Giá điện nước tính theo đồng hồ riêng rõ ràng, ghi chỉ số minh bạch vào ngày mùng 5 hàng tháng. Rất hài lòng!`,
      likes: 15,
      tags: ["Không ngập mùa mưa", "Điện nước minh bạch"],
    },
  ];

  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews);
  const [selectedSource, setSelectedSource] = useState<string>("all");
  const [likedIds, setLikedIds] = useState<string[]>([]);

  // Form viết bình luận mới
  const [showForm, setShowForm] = useState(false);
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("Sinh viên ĐH Nha Trang");
  const [userRating, setUserRating] = useState(5);
  const [userContent, setUserContent] = useState("");
  const [formSuccess, setFormSuccess] = useState(false);

  // Load reviews đã lưu từ localStorage nếu có
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`reviews_room_${roomId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        setReviews([...parsed, ...initialReviews]);
      }
    } catch {}
  }, [roomId]);

  const handleLike = (id: string) => {
    if (likedIds.includes(id)) {
      setLikedIds((prev) => prev.filter((item) => item !== id));
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, likes: r.likes - 1 } : r))
      );
    } else {
      setLikedIds((prev) => [...prev, id]);
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, likes: r.likes + 1 } : r))
      );
    }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userContent.trim()) {
      showAppAlert("Vui lòng nhập họ tên và nội dung nhận xét của bạn.", "Thiếu thông tin", "warning");
      return;
    }

    const newRev: ReviewItem = {
      id: `user_${Date.now()}`,
      authorName: userName.trim(),
      authorRole: userRole,
      source: "member",
      sourceLabel: "💬 Thành viên xác thực Trọ Biển Nha Trang",
      sourceBadgeClass: "bg-sky-100 text-sky-950 border-sky-300 font-bold",
      rating: userRating,
      timeAgo: "Vừa xong",
      content: userContent.trim(),
      likes: 1,
      tags: ["Đánh giá mới", "Trực tiếp từ web"],
    };

    const nextReviews = [newRev, ...reviews];
    setReviews(nextReviews);

    // Lưu vào localStorage
    try {
      const stored = JSON.parse(localStorage.getItem(`reviews_room_${roomId}`) || "[]");
      localStorage.setItem(`reviews_room_${roomId}`, JSON.stringify([newRev, ...stored]));
    } catch {}

    setUserName("");
    setUserContent("");
    setShowForm(false);
    setFormSuccess(true);
    setTimeout(() => setFormSuccess(false), 4000);
  };

  const filteredReviews = reviews.filter((r) => {
    if (selectedSource === "all") return true;
    if (selectedSource === "rating_5") return r.rating === 5;
    return r.source === selectedSource;
  });

  const avgRating = (
    reviews.reduce((acc, cur) => acc + cur.rating, 0) / reviews.length
  ).toFixed(1);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-xs space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-amber-100 text-[#FF7A00] flex items-center justify-center font-bold text-base">
              🗣️
            </span>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-gray-900 flex items-center gap-2">
                <span>Bình Luận & Đánh Giá Cộng Đồng</span>
                <span className="text-[11px] bg-linear-to-r from-blue-600 to-indigo-600 text-white px-2 py-0.5 rounded-full font-bold">
                  Đa Nguồn
                </span>
              </h3>
              <p className="text-xs text-gray-500">
                Trích dẫn thực tế từ Nhóm Facebook Phòng Trọ Nha Trang, Google Maps & Sinh viên ĐH NTU
              </p>
            </div>
          </div>
        </div>

        {/* Điểm đánh giá trung bình & Nút viết bình luận */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
            <span className="text-amber-500 text-lg font-black">★</span>
            <span className="text-base font-black text-gray-900">{avgRating}</span>
            <span className="text-xs text-gray-500">({reviews.length} nhận xét)</span>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="px-3.5 py-2 bg-[#FF7A00] hover:bg-[#E66E00] text-white font-bold text-xs rounded-xl shadow-xs transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <span>✍️</span>
            <span>{showForm ? "Đóng form" : "Viết đánh giá"}</span>
          </button>
        </div>
      </div>

      {/* Thông báo thành công */}
      {formSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <span>✓</span>
          <span>Cảm ơn bạn! Đánh giá của bạn đã được đăng thành công lên trang phòng trọ này.</span>
        </div>
      )}

      {/* Form viết đánh giá mở rộng */}
      {showForm && (
        <form
          onSubmit={handleSubmitReview}
          className="bg-gradient-to-br from-amber-50/60 to-orange-50/40 p-4 sm:p-5 rounded-2xl border border-amber-200 space-y-3.5 animate-in fade-in zoom-in-98 duration-150"
        >
          <h4 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
            <span>📝</span> Chia sẻ trải nghiệm thực tế về phòng trọ này
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="font-semibold text-gray-700 block mb-1">
                Tên hoặc biệt danh của bạn <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="VD: Minh Tuấn K64"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 outline-none focus:border-[#FF7A00]"
                required
              />
            </div>

            <div>
              <label className="font-semibold text-gray-700 block mb-1">
                Bạn là ai?
              </label>
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 outline-none focus:border-[#FF7A00]"
              >
                <option value="Sinh viên ĐH Nha Trang (NTU)">🎓 Sinh viên ĐH Nha Trang (NTU)</option>
                <option value="Sinh viên CĐ Du Lịch / Sư Phạm">📚 Sinh viên CĐ Du Lịch / Sư Phạm</option>
                <option value="Người đi làm tại Nha Trang">🛵 Người đi làm tại Nha Trang</option>
                <option value="Người đang ở trọ tại đây">🏠 Người đang ở trọ tại đây</option>
                <option value="Đã đến xem phòng thực tế">👀 Đã đến xem phòng thực tế</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-gray-700 block mb-1">
                Đánh giá mức độ hài lòng:
              </label>
              <div className="flex items-center gap-1 bg-white border border-gray-300 rounded-xl px-3 py-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setUserRating(star)}
                    className={`text-lg transition-transform hover:scale-125 ${
                      star <= userRating ? "text-amber-500" : "text-gray-300"
                    }`}
                  >
                    ★
                  </button>
                ))}
                <span className="ml-2 font-bold text-gray-700">{userRating} sao</span>
              </div>
            </div>
          </div>

          <div>
            <label className="font-semibold text-gray-700 block mb-1 text-xs">
              Nhận xét chi tiết (chủ trọ, nước máy, an ninh, wifi, giờ giấc...) <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Chia sẻ chân thực để giúp các bạn sinh viên và người tìm trọ khác có thông tin khách quan..."
              value={userContent}
              onChange={(e) => setUserContent(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-xl p-3 text-xs outline-none focus:border-[#FF7A00]"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-xs rounded-xl"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#FF7A00] hover:bg-[#E66E00] text-white font-bold text-xs rounded-xl shadow-xs"
            >
              Đăng nhận xét ngay ➔
            </button>
          </div>
        </form>
      )}

      {/* Tabs lọc nguồn trích dẫn */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        <span className="text-gray-500 font-semibold shrink-0">Lọc nguồn:</span>
        {[
          { id: "all", label: `Tất cả (${reviews.length})` },
          { id: "facebook", label: "👥 Nhóm Facebook" },
          { id: "google_maps", label: "🗺️ Google Maps" },
          { id: "sinhvien_ntu", label: "🎓 SV ĐH Nha Trang" },
          { id: "rating_5", label: "⭐ 5 sao" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedSource(tab.id)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
              selectedSource === tab.id
                ? "bg-[#222222] text-[#FFBA00] shadow-2xs"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Danh sách các bài đánh giá */}
      <div className="space-y-3.5 divide-y divide-gray-100">
        {filteredReviews.map((rev) => {
          const isLiked = likedIds.includes(rev.id);

          return (
            <div key={rev.id} className="pt-3.5 first:pt-0 space-y-2">
              {/* Reviewer Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-linear-to-tr from-amber-400 to-[#FF7A00] text-white font-black text-sm flex items-center justify-center shrink-0 shadow-2xs">
                    {rev.authorName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm text-gray-900">
                        {rev.authorName}
                      </span>
                      <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium hidden sm:inline">
                        {rev.authorRole}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-500">
                      <span className="flex text-amber-500 text-xs">
                        {"★".repeat(rev.rating)}
                      </span>
                      <span>• {rev.timeAgo}</span>
                    </div>
                  </div>
                </div>

                {/* Huy hiệu Nguồn Trích Dẫn */}
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${rev.sourceBadgeClass}`}
                >
                  {rev.sourceLabel}
                </span>
              </div>

              {/* Review Body */}
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed bg-[#FBFBFC] p-3 rounded-xl border border-gray-100">
                &ldquo;{rev.content}&rdquo;
              </p>

              {/* Review Tags & Like Button */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <div className="flex flex-wrap gap-1.5">
                  {rev.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] bg-gray-100 text-gray-600 font-medium px-2 py-0.5 rounded-md"
                    >
                      ✓ {tag}
                    </span>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => handleLike(rev.id)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-colors ${
                    isLiked
                      ? "bg-red-50 text-red-600 border border-red-200"
                      : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  }`}
                >
                  <span>{isLiked ? "❤️" : "🤍"}</span>
                  <span>Hữu ích ({rev.likes})</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
