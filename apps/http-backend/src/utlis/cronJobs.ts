import cron from "node-cron";
import { cronJobToFetchDailyCandleData } from "../modules/assets/service.js";
import { getSessionToken } from "./authToken.js";
import { fetchAllWhatchkistedAndGetSignal, getSignal } from "../modules/engine/services/signalLogic.services.js";

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

    cron.schedule("13 0 * * *", async () => {
      // cron.schedule("*/2 * * * * *",async()=>{
      console.log("Running cron job");
      const stocks = await fetchAllWhatchkistedAndGetSignal();
      console.log("stocks count", stocks.length);

      const signals: any = [];
      for (const stock of stocks) {
        const signal = await getSignal(stock.token);
        signals.push({ ...signal });
      }
      console.log(signals,"signals");
      
    })
  }
}

export default cronJobs;