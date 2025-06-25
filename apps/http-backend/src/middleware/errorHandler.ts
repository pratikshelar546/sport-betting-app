import { Request, Response, NextFunction } from "express";
import { AppError } from "../utlis/AppError";


export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const isOperational = err instanceof AppError;
    const statusCode = isOperational ? (err as AppError).statusCode : 500;
    const message = isOperational ? err.message : "Something went wrong";
    res.setHeader('Content-Type', 'application/json');

    console.error("🔥 Error caught:", err);

    res.status(statusCode).json({
        success: false,
        status: "error",
        message,
        ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
    });
};
