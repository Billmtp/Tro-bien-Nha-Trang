import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { invalidateRoomCache } from "@/lib/cache";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "24");
  const district = searchParams.get("district") || "";
  const minPrice = parseInt(searchParams.get("minPrice") || "0");
  const maxPrice = parseInt(searchParams.get("maxPrice") || "99999999999");
  const minArea = parseInt(searchParams.get("minArea") || "0");
  const site = searchParams.get("site") || "";
  const q = searchParams.get("q") || "";
  const sort = searchParams.get("sort") || "newest";

  let orderBy: any = { scrapedAt: "desc" };
  if (sort === "price_asc") orderBy = { price: "asc" };
  if (sort === "price_desc") orderBy = { price: "desc" };

  const where: any = {
    isActive: true,
    status: "approved",
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
    price: { gte: minPrice || undefined, lte: maxPrice < 99999999999 ? maxPrice : undefined },
    ...(minArea > 0 && { area: { gte: minArea } }),
  };

  const [rooms, total] = await Promise.all([
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
        description: true,
        isVip: true,
        scrapedAt: true,
      },
    }),
    prisma.room.count({ where }),
  ]);

  return NextResponse.json(
    {
      rooms,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    }
  );
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        {
          error: "Vui lòng đăng nhập tài khoản để đăng tin phòng trọ.",
          requireLogin: true,
        },
        { status: 401 }
      );
    }

    if ((user as any).isBanned) {
      return NextResponse.json(
        { error: "Tài khoản của bạn đã bị khóa tính năng đăng tin do vi phạm quy tắc cộng đồng." },
        { status: 403 }
      );
    }

    // CHỈ TÀI KHOẢN ĐÃ XÁC THỰC SĐT HOẶC GMAIL MỚI ĐƯỢC ĐĂNG TIN
    const isEligible =
      (user as any).role === "admin" ||
      Boolean((user as any).isVerified || (user as any).isEmailVerified);

    if (!isEligible) {
      return NextResponse.json(
        {
          error: "Chỉ những tài khoản đã xác thực Số điện thoại hoặc Gmail mới đủ tư cách đăng tin.",
          requireVerification: true,
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, price, area, address, district, description, images, contact, category } = body;

    if (!title || !price) {
      return NextResponse.json({ error: "Tiêu đề và giá phòng là bắt buộc" }, { status: 400 });
    }

    const uniqueId = Date.now();
    const finalCategory = category === "sale" ? "sale" : category === "roommate" ? "roommate" : "rent";
    // User postings are set to 'pending' by default and require admin approval!
    const status = (user as any)?.role === "admin" ? "approved" : "pending";

    const room = await prisma.room.create({
      data: {
        title: title.trim(),
        price: parseInt(price) || 0,
        area: parseFloat(area) || 0,
        address: address?.trim() || "",
        district: district?.trim() || "Nha Trang",
        description: description?.trim() || "",
        images: Array.isArray(images) && images.length > 0 ? images : ["/placeholders/default-room.svg"],
        sourceUrl: `https://chotot-nhatrang.local/tin-dang/${uniqueId}`,
        sourceSite: "nguoidang",
        contact: contact?.trim() || user?.name || "Chủ phòng trọ",
        category: finalCategory,
        status,
        userId: user?.id || null,
      },
    });

    invalidateRoomCache(room.id);

    return NextResponse.json({
      success: true,
      room,
      status,
      message:
        status === "pending"
          ? "Tin đăng của bạn đã được gửi thành công và đang chờ Ban Quản Trị kiểm duyệt trước khi hiển thị công khai."
          : "Tin đăng đã được duyệt và hiển thị thành công.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Lỗi khi đăng tin" }, { status: 500 });
  }
}

