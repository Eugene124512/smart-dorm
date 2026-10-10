import "server-only";
import path from "node:path";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/app/generated/prisma/client";

function createPrismaClient() {
  const fromEnv = process.env.DATABASE_URL ?? "file:./dev.db";
  const url = fromEnv.startsWith("file:")
    ? `file:${path.join(process.cwd(), fromEnv.replace(/^file:(\.\/)?/, ""))}`
    : fromEnv;

  return new PrismaClient({
    adapter: new PrismaBetterSqlite3({ url }),
  });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
