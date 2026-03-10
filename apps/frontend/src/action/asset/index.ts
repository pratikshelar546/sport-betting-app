"use server";
import prismaClient from "@repo/database/client";

export const getAllAsset = async () => {
  const assets = await prismaClient.stocks.findMany();
  return assets;
};
