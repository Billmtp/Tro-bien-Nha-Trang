import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { scrapePhoTro123, scrapeMogi, scrapeNhaTot, scrapeNhaTotSales, RoomData } from "@/lib/scrapers";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { category = "rent" } = await request.json().catch(() => ({ category: "rent" }));

    // 1. LẤY TOÀN BỘ SOURCE_URL ĐÃ CÓ TRONG DB ĐỂ SO SÁNH CHÍNH XÁC CŨ - MỚI
    const existingRooms = await prisma.room.findMany({
      select: {
        id: true,
        sourceUrl: true,
        title: true,
        price: true,
        lat: true,
        lng: true,
        category: true,
      },
    });

    const existingMap = new Map(existingRooms.map((r) => [r.sourceUrl, r]));
    const totalExistingInDb = existingRooms.length;

    // 2. CHẠY THU THẬP THỰC TẾ TỪ CÁC NGUỒN (CHỢ TỐT / NHÀ TỐT, PHONGTRO123, MOGI)
    // TUYỆT ĐỐI 100% DỮ LIỆU THỰC - KHÔNG MOCK HAY BỊA ĐẶT
    const scrapeTasks: { source: string; promise: Promise<RoomData[]> }[] = [
      { source: "nhatot", promise: scrapeNhaTot() },
      { source: "phongtro123", promise: scrapePhoTro123() },
      { source: "mogi", promise: scrapeMogi() },
    ];

    if (category === "sale" || category === "all") {
      scrapeTasks.push({ source: "nhatot_sales", promise: scrapeNhaTotSales() });
    }

    const settledResults = await Promise.allSettled(scrapeTasks.map((t) => t.promise));
    const scrapedRooms: RoomData[] = [];
    const sourceStats: Record<string, number> = {};

    settledResults.forEach((res, index) => {
      const sourceName = scrapeTasks[index].source;
      if (res.status === "fulfilled" && Array.isArray(res.value)) {
        sourceStats[sourceName] = res.value.length;
        scrapedRooms.push(...res.value);
      } else {
        sourceStats[sourceName] = 0;
      }
    });

    // 3. SO SÁNH ĐỐI CHIẾU THỰC SỰ GIỮA CŨ VÀ MỚI (DỰA TRÊN UNIQUE SOURCE_URL)
    const genuinelyNewScraped: RoomData[] = [];
    let existingUpdatedCount = 0;
    const seenUrlsInBatch = new Set<string>();

    for (const room of scrapedRooms) {
      if (!room.sourceUrl || seenUrlsInBatch.has(room.sourceUrl)) {
        continue;
      }
      seenUrlsInBatch.add(room.sourceUrl);

      const existingRecord = existingMap.get(room.sourceUrl);
      if (existingRecord) {
        // Bài đăng cũ đã có trong DB
        existingUpdatedCount++;
        // Cập nhật tọa độ nếu bài cũ chưa có
        if ((!existingRecord.lat || !existingRecord.lng) && (room.lat && room.lng)) {
          await prisma.room.update({
            where: { id: existingRecord.id },
            data: { lat: room.lat, lng: room.lng },
          }).catch(() => {});
        }
      } else {
        // Bài đăng thực tế MỚI CHƯA TỪNG CÓ TRONG DB
        genuinelyNewScraped.push(room);
      }
    }

    // 4. LƯU CÁC BÀI ĐĂNG MỚI THẬT 100% VÀO DATABASE VỚI ĐẦY ĐỦ TỌA ĐỘ VÀ THỜI GIAN HIỆN TẠI
    const newlyCreatedRecords: any[] = [];

    for (const room of genuinelyNewScraped) {
      try {
        const created = await prisma.room.create({
          data: {
            title: room.title,
            price: room.price,
            area: room.area,
            address: room.address,
            district: room.district,
            description: room.description,
            images: room.images,
            sourceUrl: room.sourceUrl,
            sourceSite: room.sourceSite,
            contact: room.contact,
            lat: room.lat,
            lng: room.lng,
            category: room.category || (category === "sale" ? "sale" : "rent"),
            status: "approved",
            isActive: true,
            scrapedAt: new Date(), // Đứng đầu danh sách mới nhất
          },
          select: {
            id: true,
            title: true,
            price: true,
            area: true,
            district: true,
            address: true,
            images: true,
            sourceSite: true,
            category: true,
            lat: true,
            lng: true,
            scrapedAt: true,
          },
        });

        newlyCreatedRecords.push(created);
      } catch (insertErr) {
        console.error("Lỗi khi thêm bài mới:", insertErr);
      }
    }

    // 5. CẬP NHẬT THỜI GIAN HOẠT ĐỘNG CHO CÁC BÀI ĐĂNG CŨ VẪN CÒN HIỆU LỰC
    if (existingUpdatedCount > 0) {
      const urlsToUpdate = Array.from(seenUrlsInBatch).filter((url) => existingMap.has(url));
      await prisma.room.updateMany({
        where: {
          sourceUrl: { in: urlsToUpdate },
        },
        data: {
          updatedAt: new Date(),
          isActive: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      comparison: {
        totalExistingInDb,
        totalScanned: scrapedRooms.length,
        existingMatched: existingUpdatedCount,
        newInserted: newlyCreatedRecords.length,
        sourceBreakdown: sourceStats,
      },
      newRooms: newlyCreatedRecords,
      message:
        newlyCreatedRecords.length > 0
          ? `Đã tìm thấy và cập nhật thêm ${newlyCreatedRecords.length} tin trọ mới từ các nguồn thực tế!`
          : `Đã quét và đồng bộ ${existingUpdatedCount} tin trọ thực tế. Không phát sinh tin mới tại thời điểm này.`,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Lỗi API scan:", error);
    return NextResponse.json(
      { error: "Lỗi trong quá trình quét đối chiếu", detail: String(error) },
      { status: 500 }
    );
  }
}
