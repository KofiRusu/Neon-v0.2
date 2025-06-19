import { PrismaClient } from '@prisma/client';

// Global variable to store the Prisma client instance
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create a singleton Prisma client
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query'],
});

// In development, attach the client to the global object to prevent multiple instances
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;