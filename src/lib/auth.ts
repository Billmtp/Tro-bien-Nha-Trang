import crypto from "crypto";
import { cookies } from "next/headers";
import { prisma } from "./db";

const SECRET = process.env.AUTH_SECRET || "chotot-nhatrang-secret-key-2026";
const COOKIE_NAME = "chotot_token";

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, originalHash] = storedHash.split(":");
  if (!salt || !originalHash) return false;
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return hash === originalHash;
}

export function createToken(payload: { id: number; phone: string; name: string }): string {
  const data = JSON.stringify(payload);
  const signature = crypto.createHmac("sha256", SECRET).update(data).digest("hex");
  return Buffer.from(JSON.stringify({ data, signature })).toString("base64");
}

export function verifyToken(token: string): { id: number; phone: string; name: string } | null {
  try {
    const raw = Buffer.from(token, "base64").toString("utf-8");
    const { data, signature } = JSON.parse(raw);
    const expectedSig = crypto.createHmac("sha256", SECRET).update(data).digest("hex");
    if (signature !== expectedSig) return null;
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.id },
    select: {
      id: true,
      name: true,
      phone: true,
      avatar: true,
      bio: true,
      role: true,
      isVerified: true,
      email: true,
      isEmailVerified: true,
      isBanned: true,
      createdAt: true,
    },
  });
  return user;
}

export function isUserEligibleToPost(user: any): boolean {
  if (!user) return false;
  if (user.role === "admin") return true;
  return Boolean(user.isVerified || user.isEmailVerified);
}

export { COOKIE_NAME };
