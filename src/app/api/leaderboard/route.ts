import { NextResponse } from "next/server";
import { calculateWilksScore } from "@/lib/formulas";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        lifts: {
          orderBy: { date: "desc" },
        },
        userNodes: {
          where: { status: "COMPLETED" },
        },
      },
    });

    const leaderboard = users.map((user) => {
      const bestLifts: Record<string, number> = {};
      for (const lift of user.lifts) {
        if (!bestLifts[lift.name] || lift.oneRM > bestLifts[lift.name]) {
          bestLifts[lift.name] = lift.oneRM;
        }
      }

      let squat = bestLifts["squat"] || 0;
      let bench = bestLifts["bench"] || 0;
      let deadlift = bestLifts["deadlift"] || 0;

      if (user.unit === "LBS") {
        squat /= 2.20462;
        bench /= 2.20462;
        deadlift /= 2.20462;
      }

      const sbdTotal = squat + bench + deadlift;
      const bodyweightKg =
        user.unit === "LBS" && user.bodyweight
          ? user.bodyweight / 2.20462
          : user.bodyweight || 70;

      const wilksScore = calculateWilksScore(sbdTotal, bodyweightKg);
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

    leaderboard.sort((a, b) => b.wilksScore - a.wilksScore);

    return NextResponse.json(
      leaderboard.map((entry, index) => ({ ...entry, rank: index + 1 })),
    );
  } catch (error) {
    console.error("Get leaderboard error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 },
    );
  }
}
