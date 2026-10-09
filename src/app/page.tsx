import { prisma } from "@/lib/db";
import RoomListClient from "@/components/RoomListClient";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    district?: string;
    minPrice?: string;
    maxPrice?: string;
    minArea?: string;
    site?: string;
    q?: string;
    sort?: string;
    category?: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const limit = 20;
  const category = params.category === "sale" ? "sale" : params.category === "roommate" ? "roommate" : "rent";
  const district = params.district && params.district !== "Tất cả khu vực" ? params.district : "";
  const minPrice = parseInt(params.minPrice || "0");
  const maxPrice = parseInt(params.maxPrice || "0");
  const site = params.site || "";
  const q = params.q || "";
  const sort = params.sort || "newest";

  let orderBy: any = { scrapedAt: "desc" };
  if (sort === "price_asc") orderBy = { price: "asc" };
  if (sort === "price_desc") orderBy = { price: "desc" };

  const where: any = {
    isActive: true,
    status: "approved",
    category,
    ...(district && { district }),
    ...(site && {
      sourceSite: site === "facebook" ? { contains: "facebook" } : site,
    }),
    ...(q && {
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { address: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ],
    }),
    ...(minPrice > 0 || maxPrice > 0
      ? {
          price: {
            ...(minPrice > 0 ? { gte: minPrice } : {}),
            ...(maxPrice > 0 ? { lte: maxPrice } : {}),
          },
        }
      : {}),
  };

  const [rooms, total, todayCount, lastUpdate, mapRoomsRaw] = await Promise.all([
    prisma.room.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        title: true,
        price: true,
        area: true,
        address: true,
        district: true,
        images: true,
        sourceUrl: true,
        sourceSite: true,
        contact: true,
        lat: true,
        lng: true,
        scrapedAt: true,
      },
    }),
    prisma.room.count({ where }),
    prisma.room.count({
      where: {
        isActive: true,
        category,
        scrapedAt: { gte: new Date(Date.now() - 24 * 3_600_000) },
      },
    }),
    prisma.room.findFirst({
      where: { category },
      orderBy: { scrapedAt: "desc" },
      select: { scrapedAt: true },
    }),
    // Lấy tập hợp phòng diện rộng cho Bản Đồ Nha Trang (lên đến 300 phòng) để bản đồ phủ kín thành phố
    prisma.room.findMany({
      where: {
        isActive: true,
        status: "approved",
        category,
        ...(district && { district }),
        ...(minPrice > 0 || maxPrice > 0
          ? {
              price: {
                ...(minPrice > 0 ? { gte: minPrice } : {}),
                ...(maxPrice > 0 ? { lte: maxPrice } : {}),
              },
            }
          : {}),
      },
      take: 300,
      orderBy: { scrapedAt: "desc" },
      select: {
        id: true,
        title: true,
        price: true,
        area: true,
        address: true,
        district: true,
        images: true,
        sourceSite: true,
        lat: true,
        lng: true,
        category: true,
      },
    }),
  ]);

  const formattedRooms = rooms.map((r) => ({
    ...r,
    scrapedAt: r.scrapedAt.toISOString(),
  }));

  return (
    <RoomListClient
      rooms={formattedRooms}
      mapRooms={mapRoomsRaw}
      total={total}
      page={page}
      totalPages={Math.ceil(total / limit)}
      stats={{
        total,
        todayCount,
        lastUpdate: lastUpdate?.scrapedAt ? lastUpdate.scrapedAt.toISOString() : null,
      }}
      searchParams={params}
      category={category}
    />
  );
}
