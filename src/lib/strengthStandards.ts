import { calculateDOTSScore, calculateWilksScore } from "./formulas";

export type StrengthTier = "UNTRAINED" | "NOVICE" | "INTERMEDIATE" | "ADVANCED" | "ELITE";

export interface LiftStandardBenchmark {
  untrained: number;
  novice: number;
  intermediate: number;
  advanced: number;
  elite: number;
}

export interface AthleteStrengthProfile {
  bodyweightKg: number;
  isFemale: boolean;
  sbdTotal: number;
  dotsScore: number;
  wilksScore: number;
  tier: StrengthTier;
  percentile: number;
  liftClassifications: Record<
    string,
    {
      actual1RM: number;
      bodyweightRatio: number;
      tier: StrengthTier;
      scorePercent: number; // 0 to 100
      standards: LiftStandardBenchmark;
    }
  >;
}

// Multipliers relative to bodyweight for Male athletes
export const MALE_STRENGTH_RATIOS: Record<string, LiftStandardBenchmark> = {
  squat: { untrained: 0.75, novice: 1.15, intermediate: 1.55, advanced: 2.05, elite: 2.55 },
  bench: { untrained: 0.5, novice: 0.8, intermediate: 1.15, advanced: 1.55, elite: 1.95 },
  deadlift: { untrained: 0.9, novice: 1.35, intermediate: 1.85, advanced: 2.45, elite: 3.0 },
  ohp: { untrained: 0.35, novice: 0.55, intermediate: 0.75, advanced: 0.95, elite: 1.15 },
  row: { untrained: 0.45, novice: 0.7, intermediate: 0.95, advanced: 1.25, elite: 1.55 },
};

// Multipliers relative to bodyweight for Female athletes
export const FEMALE_STRENGTH_RATIOS: Record<string, LiftStandardBenchmark> = {
  squat: { untrained: 0.55, novice: 0.85, intermediate: 1.2, advanced: 1.6, elite: 2.05 },
  bench: { untrained: 0.35, novice: 0.55, intermediate: 0.75, advanced: 1.05, elite: 1.35 },
  deadlift: { untrained: 0.7, novice: 1.05, intermediate: 1.45, advanced: 1.95, elite: 2.45 },
  ohp: { untrained: 0.25, novice: 0.38, intermediate: 0.52, advanced: 0.68, elite: 0.85 },
  row: { untrained: 0.32, novice: 0.48, intermediate: 0.65, advanced: 0.88, elite: 1.1 },
};

export function getTierFromScore(score: number): StrengthTier {
  if (score < 25) return "UNTRAINED";
  if (score < 50) return "NOVICE";
  if (score < 75) return "INTERMEDIATE";
  if (score < 90) return "ADVANCED";
  return "ELITE";
}

/**
 * Calculates strength standard percentage (0-100) for a given lift and ratio
 */
export function calculateLiftScorePercent(ratio: number, std: LiftStandardBenchmark): number {
  if (ratio <= std.untrained) {
    return Math.max(0, (ratio / std.untrained) * 25);
  }
  if (ratio <= std.novice) {
    return 25 + ((ratio - std.untrained) / (std.novice - std.untrained)) * 25;
  }
  if (ratio <= std.intermediate) {
    return 50 + ((ratio - std.novice) / (std.intermediate - std.novice)) * 25;
  }
  if (ratio <= std.advanced) {
    return 75 + ((ratio - std.intermediate) / (std.advanced - std.intermediate)) * 15;
  }
  if (ratio <= std.elite) {
    return 90 + ((ratio - std.advanced) / (std.elite - std.advanced)) * 10;
  }
  return Math.min(100, 100 + (ratio - std.elite) * 10);
}

/**
 * Evaluates an athlete's entire strength profile across all compound lifts
 */
export function evaluateAthleteStrengthProfile(
  lifts: Record<string, number>,
  bodyweightKg: number = 75,
  isFemale: boolean = false,
): AthleteStrengthProfile {
  const safeBW = Math.max(35, bodyweightKg);
  const ratioTable = isFemale ? FEMALE_STRENGTH_RATIOS : MALE_STRENGTH_RATIOS;

  const findLift = (nameFragment: string): number => {
    const target = nameFragment.toLowerCase().replace(/[\s\-_]/g, "");
    for (const [key, val] of Object.entries(lifts)) {
      const norm = key.toLowerCase().replace(/[\s\-_]/g, "");
      if (norm === target || norm.includes(target) || target.includes(norm)) {
        return val;
      }
    }
    return 0;
  };

  const squat1RM = findLift("squat");
  const bench1RM = findLift("bench");
  const deadlift1RM = findLift("deadlift");
  const ohp1RM = findLift("press");
  const row1RM = findLift("row");

  const sbdTotal = squat1RM + bench1RM + deadlift1RM;
  const dotsScore = calculateDOTSScore(sbdTotal, safeBW, isFemale);
  const wilksScore = calculateWilksScore(sbdTotal, safeBW, isFemale);

  const rawLifts: Record<string, number> = {
    squat: squat1RM,
    bench: bench1RM,
    deadlift: deadlift1RM,
    ohp: ohp1RM,
    row: row1RM,
  };

  const liftClassifications: AthleteStrengthProfile["liftClassifications"] = {};
  let totalScoreSum = 0;
  let classifiedCount = 0;

  Object.entries(ratioTable).forEach(([liftKey, ratios]) => {
    const actual1RM = rawLifts[liftKey] || 0;
    const bodyweightRatio = Math.round((actual1RM / safeBW) * 100) / 100;
    const std: LiftStandardBenchmark = {
      untrained: Math.round(ratios.untrained * safeBW),
      novice: Math.round(ratios.novice * safeBW),
      intermediate: Math.round(ratios.intermediate * safeBW),
      advanced: Math.round(ratios.advanced * safeBW),
      elite: Math.round(ratios.elite * safeBW),
    };

    const scorePercent = Math.round(calculateLiftScorePercent(bodyweightRatio, ratios) * 10) / 10;
    const tier = getTierFromScore(scorePercent);

    liftClassifications[liftKey] = {
      actual1RM,
      bodyweightRatio,
      tier,
      scorePercent,
      standards: std,
    };

    if (actual1RM > 0) {
      totalScoreSum += scorePercent;
      classifiedCount++;
    }
  });

  const avgScore = classifiedCount > 0 ? totalScoreSum / classifiedCount : 0;
  const overallTier = getTierFromScore(avgScore);
  const percentile = Math.min(99, Math.max(1, Math.round(avgScore * 0.95)));

  return {
    bodyweightKg: safeBW,
    isFemale,
    sbdTotal: Math.round(sbdTotal * 10) / 10,
    dotsScore: Math.round(dotsScore * 100) / 100,
    wilksScore: Math.round(wilksScore * 100) / 100,
    tier: overallTier,
    percentile,
    liftClassifications,
  };
}
