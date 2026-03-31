import { TOTP } from "totp-generator";
import { AppError } from "./AppError.js";
import SmartApiPackage from "smartapi-javascript";
import prismaClient from "@repo/database/client";
import axios from "axios";
export async function getSessionToken() {
  try {
  
    const smartApiTokenData = await prismaClient.smartApiToken.findFirst({
        orderBy: { createdAt: "desc" },
      });
    if(smartApiTokenData){
      const authToken = await getAuthToken(smartApiTokenData.refreshToken,smartApiTokenData.authToken);
      console.log("authToken from refresh token",authToken);
      if(authToken){
        await prismaClient.smartApiToken.update({
          where: { id: smartApiTokenData.id },
          data: {
            authToken: authToken,
          },
        });
      return true;
      }
    }
    // alway do login: skip any refresh logic, always generate session using TOTP
    const totpToken = await TOTP.generate(process.env.TOTP_SECRET!);
    const config = {
  
        headers: { 
          'X-PrivateKey': process.env.SMART_API_KEY, 
          'Accept': 'application/json', 
          'X-SourceID': 'WEB', 
          'X-ClientLocalIP': '106.201.224.90', 
          'X-ClientPublicIP': '8.8.8.8', 
            'X-MACAddress': '00:00:00:00:00:00',
            'X-UserType': 'USER',
          'Content-Type': 'application/json'
        }
    } as any

    const body = {
        clientcode: process.env.CLIENT_ID,
        password: process.env.PASSWORD,   
        totp: totpToken.otp,
         state:"STATE_VARIABLE"
    }
    const response:any = await axios.post(`${process.env.SMART_ROOT_URL}/rest/auth/angelbroking/user/v1/loginByPassword`,body,config)

    const session = response.data;

    if (!session.status) {
      console.error("Session failed:", response.message);
      throw new AppError("error while getting session token", 500);
    }

    console.log("New session created");

    const smartApiToken = await prismaClient.smartApiToken.findFirst({
      orderBy: { createdAt: "desc" },
    });

    if (smartApiToken) {
      // update existing row instead of creating duplicate
      await prismaClient.smartApiToken.update({
        where: { id: smartApiToken.id },
        data: {
          authToken: session.data.jwtToken,
          refreshToken: session.data.refreshToken,
          feedToken: session.data.feedToken,
        },
      });
    } else {
      await prismaClient.smartApiToken.create({
        data: {
          authToken: session.data.jwtToken,
          refreshToken: session.data.refreshToken,
          feedToken: session.data.feedToken,
        },
      });
    }

    return true;

  } catch (error: any) {
    console.error("error while getting auth token", error);
    throw new AppError("error while getting auth token", 500);
  }
}


export async function getAuthToken(refreshToken: string,authToken: string) {
    try {
        const config = {
            headers: {
                'Authorization': 'Bearer '+authToken,
                'X-PrivateKey': process.env.SMART_API_KEY, 
                'Accept': 'application/json', 
                'X-SourceID': 'WEB', 
                'X-ClientLocalIP': '106.201.224.90', 
                'X-ClientPublicIP': '8.8.8.8', 
                  'X-MACAddress': '00:00:00:00:00:00',
                  'X-UserType': 'USER',
                'Content-Type': 'application/json'
            }
        }
        const data ={
            refreshToken:refreshToken,
        }
        const response:any = await axios.post(`${process.env.SMART_ROOT_URL}/rest/auth/angelbroking/jwt/v1/generateTokens`,data,config);
        if(response.data.status){
            return response.data.data.jwtToken;
        }else{
            return null;
        }
    } catch (error) {
        console.log("error while getting auth token", error);
        throw new AppError("error while getting auth token", 500);
    }
}