"use client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { server } from "@/utlis/server";
import dayjs from "dayjs";
import { CandlestickSeries, ColorType, createChart } from 'lightweight-charts';
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import OrderBook from "./OrderBook";
import OrderModal from "./OrderModal";
import Tab from "./Tab";
import { log } from "next/dist/server/typescript/utils";
export interface Asset {
  symbol: string;
  exch_seg: string;
  token: string;
}
export interface OrderBookEntry {
  id: string;
  type: string;
  qty: number;
  remainingQty: number;
  price: number;
  method: string;
  executed: boolean;
  createdAt: string;
}

type candleStickData = [string, number, number, number, number, number];

interface chartComponent {
  rawData: candleStickData[];
}
const AssetDetails = () => {
  const { id } = useParams();
  const [asset, setAsset] = useState<Asset>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<string>("Buy");
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [orderType, setOrderType] = useState<"Buy" | "Sell">("Buy");
  const [currentPrice, setCurrentPrice] = useState<number>(NaN)
  const [formData, setFormData] = useState({
    price: NaN,
    type: "",
    qty: NaN,
  });
  const [orders, setOrders] = useState<OrderBookEntry[]>([]);
  const [candles,setCandles] = useState<any[]>([]);
  const [loadingCandleData,setLoadingCandleData] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<any>(null);
  const seriesRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAtEnd, setIsAtEnd] = useState(false);
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");


