import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { authMiddleware } from "../middleware/auth";

const router = Router();

const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  bio: z.string().max(500).optional(),
  goal: z
    .enum(["STRENGTH", "POWERLIFTING", "BODYBUILDING", "ATHLETIC"])
    .optional(),
  bodyweight: z.number().positive().optional(),
  unit: z.enum(["KG", "LBS"]).optional(),
  image: z.string().url().optional(),
});

// GET /api/profile/:id (public)
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
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
    const lifts = await prisma.lift.findMany({
      where: { userId: id },
    });

    const userNodes = await prisma.userNode.findMany({
      where: { userId: id, status: "COMPLETED" },
    });

    const achievements = await prisma.achievement.findMany({
      where: { userId: id },
    });

    // Calculate best lifts
    const bestLifts: Record<string, number> = {};
    for (const lift of lifts) {
      if (!bestLifts[lift.name] || lift.oneRM > bestLifts[lift.name]) {
        bestLifts[lift.name] = lift.oneRM;
      }
    }

    res.json({
      ...user,
      bestLifts,
      nodesCompleted: userNodes.length,
      achievements,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// PATCH /api/profile (authenticated)
router.patch("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const data = updateProfileSchema.parse(req.body);

    const user = await prisma.user.update({
      where: { id: userId },
      data,
    });

    res.json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid input", details: error.issues });
      return;
    }
    console.error("Update profile error:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

export default router;
