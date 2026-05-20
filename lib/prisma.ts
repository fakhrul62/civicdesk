import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  _prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("Missing DATABASE_URL environment variable.");
  }

  const adapter = new PrismaPg({ connectionString });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    if (prop === "$on") return undefined; // required for some Next.js edge cases
    if (!globalForPrisma._prisma) {
      globalForPrisma._prisma = createPrismaClient();
    }
    const val = Reflect.get(
      globalForPrisma._prisma,
      prop,
      globalForPrisma._prisma
    );
    return typeof val === "function" ? val.bind(globalForPrisma._prisma) : val;
  }
});

if (process.env.NODE_ENV !== "production") globalForPrisma._prisma = globalForPrisma._prisma;
