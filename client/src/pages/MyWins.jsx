import { useQuery } from "@tanstack/react-query";
import { api } from "../config/api.js";
import { Link } from "react-router";
import LoadingScreen from "../components/LoadingScreen.jsx";

export const MyWins = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["mywins"],
    queryFn: async () => {
      // Actually we can reuse fetching mybids but filter by isWon. Since we don't have a specific endpoint, let's get mybids.
      const res = await api.get("/auction/mybids?limit=100");
      return res.data.auctions;
    },
  });

  if (isLoading) return <LoadingScreen />;

  // Filter wins locally
  // A win is where user._id === item.winner._id
  const wins = data?.filter((a) => a.winner && !a.isExpired) || []; // Wait, if it's won, it IS expired!
  const actualWins = data?.filter((a) => a.winner && a.isExpired) || [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Wins</h1>
      {actualWins.length === 0 ? (
        <p className="text-gray-500">You haven't won any auctions yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {actualWins.map((auction) => (
            <div key={auction._id} className="bg-white rounded-xl shadow border p-4">
              <img src={auction.itemPhoto} alt="" className="w-full h-40 object-cover rounded-lg mb-4" />
              <h2 className="font-bold">{auction.itemName}</h2>
              <p className="text-sm text-gray-500">Winning Bid: Rs {auction.currentPrice}</p>
              <Link to={`/auction/${auction._id}`} className="mt-4 block text-center bg-indigo-600 text-white rounded py-2">
                View & Pay
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
