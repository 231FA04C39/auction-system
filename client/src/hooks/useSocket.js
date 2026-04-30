import { useEffect, useState, useRef } from "react";
import { connectSocket } from "../config/socket.js";
import toast from "react-hot-toast";

export const useSocket = (auctionId, currentUserId) => {
  const [activeUsers, setActiveUsers] = useState([]);
  const [liveAuction, setLiveAuction] = useState(null);
  const [socketError, setSocketError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const joinedRef = useRef(false);

  useEffect(() => {
    if (!auctionId) return;

    const socket = connectSocket();

    const handleConnect = () => {
      setIsConnected(true);
      if (!joinedRef.current) {
        socket.emit("auction:join", { auctionId });
        joinedRef.current = true;
      }
    };

    const handleUserJoined = ({ userName, userId, activeUsers: users }) => {
      setActiveUsers(users || []);
      // Only show toast for OTHER users joining, not yourself
      if (userName && userId !== currentUserId) {
        toast(`${userName} joined the auction`, { icon: "\uD83D\uDC4B" });
      }
    };

    const handleUserLeft = ({ userName, userId, activeUsers: users }) => {
      setActiveUsers(users || []);
      // Only show toast for OTHER users leaving
      if (userName && userId !== currentUserId) {
        toast(`${userName} left the auction`, { icon: "\uD83D\uDEAA" });
      }
    };

    const handleBidPlaced = ({ auction, bidderName, bidAmount, bidderId }) => {
      setLiveAuction(auction);
      // Only show "X placed a bid" for OTHER users, not yourself
      if (bidderName && bidderId !== currentUserId) {
        toast.success(`${bidderName} placed a bid of Rs ${bidAmount}`);
      }
    };

    const handleError = ({ message }) => {
      setSocketError(message);
      toast.error(message);
      setTimeout(() => setSocketError(null), 5000);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      joinedRef.current = false;
    };

    const handleConnectError = (err) => {
      console.error("Socket connect_error:", err.message);
      setIsConnected(false);
    };

    const handleAuctionEnded = ({ auction, winnerDetail }) => {
      setLiveAuction(auction);
      if (winnerDetail && winnerDetail._id === currentUserId) {
        toast.success(`🎉 You won the auction: ${auction.itemName}!`);
      } else if (winnerDetail) {
        toast.success(`Auction ended! Winner: ${winnerDetail.name}`);
      } else {
        toast("Auction ended with no bids.", { icon: "ℹ️" });
      }
    };

    const handlePaymentSuccess = ({ auctionId: paidAuctionId }) => {
      // Just re-fetching by setting liveAuction won't easily toggle paymentStatus unless we modify it 
      // locally or trigger a react-query refetch. Since we want an instant UI update:
      setLiveAuction((prev) => prev ? { ...prev, paymentStatus: 'paid' } : prev);
      toast.success("Payment Received!", { icon: "✅" });
    };

    socket.on("connect", handleConnect);
    socket.on("connect_error", handleConnectError);
    socket.on("auction:userJoined", handleUserJoined);
    socket.on("auction:userLeft", handleUserLeft);
    socket.on("auction:bidPlaced", handleBidPlaced);
    socket.on("auction:error", handleError);
    socket.on("auctionEnded", handleAuctionEnded);
    socket.on("paymentSuccess", handlePaymentSuccess);
    socket.on("disconnect", handleDisconnect);

    // If already connected (singleton reuse), join immediately
    if (socket.connected) {
      handleConnect();
    }

    return () => {
      if (socket.connected) {
        socket.emit("auction:leave", { auctionId });
      }
      socket.off("connect", handleConnect);
      socket.off("connect_error", handleConnectError);
      socket.off("auction:userJoined", handleUserJoined);
      socket.off("auction:userLeft", handleUserLeft);
      socket.off("auction:bidPlaced", handleBidPlaced);
      socket.off("auction:error", handleError);
      socket.off("auctionEnded", handleAuctionEnded);
      socket.off("paymentSuccess", handlePaymentSuccess);
      socket.off("disconnect", handleDisconnect);
      joinedRef.current = false;
    };
  }, [auctionId, currentUserId]);

  return { activeUsers, liveAuction, socketError, isConnected };
};
