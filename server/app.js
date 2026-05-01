import express from "express";
import compression from "compression";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import { env } from "./config/env.config.js";
import {
  authRoutes,
  userRoutes,
  auctionRoutes,
  contactRoutes,
  adminRoutes,
  cloudinaryRoutes,
  paymentRoutes,
  notificationRoutes
} from "./routes/index.js";
import { connectDB } from "./config/db.config.js";
import cron from "node-cron";
import { cleanupUnusedUploads } from "./jobs/cleanupUploads.js";
import { startAuctionCron } from "./jobs/auctionCron.js";

export const app = express();

app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = env.origin ? env.origin.split(',') : [];
      if (!origin || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1') || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(compression());
app.use(express.json());

// DB connection for Vercel serveless deployment
if (process.env.VERCEL) {
  app.use(async (req, res, next) => {
    await connectDB();
    next();
  });
}

let isRunning = false;

// Daily cleanup cron job
cron.schedule("0 0 * * *", async () => { // Runs at midnight every day
  if (isRunning) return;

  isRunning = true;

  try {
    await cleanupUnusedUploads();
  } catch (err) {
    console.error(err);
  } finally {
    isRunning = false;
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/auction", auctionRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", cloudinaryRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/notifications", notificationRoutes);

if (process.env.NODE_ENV === "production") {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  
  app.use(express.static(path.join(__dirname, "../client/dist")));

  app.use((req, res) => {
    res.sendFile(path.resolve(__dirname, "../client/dist", "index.html"));
  });
}

export default app; // Exporting default app for serverless deployment
