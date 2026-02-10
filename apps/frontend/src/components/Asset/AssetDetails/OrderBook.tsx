"use client";

import { server } from "@/utlis/server";
import { useEffect, useState } from "react";

export interface OrderBookEntry {
  id: string;
  type: string;
  qty: number;
  price: number;
  method: string;
  executed: boolean;
  createdAt: string;
}

interface OrderBookProps {
  assetId: string;
}

const OrderBook = ({ assetId }: OrderBookProps) => {
  const [orders, setOrders] = useState<OrderBookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!assetId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await server.get(`/asset/getorderbook/${assetId}`);
        setOrders(res.data?.data ?? []);
      } catch {
        setError("Failed to load order book");
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [assetId]);

  const buyOrders = orders.filter((o) => o.method?.toLowerCase() === "buy");
  const sellOrders = orders.filter((o) => o.method?.toLowerCase() === "sell");

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
      <div className="rounded-lg border border-neutral-700 overflow-hidden bg-neutral-900/80 max-h-52 overflow-y-auto">
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
                  <td className="py-2 px-3">{order.qty}</td>
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

  if (loading) {
    return (
      <div className="rounded-xl border border-neutral-700 bg-neutral-800 p-6 text-center text-neutral-400">
        Loading order book…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-neutral-700 bg-neutral-800 p-6 text-center text-rose-400">
        {error}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-neutral-700 bg-neutral-800 shadow-lg overflow-hidden flex flex-col h-full min-h-0">
      <div className="px-4 py-3 border-b border-neutral-700 bg-neutral-800/90 shrink-0">
        <h2 className="text-lg font-semibold text-white">Order Book</h2>
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
