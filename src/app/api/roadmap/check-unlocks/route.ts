import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  checkAchievements,
  criteriaSatisfied,
  getRoadmapUserMetrics,
} from "../shared";

export async function POST() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [nodes, userNodes, metrics] = await Promise.all([
      prisma.node.findMany({
        orderBy: [{ track: "asc" }, { level: "asc" }],
      }),
      prisma.userNode.findMany({ where: { userId } }),
      getRoadmapUserMetrics(userId),
    ]);

    const userNodeMap = new Map(
      userNodes.map((entry) => [entry.nodeId, entry]),
    );
    const newlyUnlocked: string[] = [];
    const writes: Prisma.PrismaPromise<unknown>[] = [];

    for (const node of nodes) {
      const userNode = userNodeMap.get(node.id);
      if (userNode?.status === "COMPLETED") {
        continue;
      }

      const dependenciesMet =
        node.dependencies.length === 0 ||
        node.dependencies.every((depId) => {
          const depNode = userNodeMap.get(depId);
          return depNode?.status === "COMPLETED";
        });

      if (!dependenciesMet) {
        continue;
      }

      const criteria = node.unlockCriteria as {
        lift?: string;
        metric: string;
        value: number;
        type?: string;
      };

      const criteriaMet = criteriaSatisfied(criteria, metrics);
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
        }
      } else if (!userNode && dependenciesMet) {
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

    const achievements = await checkAchievements(
      userId,
      metrics.bestLifts,
      newlyUnlocked.length,
    );

    return NextResponse.json({
      newlyUnlocked,
      achievements: achievements.newAchievements,
    });
  } catch (error) {
    console.error("Check unlocks error:", error);
    return NextResponse.json(
      { error: "Failed to check unlocks" },
      { status: 500 },
    );
  }
}
