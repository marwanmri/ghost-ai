import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { withAccelerate } from "@prisma/extension-accelerate";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is not set");
}

function createPrismaClient() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  if (
    url.startsWith("prisma+postgres://") ||
    url.startsWith("prisma+postgress://")
  ) {
    return new PrismaClient({
      accelerateUrl: url,
    }).$extends(withAccelerate());
  } else {
    const pool = new Pool({
      connectionString: url,
      allowExitOnIdle: true,
      idleTimeoutMillis: 1000,
    });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter }).$extends(withAccelerate());
  }
}

type ExtendedPrismaClient = ReturnType<typeof createPrismaClient>;

const globalForPrisma = globalThis as unknown as {
  prisma: ExtendedPrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
