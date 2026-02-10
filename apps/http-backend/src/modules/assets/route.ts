import express, { Router } from "express";
import { authenticateUser } from "../../middleware";
import { createAsset, getAsset, getAssetOrderBook } from "./controller";

const router: Router = express.Router();

router.post("/addasset", authenticateUser, createAsset);
// router.post("/placeorder/:assetId", authenticateUser, placeOrder);
router.get("/getAssetDeatils/:id", getAsset);
router.get("/getorderbook/:id",getAssetOrderBook)
export default router;