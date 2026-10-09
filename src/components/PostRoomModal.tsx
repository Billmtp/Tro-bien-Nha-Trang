"use client";

import { useState, useRef, useId } from "react";
import CaptchaVerification from "./CaptchaVerification";
import { showAppAlert } from "./AppNotificationModal";

const NHA_TRANG_DISTRICTS = [
  "Vĩnh Hải (Gần ĐH Nha Trang)",
  "Vĩnh Phước",
  "Vĩnh Thọ",
  "Lộc Thọ (Trung tâm)",
  "Tân Lập",
  "Phước Tiến",
  "Phước Tân",
  "Phước Hòa",
  "Phước Hải",
  "Phước Long",
  "Phương Sài",
  "Phương Sơn",
  "Ngọc Hiệp",
  "Xương Huân",
  "Vạn Thắng",
  "Vạn Thạnh",
  "Vĩnh Nguyên",
  "Vĩnh Trường",
  "Vĩnh Hiệp",
  "Vĩnh Ngọc",
  "Vĩnh Thạnh",
  "Vĩnh Trung",
  "Vĩnh Thái",
  "Vĩnh Phương",
  "Vĩnh Lương",
  "Phước Đồng",
];

const RENT_PROPERTY_TYPES = [
  "Phòng trọ / Dãy trọ",
  "Căn hộ mini / Studio",
  "Nhà nguyên căn",
  "Mặt bằng kinh doanh",
  "Ở ghép / Ký túc xá",
];

const SALE_PROPERTY_TYPES = [
  "Nhà riêng / Nhà phố",
  "Căn hộ chung cư",
  "Đất nền thổ cư",
  "Biệt thự / Nhà vườn",
];

const ROOMMATE_PROPERTY_TYPES = [
  "Tìm bạn nữ ở ghép (Ưu tiên SV)",
  "Tìm bạn nam ở ghép",
  "Tìm bạn ở ghép (Nam / Nữ đều được)",
  "Tìm nhóm ở ghép ký túc xá / căn hộ",
];

const AMENITY_OPTIONS = [
  { id: "gac_lung", label: "Có gác lửng", icon: "🪜" },
  { id: "wc_rieng", label: "WC riêng khép kín", icon: "🚿" },
  { id: "dieu_hoa", label: "Máy lạnh / Điều hòa", icon: "❄️" },
  { id: "tu_lanh", label: "Tủ lạnh", icon: "🧊" },
  { id: "may_giat", label: "Máy giặt", icon: "🧺" },
  { id: "nong_lanh", label: "Bình nóng lạnh", icon: "♨️" },
  { id: "gio_tu_do", label: "Giờ giấc tự do 24/7", icon: "⏰" },
  { id: "khong_chung_chu", label: "Không chung chủ", icon: "🔑" },
  { id: "de_xe", label: "Chỗ để xe an toàn", icon: "🏍️" },
  { id: "ban_cong", label: "Ban công / Cửa sổ thoáng", icon: "☀️" },
  { id: "ke_bep", label: "Kệ bếp nấu ăn riêng", icon: "🍳" },
  { id: "wifi", label: "Wifi cáp quang tốc độ cao", icon: "📶" },
  { id: "camera", label: "Camera an ninh 24/24", icon: "📹" },
  { id: "pet", label: "Cho nuôi thú cưng", icon: "🐾" },
];

interface UploadedImageItem {
  id: string;
  file: File;
  previewUrl: string;
  isCover: boolean;
}

