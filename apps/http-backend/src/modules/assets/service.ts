import prismaClient from "@repo/database/client";
import { Asset } from "./types";

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
