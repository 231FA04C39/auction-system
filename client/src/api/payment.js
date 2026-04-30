import { api } from "../config/api.js";

export const createOrder = async (auctionId) => {
  const res = await api.post("/payment/create-order", { auctionId });
  return res.data;
};

export const verifyPayment = async (data) => {
  const res = await api.post("/payment/verify", data);
  return res.data;
};
