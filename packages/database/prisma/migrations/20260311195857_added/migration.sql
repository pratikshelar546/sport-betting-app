-- CreateTable
CREATE TABLE "watchList" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stockId" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "watchList_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "watchList_userId_isDeleted_idx" ON "watchList"("userId", "isDeleted" DESC);

-- AddForeignKey
ALTER TABLE "watchList" ADD CONSTRAINT "watchList_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watchList" ADD CONSTRAINT "watchList_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES "Stocks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
