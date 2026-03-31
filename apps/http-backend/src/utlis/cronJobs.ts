import cron from "node-cron";
import { cronJobToFetchDailyCandleData } from "../modules/assets/service.js";
import { getSessionToken } from "./authToken.js";

const cronJobs = {
  start:()=>{
    // "0 17 * * *" means 5pm every day
    // "*/2 * * * * *" means every 2 seconds
    cron.schedule("29 23 * * *",async()=>{
    // cron.schedule("*/2 * * * * *",async()=>{
      console.log("Running cron job");
      await cronJobToFetchDailyCandleData();
    })

    cron.schedule("0 0 * * *",async()=>{
      console.log("Running cron job");
      await getSessionToken();
    })
  }
}

export default cronJobs;