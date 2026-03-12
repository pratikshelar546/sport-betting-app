"use client";
import { Button } from "../ui/Button";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { server } from "@/utlis/server";

export interface asset {
  id: string;
  title: string;
  maxPrice: number;
  image?: string | null;
  oderBookId?: string;
  userId?: string;
}

export interface Stocks {
  id: string;
  name: string;
  symbol: string;
  lotsize: number;
  token: string;
  exch_seg: string;
}

const AssetCard = ({ asset,userToken }: { asset: Stocks,userToken:string }) => {
console.log(userToken,"userToken");
  const watchListStock = async () => {
    try {
      const res = await server.get(`/asset/watchlist/${asset.token}`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });
      if(res.data && res.data.success) {
        toast.success("Stock watched successfully");
      }
    } catch (error) {
      toast.error("Failed to watch stock");
    }
  }
  const router = useRouter();

  return (
    <div
      className="max-w-4xl w-full flex flex-col justify-between px-6 py-5 bg-neutral-900 border border-neutral-700 rounded-xl shadow text-white gap-4 transition duration-200 hover:shadow-lg hover:border-neutral-400 cursor-pointer"
      onClick={() => {
        router.push(`/assetDetails/${asset.symbol}`);
      }}
    >
      <div className="flex items-center gap-3">
        {/* Simple colored placeholder for symbol */}
        <div className="h-11 w-11 flex items-center justify-center rounded-md bg-neutral-800 border border-neutral-600">
          <span className="text-base font-bold text-neutral-200">
            {asset.symbol.slice(0, 3)}
          </span>
        </div>
        <div>
          <h1 className="text-white text-lg font-semibold">{asset.name}</h1>
          <p className="text-neutral-400 text-xs uppercase tracking-wide">{asset.symbol}</p>
        </div>
      </div>
      <div className="flex flex-row gap-8 items-center justify-between mt-4">
        <div className="flex flex-col">
          <span className="text-xs text-neutral-500">Lot size</span>
          <span className="text-base font-medium text-neutral-300">{asset.lotsize}</span>
        </div>
        <div className="flex flex-row gap-3">
          <Button
            className="px-5 py-1.5 text-sm font-medium bg-neutral-800 hover:bg-neutral-700 text-white rounded transition"
            size="sm"
            label="Buy Yes"
            onClick={e => e.stopPropagation()}
          />

          <Button
            className="px-5 py-1.5 text-sm font-medium bg-neutral-800 hover:bg-neutral-700 text-white rounded transition"
            size="sm"
            label="Buy No"
            onClick={e => e.stopPropagation()}
          />
        </div>
      </div>
      {/* Watchlist Button */}
      <div className="flex flex-row justify-end mt-2 gap-2">
        <span className="text-xs text-neutral-500 italic">{asset.exch_seg}</span>
        <Button
          className="px-4 py-1 text-xs font-medium bg-blue-700 hover:bg-blue-600 text-white rounded transition"
          size="sm"
          label="Watchlist"
          onClick={e => {
            e.stopPropagation();
            watchListStock();
          }}
        />
      </div>
    </div>
  );
};

export default AssetCard;
