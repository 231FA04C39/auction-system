import express from "express";
import { secureRoute } from "../middleware/auth.middleware.js";
import { getNotifications, markAsRead } from "../controllers/notification.controller.js";

const notificationRoutes = express.Router();
notificationRoutes.use(secureRoute);

notificationRoutes.get("/", getNotifications);
notificationRoutes.patch("/:id/read", markAsRead);

export default notificationRoutes;
