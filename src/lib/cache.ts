// In-Memory Fast Cache Layer with TTL for Trọ Biển Nha Trang
// Giảm tối đa round-trip tới Neon PostgreSQL, phản hồi < 1ms

type CacheEntry<T> = {
  data: T;
  expiresAt: number;
};

class MemoryCache {
  private store = new Map<string, CacheEntry<any>>();

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.data as T;
  }

  set<T>(key: string, data: T, ttlSeconds: number = 180): void {
    this.store.set(key, {
      data,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clearPrefix(prefix: string): void {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
      }
    }
  }

  // Tiện ích lấy hoặc fetch nếu cache miss kèm cơ chế bảo vệ Stale-On-Error
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds: number = 180,
    fallbackValue?: T
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }
    try {
      const freshData = await fetcher();
      if (freshData !== null && freshData !== undefined) {
        this.set(key, freshData, ttlSeconds);
      }
      return freshData;
    } catch (err) {
      // Nếu database tạm ngắt kết nối / cold start, dùng lại dữ liệu gần nhất trong RAM
      const stale = this.store.get(key);
      if (stale && stale.data !== undefined) {
        console.warn(`[Cache Fallback] Sử dụng dữ liệu cache cũ cho "${key}" do DB đang khởi động.`);
        return stale.data as T;
      }
      if (fallbackValue !== undefined) {
        console.warn(`[Cache Fallback] Sử dụng fallback mặc định cho "${key}".`);
        return fallbackValue;
      }
      throw err;
    }
  }
}

// Global singleton để tồn tại xuyên suốt các request trong Node.js process
const globalCache = globalThis as unknown as {
  __trobien_cache?: MemoryCache;
};

export const memoryCache = globalCache.__trobien_cache ?? new MemoryCache();
if (process.env.NODE_ENV !== "production") {
  globalCache.__trobien_cache = memoryCache;
}

// Xóa cache khi có phòng mới đăng hoặc cập nhật
export function invalidateRoomCache(roomId?: number) {
  if (roomId) {
    memoryCache.delete(`room:${roomId}`);
    memoryCache.delete(`similar:${roomId}`);
  }
  memoryCache.clearPrefix("map:");
  memoryCache.clearPrefix("stats:");
  memoryCache.clearPrefix("home:");
  memoryCache.clearPrefix("list:");
}
