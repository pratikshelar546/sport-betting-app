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
  interval,
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

    // 4. Check if local data doesn't fully cover the requested window (i.e. has missing edges)
    let needsBrokerFetch = false;
    const expectedMinutes = dayjs(toDateObj).diff(dayjs(fromDateObj), 'minute');
    const actualCount = candleData.length;
    
    // If we have less than 90% of the expected data, fetch from broker
    // This accounts for small gaps like lunch breaks or low liquidity
    if (actualCount < expectedMinutes * 0.9) {
        needsBrokerFetch = true;
    }

    
let finalData = candleData;
    if (!candleData || candleData.length === 0 || needsBrokerFetch) {
      // On missing coverage, always fetch the full requested window from broker!
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
    return true;
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

const dumpStocks = async()=>{
  try {

    // NSE blocks most non-browser requests with Cloudflare. 'fetch' in node
    // or axios will likely both fail unless proper browser headers and cookies are sent.

    // Using fetch (works because sometimes node-fetch or undici may bypass detection with minimal headers)
   
    // Axios call may not work due to Cloudflare/challenge/protection from NSE.
    try {
      const response = await axios.get('https://margincalculator.angelbroking.com/OpenAPI_File/files/OpenAPIScripMaster.json');
    const allInstruments = response.data;

    // The symbols we want (Nifty IT constituents)
    const itSymbols = ["TCS", "INFY", "HCLTECH", "WIPRO", "TECHM", "LTIM", "PERSISTENT", "COFORGE", "MPHASIS", "OFSS"];

    // Filter the master list for these symbols on the NSE
    const itStocksRaw = allInstruments.filter((stock: any) =>
        itSymbols.includes(stock.symbol.split('-')[0]) &&
        stock.exch_seg === "NSE" &&
        stock.symbol.endsWith("-EQ") // Ensure we get Equity, not F&O
    );

    // Map them to match our Prisma Stocks model schema
    const itStocks = itStocksRaw.map((stock: any) => ({
      // id will be generated by Prisma with default(uuid()), do not include here
      name: stock.name, // e.g. "INFY"
      symbol: stock.symbol, // e.g. "INFY-EQ"
      lotsize: Number(stock.lotsize), // "1" => 1
      token: stock.token, // e.g. "1594"
      exch_seg: stock.exch_seg // e.g. "NSE"
    }));

    const addStock = await prismaClient.stocks.createMany({
      data: itStocks
    });
    } catch (err: any) {
      // Most likely you will get a Cloudflare challenge if running from a server
      // NSE blocks popular HTTP libraries and most non-browser requests
      // Try running this from your browser or add cookie/session headers after manual browser visit
    }


  } catch (error) {
    
  }
}




// (async()=>{
//   console.log("running dump stocks");
//   const data = await fetchCandleData({
//   exchange:"NSE",
//   symboltoken:"3787",
//   interval:"ONE_DAY",
//   fromDate:"2026-03-03 09:15",
//   toDate:"2026-03-10 15:15",
//   })
  
//   })();