export interface Asset {
  id?: string;
  maxPrice: number;
  title: string;
  userId: string;
  image?: string;
}

export interface Order {
  qty: number;
  price: number;
  type: string;
  userId: string;
  id?: string;
  assetId: string;
}
