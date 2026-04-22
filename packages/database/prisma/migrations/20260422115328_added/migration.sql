-- CreateEnum
CREATE TYPE "SignalType" AS ENUM ('STRONG_BUY', 'BUY', 'IGNORE');

-- CreateTable
CREATE TABLE "signals" (
    "id" TEXT NOT NULL,
    "stockId" TEXT NOT NULL,
    "signal" "SignalType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "totalScore" INTEGER NOT NULL,
    "level" JSONB NOT NULL,
    "breakDown" JSONB NOT NULL,

    CONSTRAINT "signals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "signals_stockId_idx" ON "signals"("stockId");

-- AddForeignKey
ALTER TABLE "signals" ADD CONSTRAINT "signals_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES "Stocks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
