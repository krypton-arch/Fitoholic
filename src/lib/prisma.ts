import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

let prismaInstance: PrismaClient;

try {
  if (globalForPrisma.prisma) {
    prismaInstance = globalForPrisma.prisma;
  } else {
    // Determine connection string safely
    const connectionString = process.env.DATABASE_URL || "";
    
    // In serverless environments, pg Pool requires explicit configuration for SSL 
    // when connecting to Supabase connection poolers, otherwise it fails.
    const pool = new Pool({
      connectionString,
      // Suppress SSL errors for local development but require it for production
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
    });
    const adapter = new PrismaPg(pool);
    prismaInstance = new PrismaClient({ adapter });
  }

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
