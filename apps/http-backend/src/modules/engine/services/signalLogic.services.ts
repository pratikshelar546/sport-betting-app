import prismaClient from "@repo/database/client";
import { averageVolume, calculateSMA } from "../calculator/calculator.js";
import { ICandleData } from "../types.js";
import { IRSIresult, ISMAresult, IVolumeresult } from "./types.js";
import dayjs from "dayjs";
import { fetchCandleData } from "../../assets/service.js";

async function getCandleByStockAndDays(
  token: string,
  days: number,
): Promise<ICandleData[]> {
  // This query groups 1-min data into 1-day buckets
  return await prismaClient.stock_candle_data.findMany({
    where: {
      symboltoken: token,
    },
    orderBy: {
      timestamp: "desc",
    },
    take: days,
  });
}

export const getSignalBySMA20 = (stocksList: ICandleData[]): ISMAresult => {
  try {
    // const  = await getCandleByStockAndDays(token, 21);

    if (!stocksList || stocksList?.length === 0)
      throw new Error("No stock candle data found");

    const todaysCandle = stocksList[0];
    if (!todaysCandle) throw new Error("There is no todays candle");

    const prices = stocksList.slice(0, 20).map((c) => c.close);
    const sma20 = parseFloat(calculateSMA(prices).toFixed(2));
    const percentAboveSMA = ((todaysCandle.close - sma20) / sma20) * 100;
    const avgVolume = averageVolume(
      stocksList.slice(1, 11).map((c) => c.volume),
    );
    const volumeRatio = todaysCandle.volume / avgVolume;
    const previousCandle = stocksList[1]!;
    const isAbovePreviousHigh = todaysCandle.close > previousCandle!.high;

    let score = 0;

    if (todaysCandle.close > sma20) {
      if (percentAboveSMA <= 2 && isAbovePreviousHigh && volumeRatio >= 1.5) {
        score = 3;
      } else if (percentAboveSMA <= 3 && volumeRatio >= 1.2) {
        score = 2;
      } else if (percentAboveSMA <= 5) {
        score = 1;
      }
    }

    return { value: sma20, score };
  } catch (error) {
    console.log("***error while getting signal from SMA***=>", error);
    throw error;
  }
};

/**
 * Calculates the 20-period Simple Moving Average (SMA) signal for stocks.
 *
 * @param {ICandleData[]} stocksList  - Array of candle data objects sorted from latest to oldest. Must contain at least 28 candles to be valid: the first for today's candle, 20 for SMA calculation.
 * @returns {ISMAresult} An object containing the calculated SMA value and a score based on conditions.
 */

export const getSignalByRSI = (
  candleList: ICandleData[],
  period: number = 14,
): IRSIresult => {
  try {
    if (!candleList || candleList.length === 0)
      throw new Error("No candle data found");
    let totalGain = 0;
    let totalLoss = 0;
    const sortedCandles = candleList.slice().reverse();

    for (let i = 1; i <= period; i++) {
      const currentCandle = sortedCandles[i]!;
      const previousCandle = sortedCandles[i - 1]!;
      const change = currentCandle.close - previousCandle.close;

      if (change > 0) totalGain += change;
      else totalLoss += Math.abs(change);
    }

    let averageGain = totalGain / period;
    let averageLoss = totalLoss / period;

    for (let i = period + 1; i < sortedCandles.length; i++) {
      const change = sortedCandles[i]!.close - sortedCandles[i - 1]!.close;
      const gain = change > 0 ? change : 0;
      const loss = change < 0 ? Math.abs(change) : 0;

      averageGain = (averageGain * (period - 1) + gain) / period;
      averageLoss = (averageLoss * (period - 1) + loss) / period;
    }

    if (averageLoss === 0) return { value: 100, score: 0 };
    const rs = averageGain / averageLoss;
    const rsi = 100 - 100 / (1 + rs);
    let score = 0;
    if (rsi >= 50 && rsi <= 60)
      score = 3; // ideal
    else if (rsi >= 60 && rsi <= 65)
      score = 2; // momentum building, still ok
    else if (rsi >= 45 && rsi < 50)
      score = 2; // building up
    else if (rsi >= 40 && rsi < 45) score = 1;
    return { value: rsi, score: score }; // 30-40 or 60-70 — wait and watch
  } catch (error) {
    console.log("***error while getting signal from RSI***=>", error);
    throw error;
  }
};

