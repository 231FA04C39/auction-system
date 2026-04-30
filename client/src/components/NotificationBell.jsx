import { useState, useRef, useEffect } from "react";
import { MdNotifications } from "react-icons/md";
import { Link } from "react-router";
import { useNotifications, useMarkAsRead } from "../hooks/useNotification.js";

export const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: notifications = [] } = useNotifications();
  const { mutate: markRead } = useMarkAsRead();
  const dropdownRef = useRef();

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = (id, auctionId) => {
    markRead(id);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition relative cursor-pointer"
      >
        <MdNotifications className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="p-3 border-b border-gray-100 bg-gray-50 font-semibold text-sm text-gray-700">
            Notifications ({unreadCount} unread)
          </div>
          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">No notifications</div>
            ) : (
              notifications.map((n) => (
                <Link
                  key={n._id}
                  to={n.auctionId ? `/auction/${n.auctionId}` : "#"}
                  onClick={() => handleNotificationClick(n._id, n.auctionId)}
                  className={`block p-4 border-b border-gray-50 transition ${n.isRead ? 'bg-white' : 'bg-indigo-50/30'}`}
                >
                  <p className={`text-sm ${!n.isRead ? 'font-bold' : 'text-gray-600'}`}>{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
