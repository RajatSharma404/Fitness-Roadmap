import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { criteriaSatisfied, getRoadmapUserMetrics } from "./shared";

export async function GET() {
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

    const nodesWithStatus = nodes.map((node) => {
      const userNode = userNodeMap.get(node.id);
      const dependenciesMet =
        node.dependencies.length === 0 ||
        node.dependencies.every((depId) => {
          const depNode = userNodeMap.get(depId);
          return depNode?.status === "COMPLETED";
        });

      let status = userNode?.status || "LOCKED";
      if (status === "LOCKED" && dependenciesMet) {
        status = "ACTIVE";
      }

      const criteria = node.unlockCriteria as {
        lift?: string;
        metric: string;
        value: number;
        unit?: string;
        type?: string;
      };

      return {
        ...node,
        status,
        criteriaMet: criteriaSatisfied(criteria, metrics),
        unlockedAt: userNode?.unlockedAt,
        completedAt: userNode?.completedAt,
      };
    });

    return NextResponse.json(nodesWithStatus);
  } catch (error) {
    console.error("Get roadmap error:", error);
    return NextResponse.json(
      { error: "Failed to fetch roadmap" },
      { status: 500 },
    );
  }
}
