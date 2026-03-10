import { createClient } from "redis";


const client = createClient();

client.on("error", (err) => console.log("Redis Client Error", err));


class Database {
    private static instance :Database;
    private connection :typeof Object|null = null;
    private constructor(){}

    public static getInstance():Database{
        if(!Database.instance){
            Database.instance = new Database();
        }
        return Database.instance;
    }
}