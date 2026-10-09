import { cache } from "react";
import { prisma } from "@/lib/db";
import { memoryCache } from "@/lib/cache";
import HeaderChotot from "@/components/HeaderChotot";
import DetailClient from "./DetailClient";
import { notFound } from "next/navigation";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

// Bật ISR Cache 3 phút để các lượt truy cập sau trả về ngay lập tức (< 10ms)
export const revalidate = 180;

// Memory Cache + React Cache: 5 phút không cần query DB lại
const getRoom = cache(async (roomId: number) => {
  return memoryCache.getOrSet(
    `room:${roomId}`,
    () => prisma.room.findUnique({ where: { id: roomId } }),
    300,
    null
  );
});

// Cache danh sách phòng tương tự
const getSimilarRooms = cache(
  async (roomId: number, category: string, district?: string | null) => {
    return memoryCache.getOrSet(
      `similar:${roomId}`,
      () =>
        prisma.room.findMany({
          where: {
            id: { not: roomId },
            isActive: true,
            category,
            ...(district ? { district } : {}),
          },
          take: 4,
          orderBy: { scrapedAt: "desc" },
          select: {
            id: true,
            title: true,
            price: true,
            area: true,
            district: true,
            images: true,
            sourceUrl: true,
            sourceSite: true,
            scrapedAt: true,
          },
        }),
      300,
      []
    );
  }
);

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const roomId = parseInt(id);
  if (isNaN(roomId)) return { title: "Phòng trọ Nha Trang | Trọ Biển" };

  const room = await getRoom(roomId);
  if (!room) return { title: "Không tìm thấy tin đăng | Trọ Biển Nha Trang" };

  let imageUrl = "/tro-bien-logo.png";
  if (Array.isArray(room.images) && room.images.length > 0) {
    imageUrl = room.images[0];
  }

  return {
    title: `${room.title} - Trọ Biển Nha Trang`,
    description:
      room.description?.slice(0, 160) ||
      `Chi tiết phòng trọ tại ${room.district || "Nha Trang"}. Xem thông tin giá, vị trí, khoảng cách ĐH Nha Trang & CĐ Kỹ Thuật Công Nghệ trên Trọ Biển.`,
    openGraph: {
      title: `${room.title} | Trọ Biển Nha Trang`,
      description: room.address || `Phòng trọ tại ${room.district || "Nha Trang"}`,
      url: `https://trobien.vn/phong/${id}`,
      siteName: "Trọ Biển Nha Trang",
      images: [{ url: imageUrl, alt: room.title }],
    },
  };
}

export default async function RoomPage({ params }: PageProps) {
  const { id } = await params;
  const roomId = parseInt(id);
  if (isNaN(roomId)) notFound();

  const room = await getRoom(roomId);
  if (!room) notFound();

  // Tin tương tự cùng khu vực hoặc mức giá được cache
  const similarRooms = await getSimilarRooms(
    roomId,
    room.category,
    room.district
  );

  return (
    <div className="min-h-screen bg-[#EEF6FB]">
      <HeaderChotot />
      <DetailClient
        room={{
          ...room,
          scrapedAt: room.scrapedAt.toISOString(),
          updatedAt: room.updatedAt.toISOString(),
        }}
        similarRooms={similarRooms.map((r) => ({
          ...r,
          scrapedAt: r.scrapedAt.toISOString(),
        }))}
      />
    </div>
  );
}
