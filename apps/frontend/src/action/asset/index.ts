"use server";
import prismaClient from "@repo/database/client";

export const getAllAsset = async () => {
  const assets = await prismaClient.asset.findMany();
  return assets;
};
