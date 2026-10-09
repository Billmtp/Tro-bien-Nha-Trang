import * as cheerio from "cheerio";
import { getSourcePlaceholder } from "./room-images";

export interface RoomData {
  title: string;
  price?: number;
  area?: number;
  address?: string;
  district?: string;
  description?: string;
  images: string[];
  sourceUrl: string;
  sourceSite: string;
  contact?: string;
  lat?: number;
  lng?: number;
  category?: "rent" | "sale" | "roommate";
}

const DISTRICTS_NHA_TRANG = [
  "Vĩnh Hải", "Vĩnh Phước", "Vĩnh Thọ", "Xương Huân", "Vạn Thạnh", "Vạn Thắng",
  "Phước Hòa", "Phước Long", "Phước Tiến", "Phước Tân", "Phước Hải",
  "Ngọc Hiệp", "Phương Sài", "Phương Sơn", "Lộc Thọ", "Tân Lập",
  "Vĩnh Nguyên", "Vĩnh Trường", "Vĩnh Thạnh", "Vĩnh Lương", "Vĩnh Phương",
  "Vĩnh Hiệp", "Vĩnh Thái", "Phước Đồng", "Vĩnh Hòa", "Nha Trang",
];

// Tọa độ chi tiết theo tuyến đường thực tế tại TP. Nha Trang
const STREET_COORDS_NHA_TRANG: Record<string, [number, number]> = {
  "đặng tất": [12.2785, 109.1995],
  "nguyễn đình chiểu": [12.2682, 109.2023],
  "đoàn trần nghiệp": [12.2690, 109.2005],
  "củ chi": [12.2760, 109.1980],
  "mai xuân thưởng": [12.2840, 109.1980],
  "điện biên phủ": [12.2820, 109.1970],
  "nguyễn khuyến": [12.2750, 109.1870],
  "2/4": [12.2640, 109.1940],
  "2 tháng 4": [12.2640, 109.1940],
  "hòn chồng": [12.2720, 109.2060],
  "trần phú": [12.2420, 109.1970],
  "hùng vương": [12.2390, 109.1960],
  "nguyễn thị minh khai": [12.2410, 109.1930],
  "lê hồng phong": [12.2350, 109.1830],
  "vân đồn": [12.2380, 109.1850],
  "hoàng diệu": [12.2190, 109.2010],
  "dã tượng": [12.2150, 109.2030],
  "nguyễn trãi": [12.2450, 109.1880],
  "thống nhất": [12.2510, 109.1890],
  "yersin": [12.2500, 109.1910],
  "quang trung": [12.2530, 109.1920],
  "bạch đằng": [12.2370, 109.1920],
  "trần nhật duật": [12.2430, 109.1870],
  "lê thánh tôn": [12.2460, 109.1940],
  "ngô gia tự": [12.2440, 109.1860],
  "phước long": [12.2180, 109.1850],
  "nguyễn đức cảnh": [12.2120, 109.1920],
  "lương định của": [12.2580, 109.1550],
  "23/10": [12.2520, 109.1620],
  "23 tháng 10": [12.2520, 109.1620],
};

const DISTRICT_COORDS_FALLBACK: Record<string, [number, number]> = {
  "Vĩnh Hải": [12.275, 109.198],
  "Vĩnh Phước": [12.265, 109.201],
  "Vĩnh Thọ": [12.261, 109.198],
  "Xương Huân": [12.253, 109.196],
  "Vạn Thạnh": [12.251, 109.192],
  "Vạn Thắng": [12.253, 109.186],
  "Phương Sài": [12.251, 109.181],
  "Phương Sơn": [12.248, 109.176],
  "Ngọc Hiệp": [12.258, 109.172],
  "Phước Tiến": [12.246, 109.188],
  "Phước Tân": [12.247, 109.184],
  "Phước Hòa": [12.239, 109.185],
  "Phước Hải": [12.236, 109.175],
  "Phước Long": [12.221, 109.182],
  "Lộc Thọ": [12.2395, 109.196],
  "Tân Lập": [12.241, 109.189],
  "Vĩnh Nguyên": [12.215, 109.207],
  "Vĩnh Trường": [12.208, 109.205],
  "Vĩnh Thạnh": [12.261, 109.145],
  "Vĩnh Lương": [12.335, 109.182],
  "Vĩnh Phương": [12.29, 109.145],
  "Vĩnh Hiệp": [12.252, 109.155],
  "Vĩnh Thái": [12.235, 109.155],
  "Phước Đồng": [12.195, 109.155],
  "Vĩnh Hòa": [12.298, 109.209],
  "Nha Trang": [12.248, 109.19],
};

