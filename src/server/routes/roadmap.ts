import { Router } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { calculateWilksScore } from "../../lib/formulas";

const router = Router();

function criteriaSatisfied(
  criteria: { lift?: string; metric: string; value: number; type?: string },
  bestLifts: Record<string, number>,
  userUnit: "KG" | "LBS" | undefined,
  bodyweightKg: number,
  sbdTotal: number,
  wilksScore: number,
): boolean {
  if (criteria.type === "total" && criteria.metric === "sbd_total") {
    return sbdTotal >= criteria.value;
  }

  if (criteria.type === "wilks" && criteria.metric === "wilks_score") {
    return wilksScore >= criteria.value;
  }

  if (criteria.type === "dots" && criteria.metric === "dots_score") {
    return wilksScore >= criteria.value * 0.9;
  }

  if (criteria.lift && criteria.metric === "1rm_bw_ratio") {
    const lift1RM = bestLifts[criteria.lift] || 0;
    const liftKg = userUnit === "LBS" ? lift1RM / 2.20462 : lift1RM;
    const ratio = bodyweightKg > 0 ? liftKg / bodyweightKg : 0;
    return ratio >= criteria.value;
  }

  if (criteria.lift && criteria.metric === "1rm_absolute") {
    return (bestLifts[criteria.lift] || 0) >= criteria.value;
  }

  return false;
}

// GET /api/roadmap
router.get("/", async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // Get all nodes
    const nodes = await prisma.node.findMany({
      orderBy: [{ track: "asc" }, { level: "asc" }],
    });

    // Get user's node statuses
    const userNodes = await prisma.userNode.findMany({
      where: { userId },
    });

    const userNodeMap = new Map(userNodes.map((un) => [un.nodeId, un]));

    // Get user's best lifts
    const lifts = await prisma.lift.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    });

    // Calculate best 1RMs per lift
    const bestLifts: Record<string, number> = {};
    for (const lift of lifts) {
      if (!bestLifts[lift.name] || lift.oneRM > bestLifts[lift.name]) {
        bestLifts[lift.name] = lift.oneRM;
      }
    }

    // Get user info for bodyweight
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { bodyweight: true, unit: true },
    });

    const bodyweight = user?.bodyweight || 70;
    const bodyweightKg =
      user?.unit === "LBS" ? bodyweight / 2.20462 : bodyweight;

    // Calculate SBD total
    const sbdTotal =
      (bestLifts["squat"] || 0) +
      (bestLifts["bench"] || 0) +
      (bestLifts["deadlift"] || 0);

    const wilksScore = calculateWilksScore(sbdTotal, bodyweightKg);

    // Map nodes with status
    const nodesWithStatus = nodes.map((node) => {
      const userNode = userNodeMap.get(node.id);

      // Check if node should be active (dependencies met but not completed)
      const dependenciesMet =
        node.dependencies.length === 0 ||
        node.dependencies.every((depId) => {
          const depNode = userNodeMap.get(depId);
          return depNode?.status === "COMPLETED";
        });

      // Determine status
      let status = userNode?.status || "LOCKED";
      if (status === "LOCKED" && dependenciesMet) {
        status = "ACTIVE";
      }

      // Check if criteria are met
      const criteria = node.unlockCriteria as {
        lift?: string;
        metric: string;
        value: number;
        unit?: string;
        type?: string;
      };

      let criteriaMet = false;

      criteriaMet = criteriaSatisfied(
        criteria,
        bestLifts,
        user?.unit,
        bodyweightKg,
        sbdTotal,
        wilksScore,
      );

      return {
        ...node,
        status,
        criteriaMet,
        unlockedAt: userNode?.unlockedAt,
        completedAt: userNode?.completedAt,
      };
    });

    res.json(nodesWithStatus);
  } catch (error) {
    console.error("Get roadmap error:", error);
    res.status(500).json({ error: "Failed to fetch roadmap" });
  }
});

