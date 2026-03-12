import prismaClient from "@repo/database/client";

export const syncCandleToDb = async (allFetchedCandles: any) => {
  if (!allFetchedCandles || allFetchedCandles.length === 0) return;

  try {
    console.log(`Database syncing: processing ${allFetchedCandles.length} candles.`);

    // Skip the findMany and the Set filter. 
    // Go straight to the insert.
    await prismaClient.$executeRaw`
      INSERT INTO "stock_candle_data" (
        "id", "timestamp", "open", "high", "low", "close", "volume", "exchange", "symboltoken", "stockId", "interval"
      )
      SELECT 
        gen_random_uuid(),
        (val->>'timestamp')::timestamptz,
        (val->>'open')::double precision,
        (val->>'high')::double precision,
        (val->>'low')::double precision,
        (val->>'close')::double precision,
        (val->>'volume')::bigint,
        val->>'exchange',
        val->>'symboltoken',
        val->>'stockId',
        val->>'interval'
      FROM json_array_elements(${JSON.stringify(allFetchedCandles)}::json) AS val
      ON CONFLICT ("stockId", "timestamp") DO NOTHING;
    `;

    console.log("Database sync complete (duplicates ignored by PostgreSQL).");
  } catch (error) {
    console.error("Sync Error:", error);
    throw error;
  }
};