export default function PostRoomModal({
  onClose,
  onSuccess,
  defaultCategory = "rent",
}: {
  onClose: () => void;
  onSuccess: () => void;
  defaultCategory?: "rent" | "sale" | "roommate";
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInputId = useId();

  // Basic Form State
  const [category, setCategory] = useState<"rent" | "sale" | "roommate">(defaultCategory);
  const [propertyType, setPropertyType] = useState(
    defaultCategory === "sale"
      ? SALE_PROPERTY_TYPES[0]
      : defaultCategory === "roommate"
      ? ROOMMATE_PROPERTY_TYPES[0]
      : RENT_PROPERTY_TYPES[0]
  );
  const [title, setTitle] = useState("");
  const [priceInput, setPriceInput] = useState("");
  const [areaInput, setAreaInput] = useState("");
  const [district, setDistrict] = useState("Vĩnh Hải (Gần ĐH Nha Trang)");
  const [address, setAddress] = useState("");

  // Utilities & Additional Info
  const [electricityCost, setElectricityCost] = useState("3.500 đ/kWh");
  const [waterCost, setWaterCost] = useState("50.000 đ/người");
  const [deposit, setDeposit] = useState("1 tháng");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    "gac_lung",
    "wc_rieng",
    "gio_tu_do",
  ]);

  // Contact State
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [isOwner, setIsOwner] = useState(true);
  const [hasZalo, setHasZalo] = useState(true);

  // Description
  const [description, setDescription] = useState("");

  // Real Multi-File Upload State
  const [imageFiles, setImageFiles] = useState<UploadedImageItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [error, setError] = useState("");
  const [isCaptchaValid, setIsCaptchaValid] = useState(false);

  // Switch category updates property type
  const handleCategoryChange = (newCat: "rent" | "sale" | "roommate") => {
    setCategory(newCat);
    setPropertyType(
      newCat === "sale"
        ? SALE_PROPERTY_TYPES[0]
        : newCat === "roommate"
        ? ROOMMATE_PROPERTY_TYPES[0]
        : RENT_PROPERTY_TYPES[0]
    );
  };

  // Toggle Amenity
  const toggleAmenity = (id: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Files Selection
  const handleAddFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newItems: UploadedImageItem[] = [];
    const maxLimit = 10;
    const remainingSlots = maxLimit - imageFiles.length;

    if (remainingSlots <= 0) {
      showAppAlert("Bạn chỉ có thể đăng tối đa 10 ảnh.", "Đạt giới hạn ảnh", "warning");
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    for (let i = 0; i < filesToProcess.length; i++) {
      const file = filesToProcess[i];
      if (!file.type.startsWith("image/")) {
        continue;
      }
      const previewUrl = URL.createObjectURL(file);
      newItems.push({
        id: `${Date.now()}_${Math.random()}_${i}`,
        file,
        previewUrl,
        isCover: imageFiles.length === 0 && i === 0,
      });
    }

    if (newItems.length > 0) {
      setImageFiles((prev) => {
        const combined = [...prev, ...newItems];
        // Ensure at least one is cover
        if (!combined.some((img) => img.isCover)) {
          combined[0].isCover = true;
        }
        return combined;
      });
    }
  };

  const handleRemoveImage = (id: string) => {
    setImageFiles((prev) => {
      const filtered = prev.filter((img) => img.id !== id);
      if (filtered.length > 0 && !filtered.some((img) => img.isCover)) {
        filtered[0].isCover = true;
      }
      return filtered;
    });
  };

  const handleSetCover = (id: string) => {
    setImageFiles((prev) =>
      prev.map((img) => ({
        ...img,
        isCover: img.id === id,
      }))
    );
  };

  // Auto-generate description from selected amenities
  const handleGenerateDescription = () => {
    const amenitiesText = AMENITY_OPTIONS.filter((a) =>
      selectedAmenities.includes(a.id)
    )
      .map((a) => `- ${a.icon} ${a.label}`)
      .join("\n");

    const extra =
      category === "rent"
        ? `\n\n📌 CHI PHÍ & DỊCH VỤ:\n- Điện: ${electricityCost}\n- Nước: ${waterCost}\n- Tiền cọc: ${deposit}`
        : "";

    const template = `${propertyType} tại ${address || district}, TP. Nha Trang.
Môi trường an ninh, sạch sẽ, khu dân cư văn minh thuận tiện đi lại.

📌 TIỆN NGHI & ĐẶC ĐIỂM:${amenitiesText ? "\n" + amenitiesText : " Đầy đủ tiện nghi cơ bản."}${extra}

📞 Liên hệ: ${contactName || "Chủ phòng"} (${contactPhone || "Vui lòng gọi trực tiếp"})${hasZalo ? " (Có Zalo)" : ""}. Vui lòng liên hệ trước khi đến xem!`;

    setDescription(template);
  };

  // Human readable price helper
  const formatPriceDisplay = () => {
    if (!priceInput) return "";
    const clean = priceInput.replace(/[^0-9.]/g, "");
    const num = parseFloat(clean);
    if (isNaN(num) || num <= 0) return "";

    if (category === "rent" || category === "roommate") {
      const suffix = category === "roommate" ? " / người" : "";
      if (num < 100) {
        // User typed in millions e.g. "2" or "2.5"
        return `${num.toLocaleString("vi-VN")} triệu đ/tháng${suffix}`;
      }
      return `${Math.round(num).toLocaleString("vi-VN")} đ/tháng${suffix}`;
    } else {
      // Sale
      if (num < 1000) {
        return `${num} Tỷ VNĐ`;
      }
      return `${(num / 1000).toFixed(2)} Tỷ VNĐ`;
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Vui lòng nhập tiêu đề bài đăng.");
      return;
    }
    if (!priceInput) {
      setError("Vui lòng nhập giá cho thuê / giá bán.");
      return;
    }
    if (!contactPhone.trim()) {
      setError("Vui lòng nhập số điện thoại liên hệ.");
      return;
    }
    if (!isCaptchaValid) {
      setError("Vui lòng hoàn thành xác thực mã Captcha bảo mật để chống spam.");
      return;
    }

    setIsSubmitting(true);
    setStatusText("Đang xử lý...");

    try {
      let uploadedImageUrls: string[] = [];

      // 1. Upload real photos if selected
      if (imageFiles.length > 0) {
        setStatusText(`Đang tải lên ${imageFiles.length} hình ảnh thực tế...`);
        const uploadData = new FormData();

        // Sort so cover image is uploaded first
        const sortedImages = [...imageFiles].sort((a, b) =>
          a.isCover ? -1 : b.isCover ? 1 : 0
        );

        sortedImages.forEach((img) => {
          uploadData.append("files", img.file);
        });

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadData,
        });

        const uploadJson = await uploadRes.json();
        if (!uploadRes.ok) {
          throw new Error(uploadJson.error || "Không thể tải ảnh lên máy chủ.");
        }

        uploadedImageUrls = uploadJson.urls || [];
      }

      // 2. Format Price
      let rawPrice = parseFloat(priceInput.replace(/,/g, "."));
      let finalPrice = 0;
      if (category === "rent" || category === "roommate") {
        if (rawPrice < 100) {
          finalPrice = Math.round(rawPrice * 1_000_000);
        } else {
          finalPrice = Math.round(rawPrice);
        }
      } else {
        // Sale: if under 1000, interpret as billion VND
        if (rawPrice < 1000) {
          finalPrice = Math.round(rawPrice * 1_000_000_000);
        } else {
          finalPrice = Math.round(rawPrice);
        }
      }

      // Clean district string (strip bracket notes)
      const cleanDistrict = district.split("(")[0].trim();

      // Format description with amenities if not already included
      let finalDesc = description.trim();
      if (!finalDesc) {
        const amenitiesText = AMENITY_OPTIONS.filter((a) =>
          selectedAmenities.includes(a.id)
        )
          .map((a) => `- ${a.label}`)
          .join(", ");
        finalDesc = `Cho thuê ${propertyType} tại ${address || cleanDistrict}, Nha Trang.\nTiện ích: ${amenitiesText || "Đầy đủ tiện nghi"}.\nLiên hệ: ${contactName} - ${contactPhone}`;
      }

      setStatusText("Đang lưu bài đăng vào hệ thống...");

      // 3. Post Room
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          price: finalPrice,
          area: parseFloat(areaInput) || 20,
          district: cleanDistrict,
          address: address.trim() || `${cleanDistrict}, TP. Nha Trang`,
          category,
          contact: `${contactName.trim() || (isOwner ? "Chính chủ" : "Môi giới")} - ${contactPhone.trim()}${hasZalo ? " (Zalo)" : ""}`,
          images: uploadedImageUrls,
          description: finalDesc,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Lỗi khi lưu bài đăng.");
      }

      showAppAlert(data.message || "🎉 Đăng tin thành công! Bài đăng của bạn đã được ghi nhận.", "Thành công", "success");
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi khi đăng tin.");
    } finally {
      setIsSubmitting(false);
      setStatusText("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-[#FFFBE6] rounded-t-2xl shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="w-3.5 h-3.5 rounded-full bg-[#FF7A00] animate-pulse" />
            <div>
              <h3 className="font-black text-base sm:text-lg text-[#222222]">
                Đăng Tin Mới - Chợ Tốt Nha Trang
              </h3>
              <p className="text-[11px] text-gray-500">
                Đăng tin miễn phí, cập nhật ngay lập tức đến người tìm trọ
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 text-lg font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-6">
          {error && (
            <div className="p-3.5 bg-red-50 text-[#D0021B] rounded-xl text-xs font-semibold border border-red-200 flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form id="postRoomForm" onSubmit={handleSubmit} className="space-y-6">
            {/* 1. Category Switcher */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                1. Chọn hình thức đăng tin <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2 p-1 bg-gray-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => handleCategoryChange("rent")}
                  className={`py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    category === "rent"
                      ? "bg-white text-[#FF7A00] shadow-sm ring-1 ring-black/5"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <span>🏠 Cho thuê</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleCategoryChange("roommate")}
                  className={`py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    category === "roommate"
                      ? "bg-white text-rose-600 shadow-sm ring-1 ring-black/5"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <span>🤝 Ở ghép</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleCategoryChange("sale")}
                  className={`py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    category === "sale"
                      ? "bg-white text-[#D0021B] shadow-sm ring-1 ring-black/5"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <span>🏢 Nhà đất</span>
                </button>
              </div>
            </div>

            {/* 2. Property Type & Title */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Loại hình {category === "roommate" ? "ở ghép" : "bất động sản"} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs sm:text-sm bg-white focus:border-[#FF7A00] outline-none"
                  >
                    {(category === "sale"
                      ? SALE_PROPERTY_TYPES
                      : category === "roommate"
                      ? ROOMMATE_PROPERTY_TYPES
                      : RENT_PROPERTY_TYPES
                    ).map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Khu vực (Phường / Xã) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs sm:text-sm bg-white focus:border-[#FF7A00] outline-none"
                  >
                    {NHA_TRANG_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Tiêu đề tin đăng <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    category === "rent"
                      ? "Vd: Phòng trọ khép kín full nội thất gần ĐH Nha Trang, giờ giấc tự do..."
                      : "Vd: Bán nhà 3 tầng mặt tiền đường 2/4, sổ hồng chính chủ..."
                  }
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm focus:border-[#FF7A00] focus:ring-1 focus:ring-[#FF7A00] outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Địa chỉ chi tiết (Số nhà, tên đường)
                </label>
                <input
                  type="text"
                  placeholder="Vd: Số 12 Hẻm 84 Đoàn Trần Nghiệp, Vĩnh Phước"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm focus:border-[#FF7A00] focus:ring-1 focus:ring-[#FF7A00] outline-none"
                />
              </div>
            </div>

            {/* 3. Price & Area */}
            <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200/60 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-gray-700">
                      {category === "rent" ? "Giá thuê phòng" : "Giá bán"} <span className="text-red-500">*</span>
                    </label>
                    {formatPriceDisplay() && (
                      <span className="text-[11px] font-bold text-[#FF7A00]">
                        ≈ {formatPriceDisplay()}
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    placeholder={
                      category === "rent"
                        ? "Vd: 2.2 hoặc 2200000"
                        : "Vd: 2.5 (Tỷ) hoặc 2500000000"
                    }
                    value={priceInput}
                    onChange={(e) => setPriceInput(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm bg-white focus:border-[#FF7A00] focus:ring-1 focus:ring-[#FF7A00] outline-none font-semibold text-gray-900"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">
                    {category === "rent"
                      ? "Nhập '2' hoặc '2000000' cho 2 triệu/tháng."
                      : "Nhập '2.5' cho 2.5 tỷ VNĐ."}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Diện tích (m²)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="Vd: 25"
                    value={areaInput}
                    onChange={(e) => setAreaInput(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm bg-white focus:border-[#FF7A00] focus:ring-1 focus:ring-[#FF7A00] outline-none font-semibold"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">Diện tích sử dụng thực tế</p>
                </div>
              </div>

              {category === "rent" && (
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-amber-200/50">
                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-0.5">
                      ⚡ Tiền điện
                    </label>
                    <input
                      type="text"
                      value={electricityCost}
                      onChange={(e) => setElectricityCost(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-2 py-1 text-xs bg-white focus:border-[#FF7A00] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-0.5">
                      💧 Tiền nước
                    </label>
                    <input
                      type="text"
                      value={waterCost}
                      onChange={(e) => setWaterCost(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-2 py-1 text-xs bg-white focus:border-[#FF7A00] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-0.5">
                      🔒 Tiền đặt cọc
                    </label>
                    <input
                      type="text"
                      value={deposit}
                      onChange={(e) => setDeposit(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-2 py-1 text-xs bg-white focus:border-[#FF7A00] outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 4. Real Photo Upload Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                    📸 Tải ảnh thực tế từ thiết bị <span className="text-red-500">*</span>
                  </label>
                  <p className="text-[11px] text-gray-500">
                    Tải từ 1 đến 10 ảnh thực tế từ điện thoại hoặc máy tính. Ảnh thật giúp người thuê tin tưởng hơn!
                  </p>
                </div>
                {imageFiles.length > 0 && (
                  <span className="text-xs font-semibold text-gray-600">
                    Đã chọn: <b className="text-[#FF7A00]">{imageFiles.length}</b>/10 ảnh
                  </span>
                )}
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                id={fileInputId}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => handleAddFiles(e.target.files)}
              />

              {/* Drag and drop zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  handleAddFiles(e.dataTransfer.files);
                }}
                className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all ${
                  isDragging
                    ? "border-[#FF7A00] bg-orange-50/50 scale-[1.01]"
                    : "border-gray-300 hover:border-[#FF7A00] bg-gray-50/50"
                }`}
              >
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-orange-100 text-[#FF7A00] flex items-center justify-center text-2xl shadow-xs">
                    📁
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs sm:text-sm font-bold text-[#FF7A00] hover:underline"
                    >
                      Bấm vào đây để chọn ảnh từ máy
                    </button>
                    <span className="text-xs text-gray-500"> hoặc kéo thả ảnh vào khu vực này</span>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Hỗ trợ định dạng JPG, PNG, WEBP tối đa 15MB/ảnh.
                  </p>
                </div>
              </div>

              {/* Image Previews Grid */}
              {imageFiles.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                  {imageFiles.map((img) => (
                    <div
                      key={img.id}
                      className={`relative group rounded-xl overflow-hidden border-2 bg-gray-100 aspect-4/3 flex items-center justify-center ${
                        img.isCover ? "border-[#FF7A00] shadow-md" : "border-gray-200"
                      }`}
                    >
                      <img
                        src={img.previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />

                      {/* Cover Badge */}
                      {img.isCover ? (
                        <div className="absolute top-1.5 left-1.5 bg-[#FF7A00] text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs">
                          Ảnh bìa
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetCover(img.id)}
                          className="absolute top-1.5 left-1.5 opacity-0 group-hover:opacity-100 bg-black/65 hover:bg-[#FF7A00] text-white text-[10px] font-bold px-2 py-0.5 rounded-md transition-all"
                        >
                          Đặt làm bìa
                        </button>
                      )}

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(img.id)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-600/85 hover:bg-red-600 text-white flex items-center justify-center text-xs font-bold transition-all shadow-sm"
                        title="Xóa ảnh này"
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                  {/* Add More Button if under 10 */}
                  {imageFiles.length < 10 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-xl border-2 border-dashed border-gray-300 hover:border-[#FF7A00] flex flex-col items-center justify-center p-3 text-gray-500 hover:text-[#FF7A00] aspect-4/3 transition-colors bg-white hover:bg-orange-50/20"
                    >
                      <span className="text-xl">+</span>
                      <span className="text-[11px] font-bold">Thêm ảnh</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* 5. Amenities & Facilities */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                🛠️ Tiện ích & Đặc điểm có sẵn
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {AMENITY_OPTIONS.map((item) => {
                  const isChecked = selectedAmenities.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleAmenity(item.id)}
                      className={`flex items-center gap-2 p-2 rounded-xl text-left border text-xs font-medium transition-all ${
                        isChecked
                          ? "bg-amber-50/80 border-[#FF7A00] text-[#904400] font-bold shadow-2xs"
                          : "bg-gray-50/60 border-gray-200 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <span className="text-base">{item.icon}</span>
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 6. Description */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-gray-700">
                  Mô tả chi tiết phòng trọ
                </label>
                <button
                  type="button"
                  onClick={handleGenerateDescription}
                  className="text-[11px] font-bold text-[#FF7A00] hover:underline flex items-center gap-1"
                >
                  <span>✨</span>
                  <span>Tự động tạo mô tả từ tiện ích</span>
                </button>
              </div>
              <textarea
                rows={4}
                placeholder="Mô tả cụ thể về vị trí, an ninh, giờ giấc, đồ dùng có sẵn trong phòng..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-3 text-xs sm:text-sm focus:border-[#FF7A00] focus:ring-1 focus:ring-[#FF7A00] outline-none"
              />
            </div>

            {/* 7. Contact Information */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                👤 Thông tin người đăng & liên hệ
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">
                    Tên người đăng
                  </label>
                  <input
                    type="text"
                    placeholder="Vd: Cô Lan (Chủ nhà)"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs sm:text-sm bg-white focus:border-[#FF7A00] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">
                    Số điện thoại liên hệ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Vd: 0912 345 678"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs sm:text-sm bg-white focus:border-[#FF7A00] outline-none font-semibold"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
                  <input
                    type="checkbox"
                    checked={isOwner}
                    onChange={(e) => setIsOwner(e.target.checked)}
                    className="rounded text-[#FF7A00] focus:ring-[#FF7A00] w-4 h-4"
                  />
                  <span>Chính chủ cho thuê (Không qua trung gian)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
                  <input
                    type="checkbox"
                    checked={hasZalo}
                    onChange={(e) => setHasZalo(e.target.checked)}
                    className="rounded text-[#FF7A00] focus:ring-[#FF7A00] w-4 h-4"
                  />
                  <span>Có sử dụng Zalo qua số này</span>
                </label>
              </div>
            </div>

            {/* 8. Captcha Verification Chống Spam */}
            <CaptchaVerification onVerify={(valid) => setIsCaptchaValid(valid)} />
          </form>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-5 py-3.5 border-t border-gray-200 bg-gray-50 flex items-center justify-between gap-3 rounded-b-2xl shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
          >
            Đóng
          </button>

          <div className="flex items-center gap-3">
            {statusText && (
              <span className="text-xs font-semibold text-[#FF7A00] animate-pulse hidden sm:inline">
                {statusText}
              </span>
            )}
            <button
              type="submit"
              form="postRoomForm"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#FF7A00] hover:bg-[#E66E00] transition-colors shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin">⏳</span>
                  <span>{statusText || "Đang đăng tin..."}</span>
                </>
              ) : (
                <>
                  <span>🚀</span>
                  <span>ĐĂNG TIN NGAY</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
