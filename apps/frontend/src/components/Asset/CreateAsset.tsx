"use client";
import React, { useState } from "react";
import { toast } from "react-toastify";
// import { prismaClient } from "@repo/database/client"; // Not used here
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { DefaultSession } from "next-auth";
import { server } from "@/utlis/server";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      token: string;
    } & DefaultSession["user"];
  }
}

const CreateAsset = () => {
  const { data: session } = useSession();
  const route = useRouter();
  // console.log(session);
  const [formData, setFormData] = useState({
    title: "",
    maxPrice: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: field === "maxPrice" ? value.replace(/[^0-9.]/g, "") : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const loading = toast.loading("Creating asset...");

    try {
      if (!session || !session.user) {
        toast.dismiss(loading);
        toast.error("Log in first!", {
          autoClose: 2000,
        });
        route.push("/login");
        return;
      }
      // Validate fields
      if (!formData.title || !formData.maxPrice) {
        toast.dismiss(loading);
        toast.error("Please fill all required fields");
        return;
      }
      const data = {
        title: formData.title,
        maxPrice: Number(formData.maxPrice),
        userId: session.user.id,
      };
      // API call: POST with data in body, not as query params
      const res = await server.post("/asset/addasset", data, {
        headers: {
          Authorization: `Bearer ${session.user.token}`,
        },
      });
      toast.dismiss(loading);
      toast.success("Asset created successfully!", {
        autoClose: 2000,
      });
      // Optionally, redirect or reset form here
      route.push("/");
      setFormData({ title: "", maxPrice: "" });
    } catch (error: any) {
      toast.dismiss(loading);
      toast.error(
        error?.response?.data?.message ||
          error?.data?.message ||
          "Something went wrong",
        {
          autoClose: 2000,
        }
      );
      return null;
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] ">
      <form
        className="w-full max-w-2xl bg-transparent rounded-2xl shadow-xl p-8 flex flex-col gap-6"
        onSubmit={handleSubmit}
      >
        <h2 className="text-3xl font-extrabold text-neutral-100 mb-2 text-center">
          Create New Asset
        </h2>
        <div className="flex flex-col gap-2 w-full">
          <label
            className="block text-sm font-semibold text-neutral-100 mb-1"
            htmlFor="title"
          >
            Title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
            placeholder="Enter asset title"
          />
        </div>
        <div>
          <label
            className="block text-sm font-semibold text-neutral-100 mb-1"
            htmlFor="maxPrice"
          >
            Max Price <span className="text-red-500">*</span>
          </label>
          <input
            id="maxPrice"
            name="maxPrice"
            type="number"
            min={0}
            required
            value={formData.maxPrice}
            onChange={(e) => handleChange("maxPrice", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
            placeholder="Enter max price"
          />
        </div>
        {/* userId and orderBookId are handled in backend/session */}
        <button
          type="submit"
          className="mt-4 w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow transition"
        >
          Create Asset
        </button>
      </form>
    </div>
  );
};

export default CreateAsset;
