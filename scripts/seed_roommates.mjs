import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.room.count({
    where: { category: "roommate" },
  });

  console.log(`Current roommate rooms count: ${count}`);

  if (count === 0) {
    console.log("Seeding realistic Nha Trang roommate rooms...");
    const sampleRoommates = [
      {
        title: "Tìm 1 bạn nữ ở ghép phòng trọ gần ĐH Nha Trang (Đường Đoàn Trần Nghiệp)",
        price: 900000,
        area: 22,
        address: "Đường Đoàn Trần Nghiệp, Vĩnh Hải, Nha Trang",
        district: "Vĩnh Hải",
        description: "Phòng hiện có 1 bạn nữ SV năm 3 ĐH Nha Trang. Cần tìm thêm 1 bạn nữ sinh viên hoặc người đi làm ở ghép cho đỡ tiền phòng. Phòng có gác lửng rộng, toilet riêng khép kín, giờ giấc tự do, có chỗ nấu ăn, wifi tốc độ cao. Tiền phòng 1.8tr chia đôi mỗi người 900k. Điện 3.5k/kWh, nước 50k/người.",
        contact: "0905 842 195 (Zalo Quỳnh Nga)",
        category: "roommate",
        status: "approved",
        sourceSite: "nguoidang",
        sourceUrl: `https://chotot-nhatrang.local/tin-dang/seed-roommate-1`,
        images: [
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&auto=format&fit=crop&q=80"
        ],
        lat: 12.2685,
        lng: 109.1990
      },
      {
        title: "Cần tìm 1 bạn nam ở ghép căn hộ studio Hòn Chồng gần biển lộng gió",
        price: 1300000,
        area: 30,
        address: "Đường Phạm Văn Đồng, Vĩnh Phước, Nha Trang",
        district: "Vĩnh Phước",
        description: "Mình đi làm IT văn phòng, thuê căn studio full nội thất (máy lạnh, máy giặt, tủ lạnh, kệ bếp riêng) tại khu Hòn Chồng gần biển. Cần tìm 1 bạn nam ở ghép tính tình gọn gàng, sạch sẽ, không hút thuốc. Tổng phòng 2.6tr chia đôi mỗi người 1.3tr. Ban công view biển cực mát, an ninh bảo vệ 24/7.",
        contact: "0914 278 369 (Zalo Minh Tuấn)",
        category: "roommate",
        status: "approved",
        sourceSite: "nguoidang",
        sourceUrl: `https://chotot-nhatrang.local/tin-dang/seed-roommate-2`,
        images: [
          "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=80"
        ],
        lat: 12.2721,
        lng: 109.2014
      },
      {
        title: "Tìm bạn nữ ở ghép chung phòng trọ trung tâm phố Tây Lộc Thọ",
        price: 1100000,
        area: 25,
        address: "Nguyễn Thiện Thuật, Lộc Thọ, Nha Trang",
        district: "Lộc Thọ",
        description: "Phòng ngay trung tâm phố Tây Lộc Thọ, cách biển Trần Phú và quảng trường 2/4 chỉ 3 phút đi bộ. Cần tìm 1 bạn nữ ở ghép, giờ giấc thoải mái chìa khóa riêng, camera an ninh 24/24, có sẵn máy lạnh và tủ lạnh. Tiền phòng 2.2tr chia đôi mỗi người 1.1tr.",
        contact: "0982 654 321 (Chị Mai)",
        category: "roommate",
        status: "approved",
        sourceSite: "nguoidang",
        sourceUrl: `https://chotot-nhatrang.local/tin-dang/seed-roommate-3`,
        images: [
          "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1540518614846-7ede433c4b13?w=800&auto=format&fit=crop&q=80"
        ],
        lat: 12.2388,
        lng: 109.1967
      },
      {
        title: "Tìm bạn nam sinh viên ĐH NTU / CĐ Du Lịch ở ghép đường 2/4",
        price: 800000,
        area: 20,
        address: "Đường 2/4, Vĩnh Hải, Nha Trang",
        district: "Vĩnh Hải",
        description: "Phòng trọ sạch sẽ thoáng mát, có gác xép để ngủ, tầng trệt để xe máy và nấu ăn. Hiện có 1 bạn nam SV năm 2 trường ĐH Nha Trang. Cần tìm thêm 1 bạn nam ở cùng để chia sẻ tiền phòng tiết kiệm. Tiền phòng 1.6tr chia đôi 800k/người. Khu dân cư văn hóa, yên tĩnh học bài.",
        contact: "0935 112 890 (Hải Nam)",
        category: "roommate",
        status: "approved",
        sourceSite: "nguoidang",
        sourceUrl: `https://chotot-nhatrang.local/tin-dang/seed-roommate-4`,
        images: [
          "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80"
        ],
        lat: 12.2745,
        lng: 109.1948
      }
    ];

    for (const item of sampleRoommates) {
      await prisma.room.create({ data: item });
    }
    console.log("Successfully seeded 4 Nha Trang roommate listings!");
  } else {
    console.log("Roommate listings already exist. Skipping seed.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
