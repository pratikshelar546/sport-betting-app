import express from 'express';
import cors from 'cors'
import { errorHandler } from './middleware/errorHandler';
import userRoutes from "./modules/user/route";
import assetRoute from "./modules/assets/route";
import transactionRoute from "./modules/transaction/route";
import dotenv from 'dotenv';
const app = express();

app.use(express.json());
app.use(cors());
dotenv.config();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

// console.log("hitting ");

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/asset", assetRoute);
app.use("/api/v1/transaction", transactionRoute);

app.use(errorHandler);

app.listen(8000, () => {
  console.log("Server is running on port 8000");
  console.log("http://localhost:8000");
});
