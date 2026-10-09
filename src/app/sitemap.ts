import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

export const revalidate = 3600; // Cập nhật sitemap mỗi 1 giờ

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://chotot-nhatrang.vercel.app";

  try {
    const rooms = await prisma.room.findMany({
      where: { isActive: true, status: "approved" },
      select: { id: true, updatedAt: true },
      take: 250,
      orderBy: { scrapedAt: "desc" },
    });

    const roomEntries: MetadataRoute.Sitemap = rooms.map((room) => ({
      url: `${baseUrl}/phong/${room.id}`,
      lastModified: room.updatedAt,
      changeFrequency: "daily",
      priority: 0.8,
    }));

    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "hourly",
        priority: 1.0,
      },
      ...roomEntries,
    ];
  } catch {
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "hourly",
        priority: 1.0,
      },
    ];
  }
}
