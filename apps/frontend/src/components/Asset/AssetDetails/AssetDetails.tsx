"use client";
import { server } from "@/utlis/server";
import axios from "axios";
import { useParams } from "next/navigation";
import React, { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { useState } from "react";
import windowImg from "@/public/window.svg";
import Tab from "./Tab";
import OrderModal from "./OrderModal";
import { Input } from "@/components/ui/Input";
export interface Asset {
  title: string,
  image?: string,
  maxPrice: number,
  id: string,
  buyPriceYes: number,
  buyPriceNo: number,
  sellPriceYes: number,
  sellPriceNo: number
}
const AssetDetails = () => {
  const { id } = useParams();
  const [asset, setAsset] = useState<Asset>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<string>("Buy");
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [orderType, setOrderType] = useState<"Buy" | "Sell">("Buy");
  const [currentPrice, setCurrentPrice] = useState<number>(NaN)
  const [formData, setFormData] = useState({
    price: NaN,
    type: "",
    qty: NaN,
  });

  const getData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await server.get(`/asset/getAssetDeatils/${id}`);
      setAsset(res.data.asset);
    } catch (err: any) {
      setError("Failed to load asset details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderType === "Buy") {

    }
  }, [formData.type])

  useEffect(() => {
    getData();
    // eslint-disable-next-line
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px] text-white">
        Loading...
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[300px] text-red-400">
        {error}
      </div>
    );
  }
  if (!asset) return null;

  // Use dummy image if asset.image is missing
  const imageSrc = asset.image || "/window.jpeg";

  const handleBuyOrder = (type: string) => {
    setOrderType("Buy");
    setFormData((prev) => ({
      ...prev,
      type: type,
    }));
    setOpenModal(true);
  };

  const handleSellOrder = (type: string) => {
    setOrderType("Sell");
    setOpenModal(true);
  };

  return (
    <div className="flex flex-col md:flex-row justify-center items-center min-h-[80vh] bg-neutral-900 w-full px-4 py-8 gap-8">
      {/* Details Side */}
      <div className="flex-1 flex flex-col items-center md:items-start bg-neutral-800 rounded-xl shadow-lg p-8 border border-neutral-700 w-full max-w-xl">
        <img
          src={imageSrc}
          alt={asset.title}
          className="w-40 h-40 object-cover rounded-lg border border-neutral-700 shadow mb-6 bg-neutral-700"
        />
        <h2 className="text-3xl font-bold text-white mb-4 text-center md:text-left">
          {asset.title}
        </h2>
        <div className="flex flex-col gap-3 w-full">
          <div className="flex justify-between text-lg text-neutral-300">
            <span>Current Price:</span>
            <span className="font-semibold text-green-400">
              ₹{asset.maxPrice}
            </span>
          </div>
          <div className="flex justify-between text-lg text-neutral-300">
            <span>Max Price:</span>
            <span className="font-semibold text-blue-400">
              ₹{asset.maxPrice}
            </span>
          </div>
        </div>
      </div>
      {/* Buy/Sell Side with Tabs */}
      <div className="flex-1 flex flex-col items-center justify-center bg-neutral-800 rounded-xl shadow-lg p-8 border border-neutral-700 w-full max-w-md gap-8">
        <Tab
          tabs={["Buy", "Sell"]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        <div>
          <div className="flex flex-row gap-4 justify-center items-center">

          <Input
            type="text"
            label="Price (₹)"
            value={formData.price || ""}
            onChange={(e) => {
              const value = e.target.value;
              // Only allow numbers and decimal points
              if (/^\d*\.?\d*$/.test(value) || value === "") {
                setFormData({
                  ...formData,
                  price: value === "" ? NaN : parseFloat(value),
                });
              }
            }}
            onWheel={(e) => e.currentTarget.blur()}
            placeholder="Enter price"
            className="w-full"
            required
          />
<Input
            type="text"
            label="Quantity"
            value={formData.qty || ""}
            onChange={(e) => {
              const value = e.target.value;
              // Only allow numbers and decimal points
              if (/^\d*\.?\d*$/.test(value) || value === "") {
                setFormData({
                  ...formData,
                  qty: value === "" ? NaN : parseFloat(value),
                });
              }
            }}
            placeholder="Enter quantity"
            className="w-full"
            required
          />
  
          </div>
          <p className="text-sm text-neutral-400 mt-1">
            Current price: ₹{asset?.maxPrice}
          </p>
        </div>
        {activeTab === "Buy" && (
          <>
            <h3 className="text-2xl font-semibold text-white mb-4 text-center">
              Place Your Bet (Buy)
            </h3>
            <div className="flex flex-row gap-6 w-full justify-center">
              <Button
                label={`Buy Yes ₹${asset?.buyPriceYes}`}
                variant="primary"
                className="w-full text-lg"
                onClick={() => {
                  handleBuyOrder("yes");
                  setCurrentPrice(asset?.buyPriceYes);
                }}
              />
              <Button
                label={`Buy No ₹${asset?.buyPriceNo}`}
                variant="outlined"
                className="w-full text-lg"
                onClick={() => {
                  handleBuyOrder("no");
                  setCurrentPrice(asset?.buyPriceNo)
                }}
              />
            </div>
            <p className="text-neutral-400 text-center mt-6">
              Will this asset reach its max price?
            </p>
          </>
        )}
        {activeTab === "Sell" && (
          <>
            <h3 className="text-2xl font-semibold text-white mb-4 text-center">
              Place Your Bet (Sell)
            </h3>
            <div className="flex flex-row gap-6 w-full justify-center">
              <Button
                label={`Sell Yes ₹${asset.sellPriceYes}`}
                variant="primary"
                className="w-full text-lg"
                onClick={() => {
                  handleSellOrder("yes");
                  setCurrentPrice(asset.sellPriceYes);
                }}
              />
              <Button
                label={`Sell No ₹${asset.sellPriceNo}`}
                variant="outlined"
                className="w-full text-lg"
                onClick={() => {
                  handleSellOrder("no");
                  setCurrentPrice(asset.sellPriceNo);
                }}
              />
            </div>
            <p className="text-neutral-400 text-center mt-6">
              Do you want to sell if it reaches max price?
            </p>
          </>
        )}
      </div>
      <OrderModal
        open={openModal}
        setOpen={setOpenModal}
        orderType={orderType}
        formData={formData}
        setFormData={setFormData}
        currentPrice={currentPrice}
      />
    </div>
  );
};

export default AssetDetails;
