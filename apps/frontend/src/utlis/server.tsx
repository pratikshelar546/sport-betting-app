import axios from "axios";

export const server = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1/",
    responseType: "json",
    headers: {
        "Content-Type": "application/json",
    },
});