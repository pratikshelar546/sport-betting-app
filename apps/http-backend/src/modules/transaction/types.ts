export interface Order {
  qty: number;
  price: number;
  type: "yes"|"no";
  userId?: string;
  id?: string;
  assetId: string;
  method: "Buy" | "Sell"
}