export function resolveNhaTrangCoords(text: string, district?: string): [number, number] {
  const lower = text.toLowerCase();
  for (const [street, coord] of Object.entries(STREET_COORDS_NHA_TRANG)) {
    if (lower.includes(street)) {
      return coord;
    }
  }
  const d = district && DISTRICT_COORDS_FALLBACK[district] ? district : "Nha Trang";
  return DISTRICT_COORDS_FALLBACK[d] || DISTRICT_COORDS_FALLBACK["Nha Trang"];
}

function extractDistrict(text: string): string {
  for (const d of DISTRICTS_NHA_TRANG) {
    if (text.toLowerCase().includes(d.toLowerCase())) return d;
  }
  return "Nha Trang";
}

function parsePrice(text: string): number | undefined {
  if (!text) return undefined;
  const normalized = text.toLowerCase().replace(/\s/g, "");
  const match = normalized.match(/(\d+(?:[.,]\d+)?)(triệu|tr|đồng|đ|k)?/);
  if (!match) return undefined;
  let value = parseFloat(match[1].replace(",", "."));
  const unit = match[2] || "";
  if (unit.includes("triệu") || unit === "tr") value = value * 1_000_000;
  else if (unit === "k") value = value * 1_000;
  return Math.round(value);
}

function parseArea(text: string): number | undefined {
  if (!text) return undefined;
  const match = text.match(/(\d+(?:[.,]\d+)?)\s*m²?/i);
  if (!match) return undefined;
  return parseFloat(match[1].replace(",", "."));
}

function isFakeSaleOrLuxury(title: string, price?: number): boolean {
  if (price && price > 10_000_000) return true;
  const lower = title.toLowerCase();
  const badWords = [
    "bán đất", "bán nhà", "biệt thự", "villa", "shophouse",
    "nguyên căn 15tr", "nguyên căn 20tr", "làm văn phòng", "luxury", "mặt tiền kinh doanh lớn"
  ];
  return badWords.some(bw => lower.includes(bw));
}

