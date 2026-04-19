"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../../lib/prisma");
const formulas_1 = require("../../lib/formulas");
const router = (0, express_1.Router)();
// GET /api/leaderboard
router.get("/", async (req, res) => {
    try {
        const { period = "all" } = req.query;
        // Get all users with their lifts
        const users = await prisma_1.prisma.user.findMany({
            include: {
                lifts: {
                    orderBy: { date: "desc" },
                },
                userNodes: {
                    where: { status: "COMPLETED" },
                },
            },
        });
        // Calculate Wilks scores and rankings
        const leaderboard = users.map((user) => {
            // Get best lifts
            const bestLifts = {};
            for (const lift of user.lifts) {
                if (!bestLifts[lift.name] || lift.oneRM > bestLifts[lift.name]) {
                    bestLifts[lift.name] = lift.oneRM;
                }
            }
            // Calculate SBD total (convert to kg if needed)
            let squat = bestLifts["squat"] || 0;
            let bench = bestLifts["bench"] || 0;
            let deadlift = bestLifts["deadlift"] || 0;
            if (user.unit === "LBS") {
                squat = squat / 2.20462;
                bench = bench / 2.20462;
                deadlift = deadlift / 2.20462;
            }
            const sbdTotal = squat + bench + deadlift;
            const bodyweightKg = user.unit === "LBS" && user.bodyweight
                ? user.bodyweight / 2.20462
                : user.bodyweight || 70;
            const wilksScore = (0, formulas_1.calculateWilksScore)(sbdTotal, bodyweightKg);
            // Get top lift
            const topLift = Object.entries(bestLifts).sort((a, b) => b[1] - a[1])[0];
            return {
                id: user.id,
                name: user.name,
                image: user.image,
                goal: user.goal,
                topLift: topLift ? { name: topLift[0], weight: topLift[1] } : null,
                nodesCompleted: user.userNodes.length,
                wilksScore: Math.round(wilksScore * 100) / 100,
                total: sbdTotal,
                bodyweight: bodyweightKg,
            };
        });
        // Sort by Wilks score descending
        leaderboard.sort((a, b) => b.wilksScore - a.wilksScore);
        // Add ranks
        const ranked = leaderboard.map((entry, index) => (Object.assign(Object.assign({}, entry), { rank: index + 1 })));
        res.json(ranked);
    }
    catch (error) {
        console.error("Get leaderboard error:", error);
        res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
});
exports.default = router;
