export interface Order {
  qty: number;
  price: number;
  type: string;
  userId: string;
  id?: string;
  assetId: string;
  method: "Buy" | "Sell"
}