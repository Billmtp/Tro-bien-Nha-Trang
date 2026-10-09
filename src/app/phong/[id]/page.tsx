import { prisma } from "@/lib/db";
import HeaderChotot from "@/components/HeaderChotot";
import DetailClient from "./DetailClient";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function RoomPage({ params }: PageProps) {
  const { id } = await params;
  const roomId = parseInt(id);
  if (isNaN(roomId)) notFound();

  const room = await prisma.room.findUnique({
    where: { id: roomId },
  });

  if (!room) notFound();

  // Tin tương tự cùng khu vực hoặc giá gần kề
  const similarRooms = await prisma.room.findMany({
    where: {
      id: { not: roomId },
      isActive: true,
      OR: [
        { district: room.district || undefined },
        {
          price: room.price
            ? {
                gte: Math.max(0, room.price - 1_000_000),
                lte: room.price + 1_000_000,
              }
            : undefined,
        },
      ],
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
  });

  return (
    <div className="min-h-screen bg-[#F4F4F4]">
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
