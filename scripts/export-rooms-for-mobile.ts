import { prisma } from "../src/lib/db";
import * as fs from "fs";
import * as path from "path";

const RENT_FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80",
];

const SALE_FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80",
];

async function main() {
  console.log("Fetching all active approved rooms from Neon DB...");
  const rooms = await prisma.room.findMany({
    where: {
      isActive: true,
      status: "approved",
    },
    orderBy: {
      scrapedAt: "desc",
    },
  });

  console.log(`Found ${rooms.length} rooms in database.`);

  const normalizedRooms = rooms.map((r, index) => {
    // Sanitize images
    const rawImages = (r.images || []).filter((img: string) => {
      if (!img || typeof img !== "string") return false;
      const trimmed = img.trim();
      if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) return false;
      if (trimmed.toLowerCase().endsWith(".svg") || trimmed.includes(".svg?")) return false;
      if (trimmed.startsWith("data:image")) return false;
      return true;
    });

    let finalImages = rawImages;
    if (finalImages.length === 0) {
      const isSale = r.category === "sale" || (r.price && r.price >= 500000000);
      const pool = isSale ? SALE_FALLBACK_IMAGES : RENT_FALLBACK_IMAGES;
      const idx = Math.abs(r.id || index) % pool.length;
      finalImages = [pool[idx], pool[(idx + 1) % pool.length]];
    }

    return {
      id: r.id,
      title: r.title,
      price: r.price || 0,
      area: r.area || 25,
      address: r.address || `${r.district || "Nha Trang"}, Khánh Hòa`,
      district: r.district || "Nha Trang",
      ward: r.district || "Nha Trang",
      description: r.description || "",
      images: finalImages,
      sourceUrl: r.sourceUrl || "",
      sourceSite: r.sourceSite || "he_thong",
      contact: r.contact || "0905 123 456",
      category: r.category || (r.price && r.price >= 500000000 ? "sale" : "rent"),
      lat: r.lat || 12.2388,
      lng: r.lng || 109.1967,
      scrapedAt: r.scrapedAt.toISOString(),
      isVerified: r.isVip || r.sourceSite === "chotot" || false,
      floodSafe: !(r.district || "").includes("Vĩnh Phương") && !(r.district || "").includes("Vĩnh Trung"),
    };
  });

  const targetPath = path.resolve(__dirname, "../../mobile/src/api/databaseSnapshot.json");
  fs.writeFileSync(targetPath, JSON.stringify(normalizedRooms, null, 2), "utf-8");
  console.log(`Successfully exported ${normalizedRooms.length} synchronized rooms to ${targetPath}`);
}

main()
  .catch((e) => {
    console.error("Export error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
