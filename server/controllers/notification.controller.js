import Notification from "../models/notification.model.js";

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(20);
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Error fetching notifications" });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndUpdate(id, { isRead: true });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "Failed to mark as read" });
  }
};
