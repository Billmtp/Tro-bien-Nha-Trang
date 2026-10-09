import { prisma } from './src/lib/db';

async function run() {
  const rooms = await prisma.room.findMany({
    select: { id: true, title: true, price: true, sourceSite: true },
    take: 30,
    orderBy: { id: 'desc' }
  });
  console.log("30 bài đăng mới nhất trong database:");
  rooms.forEach(r => {
    console.log(`[ID ${r.id}] ${r.title} | ${r.price?.toLocaleString('vi')} đ | Nguồn: ${r.sourceSite}`);
  });

  const saleRooms = await prisma.room.count({
    where: {
      OR: [
        { title: { contains: "bán", mode: "insensitive" } },
        { title: { contains: "mặt tiền", mode: "insensitive" } },
        { price: { gt: 10_000_000 } }
      ]
    }
  });
  console.log(`\nSố tin có chữ 'bán' hoặc giá > 10 triệu: ${saleRooms} tin.`);
}

run().finally(() => prisma.$disconnect());
