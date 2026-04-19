"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const prisma_1 = require("../../lib/prisma");
const formulas_1 = require("../../lib/formulas");
const router = (0, express_1.Router)();
const liftSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    weight: zod_1.z.number().positive(),
    reps: zod_1.z.number().int().positive(),
    setType: zod_1.z.enum(["WORKING", "MAX_EFFORT", "COMPETITION"]).default("WORKING"),
    date: zod_1.z.string().datetime().optional(),
    notes: zod_1.z.string().optional(),
    videoUrl: zod_1.z.string().url().optional(),
});
// GET /api/lifts
router.get("/", async (req, res) => {
    try {
        const userId = req.user.userId;
        const { lift, limit = "50" } = req.query;
        const lifts = await prisma_1.prisma.lift.findMany({
            where: Object.assign({ userId }, (lift && { name: lift })),
            orderBy: { date: "desc" },
            take: parseInt(limit),
        });
        res.json(lifts);
    }
    catch (error) {
        console.error("Get lifts error:", error);
        res.status(500).json({ error: "Failed to fetch lifts" });
    }
});
// POST /api/lifts
router.post("/", async (req, res) => {
    try {
        const userId = req.user.userId;
        const data = liftSchema.parse(req.body);
        // Calculate 1RM using Epley formula
        const oneRM = (0, formulas_1.calculateEpley1RM)(data.weight, data.reps);
        const lift = await prisma_1.prisma.lift.create({
            data: {
                userId,
                name: data.name,
                weight: data.weight,
                reps: data.reps,
                oneRM,
                setType: data.setType,
                date: data.date ? new Date(data.date) : new Date(),
                notes: data.notes,
                videoUrl: data.videoUrl,
            },
        });
        res.json(lift);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({ error: "Invalid input", details: error.issues });
            return;
        }
        console.error("Create lift error:", error);
        res.status(500).json({ error: "Failed to create lift" });
    }
});
// GET /api/lifts/stats
router.get("/stats", async (req, res) => {
    try {
        const userId = req.user.userId;
        // Get all lifts for the user
        const lifts = await prisma_1.prisma.lift.findMany({
            where: { userId },
            orderBy: { date: "asc" },
        });
        // Calculate stats per lift
        const stats = {};
        for (const lift of lifts) {
            if (!stats[lift.name]) {
                stats[lift.name] = { max1RM: 0, maxWeight: 0, count: 0 };
            }
            stats[lift.name].max1RM = Math.max(stats[lift.name].max1RM, lift.oneRM);
            stats[lift.name].maxWeight = Math.max(stats[lift.name].maxWeight, lift.weight);
            stats[lift.name].count++;
        }
        res.json(stats);
    }
    catch (error) {
        console.error("Get lift stats error:", error);
        res.status(500).json({ error: "Failed to fetch lift stats" });
    }
});
exports.default = router;
