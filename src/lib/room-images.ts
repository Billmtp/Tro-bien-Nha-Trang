const SITE_FALLBACK_IMAGES: Record<string, string> = {
  facebook: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
  google_maps: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80",
  batdongsan: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
  alonhadat: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
  homedy: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
  nhatot: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
  chotot: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
  phongtro123: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
  default: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
};

export function getSourcePlaceholder(sourceSite?: string | null): string {
  if (sourceSite && sourceSite.startsWith("facebook")) {
    return SITE_FALLBACK_IMAGES.facebook;
  }
  return (sourceSite && SITE_FALLBACK_IMAGES[sourceSite]) || SITE_FALLBACK_IMAGES.default;
}

export function filterRealImages(images?: string[] | null, sourceSite?: string | null): string[] {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return [getSourcePlaceholder(sourceSite)];
  }

  const validImages = images.filter((url) => {
    if (!url || typeof url !== "string") return false;
    const trimmed = url.trim();
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) return false;
    if (trimmed.toLowerCase().endsWith(".svg") || trimmed.includes(".svg?")) return false;
    if (trimmed.startsWith("data:image")) return false;
    return true;
  });

  if (validImages.length === 0) {
    return [getSourcePlaceholder(sourceSite)];
  }

  return validImages;
}
