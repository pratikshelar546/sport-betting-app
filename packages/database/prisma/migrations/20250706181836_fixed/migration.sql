/*
  Warnings:

  - You are about to drop the column `currentPrice` on the `Asset` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Asset" DROP COLUMN "currentPrice",
ADD COLUMN     "buyPriceNo" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "buyPriceYes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "sellPriceNo" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "sellPriceYes" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Orderbook" ADD COLUMN     "method" TEXT NOT NULL DEFAULT 'sell';

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "method" TEXT NOT NULL DEFAULT 'sell';