// ================= 1. NGUỒN CHỢ TỐT & NHÀ TỐT API (MÃ CHUẨN NHA TRANG: region_v2=7044, area_v2=704401) =================
export async function scrapeNhaTot(): Promise<RoomData[]> {
  const rooms: RoomData[] = [];

  try {
    // region_v2=7044: Khánh Hòa, area_v2=704401: TP. Nha Trang
    // cg=1050: Phòng trọ | cg=1010: Căn hộ mini / chung cư | cg=1020: Nhà nguyên căn | cg=1000: BĐS thuê
    const endpoints = [
      "https://gateway.chotot.com/v1/public/ad-listing?region_v2=7044&area_v2=704401&cg=1050&type=u&limit=50&st=u,h&sort=date_created_ad",
      "https://gateway.chotot.com/v1/public/ad-listing?region_v2=7044&area_v2=704401&cg=1010&type=u&price=0-8000000&limit=50&st=u,h&sort=date_created_ad",
      "https://gateway.chotot.com/v1/public/ad-listing?region_v2=7044&area_v2=704401&cg=1020&type=u&price=0-8000000&limit=50&st=u,h&sort=date_created_ad",
      "https://gateway.chotot.com/v1/public/ad-listing?region_v2=7044&area_v2=704401&cg=1000&type=u&price=0-6000000&limit=50&st=u,h&sort=date_created_ad",
      "https://gateway.chotot.com/v1/public/ad-listing?q=ph%C3%B2ng%20tr%E1%BB%8D%20nha%20trang&cg=1010&type=u&limit=50&st=u,h&sort=date_created_ad",
      "https://gateway.chotot.com/v1/public/ad-listing?q=tr%E1%BB%8D%20nha%20trang&limit=30&st=u,h&sort=date_created_ad",
    ];

    for (const url of endpoints) {
      try {
        const res = await fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0 Safari/537.36",
            Accept: "application/json",
          },
          signal: AbortSignal.timeout(8000),
        });

        if (!res.ok) continue;
        const data = (await res.json()) as {
          ads?: Array<{
            subject?: string;
            price?: number;
            size?: number;
            area_name?: string;
            region_name?: string;
            ward_name?: string;
            street_name?: string;
            list_id?: number;
            image?: string;
            images?: string[];
            contact_name?: string;
            phone?: string;
            body?: string;
            latitude?: number;
            longitude?: number;
          }>;
        };

        for (const ad of data.ads || []) {
          const title = ad.subject || "";
          if (!title) continue;
          if (isFakeSaleOrLuxury(title, ad.price)) continue;

          // Xử lý địa chỉ & phường
          const ward = ad.ward_name || "";
          const area = ad.area_name || "Nha Trang";
          const street = ad.street_name || "";
          const fullAddress = [street, ward, area, ad.region_name].filter(Boolean).join(", ");
          const district = ward ? ward.replace(/Phường\s*/i, "").trim() : extractDistrict(title + " " + fullAddress);

          // Xử lý tọa độ GPS thực tế từ Chợ Tốt API
          let lat = ad.latitude;
          let lng = ad.longitude;
          if (!lat || !lng || lat < 12.0 || lat > 12.5 || lng < 109.0 || lng > 109.4) {
            const resolved = resolveNhaTrangCoords(title + " " + fullAddress, district);
            lat = resolved[0];
            lng = resolved[1];
          }

          // Xử lý hình ảnh thật
          const adImages: string[] = [];
          if (Array.isArray(ad.images) && ad.images.length > 0) {
            ad.images.forEach((img) => {
              if (img && typeof img === "string" && !img.includes("unsplash.com")) {
                const fullUrl = img.startsWith("http") ? img : `https://cdn.chotot.com/${img}`;
                adImages.push(fullUrl);
              }
            });
          } else if (ad.image && !ad.image.includes("unsplash.com")) {
            const fullUrl = ad.image.startsWith("http") ? ad.image : `https://cdn.chotot.com/${ad.image}`;
            adImages.push(fullUrl);
          }

          const finalImages = adImages.length > 0 ? adImages : [getSourcePlaceholder("nhatot")];

          rooms.push({
            title,
            price: ad.price,
            area: ad.size,
            address: fullAddress || `${district}, TP. Nha Trang`,
            district: district || "Nha Trang",
            images: finalImages,
            sourceUrl: `https://www.nhatot.com/thue-phong-tro-thanh-pho-nha-trang-khanh-hoa/${ad.list_id}.htm`,
            sourceSite: "nhatot",
            contact: ad.contact_name || ad.phone || "Chủ phòng trọ Chợ Tốt",
            description: ad.body,
            lat,
            lng,
            category: "rent",
          });
        }

        await new Promise((r) => setTimeout(r, 400));
      } catch {
        // Tiếp tục endpoint tiếp theo nếu lỗi
      }
    }
  } catch (err) {
    console.error("Lỗi scrapeNhaTot:", err);
  }

  return rooms;
}

