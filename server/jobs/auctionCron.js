import cron from "node-cron";
import Product from "../models/product.model.js";
import Notification from "../models/notification.model.js";
import { getIO } from "../socket/index.js";
import { sendWinnerEmail } from "../services/email.service.js";

// Run every minute
export const startAuctionCron = () => {
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();
      // find auctions that ended, aren't sold, and have no winner yet
      const expiredAuctions = await Product.find({
        itemEndDate: { $lt: now },
        isSold: false,
        winner: null,
      }).populate("bids.bidder");

      for (let auction of expiredAuctions) {
        if (auction.bids && auction.bids.length > 0) {
          const sortedBids = [...auction.bids].sort((a, b) => b.bidAmount - a.bidAmount);
          const highestBid = sortedBids[0];
          
          auction.winner = highestBid.bidder._id;
          auction.isSold = true;
          auction.paymentStatus = "pending";
          auction.paymentDeadline = new Date(now.getTime() + 24 * 60 * 60 * 1000);
          await auction.save();

          // Save notification
          await Notification.create({
            user: highestBid.bidder._id,
            message: `You won the auction: ${auction.itemName}!`,
            type: "WINNER",
            auctionId: auction._id,
          });

          // Send Email
          if (highestBid.bidder.email) {
            await sendWinnerEmail({
              to: highestBid.bidder.email,
              auctionTitle: auction.itemName,
              bidAmount: auction.currentPrice,
              paymentLink: `http://localhost:5173/auction/${auction._id}`
            });
          }

          // Emit Socket Event
          try {
            const io = getIO();
            io.to(auction._id.toString()).emit("auctionEnded", {
              auction,
              winnerDetail: highestBid.bidder
            });
          } catch(e) {}
        } else {
          // Ended with no bids
          auction.isSold = true;
          await auction.save();
          try {
            const io = getIO();
            io.to(auction._id.toString()).emit("auctionEnded", {
              auction,
              winnerDetail: null
            });
          } catch(e) {}
        }
      }
      // Check for unpaid deadlines
      const unpaidAuctions = await Product.find({
        paymentStatus: "pending",
        paymentDeadline: { $lte: now },
        winner: { $ne: null }
      }).populate("bids.bidder");

      for (let auction of unpaidAuctions) {
        // Cancel the current winner
        await Notification.create({
          user: auction.winner,
          message: `Your winning for ${auction.itemName} was cancelled due to unpaid invoice.`,
          type: "PAYMENT_FAILED",
          auctionId: auction._id,
        });

        // Find next highest bidder
        const sortedBids = [...auction.bids].sort((a, b) => b.bidAmount - a.bidAmount);
        const currentIndex = sortedBids.findIndex(b => b.bidder._id.toString() === auction.winner.toString());
        
        let foundNextWinner = false;
        if (currentIndex !== -1 && currentIndex + 1 < sortedBids.length) {
          const nextBid = sortedBids[currentIndex + 1];
          auction.winner = nextBid.bidder._id;
          auction.currentPrice = nextBid.bidAmount; // Drop price to their bid
          auction.paymentDeadline = new Date(now.getTime() + 24 * 60 * 60 * 1000);
          auction.paymentStatus = "pending";
          
          await Notification.create({
            user: nextBid.bidder._id,
            message: `You are the new winner for ${auction.itemName}! Please complete payment.`,
            type: "WINNER",
            auctionId: auction._id,
          });

          if (nextBid.bidder.email) {
            await sendWinnerEmail({
              to: nextBid.bidder.email,
              auctionTitle: auction.itemName,
              bidAmount: nextBid.bidAmount,
              paymentLink: `http://localhost:5173/auction/${auction._id}`
            });
          }
          foundNextWinner = true;
        }

        if (!foundNextWinner) {
          // No more bidders
          auction.winner = null;
          auction.isSold = false; // Relist logic or just keep marked as ended but unsold
          auction.paymentStatus = "failed";
          auction.itemEndDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Relist for 24h as a bonus
        }
        
        await auction.save();
      }
    } catch (err) {
      console.error("Auction cron error:", err);
    }
  });
};
