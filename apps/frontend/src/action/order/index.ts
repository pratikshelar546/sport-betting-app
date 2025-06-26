"use server";

import prismaClient from "@repo/database/client";

export interface PlaceOrder {
  userId: string;
  type: string;
  qty: number;
  price: number;
  assetId: string;
}
export const placeOrder = async (data: PlaceOrder) => {
  const order = await prismaClient.orderbook.create({
    data: {
      ...data,
    },
  });
  return order;
};
