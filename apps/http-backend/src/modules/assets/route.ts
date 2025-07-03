import express, { Router } from "express";
import { authenticateUser } from "../../middleware";
import { createAsset, getAsset } from "./controller";
import { placeOrder } from "./orderBook";

const router: Router = express.Router();

router.post("/addasset", authenticateUser, createAsset);
router.post("/placeorder/:assetId", authenticateUser, placeOrder);
router.get("/getAssetDeatils/:id",getAsset)
export default router;