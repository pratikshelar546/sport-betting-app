// Api will be written here and all logic and db call will done in service.ts only
// comman type will be wrritten in types.ts
// routes will be wrriten in index.ts

import { NextFunction, Request, Response } from 'express';
import { User } from "./types";
import { addUser, findEmailAlreadyExist, findUserByPhoneNumber } from "./service";
import { AppError } from "../../utlis/AppError";
import { compareHashPassword, genrateJwtToken, hashPassword } from './utlis';

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { email, name, phoneNumber, password }: User = req.body;

    const userAlreadyExits = await findEmailAlreadyExist(email);
    if (userAlreadyExits)
      throw new AppError("User with this email already exist", 400);

    const hashedPassword = await hashPassword(password);

    const user = await addUser({
      name,
      password: hashedPassword,
      email,
      phoneNumber,
    });

    if (!user) throw new AppError("Not able to create user", 400);

    // const token = genrateJwtToken(user);
    return res.status(200).json({
      message: "User created successfully",
      success: true,
      user,
    });
  } catch (error: any) {
    console.log("Error while creating user", error);
    next(error);
  }
};

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    // creadetials can be phone number or email
    const { creadntials, password } = req.body;
    const user = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(creadntials)
      ? await findEmailAlreadyExist(creadntials)
      : ((await findUserByPhoneNumber(creadntials)) as User | any);

    if (!user) throw new AppError("User not found with this creadentials", 404);

    const passwordMatched = await compareHashPassword(password, user.password);
    if (!passwordMatched)
      throw new AppError("Creadentials did not matched", 401);

    const token = genrateJwtToken(user) as string;

    return res.status(200).json({
      message: "Login successfully",
      success: true,
      token,
      user,
    });
  } catch (error) {
    console.log("error", error);
    next(error);
  }
};
