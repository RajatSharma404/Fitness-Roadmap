import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;

  try {
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
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const [lifts, userNodes, achievements] = await Promise.all([
      prisma.lift.findMany({ where: { userId: id } }),
      prisma.userNode.findMany({ where: { userId: id, status: "COMPLETED" } }),
      prisma.achievement.findMany({ where: { userId: id } }),
    ]);

    const bestLifts: Record<string, number> = {};
    for (const lift of lifts) {
      if (!bestLifts[lift.name] || lift.oneRM > bestLifts[lift.name]) {
        bestLifts[lift.name] = lift.oneRM;
      }
    }

    return NextResponse.json({
      ...user,
      bestLifts,
      nodesCompleted: userNodes.length,
      achievements,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 },
    );
  }
}
