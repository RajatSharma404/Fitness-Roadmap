import { calculatePlates, PlateCalculationResult } from "./plateCalculator";

export interface WarmupSet {
  setNumber: number;
  percentage: number; // 0 for bar, 50, 70, 85, etc.
  weight: number;
  reps: number;
  rpe: number;
  label: string; // e.g. "Empty Bar", "Light Acclimation", "Moderate Primer", "Heavy Potentiation"
  restSeconds: number;
  plates?: PlateCalculationResult;
}

export interface WarmupCalculationOptions {
  targetWeight: number;
  barWeight?: number;
  unit?: "kg" | "lbs";
  exerciseName?: string;
}

/**
 * Rounds weight to nearest practical barbell load step (2.5kg or 5lbs)
 */
function roundToPlateStep(weight: number, step: number = 2.5): number {
  return Math.round(weight / step) * step;
}

/**
 * Checks if an exercise is an empty bar or bodyweight-based movement
 */
export function isBodyweightMovement(name: string): boolean {
  const norm = name.toLowerCase();
  return (
    norm.includes("pull-up") ||
    norm.includes("pullup") ||
    norm.includes("chin-up") ||
    norm.includes("chinup") ||
    norm.includes("dip") ||
    norm.includes("push-up") ||
    norm.includes("pushup") ||
    norm.includes("plank") ||
    norm.includes("crunch") ||
    norm.includes("leg raise")
  );
}

/**
 * Calculates a science-backed warm-up ladder based on target working set weight
 */
export function calculateWarmupLadder(options: WarmupCalculationOptions): WarmupSet[] {
  const {
    targetWeight,
    barWeight = 20,
    unit = "kg",
    exerciseName = "Barbell Movement",
  } = options;

  const step = unit === "lbs" ? 5 : 2.5;

  // For light loads or bodyweight exercises
  if (targetWeight <= barWeight) {
    return [
      {
        setNumber: 1,
        percentage: 100,
        weight: Math.max(0, targetWeight),
        reps: 10,
        rpe: 5,
        label: "Dynamic Mobility & Activation",
        restSeconds: 60,
      },
    ];
  }

  const ladder: WarmupSet[] = [];

  // Step 1: Empty Bar / Initial Movement Patterning
  const barSetWeight = Math.min(barWeight, targetWeight);
  ladder.push({
    setNumber: 1,
    percentage: Math.round((barSetWeight / targetWeight) * 100),
    weight: barSetWeight,
    reps: 10,
    rpe: 5,
    label: "Empty Bar / Joint Prep",
    restSeconds: 60,
    plates: calculatePlates({ targetWeight: barSetWeight, barWeight, unit }),
  });

  // If target weight is barely above the bar, 1-2 sets are enough
  if (targetWeight <= barWeight * 1.3) {
    const intermediate = roundToPlateStep(targetWeight * 0.75, step);
    if (intermediate > barSetWeight && intermediate < targetWeight) {
      ladder.push({
        setNumber: 2,
        percentage: 75,
        weight: intermediate,
        reps: 5,
        rpe: 6,
        label: "Final Acclimation",
        restSeconds: 90,
        plates: calculatePlates({ targetWeight: intermediate, barWeight, unit }),
      });
    }
    return ladder;
  }

  // Step 2: 50% of Working Weight
  const set2Weight = roundToPlateStep(Math.max(barWeight, targetWeight * 0.5), step);
  if (set2Weight > barSetWeight && set2Weight < targetWeight) {
    ladder.push({
      setNumber: ladder.length + 1,
      percentage: Math.round((set2Weight / targetWeight) * 100),
      weight: set2Weight,
      reps: 5,
      rpe: 6,
      label: "50% Working Load Primer",
      restSeconds: 60,
      plates: calculatePlates({ targetWeight: set2Weight, barWeight, unit }),
    });
  }

  // Step 3: 70% of Working Weight
  const set3Weight = roundToPlateStep(targetWeight * 0.7, step);
  if (set3Weight > (ladder[ladder.length - 1]?.weight || barSetWeight) && set3Weight < targetWeight) {
    ladder.push({
      setNumber: ladder.length + 1,
      percentage: Math.round((set3Weight / targetWeight) * 100),
      weight: set3Weight,
      reps: 3,
      rpe: 7,
      label: "70% Velocity Ramp",
      restSeconds: 90,
      plates: calculatePlates({ targetWeight: set3Weight, barWeight, unit }),
    });
  }

  // Step 4: 85% of Working Weight (Heavy Potentiation single/double)
  const set4Weight = roundToPlateStep(targetWeight * 0.85, step);
  if (set4Weight > (ladder[ladder.length - 1]?.weight || barSetWeight) && set4Weight < targetWeight) {
    ladder.push({
      setNumber: ladder.length + 1,
      percentage: Math.round((set4Weight / targetWeight) * 100),
      weight: set4Weight,
      reps: 1,
      rpe: 7.5,
      label: "85% Neural Potentiation",
      restSeconds: 120,
      plates: calculatePlates({ targetWeight: set4Weight, barWeight, unit }),
    });
  }

  // If very heavy (> 140kg / 315lbs), add 92% single
  if (targetWeight >= (unit === "lbs" ? 315 : 140)) {
    const set5Weight = roundToPlateStep(targetWeight * 0.92, step);
    if (set5Weight > (ladder[ladder.length - 1]?.weight || barSetWeight) && set5Weight < targetWeight) {
      ladder.push({
        setNumber: ladder.length + 1,
        percentage: Math.round((set5Weight / targetWeight) * 100),
        weight: set5Weight,
        reps: 1,
        rpe: 8,
        label: "92% Heavy Acclimation",
        restSeconds: 150,
        plates: calculatePlates({ targetWeight: set5Weight, barWeight, unit }),
      });
    }
  }

  return ladder;
}
