import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    // Lấy toàn bộ các files được gửi lên
    const files: File[] = [];
    for (const [, value] of formData.entries()) {
      if (value && typeof value === "object" && "name" in value && "arrayBuffer" in value) {
        const file = value as File;
        if (file.size > 0) {
          files.push(file);
        }
      }
    }

    if (files.length === 0) {
      return NextResponse.json(
        { error: "Vui lòng chọn ít nhất một hình ảnh để tải lên." },
        { status: 400 }
      );
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const uploadedUrls: string[] = [];

    for (const file of files) {
      // Kiểm tra định dạng ảnh
      if (!file.type.startsWith("image/")) {
        continue;
      }

      // Giới hạn 15MB mỗi ảnh
      if (file.size > 15 * 1024 * 1024) {
        return NextResponse.json(
          { error: `Tệp ${file.name} vượt quá dung lượng tối đa cho phép (15MB).` },
          { status: 400 }
        );
      }

      const originalName = file.name || "photo.jpg";
      const ext = path.extname(originalName) || ".jpg";
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const safeFileName = `tro_${timestamp}_${randomStr}${ext}`;
      const filePath = path.join(uploadDir, safeFileName);

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      await writeFile(filePath, buffer);

      uploadedUrls.push(`/uploads/${safeFileName}`);
    }

    if (uploadedUrls.length === 0) {
      return NextResponse.json(
        { error: "Định dạng tệp không hợp lệ. Chỉ chấp nhận JPG, PNG, WEBP, GIF." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      urls: uploadedUrls,
      count: uploadedUrls.length,
    });
  } catch (error: any) {
    console.error("Lỗi khi tải ảnh lên:", error);
    return NextResponse.json(
      { error: error.message || "Lỗi hệ thống khi tải hình ảnh lên." },
      { status: 500 }
    );
  }
}
