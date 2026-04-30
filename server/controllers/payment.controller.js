import Razorpay from "razorpay";
import crypto from "crypto";
import Product from "../models/product.model.js";
import Notification from "../models/notification.model.js";
import { env } from "../config/env.config.js";
import { getIO } from "../socket/index.js";
import { sendPaymentSuccessEmail } from "../services/email.service.js";

const instance = new Razorpay({
  key_id: env.razorpay_key_id,
  key_secret: env.razorpay_key_secret,
});

export const createOrder = async (req, res) => {
  try {
    const { auctionId } = req.body;
    const auction = await Product.findById(auctionId);

    if (!auction) return res.status(404).json({ message: "Auction not found" });
    if (!auction.isSold || !auction.winner)
      return res.status(400).json({ message: "Auction not yet finalized" });
    if (auction.winner.toString() !== req.user.id)
      return res.status(403).json({ message: "Only the winner can pay" });
    if (auction.paymentStatus === "paid")
      return res.status(400).json({ message: "Payment already completed" });

    // Validate keys
    if (!env.razorpay_key_id || env.razorpay_key_id === "rzp_test_mock") {
      console.error("Razorpay API keys are missing or set to mock in .env!");
      return res.status(500).json({ message: "Razorpay keys are missing in backend .env. Please configure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET." });
    }

    // Amount in paise
    const amount = auction.currentPrice * 100;

    const options = {
      amount,
      currency: "INR",
      receipt: `receipt_order_${auctionId}`,
    };

    const order = await instance.orders.create(options);
    console.log("Razorpay Order Created Successfully:", order.id);
    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Create Order Error:", error);
    res.status(500).json({ message: error.error?.description || "Failed to create payment order" });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      auctionId,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", env.razorpay_key_secret)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return res.status(400).json({ message: "Invalid payment signature!" });
    }

    const auction = await Product.findById(auctionId).populate("winner seller");
    auction.paymentStatus = "paid";
    auction.razorpay_order_id = razorpay_order_id;
    auction.razorpay_payment_id = razorpay_payment_id;
    await auction.save();

    await Notification.create({
      user: auction.seller._id,
      message: `Payment received for ${auction.itemName} from ${auction.winner.name}.`,
      type: "PAYMENT_SUCCESS",
      auctionId: auction._id,
    });

    if (auction.winner.email) {
      await sendPaymentSuccessEmail({
        to: auction.winner.email,
        auctionTitle: auction.itemName,
        amountPaid: auction.currentPrice,
      });
    }

    try {
      const io = getIO();
      // Notify seller
      io.to(auction.seller._id.toString()).emit("paymentSuccess", { auctionId: auction._id });
      // Notify buyer room or explicitly buyer
      io.to(auction.winner._id.toString()).emit("paymentSuccess", { auctionId: auction._id });
    } catch(e) {}

    res.status(200).json({ success: true, message: "Payment verified successfully" });
  } catch (error) {
    console.error("Verify Payment Error", error);
    res.status(500).json({ message: "Payment verification failed" });
  }
};
