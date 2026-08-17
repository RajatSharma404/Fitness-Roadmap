import { DailyFoodLog } from "./indianFoodDatabase";

export interface AdaptiveTDEEInput {
  weightHistory: Array<{ date: string; weightKg: number }>;
  foodLogs: Record<string, DailyFoodLog>;
  formulaTDEE: number;
  goal: "fat_loss" | "weight_loss" | "muscle_gain" | "recomposition";
}

export interface AdaptiveTDEEResult {
  measuredTDEE: number;
  formulaTDEE: number;
  metabolicDelta: number; // Difference: Measured - Formula
  averageDailyIntake: number;
  weightChangeKgPerWeek: number;
  recommendedCalorieTarget: number;
  recommendedProteinGrams: number;
  confidenceScore: number; // 0 to 100 based on number of days tracked
  status: "CALIBRATING" | "RELIABLE" | "ACCURATE";
  rationale: string;
}

const KCAL_PER_KG_BODY_WEIGHT = 7700;

/**
 * Calculates MacroFactor-style Adaptive TDEE based on daily caloric intake and rate of scale weight changes
 */
export function calculateAdaptiveTDEE(input: AdaptiveTDEEInput): AdaptiveTDEEResult {
  const { weightHistory, foodLogs, formulaTDEE, goal } = input;

  // Filter valid weight entries sorted by date
  const sortedWeights = [...weightHistory]
    .filter((w) => w.weightKg > 30 && w.weightKg < 350)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Collect daily caloric intakes
  const dailyCalories: number[] = [];
  Object.values(foodLogs).forEach((log) => {
    const dayTotal = log.entries.reduce((sum, e) => sum + e.calories, 0);
    if (dayTotal > 500 && dayTotal < 8000) {
      dailyCalories.push(dayTotal);
    }
  });

  const trackedDaysCount = dailyCalories.length;
  const avgIntake =
    trackedDaysCount > 0
      ? Math.round(dailyCalories.reduce((a, b) => a + b, 0) / trackedDaysCount)
      : formulaTDEE;

  // If we have less than 7 days of food logs or less than 2 weight points, return preliminary estimate
  if (trackedDaysCount < 4 || sortedWeights.length < 2) {
    const initialTarget =
      goal === "fat_loss" || goal === "weight_loss"
        ? Math.round(formulaTDEE - 450)
        : goal === "muscle_gain"
          ? Math.round(formulaTDEE + 250)
          : formulaTDEE;

    return {
      measuredTDEE: formulaTDEE,
      formulaTDEE,
      metabolicDelta: 0,
      averageDailyIntake: avgIntake,
      weightChangeKgPerWeek: 0,
      recommendedCalorieTarget: initialTarget,
      recommendedProteinGrams: Math.round(
        (sortedWeights[sortedWeights.length - 1]?.weightKg || 70) * 2.0,
      ),
      confidenceScore: Math.min(40, trackedDaysCount * 10),
      status: "CALIBRATING",
      rationale:
        "Calibrating your metabolic rate. Log food and bodyweight for 7 consecutive days for high-precision adaptive TDEE.",
    };
  }

  // Calculate weight change over the available time window
  const firstWeight = sortedWeights[0];
  const lastWeight = sortedWeights[sortedWeights.length - 1];

  const firstDate = new Date(firstWeight.date).getTime();
  const lastDate = new Date(lastWeight.date).getTime();
  const daysDiff = Math.max(7, Math.round((lastDate - firstDate) / (1000 * 60 * 60 * 24)));
  const weeksDiff = daysDiff / 7;

  const totalWeightDelta = lastWeight.weightKg - firstWeight.weightKg;
  const weightChangeKgPerWeek = Math.round((totalWeightDelta / weeksDiff) * 100) / 100;

  // Daily energy surplus or deficit implied by weight change
  // (weeklyDeltaKg * 7700 kcal) / 7 days = weeklyDeltaKg * 1100 kcal/day
  const dailyEnergyImbalance = weightChangeKgPerWeek * (KCAL_PER_KG_BODY_WEIGHT / 7);

  // Measured TDEE = Actual Average Intake - Daily Energy Imbalance
  const rawMeasuredTDEE = avgIntake - dailyEnergyImbalance;

  // Smooth measured TDEE to avoid unrealistic noise (e.g. water weight fluctuations)
  // Weighted blend: 70% measured, 30% formula TDEE baseline
  const smoothedTDEE = Math.round(rawMeasuredTDEE * 0.75 + formulaTDEE * 0.25);
  const metabolicDelta = smoothedTDEE - formulaTDEE;

  let recommendedTarget = smoothedTDEE;
  if (goal === "fat_loss" || goal === "weight_loss") {
    recommendedTarget = Math.round(smoothedTDEE - 450);
  } else if (goal === "muscle_gain") {
    recommendedTarget = Math.round(smoothedTDEE + 250);
  }

  const confidenceScore = Math.min(100, Math.round(trackedDaysCount * 7 + sortedWeights.length * 5));
  const status = confidenceScore >= 75 ? "ACCURATE" : "RELIABLE";

  let rationale = `Based on your average intake of ${avgIntake.toLocaleString()} kcal and ${weightChangeKgPerWeek > 0 ? `+${weightChangeKgPerWeek}` : weightChangeKgPerWeek} kg/week weight trend, your measured expenditure is ${smoothedTDEE.toLocaleString()} kcal/day.`;

  if (metabolicDelta > 100) {
    rationale += ` Your metabolism is burning +${metabolicDelta} kcal faster than standard formulas.`;
  } else if (metabolicDelta < -100) {
    rationale += ` Slight metabolic adaptation detected (${metabolicDelta} kcal below formula). Target adjusted to keep fat loss steady.`;
  }

  return {
    measuredTDEE: smoothedTDEE,
    formulaTDEE,
    metabolicDelta,
    averageDailyIntake: avgIntake,
    weightChangeKgPerWeek,
    recommendedCalorieTarget: recommendedTarget,
    recommendedProteinGrams: Math.round(lastWeight.weightKg * 2.0),
    confidenceScore,
    status,
    rationale,
  };
}
