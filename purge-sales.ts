import { prisma } from './src/lib/db';

async function purgeSales() {
  console.log("🧹 Bắt đầu dọn dẹp toàn bộ tin bán nhà / đất khỏi hệ thống...");

  // Xóa mọi tin có giá > 15 triệu (phòng trọ Nha Trang không có giá trên 15 triệu)
  const delHighPrice = await prisma.room.deleteMany({
    where: { price: { gt: 15_000_000 } }
  });
  console.log(`Đã xóa ${delHighPrice.count} tin có giá > 15 triệu.`);

  // Xóa mọi tin có từ khóa bán nhà / đất
  const keywords = [
    "bán", "bán nhà", "bán đất", "shophouse", "biệt thự", "sổ hồng", "sổ đỏ",
    "chuyển nhượng", "mặt tiền", "tòa nhà", "khách sạn", "đất nền", "ngợp bank",
    "kinh doanh", "đầu tư", "phân lô"
  ];

  let countKeyword = 0;
  for (const kw of keywords) {
    const res = await prisma.room.deleteMany({
      where: {
        title: { contains: kw, mode: "insensitive" }
      }
    });
    countKeyword += res.count;
  }
  console.log(`Đã xóa thêm ${countKeyword} tin chứa từ khóa mua bán bất động sản.`);

  const remaining = await prisma.room.count();
  console.log(`Số phòng trọ thực tế còn lại trong database: ${remaining} phòng.`);
}

purgeSales().finally(() => prisma.$disconnect());
