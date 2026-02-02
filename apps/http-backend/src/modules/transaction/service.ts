import prismaClient from "@repo/database/client";
import { Order } from "./types";
import { AppError } from "../../utlis/AppError";

export const placeOrderService = async ({
  qty,
  type,
  price,
  userId,
  assetId,
  method
}: Order): Promise<Order | any> => {
  console.log("placign order");
  
  try {
    const placeOrder = await prismaClient.orderbook.create({
      data: {
        qty,
        type,
        price,
        userId,
        assetId,
        method
      },
    });

    if (!placeOrder) throw new AppError("Failed to place order", 400);

    const addTransaction = await prismaClient.transaction.create({
      data: {
        assetId: assetId,
        userId,
        executed: false,
        amount: price,
        qty: qty,
        orderBookId: placeOrder?.id,
        type,
        method
      },
    });
    return addTransaction;
  } catch (error) {
    throw error;
  }
};
