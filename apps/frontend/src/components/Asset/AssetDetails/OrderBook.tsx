"use client";

import { OrderBookEntry } from "./AssetDetails";

interface OrderBookProps {
  orders: OrderBookEntry[];
}

const OrderBook = ({ orders }: OrderBookProps) => {


  const ORDER_BOOK_LIMIT = 7;
  const buyOrders = orders
    .filter((o) => o.method?.toLowerCase() === "buy")
    .sort((a, b) => b.price - a.price)
    .slice(0, ORDER_BOOK_LIMIT);
  const sellOrders = orders
    .filter((o) => o.method?.toLowerCase() === "sell")
    .sort((a, b) => a.price - b.price)
    .slice(0, ORDER_BOOK_LIMIT);

  const TableSection = ({
    title,
    items,
    accent,
  }: {
    title: string;
    items: OrderBookEntry[];
    accent: "buy" | "sell";
  }) => (
    <div className="flex flex-col flex-1 min-w-0">
      <h3
        className={`text-sm font-semibold uppercase tracking-wider mb-2 ${
          accent === "buy" ? "text-emerald-400" : "text-rose-400"
        }`}
      >
        {title}
      </h3>
      <div className="rounded-lg border border-neutral-700 overflow-hidden bg-neutral-900/80">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-700 bg-neutral-800/90 text-neutral-400">
              <th className="py-2.5 px-3 font-medium">Type</th>
              <th className="py-2.5 px-3 font-medium">Price</th>
              <th className="py-2.5 px-3 font-medium">Qty</th>
              <th className="py-2.5 px-3 font-medium hidden sm:table-cell">Time</th>
            </tr>
          </thead>
          <tbody className="text-neutral-300">
            {items.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 px-3 text-center text-neutral-500">
                  No orders
                </td>
              </tr>
            ) : (
              items.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-neutral-800 last:border-0 hover:bg-neutral-800/50 transition-colors"
                >
                  <td className="py-2 px-3 font-medium capitalize">{order.type}</td>
                  <td className="py-2 px-3 text-white">₹{order.price}</td>
                  <td className="py-2 px-3">{order.remainingQty}</td>
                  <td className="py-2 px-3 hidden sm:table-cell text-neutral-500">
                    {new Date(order.createdAt).toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="rounded-xl border border-neutral-700 bg-neutral-800 shadow-lg overflow-hidden flex flex-col h-full min-h-0">
      <div className="px-4 py-3 border-b border-neutral-700 bg-neutral-800/90 shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Order Book</h2>
          <span className="text-[10px] uppercase tracking-wider text-neutral-500">
            Top 7
          </span>
        </div>
        <p className="text-xs text-neutral-400 mt-0.5">Live orders for this asset</p>
      </div>
      <div className="p-4 flex-1 min-h-0 overflow-auto">
        <div className="flex flex-col sm:flex-row gap-6 min-h-0">
          <TableSection title="Buy" items={buyOrders} accent="buy" />
          <TableSection title="Sell" items={sellOrders} accent="sell" />
        </div>
      </div>
    </div>
  );
};

export default OrderBook;
