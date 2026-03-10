import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
dotenv.config();


import { createClient,RedisClientType } from "redis";


// const client = createClient();



class Database {
    private static instance :Database;
    private redisConnection : RedisClientType|null = null;
    private prismaConnection :PrismaClient|null = null;
    private constructor(){}

    public static getInstance():Database{
      if(!Database.instance){
        Database.instance = new Database();
        }
        return Database.instance;
      }
      public async connectRedisClient():Promise<RedisClientType>{
        
        if(this.redisConnection){
          return this.redisConnection;
        }
        
        this.redisConnection = createClient({
          url:process.env.REDIS_URL || "redis://localhost:6379"
        });
        this.redisConnection.on("error", (err:any) => console.log("Redis Client Error", err));
        await this.redisConnection.connect();
        console.log("redis connected");
        
      return this.redisConnection;
    }

    public async disconnectRedisClient():Promise<void>{
      if(this.redisConnection){
        await this.redisConnection.disconnect();
        console.log("redis disconnected");
        this.redisConnection = null;
      }
    }

    public getPrismaClient(): PrismaClient {
      console.log("process.env.DATABASE_URL", process.env.DATABASE_URL);
      if (!this.prismaConnection) {
        this.prismaConnection = new PrismaClient({
          datasources: {
            db: {
              url:
                process.env.DATABASE_URL ||
                "postgresql://postgres:pratik@localhost:5432/betting_app",
            },
          },
        });
  
        console.log("✅ Prisma Client Initialized");
      }
  
      return this.prismaConnection;
    }
}

// const globalForPrisma = globalThis as unknown as {
//   prisma: PrismaClient | undefined;
// };

// const prismaClient = globalForPrisma.prisma ?? new PrismaClient({
//   datasources:{
//     db:{
//       url:process.env.DATABASE_URL ||"postgresql://postgres:postgres@localhost:5432/postgres"
//     }
//   }
// });

// if (process.env.NODE_ENV !== "production") {
//   globalForPrisma.prisma = prismaClient;
// }

const databaseInstance : Database = Database.getInstance();
 const prismaClient = databaseInstance.getPrismaClient();
 const redisClient =await databaseInstance.connectRedisClient();
export default prismaClient;
export { redisClient };