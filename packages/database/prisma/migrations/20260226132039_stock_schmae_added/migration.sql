/*
  Warnings:

  - You are about to drop the column `exchange` on the `Stocks` table. All the data in the column will be lost.
  - Added the required column `exch_seg` to the `Stocks` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Stocks" DROP COLUMN "exchange",
ADD COLUMN     "exch_seg" TEXT NOT NULL;
