import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import crypto from "node:crypto";
import { prisma } from "../lib/prisma";
import { authMiddleware } from "./middleware/auth";
import liftsRouter from "./routes/lifts";
import roadmapRouter from "./routes/roadmap";
import leaderboardRouter from "./routes/leaderboard";
import profileRouter from "./routes/profile";
import aiRouter from "./routes/ai";
import authRouter from "./routes/auth";

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = (
  process.env.FRONTEND_URLS ||
  process.env.FRONTEND_URL ||
  "http://localhost:3001"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.set("trust proxy", 1);

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
  }),
);

// General rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(generalLimiter);

// Body parsing
app.use(express.json({ limit: "1mb" }));

app.use((req, res, next) => {
  const requestId =
    req.headers["x-request-id"]?.toString() || crypto.randomUUID();
  res.setHeader("x-request-id", requestId);
  next();
});

// Public routes
app.use("/api/auth", authRouter);

// Protected routes
app.use("/api/lifts", authMiddleware, liftsRouter);
app.use("/api/roadmap", authMiddleware, roadmapRouter);
app.use("/api/leaderboard", leaderboardRouter); // Public
app.use("/api/profile", profileRouter);
app.use("/api/ai", authMiddleware, aiRouter);

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    uptimeSec: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

app.get("/health/ready", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ready", timestamp: new Date().toISOString() });
  } catch {
    res
      .status(503)
      .json({ status: "not_ready", timestamp: new Date().toISOString() });
  }
});

// Error handling
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    void req;
    void next;
    console.error("Server error:", err);
    res.status(500).json({ error: "Internal server error" });
  },
);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Express server running on port ${PORT}`);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, shutting down gracefully");
  await prisma.$disconnect();
  process.exit(0);
});

export default app;
