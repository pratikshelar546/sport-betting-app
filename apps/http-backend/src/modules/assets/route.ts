import express, { Router } from "express";
import { authenticateUser } from "../../middleware/index.js";
import { createAsset, getAsset, getAssetOrderBook, watchListStock } from "./controller.js";
import { getCandleData } from "./controller.js";

const router: Router = express.Router();

router.post("/addasset", authenticateUser, createAsset);
// router.post("/placeorder/:assetId", authenticateUser, placeOrder);
router.get("/getAssetDeatils/:symbol", getAsset);
router.get("/getorderbook/:symbol",getAssetOrderBook)
router.get("/getCandleData",getCandleData)
router.get("/watchlist/:token",authenticateUser,watchListStock)
export default router;