/**
 * Calculates the Relative Strength Index (RSI) signal for a list of candles.
 *
 * @param {ICandleData[]} stocksList - Array of candle data objects, sorted from latest to oldest. Should contain at least 20 elements.
 * @returns {IVolumeresult} An object containing the calculated volume ratio value and a score based on volume ratio thresholds.
 */

export const getSignalByVolume = (stocksList: ICandleData[]): IVolumeresult => {
  try {
    if (!stocksList || stocksList.length === 0)
      throw new Error("No candle data found");
    const todaysCandle = stocksList[0]!;
    const volume = stocksList.slice(1, 11).map((c) => c.volume);
    const volumeRatio = todaysCandle.volume / averageVolume(volume);

    let score = 0;

    if (volumeRatio >= 2.5) score = 3;
    else if (volumeRatio >= 1.5) score = 2;
    else if (volumeRatio >= 1.2) score = 1;

    return { value: volumeRatio, score: score };
  } catch (error) {
    console.log("***error while getting signal from volume***=>", error);
    throw error;
  }
};

export const getSignalpriceAction = (candleList: ICandleData[]) => {
  try {
    if (!candleList || candleList.length < 6)
      throw new Error("Need at least 6 candles to get price action");
    const todaysCandle = candleList[0]!;
    const previousFiveCandle = candleList.slice(1, 6);
    const fiveDayHigh = Math.max(...previousFiveCandle.map((c) => c.high));
    const breakOut = todaysCandle.close > fiveDayHigh;

    const totalRange = todaysCandle.high - todaysCandle.low;
    const closePostion =
      totalRange === 0
        ? 0
        : ((todaysCandle.close - todaysCandle.low) / totalRange) * 100;

    const bulishCandle = closePostion >= 60;

    const upperWick = todaysCandle.high - todaysCandle.close;
    const upperWickRange = todaysCandle.high - todaysCandle.close;
    const upperWickPercent =
      totalRange === 0 ? 0 : (upperWick / totalRange) * 100;

    const noRejection = upperWickPercent <= 25;

    let score = 0;
    if (breakOut) score++;
    if (bulishCandle) score++;
    if (noRejection) score++;

    return {
      score,
      breakdown: {
        breakOut,
        bulishCandle,
        noRejection,
      },
    };
  } catch (error) {
    console.log(error, "error while getting price action");
    return {
      score: 0,
      breakdown: { breakout: false, bullishCandle: false, noRejection: false },
    };
  }
};



const calculateLevel = (candle: ICandleData,rrRatio:number =2) =>{
  const entry = parseFloat((candle.high *1.002).toFixed(2));
  const stopLoss = parseFloat((candle.low * 1.002).toFixed(2));
  const risk = parseFloat((entry -stopLoss).toFixed(2));
  const target = parseFloat((entry + risk *rrRatio).toFixed(2));

  return {
    entry,
    stopLoss,
    risk,
    target
  }
}

export const getSignal = async (token: string) => {
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
    const level = calculateLevel(todaysCandle);
  
    const breakDown = {
      RSIREsult,
      sma20Result,
      volumeResult,
      priceActionResult
    }
    if(totalScore >=9){
      return {
        signal:"STRONG_BUY",
        totalScore,
        ...level,
        breakDown
      }
    }
    if(totalScore >= 7){
      return {
        signal:"BUY",
        totalScore,
        ...level,
        breakDown
      }
    }

    return {
      signal:"IGNORE",
      totalScore,
      ...level,
      breakDown
    }
};


export const fetchAllWhatchkistedAndGetSignal = async () =>{
  try {
    const allWhatchlisted = await prismaClient.stocks.findMany({
      where:{
        watchList:{
          some:{
            isDeleted:false
          }
        }
      }
    });

   return allWhatchlisted
    
  } catch (error) {
    console.log("error",error);
    throw error
    
  }
}
(async () => {
  try {
    // const signal = await getSignal("3787");
    // console.log("signal", signal);
    fetchAllWhatchkistedAndGetSignal()
  } catch (error) {
    console.error("Error getting signal:", error);
  }
})();