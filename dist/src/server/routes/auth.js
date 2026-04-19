"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const jwt_1 = require("../../lib/jwt");
const prisma_1 = require("../../lib/prisma");
const router = (0, express_1.Router)();
const sessionSyncSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    name: zod_1.z.string().trim().min(1).max(120).optional(),
    picture: zod_1.z.string().url().optional(),
    userId: zod_1.z.string().trim().min(1).max(64).optional(),
});
// POST /api/auth/session-sync
// Sync NextAuth session and issue app JWT
router.post("/session-sync", async (req, res) => {
    try {
        const parsed = sessionSyncSchema.safeParse(req.body);
        if (!parsed.success) {
            res
                .status(400)
                .json({ error: "Invalid input", details: parsed.error.issues });
            return;
        }
        const { email, name, picture, userId } = parsed.data;
        // Get or create user
        let user = await prisma_1.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            user = await prisma_1.prisma.user.create({
                data: Object.assign(Object.assign({}, (userId ? { id: userId } : {})), { email, name: name || email.split("@")[0], image: picture }),
            });
        }
        // Create JWT
        const token = await (0, jwt_1.createJWT)({
            userId: user.id,
            email: user.email,
            name: user.name,
        });
        res.json({ token, user });
    }
    catch (error) {
        console.error("Session sync error:", error);
        res.status(500).json({ error: "Failed to sync session" });
    }
});
exports.default = router;
