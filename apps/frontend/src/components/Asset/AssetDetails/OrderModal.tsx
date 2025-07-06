import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { useParams, useRouter } from "next/navigation";
import { server } from "@/utlis/server";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";

interface OrderModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  orderType: "Buy" | "Sell";
  currentPrice: number;
  formData: { price: number; type: string; qty: number };
  setFormData: (formData: { price: number; type: string; qty: number }) => void;
}

const OrderModal: React.FC<OrderModalProps> = ({
  open,
  setOpen,
  orderType,
  currentPrice,

  formData,
  setFormData,
}) => {
  const { id } = useParams();
  const { data: session } = useSession();
  const route = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loading = toast.loading("Order Processing");
    console.log(currentPrice, ((formData.price || 0) / currentPrice) || 1);

    const data = {
      price: formData.price,
      type: formData.type,
      qty: ((formData.price || 0) / currentPrice || 1) || 1,
      assetId: id,
      method: orderType
    };
    console.log(data);

    try {
      if (!session || !session.user) {
        toast.dismiss(loading);
        toast.error("Log in first!", {
          autoClose: 2000,
        });
        route.push("/login");
        return;
      }
      const res = await server.post(`/transaction/placeorder/${id}`, data, {
        headers: {
          Authorization: `Bearer ${session?.user.token}`,
        },
      });
      if (res.data && res.data.success) {
        toast.dismiss(loading);
        toast.success(res.data.message, {
          autoClose: 2000
        })
      }
    } catch (error: any) {
      toast.dismiss(loading);
      toast.error(error?.response?.data?.message || error?.message || "somthing went wrong", {
        autoClose: 2000
      })
    }
    // Reset form
    setOpen(false);
    setFormData({
      type: orderType,
      price: NaN,
      qty: NaN,
    });
  };

  if (!open) return null;
  console.log(formData, currentPrice);

  return (
    <Modal onClose={() => setOpen(false)}>
      <div className="bg-neutral-800 rounded-xl shadow-2xl border border-neutral-700 min-w-md w-full max-w-xl p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-white">
            {orderType} {formData.type} Order
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-neutral-300 text-sm font-semibold mb-3">
              Price (₹)
            </label>
            <Input
              type="number"
              value={formData.price}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  price: parseFloat(e.target.value) || 0,
                  qty: (parseFloat(e.target.value) || 0) / currentPrice,
                })
              }
              placeholder="Enter price"
              className="w-full"
              required
              min="0"
              step="0.01"
            />
            {/* <p className="text-sm text-neutral-400 mt-2">
              Current price: ₹{asset.currentPrice}
            </p> */}
          </div>

          <div className="bg-neutral-700 rounded-xl p-6 mb-8 border border-neutral-600">
            <div className="flex justify-between text-neutral-300 mb-3">
              <span className="font-medium">Total Value:</span>
              <span className="font-bold text-white text-lg">
                ₹
                {formData.price?.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="flex justify-between text-neutral-300">
              <span className="font-medium">Quantity:</span>
              <span className="font-bold text-white capitalize">
                {formData.qty || 0}
              </span>
            </div>
            <div className="flex justify-between text-neutral-300">
              <span className="font-medium">Order Type:</span>
              <span className="font-bold text-white capitalize">
                {formData.type || "Not selected"}
              </span>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              label="Cancel"
              variant="outlined"
              onClick={() => setOpen(false)}
              className="flex-1 py-4 text-base font-semibold"
            />
            <Button
              type="submit"
              label={`Trade`}
              variant="primary"
              className="flex-1 py-4 text-base font-semibold"
            />
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default OrderModal;
