import express, { Router } from "express";
import { authenticateUser } from "../../middleware/index.js";
import { getPortfolio } from "./controller.js";

const router :Router = express.Router();


router.get("/", authenticateUser, getPortfolio);

export default router;