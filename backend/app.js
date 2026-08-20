import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();

// Security & Performance Middlewares
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(compression());

// Dynamic CORS allowing Localhost, Vercel preview domains, and configured CLIENT_ORIGIN
const allowedOrigins = (process.env.CLIENT_ORIGIN || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      // Allow local development origins
      if (
        origin.startsWith("http://localhost:") ||
        origin.startsWith("http://127.0.0.1:") ||
        origin.startsWith("https://localhost:")
      ) {
        return callback(null, true);
      }

      // Allow any Vercel domain (*.vercel.app)
      if (origin.endsWith(".vercel.app") || origin.includes("vercel.app")) {
        return callback(null, true);
      }

      // Allow explicitly configured client origins
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Fallback: in non-strict environments allow origin
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(cookieParser());

// Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === "/health" || req.path === "/api/health" || req.method === "OPTIONS",
});
app.use("/api", apiLimiter);

// Database middleware: ensures Mongoose connection is established for serverless invocations
app.use(async (req, res, next) => {
  // Allow health check and root without blocking on DB
  if (req.path === "/" || req.path === "/health" || req.path === "/api/health") {
    return next();
  }

  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }
    next();
  } catch (err) {
    console.error("Database connection error in middleware:", err.message);
    return res.status(503).json({
      message: "Database connection failed. Please ensure MONGO_URI is configured and MongoDB Atlas IP whitelist allows connections.",
      error: process.env.NODE_ENV === "production" ? undefined : err.message,
    });
  }
});

// Root & Health Checks
app.get("/", (req, res) => {
  res.json({
    message: "Learniee API is running",
    documentation: "/api/courses",
    dbState: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    dbState: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;