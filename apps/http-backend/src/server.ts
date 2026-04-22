import express from 'express';
import cors from 'cors'
import { errorHandler } from './middleware/errorHandler.js';
import userRoutes from "./modules/user/route.js";
import assetRoute from "./modules/assets/route.js";
import transactionRoute from "./modules/transaction/route.js";
import dotenv from 'dotenv';
import cronJobs from './utlis/cronJobs.js';
import watchlistRoutes from "./modules/watchlist/watchlist.routes.js";
const app = express();

app.use(express.json());
app.use(cors());
dotenv.config();
cronJobs.start();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// console.log("hitting ");

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/asset", assetRoute);
app.use("/api/v1/transaction", transactionRoute);
app.use("/api/v1/watchlist", watchlistRoutes);

// app.use(errorHandler);

// getSignalBySMA20("18365")

app.listen(8000, () => {
  console.log("Server is running on port 8000");
  console.log("http://localhost:8000");
});
