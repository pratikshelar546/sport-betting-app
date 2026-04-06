import prismaClient from "@repo/database/client";
import { calculateSMA } from "../calculator/sma.calculator.js";
import { ICandleData } from "../types.js";

async function getDailyCandles(token: string, days: number) {
    // This query groups 1-min data into 1-day buckets
    return await prismaClient.$queryRaw`
      SELECT 
        DATE(timestamp) as day,
        (ARRAY_AGG(close ORDER BY timestamp ASC))[1] as open,
        (ARRAY_AGG(close ORDER BY timestamp DESC))[1] as close,
        MAX(high) as high,
        MIN(low) as low,
        SUM(volume) as volume
      FROM stock_candle_data
      WHERE symboltoken = ${token}
      GROUP BY day
      ORDER BY day DESC
      LIMIT ${days};
    `;
  }

export const getSignalBySMA20 = async (token:string) =>{
    try {
        const stocksList = await getDailyCandles(token,21) as ICandleData[]
        
        if (!stocksList || stocksList?.length === 0) throw new Error("No stock candle data found");
        console.log(stocksList?.length,"Stockssss");
        
        const todaysCandle = stocksList[0]
        if(!todaysCandle) throw new Error("There is no todays candle")

            console.log(todaysCandle,"todays candle");
            
        const prices = stocksList.slice(0, 20).map(c => c.close);
        const sma20 = calculateSMA(prices);
        const previousCandle = stocksList[1];
        console.log(sma20,"sma 2000000");
        if(previousCandle && todaysCandle.close > sma20 && todaysCandle.close > previousCandle.high){
            console.log("BIYYYYYYYYYY");
            
        }else{
            console.log("ignoreeeeeeeeeeeeeeeee");
            
        }

        
        
        
    } catch (error) {
        throw error
    }
}