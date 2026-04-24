import dayjs from "dayjs";
import { fetchCandleData, getAssetDetails } from "../assets/service.js";
import { getCandleByStockAndDays } from "../market-data/maret-data.service.js";
import { calculateLevel, getSignalByRSI, getSignalBySMA20, getSignalByVolume, getSignalpriceAction } from "./signal.stratergies.js";
import { fetchAllWatchListedStocks } from "../watchlist/watchlist.service.js";
import { IsignalType, level } from "./signal.types.js";
import prismaClient from "@repo/database/client";
import { backtestStrategy } from "../backtest/backtest.services.js";


const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getSignal = async (token: string,toDate:string) :Promise<IsignalType > => {
  const stock = await getAssetDetails({
    token
  })
  if(!stock){
    throw new Error("Stock not found");
  }

  const todaysDate = dayjs(toDate).format("YYYY-MM-DD HH:mm");
    console.log("fetching recent candles");
    
    let candleList = await fetchCandleData({
      exchange:"NSE",
      symboltoken:token,
      interval:"ONE_DAY",
      fromDate:dayjs(todaysDate).subtract(28, 'days').format("YYYY-MM-DD HH:mm"),
      toDate:todaysDate
    })
    if(candleList.length === 0){
      throw new Error("No candles found");
    }

  // const todaysCandle = candleList.find((candle: any) => (candle.date || candle.timestamp || candle.time || '').split('T')[0] === todaysDate);


  const sma20Result = getSignalBySMA20(candleList.slice(0, 20));
  const RSIREsult = getSignalByRSI(candleList.slice(0, 28));
  const volumeResult = getSignalByVolume(candleList.slice(0, 21));
  const priceActionResult = getSignalpriceAction(candleList.slice(0, 6));

  const totalScore =
    sma20Result.score +
    RSIREsult.score +
    volumeResult.score +
    priceActionResult.score;
  
    const todaysCandle = candleList[0]!;
    const level = calculateLevel(todaysCandle) as level;
  
    const breakDown = {
      RSIREsult,
      sma20Result,
      volumeResult,
      priceActionResult
    }

    if(totalScore >=9){
      return {
        stockId:stock.id,
        signal:"STRONG_BUY",
        totalScore,
        level,
        breakDown
      }
    }
    if(totalScore >= 7){
      return {
        stockId:stock.id,
        signal:"BUY",
        totalScore,
        level,
        breakDown
      }
    }

    return {
      stockId:stock.id,
      signal:"IGNORE",
      totalScore,
      level,
      breakDown
    }
};

export const createSignal = async (signals:IsignalType[]):Promise<number> => {
try {
  const data = await prismaClient.signals.createMany({
    data:signals.map((signal)=>({
      stockId:signal.stockId,
      signal:signal.signal,
      totalScore:signal.totalScore,
      level:JSON.stringify(signal.level),
      breakDown:JSON.stringify(signal.breakDown)
    }))
  })
  return data.count;
} catch (error) {
  throw error
}
}



export const getDailySignalsForAllWatchListedStocks = async () =>{
  try {
    const uniqueStocks = await fetchAllWatchListedStocks();
    const todaysDate = dayjs().format("YYYY-MM-DD HH:mm");
    const signals:IsignalType[] =[];
    for(const stock of uniqueStocks){
      console.log(stock.name,"this is stock");
      const signal = await getSignal(stock.token,todaysDate);
     signals.push(signal as IsignalType);
      await sleep(500);
    }

    if(signals.length>0){
      const signalAdded = await createSignal(signals);
      console.log("signalAdded",signalAdded);
      
      return {
        message: "Signals created successfully",
        data:signalAdded
      }
    }
    return null;


  } catch (error) {
    throw error
  }
}

// (async ()=>{
//   await getDailySignalsForAllWatchListedStocks();
// })

(async ()=>{
  const date = dayjs("2025-03-25").format("YYYY-MM-DD HH:mm");
  const token = "5097";
  await backtestStrategy(date,token);
})