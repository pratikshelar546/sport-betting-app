import dayjs from "dayjs";
import { fetchCandleData } from "../assets/service.js";
import { getSignal } from "../signals/signal.services.js";
import { IsignalType } from "../signals/signal.types.js";


export const backtestStrategy = async (date:string,token:string) =>{
try {
    const toDate = dayjs(date).format("YYYY-MM-DD HH:mm");
    const fromDate = dayjs(toDate).subtract(28,'days').format("YYYY-MM-DD HH:mm");

   const signal = await getSignal(token,toDate);

   if(signal.signal === "STRONG_BUY" || signal.signal === "BUY"){
    console.log("signal",signal,"date",toDate);
    
    console.log("------------BUY SIGNAL FOUND------------");
const data = await checkWhenTargetHit(signal,toDate,token)

    console.log(data ,"dataaaaret");
    return
   }else{
       console.log("############### IGNORE SIGNAL FOUND ###################");
      await new Promise(resolve => setTimeout(resolve, 300))
      const newToDate = dayjs(toDate).subtract(1,'day').format("YYYY-MM-DD HH:mm");
    await backtestStrategy(newToDate,token)
   }


} catch (error) {
    console.log("error while back testing",error);
    
    throw error
}
}

const checkWhenTargetHit = async (
    signal: IsignalType,
    signalReceivedDate: string,
    token: string
  ) => {
    try {
      const { level } = signal;
  
      const toDate = dayjs(signalReceivedDate).add(30, 'days').format("YYYY-MM-DD HH:mm");
  
      const candleData = await fetchCandleData({
        exchange: "NSE",
        symboltoken: token,
        interval: "ONE_DAY",
        fromDate: dayjs(signalReceivedDate).format("YYYY-MM-DD HH:mm"),
        toDate: toDate
      });
  
      if (candleData.length === 0) throw new Error("No candle data found");
  
      console.log(candleData[0].timestamp, "this is starting timestamp");
      console.log(candleData[candleData.length - 1].timestamp, "this is ending timestamp");
  
      let entryMade: { date: string | null, price: number } = { date: null, price: 0 };
      let stopLossHit: { date: string | null, price: number } = { date: null, price: 0 };
      let targetHit: { date: string | null, price: number } = { date: null, price: 0 };
      let status = "OPEN";
      let realisedProfit = 0;
      console.log("Entry price needed:", level.entry);
      console.log("First candle:", candleData[0]);
      console.log("All candle highs:", candleData.map(c => c.high));
      for (const candle of candleData) {
  
        // 1. Check entry — high must cross entry price
        if (entryMade.date === null && candle.high >= level.entry) {
          entryMade = { date: candle.timestamp, price: level.entry };
          continue;
        }
  
        // 2. Only check target/stoploss after entry is made
        if (entryMade.date !== null) {
  
          // Both hit same day — stoploss wins (conservative)
          if (candle.high >= level.target && candle.low <= level.stopLoss) {
            stopLossHit = { date: candle.timestamp, price: level.stopLoss };
            status = "LOSS";
            realisedProfit = level.stopLoss - entryMade.price;
            break;
          }
  
          // Target hit
          if (candle.high >= level.target) {
            targetHit = { date: candle.timestamp, price: level.target };
            status = "WIN";
            realisedProfit = level.target - entryMade.price;
            break;
          }
  
          // StopLoss hit
          if (candle.low <= level.stopLoss) {
            stopLossHit = { date: candle.timestamp, price: level.stopLoss };
            status = "LOSS";
            realisedProfit = level.stopLoss - entryMade.price;
            break;
          }
        }
      }
  
      console.log("backtest done");
      console.log("entry made on", entryMade);
      console.log("target hit on", targetHit);
      console.log("stop loss hit on", stopLossHit);
  
      return {
        realisedProfit,
        status,
        entryOn: entryMade.date,
        targetHit: targetHit.date,
        stopLossHit: stopLossHit.date
      };
  
    } catch (error) {
      console.log("error while checking when target hit", error);
      throw error;
    }
  };