import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { scrapePhoTro123, scrapeMogi, scrapeNhaTot } from "@/lib/scrapers";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  // Bảo vệ endpoint bằng secret key
  const authHeader = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET || "dev-secret";
  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = { phongtro123: 0, mogi: 0, nhatot: 0, errors: [] as string[] };

  try {
    // Chạy song song các scrapers
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

    if (phongTroRooms.status === "rejected") results.errors.push(`phongtro123: ${phongTroRooms.reason}`);
    if (mogiRooms.status === "rejected") results.errors.push(`mogi: ${mogiRooms.reason}`);
    if (nhaTotRooms.status === "rejected") results.errors.push(`nhatot: ${nhaTotRooms.reason}`);

    // Upsert từng phòng vào DB
    for (const room of allRooms) {
      try {
        await prisma.room.upsert({
          where: { sourceUrl: room.sourceUrl },
          update: {
            title: room.title,
            price: room.price,
            area: room.area,
            address: room.address,
            district: room.district,
            description: room.description,
            images: room.images,
            contact: room.contact,
            isActive: true,
            updatedAt: new Date(),
          },
          create: {
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
          },
        });

        if (room.sourceSite === "phongtro123") results.phongtro123++;
        else if (room.sourceSite === "mogi") results.mogi++;
        else if (room.sourceSite === "nhatot") results.nhatot++;
      } catch {
        // skip duplicate or invalid
      }
    }

    // Mark phòng cũ hơn 7 ngày là inactive
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    await prisma.room.updateMany({
      where: { updatedAt: { lt: sevenDaysAgo }, isActive: true },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      scraped: results,
      total: allRooms.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Cron error:", err);
    return NextResponse.json({ error: "Internal error", detail: String(err) }, { status: 500 });
  }
}

// GET cho Vercel Cron (cron job gửi GET request)
export async function GET(request: Request) {
  return POST(request);
}
