import prismaClient from "@repo/database/client";
import { AppError } from "../../utlis/AppError.js";
import { fetchCandleData, getAssetDetails } from "../assets/service.js";
import dayjs from "dayjs";
import { Request, Response } from "express";
import { User } from "@prisma/client";
export const watchListStockService = async (req:Request,res:Response):Promise<any>=>{
    try {
      const { token } = req.params;
      const { id } = req.user as User;
    const stock = await getAssetDetails({
      token:token as string
    });
    if(!stock) throw new AppError("Stock not found", 404);
  
    const findAlreadyWatching = await prismaClient.watchList.findFirst({
      where:{
        userId:id,
        stockId:stock.id,
      }
    })
    if(findAlreadyWatching) throw new AppError("Stock already in watchlist", 400);
  
    const addToWatcchList = await prismaClient.watchList.create({
      data:{
        userId:id,
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
  
    return res.status(200).json({
    message: "Stock added to watchlist successfully",
    data:addToWatcchList,
   });
    
  
    } catch (error:any) {
      console.log("error while watching stock",error);
      return res.status(500).json({
        message: "Internal server error",
        error:error.message,
      });
    }
  }
  

export const fetchAllWatchListedStocks = async () =>{
    try {
      const allWhatchlisted = await prismaClient.stocks.findMany({
        where: {
          watchList: {
            some: {
              isDeleted: false
            }
          }
        },
      });
  
     return allWhatchlisted
      
    } catch (error) {
      console.log("error",error);
      throw error
      
    }
  }
  