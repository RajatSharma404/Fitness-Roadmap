import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const lifts = await prisma.lift.findMany({
      where: { userId },
      orderBy: { date: "asc" },
    });

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
      stats[lift.name].count += 1;
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Get lift stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch lift stats" },
      { status: 500 },
    );
  }
}
