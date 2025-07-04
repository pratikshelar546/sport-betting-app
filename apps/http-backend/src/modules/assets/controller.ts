import { NextFunction, Request, Response } from "express";
import { addAsset, getAssetDetails } from "./service";
import { Asset } from "./types";
import { AppError } from "../../utlis/AppError";
import { User } from "../user/types";

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
    const { id }: { id?: string } = req.params;
    const getAssetDeatils: any = await getAssetDetails({ id: id as string });

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
