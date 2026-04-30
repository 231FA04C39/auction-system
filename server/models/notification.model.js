import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
    type: { type: String, required: true }, 
    isRead: { type: Boolean, default: false },
    auctionId: { type: mongoose.Schema.ObjectId, ref: "Product" },
  },
  { timestamps: true },
);

export default mongoose.model("Notification", notificationSchema);
