export interface DailyReadinessInput {
  sleepHours: number;
  sleepQualityRating: number; // 1-10
  sorenessRating: number; // 1-10 (10 = extreme soreness)
  stressRating: number; // 1-10 (10 = extreme stress)
  energyRating: number; // 1-10 (10 = high energy)
  workoutsInPast48Hours: number;
}

export type ReadinessTier = "OPTIMAL" | "GOOD" | "FATIGUED" | "EXHAUSTED";

export interface ReadinessEvaluation {
  readinessScore: number; // 0 to 100
  tier: ReadinessTier;
  recommendedSetMultiplier: number; // 1.0 (normal), 0.8 (drop 1 set), 0.5 (active recovery)
  recommendedIntensityAdjustmentPercent: number; // 0% (normal), -5%, -10%
  coachingHeadline: string;
  coachingDetails: string;
  actionProtocol: string[];
}

/**
 * Calculates evidence-based daily readiness and auto-regulates workout volume and intensity
 */
export function calculateDailyReadiness(
  input: DailyReadinessInput,
): ReadinessEvaluation {
  const {
    sleepHours,
    sleepQualityRating,
    sorenessRating,
    stressRating,
    energyRating,
    workoutsInPast48Hours,
  } = input;

  // 1. Sleep score (35% weight)
  const safeSleep = Math.max(3, Math.min(10, sleepHours));
  const sleepDurationScore = (safeSleep / 8) * 60; // 8h = 60 pts
  const sleepQualityScore = (sleepQualityRating / 10) * 40;
  const totalSleepComponent = Math.min(100, (sleepDurationScore + sleepQualityScore) / 100) * 35;

  // 2. Soreness & Fatigue component (25% weight)
  // Higher soreness reduces score
  const sorenessScore = Math.max(0, (10 - sorenessRating) / 10) * 100;
  const totalSorenessComponent = (sorenessScore / 100) * 25;

  // 3. Energy & Stress component (25% weight)
  const stressPenalty = Math.max(0, (10 - stressRating) / 10) * 50;
  const energyBonus = (energyRating / 10) * 50;
  const totalEnergyComponent = ((stressPenalty + energyBonus) / 100) * 25;

  // 4. Past 48h workload component (15% weight)
  let workloadScore = 100;
  if (workoutsInPast48Hours >= 2) workloadScore = 65;
  else if (workoutsInPast48Hours === 1) workloadScore = 85;
  const totalWorkloadComponent = (workloadScore / 100) * 15;

  const rawScore =
    totalSleepComponent +
    totalSorenessComponent +
    totalEnergyComponent +
    totalWorkloadComponent;

  const readinessScore = Math.min(100, Math.max(20, Math.round(rawScore)));

  let tier: ReadinessTier = "GOOD";
  let recommendedSetMultiplier = 1.0;
  let recommendedIntensityAdjustmentPercent = 0;
  let coachingHeadline = "Normal Training Baseline";
  let coachingDetails = "Your central nervous system and muscular recovery are in a solid state. Execute all prescribed working sets.";
  let actionProtocol = [
    "Proceed with planned compound working weights.",
    "Follow standard warm-up ladder.",
    "Target RPE 7.5 - 8.5 on top sets.",
  ];

  if (readinessScore >= 85) {
    tier = "OPTIMAL";
    recommendedSetMultiplier = 1.0;
    recommendedIntensityAdjustmentPercent = 0;
    coachingHeadline = "Optimal Performance State (Peak Readiness)";
    coachingDetails = "High recovery status detected. Excellent day to attempt progressive overload, log a PR attempt, or add an extra working set.";
    actionProtocol = [
      "Target top single or +1-2.5 kg on main compound lifts.",
      "Push final set of accessories to technical failure (RPE 9-10).",
      "High CNS output window active.",
    ];
  } else if (readinessScore >= 65) {
    tier = "GOOD";
    recommendedSetMultiplier = 1.0;
    recommendedIntensityAdjustmentPercent = 0;
    coachingHeadline = "Steady Training Readiness";
    coachingDetails = "Adequate recovery. Maintain planned weights and standard rest intervals.";
    actionProtocol = [
      "Execute scheduled working sets.",
      "Rest 2-3 minutes between compound sets.",
      "Stay hydrated during session.",
    ];
  } else if (readinessScore >= 45) {
    tier = "FATIGUED";
    recommendedSetMultiplier = 0.8; // drop accessory sets
    recommendedIntensityAdjustmentPercent = -5;
    coachingHeadline = "Elevated Fatigue Detected";
    coachingDetails = "Accumulated soreness or short sleep has reduced recovery capacity. Auto-dropping accessory volume by 1 set to avoid burnout.";
    actionProtocol = [
      "Keep main compound lifts at RPE 7-8 (leave 2-3 reps in reserve).",
      "Drop 1 working set on accessory and isolation exercises.",
      "Prioritize 8+ hours sleep and 500ml hydration post-workout.",
    ];
  } else {
    tier = "EXHAUSTED";
    recommendedSetMultiplier = 0.5;
    recommendedIntensityAdjustmentPercent = -15;
    coachingHeadline = "Central Nervous System Exhaustion Alert";
    coachingDetails = "High systemic fatigue detected. Heavy lifting today risks injury and blunted hypertrophy. Active recovery or a light technique deload is strongly prescribed.";
    actionProtocol = [
      "Reduce bar loads by 15% (focus purely on bar speed and technique).",
      "Cut workout duration to 35-40 minutes.",
      "Perform 15 mins mobility and soft tissue foam rolling.",
    ];
  }

  return {
    readinessScore,
    tier,
    recommendedSetMultiplier,
    recommendedIntensityAdjustmentPercent,
    coachingHeadline,
    coachingDetails,
    actionProtocol,
  };
}
