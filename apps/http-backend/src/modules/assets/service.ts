import prismaClient from "@repo/database/client";
import { Asset, Order } from "./types";

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
  } catch (error: any) {
    throw new error();
  }
};

export const placeOrderService = async ({
  qty,
  type,
  price,
  userId,
  assetId
}: Order): Promise<Order | any> => {
  try {
    const placeOrder = await prismaClient.orderbook.create({
      data: {
        qty,
        type,
        price,
        userId,
        assetId
      },
    });
    return placeOrder;
  } catch (error: any) {
    throw new error();
  }
};
