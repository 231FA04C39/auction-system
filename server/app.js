import express from "express";
import compression from "compression";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
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
  
  const clientPath = path.resolve(__dirname, "../client/dist");
  
  app.get("/debug-fs", (req, res) => {
    try {
      const clientDir = fs.readdirSync(path.resolve(__dirname, "../client"));
      const distDir = fs.existsSync(clientPath) ? fs.readdirSync(clientPath) : "dist does not exist";
      const assetsDir = fs.existsSync(path.join(clientPath, "assets")) ? fs.readdirSync(path.join(clientPath, "assets")) : "assets does not exist";
      res.json({ clientDir, distDir, assetsDir, __dirname, cwd: process.cwd() });
    } catch (err) {
      res.status(500).json({ error: err.message, stack: err.stack });
    }
  });

  app.use(express.static(clientPath));

  app.use((req, res) => {
    res.sendFile(path.join(clientPath, "index.html"), (err) => {
      if (err) {
        res.status(500).send(`Server Error: ${err.message}. Looked for index.html at ${clientPath}. __dirname: ${__dirname}, cwd: ${process.cwd()}`);
      }
    });
  });
}

export default app; // Exporting default app for serverless deployment
