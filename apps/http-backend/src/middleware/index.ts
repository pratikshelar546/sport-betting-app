import { NextFunction, Request, Response } from "express";
import { AppError } from "../utlis/AppError";
import jwt from "jsonwebtoken";
const jwtSecret = process.env.JWT_TOKEN || "thisistoken";

interface decodedToken {
    id: string,
    email?: string
}

declare global {
    namespace Express {
        interface Request {
            user?: decodedToken
        }
    }
}

export const authenticateUser = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const authToken = req.headers.authorization;

    if (!authToken || !authToken.startsWith("Bearer")) {
        throw new AppError("uauthorized", 401);
    }
    const token = authToken.split(" ")[1];
    console.log(token);

    try {
        if (!token) return
        const decoded = jwt.verify(token, jwtSecret) as decodedToken;
        console.log(decoded, "decoded");

        req.user = decoded;
        next();
    } catch (error: any) {
        throw new AppError(error.message || "Somthing went wrong", 500)
    }
}

