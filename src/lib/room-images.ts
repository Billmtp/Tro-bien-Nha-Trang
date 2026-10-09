export function getSourcePlaceholder(sourceSite?: string | null): string {
  if (sourceSite && sourceSite.startsWith("facebook")) {
    return "/placeholders/facebook-card.svg";
  }
  switch (sourceSite) {
    case "batdongsan":
      return "/placeholders/batdongsan-card.svg";
    case "alonhadat":
      return "/placeholders/alonhadat-card.svg";
    case "homedy":
      return "/placeholders/homedy-card.svg";
    case "google_maps":
      return "/placeholders/google-maps-card.svg";
    case "nhatot":
    case "chotot":
      return "/placeholders/chotot-card.svg";
    case "phongtro123":
      return "/placeholders/phongtro123-card.svg";
    default:
      return "/placeholders/default-room.svg";
  }
}

export function filterRealImages(images?: string[] | null, sourceSite?: string | null): string[] {
  if (!images || !Array.isArray(images)) {
    return [getSourcePlaceholder(sourceSite)];
  }

  // Loại bỏ hoàn toàn các ảnh stock giả (unsplash, pexels, data:image rỗng)
  const realImages = images.filter((url) => {
    if (!url || typeof url !== "string") return false;
    const lower = url.toLowerCase();
    if (lower.includes("unsplash.com")) return false;
    if (lower.includes("pexels.com")) return false;
    if (lower.includes("pixabay.com")) return false;
    if (lower.startsWith("data:image")) return false;
    return true;
  });

  if (realImages.length === 0) {
    return [getSourcePlaceholder(sourceSite)];
  }

  return realImages;
}
