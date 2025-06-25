import express, { Router } from "express";
import { authenticateUser } from "../../middleware";
import { createAsset } from "./controller";
import { placeOrder } from "./orderBook";

const router: Router = express.Router();

router.post("/addasset", authenticateUser, createAsset);
router.post("/placeorder/:assetId", authenticateUser, placeOrder)
export default router;