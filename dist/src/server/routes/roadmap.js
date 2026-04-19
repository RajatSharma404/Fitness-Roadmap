"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../../lib/prisma");
const formulas_1 = require("../../lib/formulas");
const router = (0, express_1.Router)();
// GET /api/roadmap
router.get("/", async (req, res) => {
    try {
        const userId = req.user.userId;
        // Get all nodes
        const nodes = await prisma_1.prisma.node.findMany({
            orderBy: [{ track: "asc" }, { level: "asc" }],
        });
        // Get user's node statuses
        const userNodes = await prisma_1.prisma.userNode.findMany({
            where: { userId },
        });
        const userNodeMap = new Map(userNodes.map((un) => [un.nodeId, un]));
        // Get user's best lifts
        const lifts = await prisma_1.prisma.lift.findMany({
            where: { userId },
            orderBy: { date: "desc" },
        });
        // Calculate best 1RMs per lift
        const bestLifts = {};
        for (const lift of lifts) {
            if (!bestLifts[lift.name] || lift.oneRM > bestLifts[lift.name]) {
                bestLifts[lift.name] = lift.oneRM;
            }
        }
        // Get user info for bodyweight
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
            select: { bodyweight: true, unit: true },
        });
        const bodyweight = (user === null || user === void 0 ? void 0 : user.bodyweight) || 70;
        const bodyweightKg = (user === null || user === void 0 ? void 0 : user.unit) === "LBS" ? bodyweight / 2.20462 : bodyweight;
        // Calculate SBD total
        const sbdTotal = (bestLifts["squat"] || 0) +
            (bestLifts["bench"] || 0) +
            (bestLifts["deadlift"] || 0);
        const wilksScore = (0, formulas_1.calculateWilksScore)(sbdTotal, bodyweightKg);
        // Map nodes with status
        const nodesWithStatus = nodes.map((node) => {
            const userNode = userNodeMap.get(node.id);
            // Check if node should be active (dependencies met but not completed)
            const dependenciesMet = node.dependencies.length === 0 ||
                node.dependencies.every((depId) => {
                    const depNode = userNodeMap.get(depId);
                    return (depNode === null || depNode === void 0 ? void 0 : depNode.status) === "COMPLETED";
                });
            // Determine status
            let status = (userNode === null || userNode === void 0 ? void 0 : userNode.status) || "LOCKED";
            if (status === "LOCKED" && dependenciesMet) {
                status = "ACTIVE";
            }
            // Check if criteria are met
            const criteria = node.unlockCriteria;
            let criteriaMet = false;
            if (criteria.type === "total" && criteria.metric === "sbd_total") {
                criteriaMet = sbdTotal >= criteria.value;
            }
            else if (criteria.type === "wilks" &&
                criteria.metric === "wilks_score") {
                criteriaMet = wilksScore >= criteria.value;
            }
            else if (criteria.type === "dots" && criteria.metric === "dots_score") {
                // Simplified dots check
                criteriaMet = wilksScore >= criteria.value * 0.9; // Approximate
            }
            else if (criteria.lift && criteria.metric === "1rm_bw_ratio") {
                const lift1RM = bestLifts[criteria.lift] || 0;
                const liftKg = (user === null || user === void 0 ? void 0 : user.unit) === "LBS" ? lift1RM / 2.20462 : lift1RM;
                const ratio = bodyweightKg > 0 ? liftKg / bodyweightKg : 0;
                criteriaMet = ratio >= criteria.value;
            }
            else if (criteria.lift && criteria.metric === "1rm_absolute") {
                const lift1RM = bestLifts[criteria.lift] || 0;
                criteriaMet = lift1RM >= criteria.value;
            }
            return Object.assign(Object.assign({}, node), { status,
                criteriaMet, unlockedAt: userNode === null || userNode === void 0 ? void 0 : userNode.unlockedAt, completedAt: userNode === null || userNode === void 0 ? void 0 : userNode.completedAt });
        });
        res.json(nodesWithStatus);
    }
    catch (error) {
        console.error("Get roadmap error:", error);
        res.status(500).json({ error: "Failed to fetch roadmap" });
    }
});
// POST /api/roadmap/check-unlocks
router.post("/check-unlocks", async (req, res) => {
    try {
        const userId = req.user.userId;
        // Get all nodes
        const nodes = await prisma_1.prisma.node.findMany({
            orderBy: [{ track: "asc" }, { level: "asc" }],
        });
        // Get user's current node statuses
        const userNodes = await prisma_1.prisma.userNode.findMany({
            where: { userId },
        });
        const userNodeMap = new Map(userNodes.map((un) => [un.nodeId, un]));
        // Get user's lifts
        const lifts = await prisma_1.prisma.lift.findMany({
            where: { userId },
            orderBy: { date: "desc" },
        });
        // Calculate best 1RMs
        const bestLifts = {};
        for (const lift of lifts) {
            if (!bestLifts[lift.name] || lift.oneRM > bestLifts[lift.name]) {
                bestLifts[lift.name] = lift.oneRM;
            }
        }
        // Get user info
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
            select: { bodyweight: true, unit: true },
        });
        const bodyweight = (user === null || user === void 0 ? void 0 : user.bodyweight) || 70;
        const bodyweightKg = (user === null || user === void 0 ? void 0 : user.unit) === "LBS" ? bodyweight / 2.20462 : bodyweight;
        const sbdTotal = (bestLifts["squat"] || 0) +
            (bestLifts["bench"] || 0) +
            (bestLifts["deadlift"] || 0);
        const wilksScore = (0, formulas_1.calculateWilksScore)(sbdTotal, bodyweightKg);
        const newlyUnlocked = [];
        const writes = [];
        for (const node of nodes) {
            const userNode = userNodeMap.get(node.id);
            if ((userNode === null || userNode === void 0 ? void 0 : userNode.status) === "COMPLETED")
                continue;
            // Check dependencies
            const dependenciesMet = node.dependencies.length === 0 ||
                node.dependencies.every((depId) => {
                    const depNode = userNodeMap.get(depId);
                    return (depNode === null || depNode === void 0 ? void 0 : depNode.status) === "COMPLETED";
                });
            if (!dependenciesMet)
                continue;
            // Check unlock criteria
            const criteria = node.unlockCriteria;
            let criteriaMet = false;
            if (criteria.type === "total" && criteria.metric === "sbd_total") {
                criteriaMet = sbdTotal >= criteria.value;
            }
            else if (criteria.type === "wilks" &&
                criteria.metric === "wilks_score") {
                criteriaMet = wilksScore >= criteria.value;
            }
            else if (criteria.type === "dots" && criteria.metric === "dots_score") {
                criteriaMet = wilksScore >= criteria.value * 0.9;
            }
            else if (criteria.lift && criteria.metric === "1rm_bw_ratio") {
                const lift1RM = bestLifts[criteria.lift] || 0;
                const liftKg = (user === null || user === void 0 ? void 0 : user.unit) === "LBS" ? lift1RM / 2.20462 : lift1RM;
                const ratio = bodyweightKg > 0 ? liftKg / bodyweightKg : 0;
                criteriaMet = ratio >= criteria.value;
            }
            else if (criteria.lift && criteria.metric === "1rm_absolute") {
                criteriaMet = (bestLifts[criteria.lift] || 0) >= criteria.value;
            }
            if (criteriaMet) {
                if (!userNode) {
                    writes.push(prisma_1.prisma.userNode.create({
                        data: {
                            userId,
                            nodeId: node.id,
                            status: "COMPLETED",
                            unlockedAt: new Date(),
                            completedAt: new Date(),
                        },
                    }));
                }
                else {
                    writes.push(prisma_1.prisma.userNode.update({
                        where: { id: userNode.id },
                        data: {
                            status: "COMPLETED",
                            completedAt: new Date(),
                        },
                    }));
                }
                newlyUnlocked.push(node.id);
            }
            else if (!userNode && dependenciesMet) {
                // Node is active (dependencies met but criteria not)
                writes.push(prisma_1.prisma.userNode.create({
                    data: {
                        userId,
                        nodeId: node.id,
                        status: "ACTIVE",
                        unlockedAt: new Date(),
                    },
                }));
            }
        }
        if (writes.length > 0) {
            await prisma_1.prisma.$transaction(writes);
        }
        // Check achievements
        const achievements = await checkAchievements(userId, bestLifts, newlyUnlocked.length);
        res.json({
            newlyUnlocked,
            achievements: achievements.newAchievements,
        });
    }
    catch (error) {
        console.error("Check unlocks error:", error);
        res.status(500).json({ error: "Failed to check unlocks" });
    }
});
async function checkAchievements(userId, bestLifts, newlyUnlockedCount) {
    const existingAchievements = await prisma_1.prisma.achievement.findMany({
        where: { userId },
    });
    const existingTypes = new Set(existingAchievements.map((a) => a.type));
    const newAchievements = [];
    // First PR
    if (!existingTypes.has("first_pr") && Object.keys(bestLifts).length > 0) {
        await prisma_1.prisma.achievement.create({
            data: {
                userId,
                type: "first_pr",
                label: "First PR",
            },
        });
        newAchievements.push("first_pr");
    }
    // First node
    if (!existingTypes.has("first_node") && newlyUnlockedCount > 0) {
        await prisma_1.prisma.achievement.create({
            data: {
                userId,
                type: "first_node",
                label: "First Node",
            },
        });
        newAchievements.push("first_node");
    }
    return { newAchievements };
}
exports.default = router;
