import prismaClient from "@repo/database/client";
import { User } from "./types";
import { AppError } from "../../utlis/AppError";
// All logic and db call will be done from here only

export const findEmailAlreadyExist = async (
  email: string
): Promise<User | any> => {
  try {
    const emailExist = await prismaClient.user.findFirst({
      where: {
        email: email,
      },
      select: {
        id: true,
        email: true,
        name: true,
        balance: true,
        phoneNumber: true,
        createdAt: true,
        password: true,
      },
    });
    return emailExist;
  } catch (error) {
    console.log("Error while finding email in db");
    throw error;
  }
};

export const findUserByPhoneNumber = async (
  phoneNumber: string
): Promise<User | any> => {
  console.log("finding by phone", phoneNumber);

  try {
    const userExist = await prismaClient.user.findFirst({
      where: {
        phoneNumber: phoneNumber,
      },
      select: {
        id: true,
        email: true,
        name: true,
        balance: true,
        phoneNumber: true,
        createdAt: true,
        password: true,
      },
    });
    return userExist;
  } catch (error) {
    console.log("Error while finding email in db");
    throw error;
  }
};

export const addUser = async ({
  name,
  email,
  password,
  phoneNumber,
}: User): Promise<any> => {
  try {
    const user = prismaClient.user.create({
      data: {
        name,
        email,
        password,
        phoneNumber: phoneNumber,
      },
    });
    return user;
  } catch (error) {
    console.log("Error while creating user");
    throw error;
  }
};
