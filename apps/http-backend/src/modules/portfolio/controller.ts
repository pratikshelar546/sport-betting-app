import { NextFunction, Request, Response } from "express";
import { User } from "../user/types.js";
import { getPortfolioById } from "./service.js";

export const getPortfolio = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const { id } = req.user as User;
        const portfolio = await getPortfolioById(id as string);
        if (!portfolio) {
            return res.status(404).json({
                message: "Portfolio not found",
            });
        }
        return res.status(200).json({
            message: "Portfolio fetched successfully",
            portfolio,
        });
    } catch (error) {
        console.log("error while getting portfolio", error);
        next(error);
    }
}