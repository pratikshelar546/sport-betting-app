-- CreateTable
CREATE TABLE "stock_candle_data" (
    "id" TEXT NOT NULL,
    "timestamp" TEXT NOT NULL,
    "open" DOUBLE PRECISION NOT NULL,
    "high" DOUBLE PRECISION NOT NULL,
    "low" DOUBLE PRECISION NOT NULL,
    "close" DOUBLE PRECISION NOT NULL,
    "volume" INTEGER NOT NULL,
    "exchange" TEXT NOT NULL,
    "symboltoken" TEXT NOT NULL,
    "stockId" TEXT NOT NULL,

    CONSTRAINT "stock_candle_data_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "stock_candle_data" ADD CONSTRAINT "stock_candle_data_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES "Stocks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
