import { PrismaClient } from "./generated/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// FORCE REFRESH: In development, we must clear the global instance 
// to ensure the latest generated client (lib/generated/client) is used.
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = undefined;
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
