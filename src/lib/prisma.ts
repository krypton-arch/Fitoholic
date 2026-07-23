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
  console.error(error);
  throw error;
}

export const prisma = prismaInstance;
export default prisma;
