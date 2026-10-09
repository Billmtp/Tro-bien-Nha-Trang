import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SAMPLE_ROOMS = [
  {
    title: "Phòng trọ mới xây gần Đại học Nha Trang, có gác lửng, ban công thoáng",
    price: 1800000,
    area: 24,
    district: "Vĩnh Hải",
    address: "Đường 2/4, Phường Vĩnh Hải, TP. Nha Trang",
    contact: "Cô Mai (Chính chủ)",
    description: "Phòng trọ sạch sẽ, mới xây 100%. Cách cổng trường ĐH Nha Trang 400m. Có gác lửng đúc kiên cố, kệ bếp nấu ăn, WC riêng biệt khép kín. Giờ giấc tự do không chung chủ, có camera an ninh 24/7, wifi tốc độ cao.",
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
    ],
    sourceUrl: "https://chotot.vn/nha-trang/phong-tro-vinh-hai-101",
    sourceSite: "nhatot",
  },
  {
    title: "Căn hộ mini full nội thất trung tâm Lộc Thọ, cách biển Trần Phú 200m",
    price: 3800000,
    area: 32,
    district: "Lộc Thọ",
    address: "Đường Nguyễn Thiện Thuật, Phường Lộc Thọ, TP. Nha Trang",
    contact: "Anh Tuấn - 0905123889",
    description: "Căn hộ dịch vụ tiện nghi đầy đủ: Máy lạnh, máy giặt, tủ lạnh, giường nệm cao cấp, smart TV, bếp từ. Ban công view thoáng mát, thang máy, bảo vệ 24/7. Thích hợp cho chuyên viên, người đi làm hoặc ở ghép 2 người.",
    images: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80",
    ],
    sourceUrl: "https://chotot.vn/nha-trang/can-ho-loc-tho-102",
    sourceSite: "nhatot",
  },
  {
    title: "Phòng trọ giá rẻ sinh viên Phước Long, vệ sinh riêng, không chung chủ",
    price: 1300000,
    area: 18,
    district: "Phước Long",
    address: "Đường Lê Hồng Phong, Phường Phước Long, TP. Nha Trang",
    contact: "Chú Hùng (0913456789)",
    description: "Cho thuê phòng trọ giá rẻ sinh viên/công nhân. Điện 3.5k/kwh, nước 50k/người. An ninh tốt, cổng khóa vân tay ra vào tự do, có chỗ để xe máy rộng rãi trong nhà.",
    images: [
      "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80",
    ],
    sourceUrl: "https://chotot.vn/nha-trang/phong-tro-phuoc-long-103",
    sourceSite: "phongtro123",
  },
  {
    title: "Phòng trọ cao cấp có máy lạnh, gác cao đứng thẳng tại Vĩnh Phước",
    price: 2400000,
    area: 26,
    district: "Vĩnh Phước",
    address: "Đường 2/4 gần cầu Xóm Bóng, Phường Vĩnh Phước, TP. Nha Trang",
    contact: "Chị Hạnh - 0988776655",
    description: "Phòng mới tinh trang bị sẵn điều hòa Inverter tiết kiệm điện, gác đúc cao không chạm đầu, bồn rửa chén inox, máy giặt chung sân thượng. Gần chợ Đầm, khu ăn uống sầm uất.",
    images: [
      "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
    ],
    sourceUrl: "https://chotot.vn/nha-trang/phong-tro-vinh-phuoc-104",
    sourceSite: "mogi",
  },
  {
    title: "Studio khép kín view biển Hòn Chồng, Vĩnh Thọ, đầy đủ đồ đạc",
    price: 4200000,
    area: 35,
    district: "Vĩnh Thọ",
    address: "Đường Phạm Văn Đồng, Phường Vĩnh Thọ, TP. Nha Trang",
    contact: "Ngọc Lan (0935112233)",
    description: "Căn hộ Studio sát biển Hòn Chồng, gió biển mát rượi, chỉ đi bộ 2 phút ra bãi tắm. Trang bị sofa, tivi, tủ lạnh, bếp nấu ăn, máy hút mùi. Miễn phí tiền wifi và gửi xe máy.",
    images: [
      "https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&w=800&q=80",
    ],
    sourceUrl: "https://chotot.vn/nha-trang/studio-vinh-tho-105",
    sourceSite: "nhatot",
  },
  {
    title: "Phòng trọ yên tĩnh Ngọc Hiệp, sân để xe rộng, an ninh tuyệt đối",
    price: 1500000,
    area: 22,
    district: "Ngọc Hiệp",
    address: "Đường Phương Sài rẽ vào Ngọc Hiệp, TP. Nha Trang",
    contact: "Bác Năm - 0903334455",
    description: "Dãy trọ ít phòng, dân trí cao, toàn người đi làm văn phòng. Có camera từng hành lang, cổng khóa số. Tiền phòng thanh toán đầu tháng. Ưu tiên ở lâu dài.",
    images: [
      "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=800&q=80",
    ],
    sourceUrl: "https://chotot.vn/nha-trang/phong-tro-ngoc-hiep-106",
    sourceSite: "nhatot",
  },
];

async function main() {
  console.log("Seeding sample rooms in Nha Trang...");
  for (const r of SAMPLE_ROOMS) {
    await prisma.room.upsert({
      where: { sourceUrl: r.sourceUrl },
      update: {
        title: r.title,
        price: r.price,
        area: r.area,
        district: r.district,
        address: r.address,
        contact: r.contact,
        description: r.description,
        images: r.images,
        isActive: true,
      },
      create: r,
    });
  }
  console.log("Seeding completed successfully!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
