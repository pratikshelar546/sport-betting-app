/*
  Warnings:

  - A unique constraint covering the columns `[stockId,timestamp]` on the table `stock_candle_data` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `timestamp` on the `stock_candle_data` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "stock_candle_data" DROP COLUMN "timestamp",
ADD COLUMN     "timestamp" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "stock_candle_data_timestamp_idx" ON "stock_candle_data"("timestamp" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "stock_candle_data_stockId_timestamp_key" ON "stock_candle_data"("stockId", "timestamp");
