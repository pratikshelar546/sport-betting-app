import express, { Router } from "express";
import { authenticateUser } from "../../middleware/index";
import { placeOrder } from "./controller";

const router: Router = express.Router();
router.get("/", () => {
  console.log("herrr");
});
router.post("/placeorder/:id", authenticateUser, placeOrder);

export default router;
