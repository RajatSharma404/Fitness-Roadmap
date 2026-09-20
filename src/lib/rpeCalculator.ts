/**
 * Evidence-Based RPE (Rate of Perceived Exertion) and RIR (Reps in Reserve)
 * Auto-Regulation Engine based on Reactive Training Systems (Mike Tuchscherer).
 */

// RTS RPE to Percentage-of-1RM Conversion Table
// Rows: Reps 1 to 12
// Columns: RPE 6.5, 7.0, 7.5, 8.0, 8.5, 9.0, 9.5, 10.0
export const RPE_PERCENTAGE_TABLE: Record<number, Record<number, number>> = {
  1: { 6.5: 0.863, 7.0: 0.892, 7.5: 0.907, 8.0: 0.922, 8.5: 0.939, 9.0: 0.955, 9.5: 0.978, 10.0: 1.0 },
  2: { 6.5: 0.837, 7.0: 0.863, 7.5: 0.878, 8.0: 0.892, 8.5: 0.907, 9.0: 0.922, 9.5: 0.939, 10.0: 0.955 },
  3: { 6.5: 0.811, 7.0: 0.837, 7.5: 0.851, 8.0: 0.863, 8.5: 0.878, 9.0: 0.892, 9.5: 0.907, 10.0: 0.922 },
  4: { 6.5: 0.786, 7.0: 0.811, 7.5: 0.824, 8.0: 0.837, 8.5: 0.851, 9.0: 0.863, 9.5: 0.878, 10.0: 0.892 },
  5: { 6.5: 0.762, 7.0: 0.786, 7.5: 0.799, 8.0: 0.811, 8.5: 0.824, 9.0: 0.837, 9.5: 0.851, 10.0: 0.863 },
  6: { 6.5: 0.738, 7.0: 0.762, 7.5: 0.774, 8.0: 0.786, 8.5: 0.799, 9.0: 0.811, 9.5: 0.824, 10.0: 0.837 },
  7: { 6.5: 0.707, 7.0: 0.738, 7.5: 0.751, 8.0: 0.762, 8.5: 0.774, 9.0: 0.786, 9.5: 0.799, 10.0: 0.811 },
  8: { 6.5: 0.680, 7.0: 0.707, 7.5: 0.723, 8.0: 0.738, 8.5: 0.751, 9.0: 0.762, 9.5: 0.774, 10.0: 0.786 },
  9: { 6.5: 0.653, 7.0: 0.680, 7.5: 0.694, 8.0: 0.707, 8.5: 0.723, 9.0: 0.738, 9.5: 0.751, 10.0: 0.762 },
  10: { 6.5: 0.626, 7.0: 0.653, 7.5: 0.667, 8.0: 0.680, 8.5: 0.694, 9.0: 0.707, 9.5: 0.723, 10.0: 0.738 },
  11: { 6.5: 0.599, 7.0: 0.626, 7.5: 0.640, 8.0: 0.653, 8.5: 0.667, 9.0: 0.680, 9.5: 0.694, 10.0: 0.707 },
  12: { 6.5: 0.574, 7.0: 0.599, 7.5: 0.613, 8.0: 0.626, 8.5: 0.640, 9.0: 0.653, 9.5: 0.667, 10.0: 0.680 },
};

/**
 * Converts Reps In Reserve (RIR) to RPE scale
 * e.g., 2 RIR = 8.0 RPE; 0 RIR = 10.0 RPE
 */
export function rirToRpe(rir: number): number {
  return Math.max(6, Math.min(10, 10 - rir));
}

/**
 * Converts RPE scale to Reps In Reserve (RIR)
 */
export function rpeToRir(rpe: number): number {
  return Math.max(0, Math.min(4, 10 - rpe));
}

/**
 * Retrieves percentage of 1RM based on target reps and RPE
 */
export function getPercentageOf1RM(reps: number, rpe: number): number {
  const boundedReps = Math.max(1, Math.min(12, Math.round(reps)));
  // Round RPE to nearest 0.5
  const roundedRpe = Math.max(6.5, Math.min(10, Math.round(rpe * 2) / 2));
  
  const repRow = RPE_PERCENTAGE_TABLE[boundedReps];
  if (!repRow) return 0.75;
  return repRow[roundedRpe] ?? 0.75;
}

/**
 * Calculates Estimated 1RM (e1RM) using RPE auto-regulation
 */
export function calculateE1RMFromRPE(weight: number, reps: number, rpe: number): number {
  if (weight <= 0 || reps <= 0) return 0;
  const percentage = getPercentageOf1RM(reps, rpe);
  if (percentage <= 0) return weight;
  return Math.round((weight / percentage) * 10) / 10;
}

/**
 * Calculates target barbell load for planned reps and RPE based on an e1RM
 */
export function calculateTargetWeightForRPE(
  e1RM: number,
  targetReps: number,
  targetRPE: number,
): number {
  if (e1RM <= 0) return 0;
  const percentage = getPercentageOf1RM(targetReps, targetRPE);
  return Math.round(e1RM * percentage * 2) / 2; // Round to nearest 0.5kg
}

/**
 * Auto-regulates and suggests weight adjustment when a lifter overshoots or undershoots planned RPE
 */
export function calculateFatigueDropWeight(
  currentWeight: number,
  currentReps: number,
  currentRPE: number,
  plannedRPE: number,
): {
  recommendedWeight: number;
  percentageDelta: number;
  feedback: string;
} {
  const currentPct = getPercentageOf1RM(currentReps, currentRPE);
  const plannedPct = getPercentageOf1RM(currentReps, plannedRPE);
  
  const ratio = plannedPct / currentPct;
  const recommendedWeight = Math.round(currentWeight * ratio * 2) / 2;
  const percentageDelta = Math.round((ratio - 1) * 1000) / 10;

  let feedback = "On target. Maintain current working weight.";
  if (currentRPE > plannedRPE) {
    feedback = `Overshot by RPE ${(currentRPE - plannedRPE).toFixed(1)}. Drop weight by ${Math.abs(percentageDelta)}% to manage CNS fatigue.`;
  } else if (currentRPE < plannedRPE) {
    feedback = `Undershot target RPE. You have strength in reserve to increase load by +${percentageDelta}%.`;
  }

  return {
    recommendedWeight,
    percentageDelta,
    feedback,
  };
}
