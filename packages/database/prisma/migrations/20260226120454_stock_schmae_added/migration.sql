-- CreateTable
CREATE TABLE "Stocks" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "lotsize" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "exchange" TEXT NOT NULL,

    CONSTRAINT "Stocks_pkey" PRIMARY KEY ("id")
);
