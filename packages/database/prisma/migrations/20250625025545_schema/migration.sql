/*
  Warnings:

  - You are about to drop the column `orderBookId` on the `Asset` table. All the data in the column will be lost.
  - You are about to drop the column `qyt` on the `Orderbook` table. All the data in the column will be lost.
  - You are about to drop the column `qyt` on the `Transaction` table. All the data in the column will be lost.
  - Added the required column `assetId` to the `Orderbook` table without a default value. This is not possible if the table is not empty.
  - Added the required column `qty` to the `Orderbook` table without a default value. This is not possible if the table is not empty.
  - Added the required column `qty` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Asset" DROP CONSTRAINT "Asset_orderBookId_fkey";

-- AlterTable
ALTER TABLE "Asset" DROP COLUMN "orderBookId";

-- AlterTable
ALTER TABLE "Orderbook" DROP COLUMN "qyt",
ADD COLUMN     "assetId" TEXT NOT NULL,
ADD COLUMN     "executed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "qty" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "qyt",
ADD COLUMN     "executed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "qty" INTEGER NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Orderbook" ADD CONSTRAINT "Orderbook_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
