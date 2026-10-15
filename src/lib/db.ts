import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/** Prisma client singleton (pg driver adapter, no native engine). Reused across hot reloads. */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  // Neon URLs use sslmode=require; pg treats it as verify-full anyway — say so explicitly to silence its warning
  const url = (process.env.DATABASE_URL ?? "").replace(/sslmode=(prefer|require|verify-ca)\b/, "sslmode=verify-full");
  const adapter = new PrismaPg({ connectionString: url });
  return new PrismaClient({ adapter, log: ["warn", "error"] });
}

export const db: PrismaClient = globalForPrisma.prisma ?? createClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