// ================= 2. NGUỒN PHONGTRO123 (NHA TRANG - QUÉT NHIỀU TRANG & CHUYÊN MỤC) =================
export async function scrapePhoTro123(): Promise<RoomData[]> {
  const rooms: RoomData[] = [];

  const targets = [
    // Trang chính TP. Nha Trang (cào 6 trang)
    ...Array.from({ length: 6 }, (_, i) => ({
      url: `https://phongtro123.com/tinh-thanh/khanh-hoa/thanh-pho-nha-trang?page=${i + 1}`,
      category: "rent" as const,
    })),
    // Căn hộ mini / chung cư Khánh Hòa
    {
      url: "https://phongtro123.com/cho-thue-can-ho-khanh-hoa",
      category: "rent" as const,
    },
    // Nhà nguyên căn cho thuê Khánh Hòa
    {
      url: "https://phongtro123.com/cho-thue-nha-nguyen-can-khanh-hoa",
      category: "rent" as const,
    },
    // Tìm người ở ghép Khánh Hòa
    {
      url: "https://phongtro123.com/tim-nguoi-o-ghep-khanh-hoa",
      category: "roommate" as const,
    },
  ];

  for (const target of targets) {
    try {
      const res = await fetch(target.url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml",
        },
        signal: AbortSignal.timeout(8000),
      });

      if (!res.ok) continue;
      const html = await res.text();
      const $ = cheerio.load(html);

      $("ul.post__listing > li").each((_, el) => {
        try {
          const jsonText = $(el).find('script[type="application/ld+json"]').text();
          let data: any = null;
          if (jsonText) {
            try {
              data = JSON.parse(jsonText);
            } catch {}
          }

          const title = data?.name || $(el).find("h3 a").text().trim();
          if (!title) return;

          const price = data?.priceRange ? parseFloat(data.priceRange) : parsePrice($(el).find(".post-price, .text-price, .price").text().trim());
          if (isFakeSaleOrLuxury(title, price)) return;

          const address = data?.address?.streetAddress || $(el).find(".text-body").text().trim();
          const phone = data?.telephone || $(el).find('a[href^="tel:"]').first().attr("href")?.replace("tel:", "") || "";
          const desc = data?.description || $(el).find("p").text().trim();

          const areaMatch = $(el).text().match(/(\d+(?:\.\d+)?)\s*m2/i) || $(el).text().match(/(\d+(?:\.\d+)?)\s*m/i);
          const area = areaMatch ? parseFloat(areaMatch[1]) : undefined;

          const href = data?.url || $(el).find("h3 a").attr("href") || "";
          const sourceUrl = href.startsWith("http") ? href : `https://phongtro123.com${href}`;

          // Thu thập hình ảnh thật từ bài đăng
          const realImages: string[] = [];
          if (data?.image && typeof data.image === "string" && !data.image.includes("thumb_default")) {
            realImages.push(data.image);
          }

          $(el).find("img").each((_, im) => {
            const src = $(im).attr("data-src") || $(im).attr("src");
            if (
              src &&
              src.includes("static123.com") &&
              !src.includes("thumb_default") &&
              !src.includes("avatar") &&
              !src.includes("logo") &&
              !realImages.includes(src)
            ) {
              realImages.push(src);
            }
          });

          const images = realImages.length > 0 ? realImages : [getSourcePlaceholder("phongtro123")];
          const fullSearchText = `${title} ${address}`;
          const district = extractDistrict(fullSearchText);
          const [lat, lng] = resolveNhaTrangCoords(fullSearchText, district);

          rooms.push({
            title,
            price,
            area,
            address: address || "Nha Trang, Khánh Hòa",
            district,
            images,
            sourceUrl,
            sourceSite: "phongtro123",
            contact: phone ? `Chủ trọ: ${phone}` : "Chính chủ Phongtro123",
            description: desc,
            lat,
            lng,
            category: target.category,
          });
        } catch {
          // skip
        }
      });

      await new Promise((r) => setTimeout(r, 400));
    } catch {
      // Bỏ qua lỗi lẻ
    }
  }

  return rooms;
}

// ================= 3. NGUỒN MOGI (NHA TRANG) =================
export async function scrapeMogi(): Promise<RoomData[]> {
  const urls = [
    "https://mogi.vn/thanh-pho-nha-trang/thue-phong-tro",
    "https://mogi.vn/thanh-pho-nha-trang/thue-phong-tro?cp=2",
    "https://mogi.vn/thanh-pho-nha-trang/thue-nha-dat",
  ];
  const rooms: RoomData[] = [];

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml",
        },
        signal: AbortSignal.timeout(8000),
      });

      if (!res.ok) continue;
      const html = await res.text();
      const $ = cheerio.load(html);

      $(".prop-item, .item, .listing-item").each((_, el) => {
        try {
          const $el = $(el);
          const title = $el.find("h2, h3, .prop-title, .title").first().text().trim();
          const href = $el.find("a").first().attr("href") || "";
          const sourceUrl = href.startsWith("http") ? href : `https://mogi.vn${href}`;
          if (!title || !href) return;

          const priceText = $el.find(".price, .prop-price").first().text();
          const price = parsePrice(priceText);
          if (isFakeSaleOrLuxury(title, price)) return;

          const areaText = $el.find(".area, .prop-attr").first().text();
          const addressText = $el.find(".address, .prop-addr").first().text().trim();
          const imgSrc = $el.find("img").first().attr("src") || $el.find("img").first().attr("data-src") || "";

          const images = imgSrc && !imgSrc.includes("data:image") ? [imgSrc] : [getSourcePlaceholder("mogi")];
          const district = extractDistrict(addressText + " " + title);
          const [lat, lng] = resolveNhaTrangCoords(addressText + " " + title, district);

          rooms.push({
            title,
            price,
            area: parseArea(areaText),
            address: addressText || "Nha Trang, Khánh Hòa",
            district,
            images,
            sourceUrl,
            sourceSite: "mogi",
            contact: "Môi giới / Chủ trọ Mogi",
            lat,
            lng,
            category: "rent",
          });
        } catch {
          // skip
        }
      });

      await new Promise((r) => setTimeout(r, 400));
    } catch {
      // skip
    }
  }

  return rooms;
}

