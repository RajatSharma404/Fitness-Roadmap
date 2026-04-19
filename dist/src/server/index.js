"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const node_crypto_1 = __importDefault(require("node:crypto"));
const prisma_1 = require("../lib/prisma");
const jwt_1 = require("../lib/jwt");
const lifts_1 = __importDefault(require("./routes/lifts"));
const roadmap_1 = __importDefault(require("./routes/roadmap"));
const leaderboard_1 = __importDefault(require("./routes/leaderboard"));
const profile_1 = __importDefault(require("./routes/profile"));
const ai_1 = __importDefault(require("./routes/ai"));
const auth_1 = __importDefault(require("./routes/auth"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
const allowedOrigins = (process.env.FRONTEND_URLS ||
    process.env.FRONTEND_URL ||
    "http://localhost:3001")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
app.set("trust proxy", 1);
// Security middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
            return;
        }
        callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
}));
// General rate limiting
const generalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
});
app.use(generalLimiter);
// Body parsing
app.use(express_1.default.json({ limit: "1mb" }));
app.use((req, res, next) => {
    var _a;
    const requestId = ((_a = req.headers["x-request-id"]) === null || _a === void 0 ? void 0 : _a.toString()) || node_crypto_1.default.randomUUID();
    res.setHeader("x-request-id", requestId);
    next();
});
// JWT middleware
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!(authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith("Bearer "))) {
            res.status(401).json({ error: "No token provided" });
            return;
        }
        const token = authHeader.substring(7);
        const payload = await (0, jwt_1.verifyJWT)(token);
        if (!payload) {
            res.status(401).json({ error: "Invalid token" });
            return;
        }
        req.user = payload;
        next();
    }
    catch (_a) {
        res.status(401).json({ error: "Authentication failed" });
    }
};
exports.authMiddleware = authMiddleware;
// Public routes
app.use("/api/auth", auth_1.default);
// Protected routes
app.use("/api/lifts", exports.authMiddleware, lifts_1.default);
app.use("/api/roadmap", exports.authMiddleware, roadmap_1.default);
app.use("/api/leaderboard", leaderboard_1.default); // Public
app.use("/api/profile", exports.authMiddleware, profile_1.default);
app.use("/api/ai", exports.authMiddleware, ai_1.default);
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
        await prisma_1.prisma.$queryRaw `SELECT 1`;
        res.json({ status: "ready", timestamp: new Date().toISOString() });
    }
    catch (_a) {
        res
            .status(503)
            .json({ status: "not_ready", timestamp: new Date().toISOString() });
    }
});
// Error handling
app.use((err, req, res, next) => {
    void req;
    void next;
    console.error("Server error:", err);
    res.status(500).json({ error: "Internal server error" });
});
// Start server
app.listen(PORT, () => {
    console.log(`🚀 Express server running on port ${PORT}`);
});
// Graceful shutdown
process.on("SIGTERM", async () => {
    console.log("SIGTERM received, shutting down gracefully");
    await prisma_1.prisma.$disconnect();
    process.exit(0);
});
process.on("SIGINT", async () => {
    console.log("SIGINT received, shutting down gracefully");
    await prisma_1.prisma.$disconnect();
    process.exit(0);
});
exports.default = app;
