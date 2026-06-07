import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { withAccelerate } from "@prisma/extension-accelerate";

const databaseUrl = process.env.DATABASE_URL || "";

function createPrismaClient() {
  if (
    databaseUrl.startsWith("prisma+postgres://") ||
    databaseUrl.startsWith("prisma+postgress://")
  ) {
    return new PrismaClient({
      accelerateUrl: databaseUrl,
    }).$extends(withAccelerate());
  } else {
    const pool = new Pool({ connectionString: databaseUrl });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
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
