"use client";
import useModal from "@/hooks/useModal";
import Image from "next/image";
import { useState } from "react";
import { Button } from "../ui/Button";
import PlaceOrderModal from "./PlaceOrderModal";
import { useRouter } from "next/navigation";

export interface asset {
  id: string;
  title: string;
  maxPrice: number;
  image?: string | null;
  oderBookId?: string;
  userId?: string;
}

const AssetCard = ({ asset }: { asset: asset }) => {
  const router = useRouter();
  return (
    <>
      <div
        className="flex flex-col px-4 py-3 bg-transparent border border-neutral-500 text-white gap-8 cursor-pointer"
        onClick={() => {
          router.push(`/assetDetails/${asset.id}`);
        }}
      >
        <div className="flex gap-2">
          {asset.image && <Image src={asset.image} alt={asset.title} />}
          <h1 className="text-white text-xl">{asset.title}</h1>
        </div>
        <div className="flex flex-2 gap-4 justify-center items-center">
          <Button
            className="text-white text-lg px-6 py-1  bg-green-400 hover:bg-emerald-300"
            size="sm"
            label="Buy Yes"
          />

          <Button
            className="text-white text-lg px-6 py-1  bg-red-400 hover:bg-red-300"
            size="sm"
            label="Buy No"
          />
        </div>
      </div>
    </>
  );
};

export default AssetCard;
