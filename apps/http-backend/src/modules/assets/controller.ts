import { NextFunction, Request, Response } from "express";
import { AppError } from "../../utlis/AppError.js";
import { User } from "../user/types.js";
import { addAsset, fetchCandleData, fetchOrderBook, getAssetDetails } from "./service.js";
import { Asset } from "./types.js";

export const createAsset = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id } = req.user as User;
    const { title, maxPrice } = req.body;
    console.log(id, title, maxPrice);
    if (!id) return;

    const asset = (await addAsset({ userId: id, title, maxPrice })) as
      | Asset
      | any;
    if (!asset) throw new AppError("Failed to add new asset", 400);

    return res.status(200).json({
      message: "Asset created successfully",
      success: true,
      asset,
    });
  } catch (error) {
    console.log("error while createing asset", error);
    next(error);
  }
};

export const getAsset = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { symbol }: { symbol?: string } = req.params;
    const getAssetDeatils: any = await getAssetDetails({ symbol: symbol as string });

    return res.status(200).json({
      message: "Fetched asset deatils",
      success: true,
      asset: getAssetDeatils,
    });
  } catch (error) {
    console.log("error while createing asset", error);
    next(error);
  }
};

export const getAssetOrderBook = async (req:Request,res:Response,next:NextFunction) :Promise<any>=>{
  try {
    const { symbol } = req.params;
    if (!symbol) throw new AppError("Asset symbol is required", 400);

    const orderBook = await fetchOrderBook({
      symbol,
    })
    return res.status(200).json({
      message: "Fetched order book",
      success: true,
      data: orderBook,
    });
  } catch (error) {
    console.log("error while getting order book by asset:",error);
    
    next(error)
  }
}


export const getCandleData = async (req:Request,res:Response,next:NextFunction) :Promise<any>=>{
  try {
const {symbol,exchange,interval,fromDate,toDate} = req.query;    
if(!symbol || !exchange || !fromDate || !toDate) throw new AppError("All fields are required", 400);

const candleData = await fetchCandleData({
  symboltoken: symbol as string,
  exchange: exchange as string,
  interval: interval as string,
  fromDate: fromDate as string,
  toDate: toDate as string
});

return res.status(200).json({
  message: "Fetched candle data",
  success: true,
  data: candleData,
});
  } catch (error) {
    console.log("error while getting candle data",error);
    
    next(error);
  }
}