// routes/index.ts
import express, { Router } from "express";
import { createUser, loginUser } from "./controller";

const router: Router = express.Router();

router.post("/signin", createUser);
router.post("/login", loginUser);
export default router;
