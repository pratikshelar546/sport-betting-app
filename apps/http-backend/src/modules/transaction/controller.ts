import { NextFunction, Request, Response } from "express";
import { User } from "../user/types.js";
import { AppError } from "../../utlis/AppError.js";
import { executeOrder, placeOrderService } from "./service.js";
console.log("dd");

export const placeOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id: assetId } = req.params;
    const { id } = req.user as User;
    const { price, qty, type, method } = req.body;
    console.log("placing order", assetId, id, price, qty, type, method);

    if (!price || !qty || !type || !id || !assetId || !method)
      throw new AppError("Data invalid", 409);

    const placedOrder = await placeOrderService({
      qty,
      type,
      price,
      userId: id,
      assetId,
      method,
      remainingQty:qty
    });

    const {success,fullyFiled,remaining,message} = await executeOrder({
      qty,
      price,
      type,
      method,
      assetId,
      id:placedOrder.orderBookId,
      remainingQty:qty
    })

    return res.status(200).json({
      message: `Order placed successfully and ${message}`,
      success: true,
      orderId: placedOrder?.id,
      orderExecuted:success,
      fullyFiled,
      remaining
    });
  } catch (error) {
    console.log("Error while placing order", error);
    next(error);
  }
};
