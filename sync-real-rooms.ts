import { prisma } from "./src/lib/db";
import { scrapePhoTro123, scrapeNhaTot } from "./src/lib/scrapers";

async function syncAll() {
  console.log("=== BẮT ĐẦU ĐỒNG BỘ DỮ LIỆU PHÒNG TRỌ THẬT 100% ===");

  // 1. Dọn dẹp triệt để các tin bán nhà, văn phòng, nhà > 6 triệu hoặc chứa ảnh unsplash
  console.log("1. Đang thanh lọc database: xóa tin bán nhà, biệt thự, giá > 6 triệu...");
  
  const deletedSales = await prisma.room.deleteMany({
    where: {
      OR: [
        { price: { gt: 6_000_000 } },
        { title: { contains: "bán", mode: "insensitive" } },
        { title: { contains: "biệt thự", mode: "insensitive" } },
        { title: { contains: "shophouse", mode: "insensitive" } },
        { title: { contains: "nguyên căn 1", mode: "insensitive" } },
        { title: { contains: "làm văn phòng", mode: "insensitive" } },
      ],
    },
  });
  console.log(`Đã xóa ${deletedSales.count} tin bán nhà / giá cao không phải phòng trọ.`);

  // Xóa hoặc làm sạch các tin chứa ảnh unsplash
  const unsplashRooms = await prisma.room.findMany({
    select: { id: true, images: true, sourceSite: true },
  });

  for (const r of unsplashRooms) {
    const hasUnsplash = r.images.some(img => img.includes("unsplash.com") || img.includes("pexels.com"));
    if (hasUnsplash) {
      // Thay thế bằng ảnh đại diện chính thức theo nguồn
      let placeholder = "/placeholders/default-room.svg";
      if (r.sourceSite === "facebook") placeholder = "/placeholders/facebook-card.svg";
      else if (r.sourceSite === "google_maps") placeholder = "/placeholders/google-maps-card.svg";
      else if (r.sourceSite === "phongtro123") placeholder = "/placeholders/phongtro123-card.svg";
      else if (r.sourceSite === "nhatot") placeholder = "/placeholders/chotot-card.svg";

      const cleanImgs = r.images.filter(img => !img.includes("unsplash.com") && !img.includes("pexels.com"));
      const finalImgs = cleanImgs.length > 0 ? cleanImgs : [placeholder];

      await prisma.room.update({
        where: { id: r.id },
        data: { images: finalImgs },
      });
    }
  }
  console.log("Đã loại bỏ 100% ảnh Unsplash stock khỏi toàn bộ database.");

  // 2. Cào dữ liệu phòng trọ thật từ Phongtro123 (Nha Trang)
  console.log("2. Đang quét bài đăng phòng trọ thực tế từ Phongtro123...");
  const ptRooms = await scrapePhoTro123();
  console.log(`Quét được ${ptRooms.length} tin từ Phongtro123.`);
  
  let ptInserted = 0;
  for (const r of ptRooms) {
    if (!r.title || !r.sourceUrl) continue;
    try {
      await prisma.room.upsert({
        where: { sourceUrl: r.sourceUrl },
        update: {
          title: r.title,
          price: r.price,
          area: r.area,
          address: r.address,
          district: r.district,
          description: r.description,
          images: r.images,
          contact: r.contact,
          isActive: true,
          updatedAt: new Date(),
        },
        create: {
          title: r.title,
          price: r.price,
          area: r.area,
          address: r.address,
          district: r.district,
          description: r.description,
          images: r.images,
          sourceUrl: r.sourceUrl,
          sourceSite: "phongtro123",
          contact: r.contact,
          isActive: true,
        },
      });
      ptInserted++;
    } catch {}
  }
  console.log(`Đã lưu ${ptInserted} tin phòng trọ thực tế từ Phongtro123.`);

  // 3. Cào dữ liệu phòng trọ thật từ Chợ Tốt / Nhà Tốt (Nha Trang)
  console.log("3. Đang quét phòng trọ từ Chợ Tốt / Nhà Tốt...");
  const ntRooms = await scrapeNhaTot();
  console.log(`Quét được ${ntRooms.length} tin từ Chợ Tốt.`);

  let ntInserted = 0;
  for (const r of ntRooms) {
    if (!r.title || !r.sourceUrl) continue;
    try {
      await prisma.room.upsert({
        where: { sourceUrl: r.sourceUrl },
        update: {
          title: r.title,
          price: r.price,
          area: r.area,
          address: r.address,
          district: r.district,
          description: r.description,
          images: r.images,
          contact: r.contact,
          isActive: true,
          updatedAt: new Date(),
        },
        create: {
          title: r.title,
          price: r.price,
          area: r.area,
          address: r.address,
          district: r.district,
          description: r.description,
          images: r.images,
          sourceUrl: r.sourceUrl,
          sourceSite: "nhatot",
          contact: r.contact,
          isActive: true,
        },
      });
      ntInserted++;
    } catch {}
  }
  console.log(`Đã lưu ${ntInserted} tin phòng trọ từ Chợ Tốt.`);

  // 4. Tổng kết
  const totalCount = await prisma.room.count();
  const priceStats = await prisma.room.findMany({
    select: { id: true, title: true, price: true, sourceSite: true, images: true },
    orderBy: { id: "desc" },
    take: 10,
  });

  console.log("\n================ KẾT QUẢ ĐỒNG BỘ ================");
  console.log(`Tổng số phòng trọ trong hệ thống: ${totalCount} phòng.`);
  console.log("10 phòng trọ mới nhất:");
  priceStats.forEach(r => {
    console.log(`[#${r.id}] [${r.sourceSite}] ${r.price?.toLocaleString("vi")} đ | ${r.title.slice(0, 50)} | Ảnh: ${r.images[0]?.slice(0, 60)}...`);
  });
}

syncAll()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
