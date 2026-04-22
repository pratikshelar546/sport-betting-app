
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