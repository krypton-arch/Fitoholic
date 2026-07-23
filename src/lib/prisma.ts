import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { _prisma?: PrismaClient };

// Lazy initialize PrismaClient to prevent build-time crashes if DATABASE_URL is malformed or missing
export const prisma = new Proxy({} as PrismaClient, {
  get: (target, prop) => {
    if (!globalForPrisma._prisma) {
      globalForPrisma._prisma = new PrismaClient();
    }
    return (globalForPrisma._prisma as any)[prop];
  }
});

if (process.env.NODE_ENV !== 'production') {
  // We can't assign a proxy to the global _prisma directly if we want to reuse the instance, 
  // but we can just leave it as is since the proxy handles the singleton logic.
}

export default prisma;