// POST /api/roadmap/check-unlocks
router.post("/check-unlocks", async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // Get all nodes
    const nodes = await prisma.node.findMany({
      orderBy: [{ track: "asc" }, { level: "asc" }],
    });

    // Get user's current node statuses
    const userNodes = await prisma.userNode.findMany({
      where: { userId },
    });

    const userNodeMap = new Map(userNodes.map((un) => [un.nodeId, un]));

    // Get user's lifts
    const lifts = await prisma.lift.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    });

    // Calculate best 1RMs
    const bestLifts: Record<string, number> = {};
    for (const lift of lifts) {
      if (!bestLifts[lift.name] || lift.oneRM > bestLifts[lift.name]) {
        bestLifts[lift.name] = lift.oneRM;
      }
    }

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { bodyweight: true, unit: true },
    });

    const bodyweight = user?.bodyweight || 70;
    const bodyweightKg =
      user?.unit === "LBS" ? bodyweight / 2.20462 : bodyweight;

    const sbdTotal =
      (bestLifts["squat"] || 0) +
      (bestLifts["bench"] || 0) +
      (bestLifts["deadlift"] || 0);

    const wilksScore = calculateWilksScore(sbdTotal, bodyweightKg);

    const newlyUnlocked: string[] = [];
    const writes: Prisma.PrismaPromise<unknown>[] = [];

    for (const node of nodes) {
      const userNode = userNodeMap.get(node.id);
      if (userNode?.status === "COMPLETED") continue;

      // Check dependencies
      const dependenciesMet =
        node.dependencies.length === 0 ||
        node.dependencies.every((depId) => {
          const depNode = userNodeMap.get(depId);
          return depNode?.status === "COMPLETED";
        });

      if (!dependenciesMet) continue;

      // Check unlock criteria
      const criteria = node.unlockCriteria as {
        lift?: string;
        metric: string;
        value: number;
        type?: string;
      };

      let criteriaMet = false;

      criteriaMet = criteriaSatisfied(
        criteria,
        bestLifts,
        user?.unit,
        bodyweightKg,
        sbdTotal,
        wilksScore,
      );

      if (criteriaMet) {
        if (!userNode) {
          writes.push(
            prisma.userNode.create({
              data: {
                userId,
                nodeId: node.id,
                status: "ACTIVE",
                unlockedAt: new Date(),
              },
            }),
          );
          newlyUnlocked.push(node.id);
        } else if (userNode.status === "LOCKED") {
          writes.push(
            prisma.userNode.update({
              where: { id: userNode.id },
              data: {
                status: "ACTIVE",
                unlockedAt: userNode.unlockedAt ?? new Date(),
              },
            }),
          );
          newlyUnlocked.push(node.id);
        } else {
          // Leave ACTIVE/COMPLETED nodes unchanged during unlock checks.
        }
      } else if (!userNode && dependenciesMet) {
        // Node is active (dependencies met but criteria not)
        writes.push(
          prisma.userNode.create({
            data: {
              userId,
              nodeId: node.id,
              status: "ACTIVE",
              unlockedAt: new Date(),
            },
          }),
        );
      }
    }

    if (writes.length > 0) {
      await prisma.$transaction(writes);
    }

    // Check achievements
    const achievements = await checkAchievements(
      userId,
      bestLifts,
      newlyUnlocked.length,
    );

    res.json({
      newlyUnlocked,
      achievements: achievements.newAchievements,
    });
  } catch (error) {
    console.error("Check unlocks error:", error);
    res.status(500).json({ error: "Failed to check unlocks" });
  }
});

// POST /api/roadmap/complete-node
router.post("/complete-node", async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const nodeId = String(req.body?.nodeId ?? "").trim();
    if (!nodeId) {
      res.status(400).json({ error: "nodeId is required" });
      return;
    }

    const userNode = await prisma.userNode.findUnique({
      where: {
        userId_nodeId: {
          userId,
          nodeId,
        },
      },
    });

    if (!userNode || userNode.status === "LOCKED") {
      res.status(400).json({ error: "Node is locked or not unlocked yet" });
      return;
    }

    if (userNode.status === "COMPLETED") {
      res.json({ ok: true, alreadyCompleted: true });
      return;
    }

    const completed = await prisma.userNode.update({
      where: { id: userNode.id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
    });

    res.json({ ok: true, node: completed });
  } catch (error) {
    console.error("Complete node error:", error);
    res.status(500).json({ error: "Failed to complete node" });
  }
});

async function checkAchievements(
  userId: string,
  bestLifts: Record<string, number>,
  newlyUnlockedCount: number,
) {
  const existingAchievements = await prisma.achievement.findMany({
    where: { userId },
  });

  const existingTypes = new Set(existingAchievements.map((a) => a.type));
  const newAchievements: string[] = [];

  // First PR
  if (!existingTypes.has("first_pr") && Object.keys(bestLifts).length > 0) {
    await prisma.achievement.create({
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
    await prisma.achievement.create({
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

export default router;
