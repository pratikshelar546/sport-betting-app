import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
dotenv.config();

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prismaClient = globalForPrisma.prisma ?? new PrismaClient({
  datasources:{
    db:{
      url:process.env.DATABASE_URL ||"postgresql://postgres:postgres@localhost:5432/postgres"
    }
  }
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prismaClient;
}

export default prismaClient;