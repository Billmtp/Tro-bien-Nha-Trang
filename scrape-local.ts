import { PrismaClient } from '@prisma/client';
import { scrapePhoTro123, scrapeMogi, scrapeNhaTot } from './src/lib/scrapers';

const prisma = new PrismaClient();

async function main() {
  console.log("Đang bắt đầu quét dữ liệu phòng trọ Nha Trang từ nhiều nguồn...");
  const [phongTroRooms, mogiRooms, nhaTotRooms] = await Promise.allSettled([
    scrapePhoTro123(),
    scrapeMogi(),
    scrapeNhaTot(),
  ]);

  const allRooms = [
    ...(phongTroRooms.status === "fulfilled" ? phongTroRooms.value : []),
    ...(mogiRooms.status === "fulfilled" ? mogiRooms.value : []),
    ...(nhaTotRooms.status === "fulfilled" ? nhaTotRooms.value : []),
  ];
  
  console.log(`Tìm thấy tổng cộng ${allRooms.length} tin. Đang lưu vào cơ sở dữ liệu...`);

  let count = 0;
  let skipped = 0;
  for (const room of allRooms) {
    try {
      const price = typeof room.price === "number" && !isNaN(room.price) ? room.price : null;
      
      // Bỏ qua các tin bán đất/bán nhà giá trên 35 triệu/tháng vì đây là web phòng trọ cho thuê
      if (price && price > 35_000_000) {
        skipped++;
        continue;
      }

      const area = typeof room.area === "number" && !isNaN(room.area) ? parseFloat(room.area.toFixed(1)) : null;

      await prisma.room.upsert({
        where: { sourceUrl: room.sourceUrl },
        update: {
          title: room.title,
          price,
          area,
          address: room.address || "",
          district: room.district || "Nha Trang",
          description: room.description || "",
          images: Array.isArray(room.images) && room.images.length > 0 ? room.images : [],
          contact: room.contact || "Chủ phòng trọ Nha Trang",
          isActive: true,
          updatedAt: new Date(),
        },
        create: {
          title: room.title,
          price,
          area,
          address: room.address || "",
          district: room.district || "Nha Trang",
          description: room.description || "",
          images: Array.isArray(room.images) && room.images.length > 0 ? room.images : [],
          sourceUrl: room.sourceUrl,
          sourceSite: room.sourceSite,
          contact: room.contact || "Chủ phòng trọ Nha Trang",
        },
      });
      count++;
    } catch (e: any) {
      console.error("Lỗi khi thêm tin:", e.message);
    }
  }
  console.log(`🎉 Thành công: Đã lưu ${count} phòng trọ vào database (Bỏ qua ${skipped} tin bán đất/nhà giá cao).`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
