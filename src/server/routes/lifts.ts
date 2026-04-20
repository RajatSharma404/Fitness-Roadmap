import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { calculateEpley1RM } from "../../lib/formulas";

const router = Router();

const liftSchema = z.object({
  name: z.string().min(1),
  weight: z.number().positive(),
  reps: z.number().int().positive(),
  setType: z.enum(["WORKING", "MAX_EFFORT", "COMPETITION"]).default("WORKING"),
  date: z.string().datetime().optional(),
  notes: z.string().optional(),
  videoUrl: z.string().url().optional(),
});

// GET /api/lifts
router.get("/", async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { lift, limit = "50" } = req.query;

    const lifts = await prisma.lift.findMany({
      where: {
        userId,
        ...(lift && { name: lift as string }),
      },
      orderBy: { date: "desc" },
      take: parseInt(limit as string),
    });

    res.json(lifts);
  } catch (error) {
    console.error("Get lifts error:", error);
    res.status(500).json({ error: "Failed to fetch lifts" });
  }
});

// POST /api/lifts
router.post("/", async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const data = liftSchema.parse(req.body);

    // Calculate 1RM using Epley formula
    const oneRM = calculateEpley1RM(data.weight, data.reps);

    const lift = await prisma.lift.create({
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
  } catch (error) {
    if (error instanceof z.ZodError) {
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
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // Get all lifts for the user
    const lifts = await prisma.lift.findMany({
      where: { userId },
      orderBy: { date: "asc" },
    });

    // Calculate stats per lift
    const stats: Record<
      string,
      { max1RM: number; maxWeight: number; count: number }
    > = {};

    for (const lift of lifts) {
      if (!stats[lift.name]) {
        stats[lift.name] = { max1RM: 0, maxWeight: 0, count: 0 };
      }
      stats[lift.name].max1RM = Math.max(stats[lift.name].max1RM, lift.oneRM);
      stats[lift.name].maxWeight = Math.max(
        stats[lift.name].maxWeight,
        lift.weight,
      );
      stats[lift.name].count++;
    }

    res.json(stats);
  } catch (error) {
    console.error("Get lift stats error:", error);
    res.status(500).json({ error: "Failed to fetch lift stats" });
  }
});

export default router;