useEffect(() => {
  if (!chartContainerRef.current || !candles.length ) return;

  // 1. Initialize the Chart
  const chart = createChart(chartContainerRef.current, {
    layout: {
      background: { type: ColorType.Solid, color: 'black' },
      textColor: 'white',
    },
    width: chartContainerRef.current.clientWidth,
    height: 400,
    timeScale: {
      timeVisible: true, // Required for intraday (minute/hour) data
      secondsVisible: true,
      tickMarkFormatter: (time: number) => {
        const date = new Date(time * 1000);
        return new Intl.DateTimeFormat('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }).format(date);
      },
    },
    localization: {
      timeFormatter: (time:any) => {
        // This ensures the labels on the axis look correct
        return new Date(time * 1000).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
      },
    },
  });

  chartInstance.current = chart;

  // 2. Add the Candlestick Series
  const candlestickSeries = chart.addSeries(CandlestickSeries, {
    upColor: '#26a69a',
    downColor: '#ef5350',
    borderVisible: false,
    wickUpColor: '#26a69a',
    wickDownColor: '#ef5350',
  });

  chartInstance.current = chart;
  seriesRef.current = candlestickSeries;

  // Cleanup
  return () => chart.remove();
  // 3. Transform Angel One Data
  // Angel One format: [timestamp, open, high, low, close, volume]
  // const formattedData = candles.map((c) => ({
  //   time: toUnixSeconds(c.timestamp) as any, // Send raw UTC
  //   open: c.open,
  //   high: c.high,
  //   low: c.low,
  //   close: c.close,
  // }));

  // // 4. Inject Data into the Series
  // candlestickSeries.setData(formattedData);
  // chart.timeScale().fitContent();
  // // 5. Cleanup function on unmount
  // return () => {
  //   chart.remove();
  // };
}, [candles.length > 0]); // Re-run if data changes


useEffect(() => {
  if (seriesRef.current && candles.length > 0) {
    const timeScale = chartInstance.current.timeScale();

    // Capture where the user is looking BEFORE the update
    const logicalRange = timeScale.getVisibleLogicalRange();

    // Ensure candles are ordered ASCENDING by timestamp,
    // and filter out any duplicate timestamps
    let sortedCandles = [...candles]
      .sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    // Remove any duplicate timestamps
    // (Lightweight Charts requires strictly ascending timestamps)
    let dedupedCandles: any[] = [];
    for (let i = 0; i < sortedCandles.length; i++) {
      const ts = new Date(sortedCandles[i].timestamp).getTime();
      if (
        i === 0 ||
        ts !== new Date(sortedCandles[i - 1].timestamp).getTime()
      ) {
        dedupedCandles.push(sortedCandles[i]);
      }
    }

    // For developer debugging: check for strictly ascending order
    for (let i = 1; i < dedupedCandles.length; i++) {
      const prevTime = new Date(dedupedCandles[i - 1].timestamp).getTime() / 1000;
      const currTime = new Date(dedupedCandles[i].timestamp).getTime() / 1000;
      if (currTime <= prevTime) {
        if (process.env.NODE_ENV !== "production") {
          // Only throw in dev
          throw new Error(
            `Assertion failed: data must be strictly asc ordered by time, index=${i}, time=${currTime}, prev time=${prevTime}`
          );
        }
      }
    }

    const formattedData = dedupedCandles.map((c: any) => ({
      time: Math.floor(new Date(c.timestamp).getTime() / 1000) as any,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));

    seriesRef?.current?.setData(formattedData);

    // If this was a historical prepend, restore the position
    if (logicalRange !== null) {
      // Uncomment if you wish to maintain scroll position
      // timeScale.scrollToLogicalRange(logicalRange);
    }
  }
}, [candles]);

useEffect(() => {
  if (!chartInstance.current) return;

  // Debounce implementation for handleScroll
  let debounceTimer: NodeJS.Timeout | null = null;
  const DEBOUNCE_DELAY = 500; // ms

  const handleScroll = (newVisibleRange: any) => {
    if (!newVisibleRange) return;

    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    debounceTimer = setTimeout(() => {
      // Logical range < 10 means the user is within 10 bars of the left edge
      console.log(newVisibleRange,"newVisibleRange",isLoading, isAtEnd);
      
      if (newVisibleRange.from < 10 && !isLoading && !isAtEnd) {
        console.log("----------------------------------------");
        const oldestCandle = candles[0];
        if (oldestCandle) {
          // We want data BEFORE the oldest candle we have
          const toDate = dayjs(oldestCandle.timestamp).subtract(1, 'minute').format("YYYY-MM-DD HH:mm");
          const newFromDate = dayjs(oldestCandle.timestamp).subtract(95, 'days').format("YYYY-MM-DD HH:mm");
          console.log(newFromDate, toDate,"newFromDate and toDate -------------------");
          
          setFromDate(newFromDate);
          setToDate(toDate);
          
          fetchCandleData(newFromDate, toDate);
        }
      }
    }, DEBOUNCE_DELAY);
  };

  chartInstance.current.timeScale().subscribeVisibleLogicalRangeChange(handleScroll);

  return () => {
    chartInstance.current?.timeScale().unsubscribeVisibleLogicalRangeChange(handleScroll);
    if (debounceTimer) clearTimeout(debounceTimer);
  };
}, [candles, isLoading, isAtEnd]);

  const getData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await server.get(`/asset/getAssetDeatils/${id}`);
      setAsset(res.data.asset);
    } catch (err: any) {
      setError("Failed to load asset details");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => { 
    if (!asset?.token) return;
    setLoadingOrders(true);
    try {
      const res = await server.get(`/asset/getorderbook/${asset?.token}`);
      setOrders(res.data?.data ?? []);
    } catch {
      setError("Failed to load order book");
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchCandleData = async (fromDate:string, toDate:string) => {
    console.log("fetching candle data");
    
    setIsLoading(true);
    if (!asset?.token) return;
    setLoadingCandleData(true);
    try {
      const res = await server.get(`/asset/getCandleData?symbol=${asset?.token}&exchange=${asset?.exch_seg}&fromDate=${encodeURIComponent(fromDate)}&toDate=${encodeURIComponent(toDate)}`);
      setCandles([...res.data.data,...candles])
      
    } catch {
      setError("Failed to load candle data");
      setCandles([]);
    } finally {
      setLoadingCandleData(false);
      setIsLoading(false);
      // setIsAtEnd(true);
    }
  };

  useEffect(() => {
    if (orderType === "Buy") {

    }
  }, [formData.type])

  useEffect(() => {
    getData();
    fetchOrders();
    
    // eslint-disable-next-line
  }, [id]);

  useEffect(() => {
    if (asset) {
      // Fetch the past 95 days of daily candles, up to the latest completed session (i.e., not today's in-progress candle)
      const now = dayjs();

      // End date should be yesterday's close if before market open, otherwise today's close (or the latest market close)
      let endDate: dayjs.Dayjs;

      const marketOpen = now.set('hour', 9).set('minute', 15).set('second', 0).set('millisecond', 0);
      const marketClose = now.set('hour', 15).set('minute', 15).set('second', 0).set('millisecond', 0);

      if (now.isBefore(marketOpen)) {
        // Before market opens, use yesterday's close
        endDate = now.subtract(1, 'day').set('hour', 15).set('minute', 15).set('second', 0).set('millisecond', 0);
      } else if (now.isAfter(marketClose)) {
        // After today's close, use today's close
        endDate = marketClose;
      } else {
        // During market session, use yesterday's close as last fully completed candle
        endDate = now.subtract(1, 'day').set('hour', 15).set('minute', 15).set('second', 0).set('millisecond', 0);
      }

      // Start date is 95 days before endDate at session open time
      const startDate = endDate.subtract(94, 'day').set('hour', 9).set('minute', 15).set('second', 0).set('millisecond', 0);

      const fromDate = startDate.format("YYYY-MM-DD HH:mm");
      const toDate = endDate.format("YYYY-MM-DD HH:mm");

      setFromDate(fromDate);
      setToDate(toDate);

      if (fromDate && toDate) {
        fetchCandleData(fromDate, toDate);
      }
    }
  }, [asset]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px] text-white">
        Loading...
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[300px] text-red-400">
        {error}
      </div>
    );
  }
  if (!asset) return null;

  // Use dummy image if asset.image is missing
  // const imageSrc = asset.image || "/window.jpeg";

  const handleBuyOrder = (type: string) => {
    setOrderType("Buy");
    setFormData((prev) => ({
      ...prev,
      type: type,
    }));
    setOpenModal(true);
  };

  const handleSellOrder = (type: string) => {
    setOrderType("Sell");
    setFormData((prev) => ({
      ...prev,
      type: type,
    }));
    setOpenModal(true);
  };
  return (
    <div className="flex flex-col md:flex-row min-h-[80vh] bg-neutral-950 w-full px-4 py-6 md:py-8 gap-6 md:gap-8 mt-16 md:mt-20 max-w-7xl mx-auto">
      {/* Left: Asset details + Order book */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Asset card */}
        <div className="flex flex-col items-center md:items-start bg-neutral-800/80 rounded-2xl p-6 md:p-8 border border-neutral-700/80 shadow-xl shadow-black/20 w-full">
        <div ref={chartContainerRef} style={{ width: '100%', height: '400px',minWidth: '500px', maxWidth: '1000px' }} />
        </div>

        {/* Order book */}
        <div className="w-full mt-5 flex-1 min-h-0 flex flex-col">
          {
            loadingOrders ? (
                  <div className="rounded-xl border border-neutral-700 bg-neutral-800 p-6 text-center text-neutral-400">
                    Loading order book…
                  </div>
            ) : (
              orders.length > 0 ? (
                <OrderBook orders={orders} />
              ) : (
                <div className="rounded-xl border border-neutral-700 bg-neutral-800 p-6 text-center text-neutral-400">
                  No orders
                </div>
              )
            )
          }
        </div>
      </div>

      {/* Right: Trade panel (sticky) */}
      <div className="w-full md:w-[480px] shrink-0 md:sticky md:top-24 md:self-start">
        <div className="bg-neutral-800/80 rounded-2xl border border-neutral-700/80 shadow-xl shadow-black/20 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-700/80">
            <h2 className="text-lg font-semibold text-white">Place order</h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Buy or sell Yes/No at current prices
            </p>
          </div>
          <div className="p-5 space-y-5">
            <Tab
              tabs={["Buy", "Sell"]}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="text"
                  label="Price (₹)"
                  value={formData.price || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*\.?\d*$/.test(value) || value === "") {
                      setFormData({
                        ...formData,
                        price: value === "" ? NaN : parseFloat(value),
                      });
                    }
                  }}
                  onWheel={(e) => e.currentTarget.blur()}
                  placeholder="0"
                  className="w-full"
                  required
                />
                <Input
                  type="text"
                  label="Quantity"
                  value={formData.qty || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*\.?\d*$/.test(value) || value === "") {
                      setFormData({
                        ...formData,
                        qty: value === "" ? NaN : parseFloat(value),
                      });
                    }
                  }}
                  placeholder="0"
                  className="w-full"
                  required
                />
              </div>
              <p className="text-xs text-neutral-500">
                Reference: ₹{asset?.maxPrice}
              </p>
            </div>

            {activeTab === "Buy" && (
              <div className="space-y-4 pt-1">
                <h3 className="text-sm font-medium text-neutral-400">
                  Place your bet (Buy)
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    label={`Yes ₹${asset?.buyPriceYes}`}
                    variant="primary"
                    className="w-full"
                    onClick={() => {
                      handleBuyOrder("yes");
                      setCurrentPrice(asset?.buyPriceYes);
                    }}
                  />
                  <Button
                    label={`No ₹${asset?.buyPriceNo}`}
                    variant="outlined"
                    className="w-full"
                    onClick={() => {
                      handleBuyOrder("no");
                      setCurrentPrice(asset?.buyPriceNo);
                    }}
                  />
                </div>
                <p className="text-xs text-neutral-500 text-center">
                  Will this reach max price?
                </p>
              </div>
            )}
            {activeTab === "Sell" && (
              <div className="space-y-4 pt-1">
                <h3 className="text-sm font-medium text-neutral-400">
                  Place your bet (Sell)
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    label={`Yes ₹${asset.sellPriceYes}`}
                    variant="primary"
                    className="w-full"
                    onClick={() => {
                      handleSellOrder("yes");
                      setCurrentPrice(asset.sellPriceYes);
                    }}
                  />
                  <Button
                    label={`No ₹${asset.sellPriceNo}`}
                    variant="outlined"
                    className="w-full"
                    onClick={() => {
                      handleSellOrder("no");
                      setCurrentPrice(asset.sellPriceNo);
                    }}
                  />
                </div>
                <p className="text-xs text-neutral-500 text-center">
                  Sell if it reaches max price?
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <OrderModal
      updateOrderBook={fetchOrders}
        open={openModal}
        setOpen={setOpenModal}
        orderType={orderType}
        formData={formData}
        setFormData={setFormData}
        currentPrice={currentPrice}
      />
    </div>
  );
};

export default AssetDetails;
