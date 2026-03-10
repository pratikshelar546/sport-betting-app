import { getAllAsset } from "@/action/asset";
import { authOptions } from "@/lib/authHandler";
import { getServerSession } from "next-auth";
import React from "react";
import AssetCard, { Stocks } from "./AssetCard";

const AssetList = async () => {
  const session = await getServerSession(authOptions);


  const assets: Stocks[] = await getAllAsset();

  if (!assets) return (
    <div>
      Asset Not Found! add new assets
    </div>
  )
  return (
    <>
      <div className="grid grid-cols-3 gap-5 mt-18">
        {assets?.map((asset, id) => {
          return <AssetCard asset={asset} key={id} />;
        })}
      </div>
    </>
  );
};

export default AssetList;
