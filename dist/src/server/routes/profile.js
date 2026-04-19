"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const prisma_1 = require("../../lib/prisma");
const router = (0, express_1.Router)();
const updateProfileSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    bio: zod_1.z.string().max(500).optional(),
    goal: zod_1.z
        .enum(["STRENGTH", "POWERLIFTING", "BODYBUILDING", "ATHLETIC"])
        .optional(),
    bodyweight: zod_1.z.number().positive().optional(),
    unit: zod_1.z.enum(["KG", "LBS"]).optional(),
    image: zod_1.z.string().url().optional(),
});
// GET /api/profile/:id (public)
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const user = await prisma_1.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                image: true,
                goal: true,
                bio: true,
                createdAt: true,
            },
        });
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        // Get public stats
        const lifts = await prisma_1.prisma.lift.findMany({
            where: { userId: id },
        });
        const userNodes = await prisma_1.prisma.userNode.findMany({
            where: { userId: id, status: "COMPLETED" },
        });
        const achievements = await prisma_1.prisma.achievement.findMany({
            where: { userId: id },
        });
        // Calculate best lifts
        const bestLifts = {};
        for (const lift of lifts) {
            if (!bestLifts[lift.name] || lift.oneRM > bestLifts[lift.name]) {
                bestLifts[lift.name] = lift.oneRM;
            }
        }
        res.json(Object.assign(Object.assign({}, user), { bestLifts, nodesCompleted: userNodes.length, achievements }));
    }
    catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json({ error: "Failed to fetch profile" });
    }
});
// PATCH /api/profile (authenticated)
router.patch("/", async (req, res) => {
    try {
        const userId = req.user.userId;
        const data = updateProfileSchema.parse(req.body);
        const user = await prisma_1.prisma.user.update({
            where: { id: userId },
            data,
        });
        res.json(user);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({ error: "Invalid input", details: error.issues });
            return;
        }
        console.error("Update profile error:", error);
        res.status(500).json({ error: "Failed to update profile" });
    }
});
exports.default = router;