// ================= 4. NGUỒN MUA BÁN NHÀ ĐẤT NHA TRANG (MÃ CHUẨN: region_v2=7044, area_v2=704401) =================
export async function scrapeNhaTotSales(): Promise<RoomData[]> {
  const rooms: RoomData[] = [];
  try {
    const urls = [
      "https://gateway.chotot.com/v1/public/ad-listing?region_v2=7044&area_v2=704401&cg=1000&st=s&limit=40&sort=date_created_ad",
      "https://gateway.chotot.com/v1/public/ad-listing?region_v2=7044&area_v2=704401&cg=1040&st=s&limit=30&sort=date_created_ad",
    ];

    for (const url of urls) {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0 Safari/537.36",
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(8000),
      });

      if (!res.ok) continue;
      const data = (await res.json()) as {
        ads?: Array<{
          subject?: string;
          price?: number;
          size?: number;
          area_name?: string;
          region_name?: string;
          ward_name?: string;
          street_name?: string;
          list_id?: number;
          image?: string;
          images?: string[];
          contact_name?: string;
          phone?: string;
          body?: string;
          latitude?: number;
          longitude?: number;
        }>;
      };

      for (const ad of data.ads || []) {
        const title = ad.subject || "";
        if (!title) continue;

        const ward = ad.ward_name || "";
        const area = ad.area_name || "Nha Trang";
        const street = ad.street_name || "";
        const fullAddress = [street, ward, area, ad.region_name].filter(Boolean).join(", ");
        const district = ward ? ward.replace(/Phường\s*/i, "").trim() : extractDistrict(title + " " + fullAddress);

        let lat = ad.latitude;
        let lng = ad.longitude;
        if (!lat || !lng || lat < 12.0 || lat > 12.5 || lng < 109.0 || lng > 109.4) {
          const resolved = resolveNhaTrangCoords(title + " " + fullAddress, district);
          lat = resolved[0];
          lng = resolved[1];
        }

        const adImages: string[] = [];
        if (Array.isArray(ad.images) && ad.images.length > 0) {
          ad.images.forEach((img) => {
            if (img && typeof img === "string" && !img.includes("unsplash.com")) {
              const fullUrl = img.startsWith("http") ? img : `https://cdn.chotot.com/${img}`;
              adImages.push(fullUrl);
            }
          });
        } else if (ad.image && !ad.image.includes("unsplash.com")) {
          const fullUrl = ad.image.startsWith("http") ? ad.image : `https://cdn.chotot.com/${ad.image}`;
          adImages.push(fullUrl);
        }

        const finalImages = adImages.length > 0 ? adImages : [getSourcePlaceholder("nhatot")];

        rooms.push({
          title,
          price: ad.price,
          area: ad.size,
          address: fullAddress || `${district}, TP. Nha Trang`,
          district: district || "Nha Trang",
          images: finalImages,
          sourceUrl: `https://www.nhatot.com/mua-ban-bat-dong-san-thanh-pho-nha-trang-khanh-hoa/${ad.list_id}.htm`,
          sourceSite: "nhatot",
          contact: ad.contact_name || ad.phone || "Chính chủ bán nhà Nha Trang",
          description: ad.body,
          lat,
          lng,
          category: "sale",
        });
      }

      await new Promise((r) => setTimeout(r, 400));
    }
  } catch (err) {
    console.error("Lỗi scrapeNhaTotSales:", err);
  }
  return rooms;
}

// Quét đồng bộ tất cả các nguồn phòng trọ thuê
export async function scrapeAllSources(): Promise<RoomData[]> {
  const [nhatot, phongtro123, mogi] = await Promise.allSettled([
    scrapeNhaTot(),
    scrapePhoTro123(),
    scrapeMogi(),
  ]);

  const all: RoomData[] = [
    ...(nhatot.status === "fulfilled" ? nhatot.value : []),
    ...(phongtro123.status === "fulfilled" ? phongtro123.value : []),
    ...(mogi.status === "fulfilled" ? mogi.value : []),
  ];

  return all;
}
