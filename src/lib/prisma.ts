import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

let prismaInstance: PrismaClient;

try {
  prismaInstance = globalForPrisma.prisma ?? new PrismaClient();
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prismaInstance;
  }
} catch (error) {
  console.error("=================================================================");
  console.error("🔥 CRITICAL ERROR: PRISMA FAILED TO INITIALIZE DURING BUILD 🔥");
  console.error("=================================================================");
  console.error("If you are seeing this on Vercel, your DATABASE_URL is malformed!");
  console.error("1. Make sure you have NO square brackets [ ] in the URL.");
  console.error("2. If your password has special characters (@, #, ?, /, etc), you MUST URL-encode them.");
  console.error("   For example, '@' becomes '%40', '#' becomes '%23'.");
  console.error("Here is the exact internal error that caused the crash:");
  console.error(error);
  console.error("=================================================================");
  throw error;
}

export const prisma = prismaInstance;
export default prisma;
