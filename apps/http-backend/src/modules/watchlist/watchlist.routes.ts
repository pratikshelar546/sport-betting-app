import { Router } from "express";
import { authenticateUser } from "../../middleware/index.js";
import { watchListStockService } from "./watchlist.service.js";

const router:Router = Router();
router.get("/watchlist/:token",authenticateUser,watchListStockService);

export default router;