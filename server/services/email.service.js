import { Resend } from "resend";
import { env } from "../config/env.config.js";

const resend = new Resend(env.resend_api_key);

export const sendWinnerEmail = async ({ to, auctionTitle, bidAmount, paymentLink }) => {
  try {
    if (env.resend_api_key === "re_mock") {
      console.log("MOCK EMAIL SENT TO:", to, paymentLink);
      return;
    }
    
    await resend.emails.send({
      from: "Auction Platform <onboarding@resend.dev>",
      to,
      subject: "You Won the Auction 🎉",
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Congratulations!</h2>
          <p>You won the auction for <strong>${auctionTitle}</strong> with a winning bid of <strong>Rs ${bidAmount}</strong>.</p>
          <p>Please complete your payment within 24 hours to claim your item.</p>
          <a href="${paymentLink}" style="display:inline-block; padding: 10px 20px; background: #4f46e5; color:#fff; text-decoration:none; border-radius: 6px;">Pay Now</a>
        </div>
      `,
    });
  } catch (error) {
    console.error("Email error:", error);
  }
};
export const sendPaymentSuccessEmail = async ({ to, auctionTitle, amountPaid }) => {
  try {
    if (env.resend_api_key === "re_mock") {
      console.log("MOCK PAYMENT SUCCESS EMAIL SENT TO:", to);
      return;
    }
    
    await resend.emails.send({
      from: "Auction Platform <onboarding@resend.dev>",
      to,
      subject: "Payment Successful 🚀",
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Payment Confirmed!</h2>
          <p>We successfully received your payment of <strong>Rs ${amountPaid}</strong> for <strong>${auctionTitle}</strong>.</p>
          <p>The seller has been notified to proceed with shipping the item.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Email error:", error);
  }
};
