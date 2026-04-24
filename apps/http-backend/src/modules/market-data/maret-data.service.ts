import axios from "axios"
import { AppError } from "../../utlis/AppError.js"
import prismaClient from "@repo/database/client"
import { getSessionToken } from "../../utlis/authToken.js"
import { ICandleData } from "./market-data.types.js";

/**
 * Fetches candlestick (OHLCV) data for a stock from an external API if not available in the database.
 * This function is used to obtain historical price data.
 * @param {Object} params - The parameters for data retrieval.
 * @param {string} params.exchange - Exchange segment (e.g., "NSE").
 * @param {string} params.symboltoken - Unique token identifying the stock.
 * @param {string} params.interval - Candle time interval (e.g., "5minute", "15minute").
 * @param {string} params.fromDate - Start date for historical data (ISO string or supported API format).
 * @param {string} params.toDate - End date for historical data (ISO string or supported API format).
 * @returns {Promise<any>} - Returns API response containing candlestick data.
 */
export const getCandlesFromBroker = async ({
    exchange,
    symboltoken,
    interval ="ONE_DAY",
    fromDate,
    toDate
  }:{
    exchange:string,
    symboltoken:string,
    interval:string,
    fromDate:string,
    toDate:string
  }) =>{
  try {
  
    const data = {
    exchange:exchange,
    symboltoken:symboltoken,
    interval:interval,
    fromdate:fromDate,
    todate:toDate
    }
    console.log(data,"data");
    
    const smartApiTokenData = await prismaClient.smartApiToken.findFirst({  
      orderBy: { createdAt: "desc" },
    });
    let JWT_AUTH_TOKEN:string;
    if(smartApiTokenData){
      function decodeJwt(token: string) {
        try {
          const payload = token.split('.')[1];
          if (!payload) return null;
          // atob returns a string, JSON.parse will give the object
          return JSON.parse(Buffer.from(payload, "base64").toString());
        } catch (e) {
          return null;
        }
      }

      // Validate expiry
      let tokenValid = true;
      if (smartApiTokenData.authToken) {
        const payload = decodeJwt(smartApiTokenData.authToken);
        if (payload && payload.exp) {
          const now = Math.floor(Date.now() / 1000);
          if (payload.exp < now) {
            tokenValid = false;
          }
        }
      }
      if (!tokenValid) {
        JWT_AUTH_TOKEN = await getSessionToken();
      } else {
        JWT_AUTH_TOKEN = smartApiTokenData.authToken;
      }
      JWT_AUTH_TOKEN = smartApiTokenData.authToken;
    }else{
      JWT_AUTH_TOKEN = await getSessionToken();
    } 

    const config = {
  
      headers: { 
        'X-PrivateKey': process.env.SMART_API_KEY, 
        'Accept': 'application/json', 
        'X-SourceID': 'WEB', 
        'X-ClientLocalIP': '106.201.224.90', 
        'X-ClientPublicIP': '8.8.8.8', 
          'X-MACAddress': '00:00:00:00:00:00',
          'X-UserType': 'USER',
        'Authorization': 'Bearer '+JWT_AUTH_TOKEN, 
        'Content-Type': 'application/json'
      }
  } as any
  
  //   const data = {
  //     mode:"FULL",
  //     exchangeTokens:{
  //       "NSE":["13538"]
  //     }
  //   }
    const response  = await axios.post("https://apiconnect.angelone.in/rest/secure/angelbroking/historical/v1/getCandleData",data,config)
console.log(response.data?.data?.length,"responseeeeee");

if(response.data.status){
  console.log("fetched data from angel broking api");
  
    return response.data.data;
}else{
    throw new AppError("No data found in broker", 404);
}

  // var data = JSON.stringify({
  //   "exchange":"NSE",
  //   "tradingsymbol":"SBIN-EQ",
  //   "symboltoken":"3045"
  // });
  // var config = {
  // method: 'post',
  // url: 'https://apiconnect.angelone.in/rest/secure/angelbroking/order/v1/getLtpData',
  // headers: { 
  //   'X-PrivateKey': '5Zb2XvTX', 
  //   'Accept': 'application/json', 
  //   'X-SourceID': 'WEB', 
  //   'X-ClientLocalIP': '106.201.224.90', 
  //   'X-ClientPublicIP': '8.8.8.8', 
  //     'X-MACAddress': '00:00:00:00:00:00',
  //     'X-UserType': 'USER',
  //   'Authorization': 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJ1c2VybmFtZSI6IkFBQ0YwMjE1MzUiLCJyb2xlcyI6MCwidXNlcnR5cGUiOiJVU0VSIiwidG9rZW4iOiJleUpoYkdjaU9pSlNVekkxTmlJc0luUjVjQ0k2SWtwWFZDSjkuZXlKMWMyVnlYM1I1Y0dVaU9pSmpiR2xsYm5RaUxDSjBiMnRsYmw5MGVYQmxJam9pZEhKaFpHVmZZV05qWlhOelgzUnZhMlZ1SWl3aVoyMWZhV1FpT2pNc0luTnZkWEpqWlNJNklqTWlMQ0prWlhacFkyVmZhV1FpT2lKbFl6Umlaak01TkMwMU5HSmtMVE5oTnpBdFlqUTFOUzFoTkdKak5XWmlOelEyTW1NaUxDSnJhV1FpT2lKMGNtRmtaVjlyWlhsZmRqSWlMQ0p2Ylc1bGJXRnVZV2RsY21sa0lqb3pMQ0p3Y205a2RXTjBjeUk2ZXlKa1pXMWhkQ0k2ZXlKemRHRjBkWE1pT2lKaFkzUnBkbVVpZlN3aWJXWWlPbnNpYzNSaGRIVnpJam9pWVdOMGFYWmxJbjE5TENKcGMzTWlPaUowY21Ga1pWOXNiMmRwYmw5elpYSjJhV05sSWl3aWMzVmlJam9pUVVGRFJqQXlNVFV6TlNJc0ltVjRjQ0k2TVRjM01qZzVNVEF5TkN3aWJtSm1Jam94TnpjeU9EQTBORFEwTENKcFlYUWlPakUzTnpJNE1EUTBORFFzSW1wMGFTSTZJbVkyWWpabU5USTBMVGRsTUdJdE5HTTNNeTA0Wm1FMExXSmxPR1ppTW1OalpERXlOeUlzSWxSdmEyVnVJam9pSW4wLmxLNXFHY0Y3ZzdCZmdlSEs2eWdXWWMwTWhuWjlTZHcybS1DekVqc2MwcnVkQ0RkNF9UcmxkUmt2blhlVElmenhZbHFBRGJtM1RneXJzdWtDUEdHWGJUbDE2TlNSZmxLTUJxQUtaV255dXdGY1NBRkV5WE41UUs4QUlrNmZwdURpVldIRkkxVEhiWWJKV2tOd2k5WlRIM3Y4Y3VCY0ZINlh6VHdLNzlQZU5lYyIsIkFQSS1LRVkiOiI1WmIyWHZUWCIsIlgtT0xELUFQSS1LRVkiOnRydWUsImlhdCI6MTc3MjgwNDYyNCwiZXhwIjoxNzcyODIxODAwfQ.NBZMUOEFP99jRk-qQLU2jvAQ6IQIFmffIY58xDl7i2pOEr60FpUahaO4WEW5mfm5su9hkOhJsenuuhFUgsCaMA', 
  //   'Content-Type': 'application/json'
  // },
  // data : data
  // };
  
  // axios(config)
  // .then(function (response) {
  // console.log(JSON.stringify(response.data));
  // })
  // .catch(function (error) {
  // console.log(error);
  // });
  
  } catch (error : any) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("HTTP Status:", error.response.status);
      console.error("Server Error Data:", error.message);
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No Response Received:", error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Axios Setup Error:", error.message);
    }
  
  }
  }

  (async()=>{
    const candles = await getCandlesFromBroker({
      exchange:"NSE",
      symboltoken:"18365",
      interval:"ONE_DAY",
      fromDate:"2026-04-06 09:15",
      toDate:"2026-04-07 15:30"
    });
    console.log(candles,"candles");
  });

  export const getCandleByStockAndDays = async (
    token: string,
    days: number,
  ): Promise<ICandleData[]> =>{
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