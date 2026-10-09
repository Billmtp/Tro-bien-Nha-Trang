import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: any;
};

// Hàm retry tự động với backoff khi Neon serverless database đang thức dậy (Cold Start)
async function executeWithRetry<T>(fn: () => Promise<T>, maxRetries = 3, delayMs = 1200): Promise<T> {
  let lastError: any;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      const isConnectionError =
        err?.code === "P1001" ||
        err?.code === "P1002" ||
        err?.code === "P2024" ||
        err?.message?.includes("Can't reach database server") ||
        err?.message?.includes("connection pool") ||
        err?.message?.includes("ConnectionReset") ||
        err?.message?.includes("forcibly closed") ||
        err?.message?.includes("closed by the remote host");

      if (isConnectionError && attempt < maxRetries) {
        console.warn(`[Neon DB Cold Start] Lần thử ${attempt}/${maxRetries} thất bại (Đang chờ Neon thức dậy: ${delayMs * attempt}ms)...`);
        await new Promise((res) => setTimeout(res, delayMs * attempt));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

function createPrismaClient() {
  const base = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

  return base.$extends({
    query: {
      $allModels: {
        async $allOperations({ args, query }) {
          return executeWithRetry(() => query(args), 3, 1000);
        },
      },
    },
  });
}

export const prisma = (globalForPrisma.prisma ?? createPrismaClient()) as ReturnType<typeof createPrismaClient>;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
