-- DropForeignKey
ALTER TABLE "Asset" DROP CONSTRAINT "Asset_orderBookId_fkey";

-- AlterTable
ALTER TABLE "Asset" ALTER COLUMN "orderBookId" DROP NOT NULL,
ALTER COLUMN "image" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_orderBookId_fkey" FOREIGN KEY ("orderBookId") REFERENCES "Orderbook"("id") ON DELETE SET NULL ON UPDATE CASCADE;
