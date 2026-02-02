import express, { Router } from "express";
import { authenticateUser } from "../../middleware/index";
import { placeOrder } from "./controller";

const router: Router = express.Router();
router.get("/", (req,res) => {
  console.log("herrr");
  res.send("reee")
});
router.post("/placeorder/:id", authenticateUser, placeOrder);

export default router;
