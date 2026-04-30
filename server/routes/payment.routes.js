import express from "express";
import { secureRoute } from "../middleware/auth.middleware.js";
import { createOrder, verifyPayment } from "../controllers/payment.controller.js";

const paymentRoutes = express.Router();
paymentRoutes.use(secureRoute);

paymentRoutes.post("/create-order", createOrder);
paymentRoutes.post("/verify", verifyPayment);

export default paymentRoutes;
