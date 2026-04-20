import prismaClient from "@repo/database/client";
import { Asset } from "./types.js";
import { AppError } from "../../utlis/AppError.js";
import axios from "axios";
import { getCandlesFromBroker } from "../broker/broker.service.js";
import { syncCandleToDb } from "./helper.js";
import { formatDate, parseToDate } from "../../utlis/dateFormatter.js";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone.js";
import utc from "dayjs/plugin/utc.js";
import fs from "fs";
import Bottleneck from "bottleneck";
dayjs.extend(utc);
dayjs.extend(timezone);

const limiter = new Bottleneck({
  minTime:400,
  maxConcurrent:1
})

export const addAsset = async ({
  userId,
  title,
  maxPrice,
  image,
}: Asset): Promise<Asset | any> => {
  try {
    const asset = await prismaClient.asset.create({
      data: {
        userId,
        title,
        maxPrice,
        ...(image && { image }),
      },
    });

    return asset;
  } catch (error) {

    throw error;
  }
};

export const getAssetDetails = async ({ symbol,token }: { symbol?: string | undefined,token?:string | undefined  }): Promise<any> => {
  try {
    const getAssetDetails = await prismaClient.stocks.findFirst({
      where: {
        ...(symbol ? { symbol } : token ? { token } : {}),
      }
    });
    return getAssetDetails;
  } catch (error) {
    throw error;
  }
};

export const fetchOrderBook = async ({ symbol }: { symbol: string }) => {
  try {
    const asset = await getAssetDetails({ symbol,token:symbol });
    if (!asset) {
      throw new AppError("Asset not found", 404);
    }
    
    const orders = await prismaClient.orderbook.findMany({
      where: { assetId: symbol ,executed:false
      },
      orderBy: [{ price: "desc" }, { createdAt: "desc" }],
    });

    // Fetch whole day candlestick data (market hours 09:00 to 15:30)
   
    return orders;
  } catch (error) {
    throw error;
  }
};



export const fetchCandleData = async ({
  exchange,
  symboltoken,
  interval="ONE_DAY",
  fromDate,
  toDate,
}: {
  exchange: string,
  symboltoken: string,
  interval: string,
  fromDate: string,
  toDate: string,
}): Promise<any> => {
  try {
    // 1. Load asset details
    const asset = await getAssetDetails({ symbol: undefined, token: symboltoken });
    if (!asset) {
      throw new AppError("Stock not found", 404);
    }

    // 2. Parse the date strings to Date objects
    const fromDateObj = dayjs.tz(fromDate, "Asia/Kolkata").toDate();
    const toDateObj = dayjs.tz(toDate, "Asia/Kolkata").toDate();
    // 3. Query for existing local candlestick data
    let candleData = await prismaClient.stock_candle_data.findMany({
      where: {
        exchange,
        symboltoken,
        timestamp: {
          gte: fromDateObj,
          lte: toDateObj,
        }
      },
      orderBy: { timestamp: "asc" }
    });

    // 4. Check if local data *fully* covers the requested window, i.e. 
    // - first candle should be at or before fromDateObj
    // - last candle should be at or after toDateObj
    // - and all days in between are present (can skip this check for now; typically gapless in db if range is covered)
    let needsBrokerFetch = false;
    const firstCandle = candleData[0];
    const lastCandle = candleData[candleData.length - 1];

    if (
      candleData.length === 0 ||
      // If first candle is after the requested fromDate, we have missing "start"
      (firstCandle !== undefined && firstCandle.timestamp > fromDateObj) ||
      // If last candle is before requested toDate, we have missing "end"
      (lastCandle !== undefined && lastCandle.timestamp < toDateObj)
    ){
      needsBrokerFetch = true;
    }

    let finalData = candleData;

    if (needsBrokerFetch) {
      // Always fetch the *FULL* requested window from broker if there's any edge missing
      const brokerCandles = await getCandlesFromBroker({
        exchange,
        symboltoken,
        interval,
        fromDate,
        toDate
      });

      // Only if we got data, transform and save to DB (idempotent insert)
      if (brokerCandles && brokerCandles.length > 0) {
        const dbCandles = brokerCandles.map((candle: any) => ({
          timestamp: dayjs(candle[0]).toDate(),
          open: candle[1],
          high: candle[2],
          low: candle[3],
          close: candle[4],
          volume: candle[5],
          exchange,
          symboltoken,
          stockId: asset.id,
          interval,
        }));

        // Save to DB (helper should handle dupes)
        syncCandleToDb(dbCandles);
        finalData = dbCandles;
      }
    }
    return finalData;
  } catch (error) {
    throw error;
  }
}

