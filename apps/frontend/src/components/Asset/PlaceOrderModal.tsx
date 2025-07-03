"use client";
import React, { useEffect, useRef, useState } from "react";
import Modal from "../ui/Modal";
import useModal from "@/hooks/useModal";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { ErrorLabel } from "../ui/ErrorLabel";
import { server } from "@/utlis/server";
import { useSession } from "next-auth/react";

const PlaceOrderModal = ({
  type,
  open,
  setOpenModal,
  assetId,
}: {
  type: string;
  open: boolean;
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
  assetId: string;
}) => {
  const { ref, onOpen, onClose } = useModal();
  const { data: session } = useSession();
  const [amount, setAmount] = useState<Number>();
  const [qty, setQty] = useState<Number>();
  const [requiredError, setRequiredError] = useState({
    amountReq: false,
    qtyReq: false,
  });

  useEffect(() => {
    if (open) {
      onOpen();
    } else {
      onClose();
    }
  }, [open, onOpen]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(Number(e.target.value));

    setRequiredError((prev) => ({
      ...prev,
      amountReq: false,
    }));
  };

  const handleChangeQyt = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQty(Number(e.target.value));
    setRequiredError((prev) => ({
      ...prev,
      qtyReq: false,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!amount) {
      setRequiredError((prev) => ({
        ...prev,
        amountReq: true,
      }));
    }
    if (!qty) {
      setRequiredError((prev) => ({
        ...prev,
        qtyReq: true,
      }));
    }

    const data = {
      price: amount,
      qty,
      type,
    };
    if (!session?.user) return;
    const placeOrder = await server.post(`/asset/placeorder/${assetId}`, data, {
      headers: {
        Authorization: `Bearer ${session.user.token}`,
      },
    });
    console.log(placeOrder, "place order");
  };

  return (
    <Modal ref={ref} onClose={() => setOpenModal(false)}>
      <div className="w-full p-6 px-10 h-full min-h-[40vh] justify-center items-center flex">
        <div className="flex flex-col gap-5 justify-center items-center">
          <h3>Put {type} Order</h3>

          <div className="w-full">
            <Input
              type="number"
              label="Amount"
              placeholder="Enter Amount"
              className="bg-neutral-800"
              value={Number(amount)}
              onChange={handleAmountChange}
            />
            {requiredError.amountReq && (
              <ErrorLabel message="Amount is Required" />
            )}
            <Input
              type="number"
              label="Quantity"
              placeholder="Enter Quantity"
              className="bg-neutral-800"
              value={Number(qty)}
              onChange={handleChangeQyt}
            />
            {requiredError.qtyReq && (
              <ErrorLabel message="Quantity is Required" />
            )}
            <Button
              label="Buy"
              variant="outlined"
              size="lg"
              className="by-2 px-4 mt-4 w-full bg-neutral-300 text-black"
              onClick={handleSubmit}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PlaceOrderModal;
