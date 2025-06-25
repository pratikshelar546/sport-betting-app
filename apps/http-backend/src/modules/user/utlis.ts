import { User } from "./types";
import jwt from 'jsonwebtoken';
import bcrypt from "bcrypt";

const SALT = 12;
export const hashPassword = async (password: string): Promise<string> => {
    return await bcrypt.hash(password, SALT)

}

export const compareHashPassword = async (password: string, hash: string): Promise<boolean> => {
    return await bcrypt.compare(password, hash);
}

export const genrateOtp = (): number => {
    const otp = Math.floor(100000 + Math.random() * 900000);
    return otp
}


export const genrateJwtToken = (user: User): string => {
    const jwtSecret = process.env.JWT_TOKEN || "thisistoken";


    const payload = {
        id: user.id,
        email: user.email
    }
    const jwtToken = jwt.sign(payload, jwtSecret!, { expiresIn: '7d' })
    return jwtToken
}