export const watchListStockService = async ({
  token,
  userId}:{
    token:string,
    userId:string,
  }):Promise<any>=>{
  try {
  const stock = await getAssetDetails({
    token:token as string
  });
  if(!stock) throw new AppError("Stock not found", 404);

  const findAlreadyWatching = await prismaClient.watchList.findFirst({
    where:{
      userId,
      stockId:stock.id,
    }
  })
  if(findAlreadyWatching) throw new AppError("Stock already in watchlist", 400);

  const addToWatcchList = await prismaClient.watchList.create({
    data:{
      userId,
      stockId:stock.id,
    }
  })


  // Get the date two years ago from today in YYYY-MM-DD format
  const pastTwoYearDate = dayjs().subtract(2, "year").format("YYYY-MM-DD HH:mm");
  const todaysDate = dayjs().format("YYYY-MM-DD HH:mm");

  const candleData = await fetchCandleData({
    exchange:stock.exch_seg,
    symboltoken:stock.token,
    interval:"ONE_DAY",
    fromDate:pastTwoYearDate,
    toDate:todaysDate,
  })

 return true;
  

  } catch (error) {
    console.log("error while watching stock",error);
    
    throw error;
  }
}

const fetchCandleDataWithLimiter = limiter.wrap(fetchCandleData);
export const cronJobToFetchDailyCandleData = async()=>{
  try {
    // Fetch unique stockIds from watchList and join with stocks table to get token and exch_seg in a single query
    const stocks = await prismaClient.watchList.findMany({
      where: {
        isDeleted: false,
      },
      distinct: ['stockId'],
      select: {
        stock: {
          select: {
            token: true,
            exch_seg: true,
          }
        }
      }
    });
    console.log(stocks,"stocks");
    if(!stocks){
      throw new Error("There is no stocks in watchlist")
    }
    for(const stock of stocks){
      const candleData = await fetchCandleDataWithLimiter({
       exchange: stock.stock.exch_seg,
       symboltoken:stock.stock.token,
       interval:"ONE_DAY",
       // Fetch only today's candle
       fromDate: dayjs().startOf('day').subtract(2, 'day').hour(9).minute(0).second(0).format("YYYY-MM-DD HH:mm"),
       toDate: dayjs().startOf('day').hour(15).minute(30).second(0).format("YYYY-MM-DD HH:mm"),
      })
      let data =`${new Date().toISOString()}-${stock.stock.token}-candleFetched-${JSON.stringify(candleData, null, 2)}`;
      fs.appendFileSync('candleData.logs', data + '\n');
    }
  } catch (error) {
    console.log("error while fetching daily candle data",error);
    
  }
}


export const getNifty100FromNSE = async () => {
  const response = await fetch(
    'https://nsearchives.nseindia.com/content/indices/ind_nifty100list.csv'
  );
  const text = await response.text();

  // Parse CSV
  const lines = text.split('\n').slice(1); // skip header
  return lines
    .filter(line => line.trim())
    .map(line => {
      const cols = line.split(',');
      return {
        name: cols[0]?.trim() ||"",
        symbol: cols[2]?.trim() ||"" // symbol column
      };
    });
};

