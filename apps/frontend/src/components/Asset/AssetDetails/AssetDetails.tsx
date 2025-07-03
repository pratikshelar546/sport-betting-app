"use client";
import { server } from "@/utlis/server";
import axios from "axios";
import { useParams } from "next/navigation";
import React, { useEffect } from "react";

const AssetDetails = () => {
  const { id } = useParams();
  const getData = async () => {
    const getAsset = await server.get(`/asset/getAssetDeatils/${id}`);
    console.log(getAsset);
  };
  useEffect(() => {
    getData();
  }, []);
  return <div></div>;
};

export default AssetDetails;
