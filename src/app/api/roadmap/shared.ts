import { calculateWilksScore } from "@/lib/formulas";
import { prisma } from "@/lib/prisma";

export interface RoadmapUserMetrics {
  bestLifts: Record<string, number>;
  bodyweightKg: number;
  userUnit: "KG" | "LBS" | undefined;
  sbdTotal: number;
  wilksScore: number;
}

export function criteriaSatisfied(
  criteria: { lift?: string; metric: string; value: number; type?: string },
  metrics: RoadmapUserMetrics,
): boolean {
  if (criteria.type === "total" && criteria.metric === "sbd_total") {
    return metrics.sbdTotal >= criteria.value;
  }

  if (criteria.type === "wilks" && criteria.metric === "wilks_score") {
    return metrics.wilksScore >= criteria.value;
  }

  if (criteria.type === "dots" && criteria.metric === "dots_score") {
    return metrics.wilksScore >= criteria.value * 0.9;
  }

  if (criteria.lift && criteria.metric === "1rm_bw_ratio") {
    const lift1RM = metrics.bestLifts[criteria.lift] || 0;
    const liftKg = metrics.userUnit === "LBS" ? lift1RM / 2.20462 : lift1RM;
    const ratio = metrics.bodyweightKg > 0 ? liftKg / metrics.bodyweightKg : 0;
    return ratio >= criteria.value;
  }

  if (criteria.lift && criteria.metric === "1rm_absolute") {
    return (metrics.bestLifts[criteria.lift] || 0) >= criteria.value;
  }

  return false;
}

export async function getRoadmapUserMetrics(
  userId: string,
): Promise<RoadmapUserMetrics> {
  const [lifts, user] = await Promise.all([
    prisma.lift.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { bodyweight: true, unit: true },
    }),
  ]);

  const bestLifts: Record<string, number> = {};
  for (const lift of lifts) {
    if (!bestLifts[lift.name] || lift.oneRM > bestLifts[lift.name]) {
      bestLifts[lift.name] = lift.oneRM;
    }
  }

  const bodyweight = user?.bodyweight || 70;
  const bodyweightKg = user?.unit === "LBS" ? bodyweight / 2.20462 : bodyweight;
  const sbdTotal =
    (bestLifts["squat"] || 0) +
    (bestLifts["bench"] || 0) +
    (bestLifts["deadlift"] || 0);

  return {
    bestLifts,
    bodyweightKg,
    userUnit: user?.unit,
    sbdTotal,
    wilksScore: calculateWilksScore(sbdTotal, bodyweightKg),
  };
}

export async function checkAchievements(
  userId: string,
  bestLifts: Record<string, number>,
  newlyUnlockedCount: number,
): Promise<{ newAchievements: string[] }> {
  const existingAchievements = await prisma.achievement.findMany({
    where: { userId },
  });

  const existingTypes = new Set(existingAchievements.map((a) => a.type));
  const newAchievements: string[] = [];

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