export const getNifty100WithTokens = async () => {
  const nifty100 = await getNifty100FromNSE();
  const allInstruments = await dumpStocks();

  const updatedStock= nifty100.map(stock => {
    const match = allInstruments?.find(
      (item: any) => item.symbol === `${stock.symbol}-EQ` && item.exch_seg === 'NSE'
    );
    return {
      name: stock.name, // e.g. "INFY"
      symbol: stock.symbol, // e.g. "INFY-EQ"
      lotsize: Number(match.lotsize), // "1" => 1
      token: match.token, // e.g. "1594"
      exch_seg: match.exch_seg // e.g. "NSE"
    };
  }).filter(s => s.token !== null); // remove unmatched
  const addStock = await prismaClient.stocks.createMany({
    data: updatedStock
  });
  
};

const dumpStocks = async()=>{
  const response = await axios.get('https://margincalculator.angelbroking.com/OpenAPI_File/files/OpenAPIScripMaster.json');
return response.data;
  // try {

    // NSE blocks most non-browser requests with Cloudflare. 'fetch' in node
    // or axios will likely both fail unless proper browser headers and cookies are sent.

    // Using fetch (works because sometimes node-fetch or undici may bypass detection with minimal headers)
   
    // Axios call may not work due to Cloudflare/challenge/protection from NSE.
    // try {

    // // The symbols we want (Nifty IT constituents)
    // const itSymbols = ["TCS", "INFY", "HCLTECH", "WIPRO", "TECHM", "LTIM", "PERSISTENT", "COFORGE", "MPHASIS", "OFSS"];

    // // Filter the master list for these symbols on the NSE
    // const itStocksRaw = allInstruments.filter((stock: any) =>
    //     itSymbols.includes(stock.symbol.split('-')[0]) &&
    //     stock.exch_seg === "NSE" &&
    //     stock.symbol.endsWith("-EQ") // Ensure we get Equity, not F&O
    // );

    // // Map them to match our Prisma Stocks model schema
    // const itStocks = itStocksRaw.map((stock: any) => ({
    //   // id will be generated by Prisma with default(uuid()), do not include here
    //   name: stock.name, // e.g. "INFY"
    //   symbol: stock.symbol, // e.g. "INFY-EQ"
    //   lotsize: Number(stock.lotsize), // "1" => 1
    //   token: stock.token, // e.g. "1594"
    //   exch_seg: stock.exch_seg // e.g. "NSE"
    // }));

    // let j = 15
    // for(let i = 0; i<1500; i+15){
    //   i=j;
    //   j=j+15;
    //   console.log(i,j);
    //   const stocks = allInstruments.slice(i,j)
    //   console.log(stocks.length,"stocksss",stocks[0]);
    //   const updatedStock = stocks.map((stock: any) => ({
    //     name: stock.name, // e.g. "INFY"
    //     symbol: stock.symbol, // e.g. "INFY-EQ"
    //     lotsize: Number(stock.lotsize), // "1" => 1
    //     token: stock.token, // e.g. "1594"
    //     exch_seg: stock.exch_seg // e.g. "NSE"
    //   }));
 
      
      // const addStock = await prismaClient.stocks.createMany({
      //   data: updatedStock
      // });
      
      
    // }

    // } catch (err: any) {
    //   console.log(err,"error");
      
      // Most likely you will get a Cloudflare challenge if running from a server
      // NSE blocks popular HTTP libraries and most non-browser requests
      // Try running this from your browser or add cookie/session headers after manual browser visit
    }


//   } catch (error) {
    
//   }
// }




(async()=>{
  // console.log("running dump stocks");
  // const data = await fetchCandleData({
  // exchange:"NSE",
  // symboltoken:"3787",
  // interval:"ONE_DAY",
  // fromDate:"2026-03-03 09:15",
  // toDate:"2026-03-10 15:15",
  // })
  // dumpStocks()
  // await getNifty100WithTokens()
  })();