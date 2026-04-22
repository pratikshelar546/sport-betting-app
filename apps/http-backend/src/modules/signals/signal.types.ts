import type { SignalType } from "@prisma/client";       
export interface ICandleData {
    id: string;
    timestamp: Date;  // ISO string representation of DateTime
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    exchange: string;
    symboltoken: string;
    stockId: string;
    interval: string;
}

export interface IRSIresult {
    value: number;
    score: number;
}

export interface ISMAresult {
    value:number,
    score:number
}

export interface IVolumeresult {
    value:number,
    score:number
}

export interface ISignalType {
    STRONG_BUY :"STRONG_BUY",
    BUY :"BUY",
    IGNORE :"IGNORE"
  }

  export interface level{
    entry:number,
    stopLoss:number,
    risk: number,
    target:number
  }

export interface IsignalType {
    id?: string, 
    stockId : string,
    signal :SignalType
    createdAt ?:Date
    updatedAt ?:Date
    totalScore :number
    level :level
    breakDown :any
}