import prismaClient from "@repo/database/client";
import { Asset } from "./types";
import { AppError } from "../../utlis/AppError";

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
    console.log(asset, "here");

    return asset;
  } catch (error) {
    console.log("here giving you error");

    throw error;
  }
};

export const getAssetDetails = async ({ id }: { id: string }): Promise<any> => {
  try {
    const getAssetDetails = await prismaClient.asset.findFirst({
      where: { id },
    });

    return getAssetDetails;
  } catch (error) {
    throw error;
  }
};

export const fetchOrderBook = async ({ id }: { id: string }) => {
  try {
    const asset = await getAssetDetails({ id });
    if (!asset) {
      throw new AppError("Asset not found", 404);
    }
    const orders = await prismaClient.orderbook.findMany({
      where: { assetId: id },
      orderBy: [{ price: "desc" }, { createdAt: "desc" }],
    });
    return orders;
  } catch (error) {
    throw error;
  }
};
