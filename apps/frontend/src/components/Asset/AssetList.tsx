import { getAllAsset } from "@/action/asset";
import { authOptions } from "@/lib/authHandler";
import { getServerSession } from "next-auth";
import React from "react";
import AssetCard, { asset } from "./AssetCard";

const AssetList = async () => {
  const session = await getServerSession(authOptions);


  const assets: asset[] = await getAllAsset();


  return (
    <>
      <div className="grid grid-cols-5 gap-5">
        {assets?.map((asset, id) => {
          return <AssetCard asset={asset} key={id}/>;
        })}
      </div>
    </>
  );
};

export default AssetList;
