import dayjs from "dayjs";
import { fetchCandleData, getAssetDetails } from "../assets/service.js";
import { getCandleByStockAndDays } from "../market-data/maret-data.service.js";
import { calculateLevel, getSignalByRSI, getSignalBySMA20, getSignalByVolume, getSignalpriceAction } from "./signal.stratergies.js";
import { fetchAllWatchListedStocks } from "../watchlist/watchlist.service.js";
import { IsignalType, level } from "./signal.types.js";
import prismaClient from "@repo/database/client";


const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getSignal = async (token: string) :Promise<IsignalType > => {
  const stock = await getAssetDetails({
    token
  })
  if(!stock){
    throw new Error("Stock not found");
  }
  let candleList = await getCandleByStockAndDays(token, 28); // Try to fetch candles including today (if any)

  const todaysDate = dayjs().format("YYYY-MM-DD HH:mm");
  if(candleList[0]!.timestamp.toISOString() !== todaysDate){
    console.log("fetching recent candles");
    
    candleList = await fetchCandleData({
      exchange:"NSE",
      symboltoken:token,
      interval:"ONE_DAY",
      fromDate:dayjs(candleList[0]!.timestamp).subtract(28, 'days').format("YYYY-MM-DD HH:mm"),
      toDate:todaysDate
    })
    if(candleList.length === 0){
      throw new Error("No candles found");
    }
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

    console.log(`\n===== ${token} =====`);
  console.log(`RSI Value: ${RSIREsult.value}  | Score: ${RSIREsult.score}/3`);
  console.log(`SMA Value: ${sma20Result.value} | Score: ${sma20Result.score}/3`);
  console.log(`Volume Ratio: ${volumeResult.value} | Score: ${volumeResult.score}/3`);
  console.log(`Price Action: `, priceActionResult.breakdown, `| Score: ${priceActionResult.score}/3`);
  console.log(`Total Score: ${totalScore}/12`);
  console.log(`Signal: ${totalScore >= 9 ? 'STRONG BUY' : totalScore >= 7 ? 'BUY' : 'IGNORE'}`);

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

    const signals:IsignalType[] =[];
    for(const stock of uniqueStocks){
      console.log(stock.name,"this is stock");
      const signal = await getSignal(stock.token);
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

(async ()=>{
  await getDailySignalsForAllWatchListedStocks();
})