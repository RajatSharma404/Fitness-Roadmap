import { calculateEpley1RM } from "./formulas";

export interface LiftLogEntry {
  id?: string;
  name: string;
  weight: number;
  reps: number;
  oneRM?: number;
  date: string;
  notes?: string;
}

export type PlateauSeverity = "PROGRESSING" | "SLOWING" | "PLATEAU_DETECTED";

export interface DeloadPrescription {
  recommendedWeightKg: number;
  recommendedSets: number;
  recommendedReps: string;
  targetRpe: string;
  focusRationale: string;
  weakPointVariations: Array<{ name: string; targetWeakness: string; reason: string }>;
}

export interface LiftPlateauAnalysis {
  liftName: string;
  status: PlateauSeverity;
  recentSessionsCount: number;
  peak1RM: number;
  current1RM: number;
  trendPercentage: number; // e.g. -2.5% or +4.1%
  consecutiveStalledSessions: number;
  deloadPrescription?: DeloadPrescription;
}

const WEAK_POINT_VARIATION_DATABASE: Record<
  string,
  Array<{ name: string; targetWeakness: string; reason: string }>
> = {
  squat: [
    {
      name: "Pause Squat (2-sec hold)",
      targetWeakness: "Stuck at the hole / bottom reversal",
      reason: "Eliminates stretch reflex and forces pure quad & glute drive out of the bottom.",
    },
    {
      name: "Pin Squat / Anderson Squat",
      targetWeakness: "Mid-range sticking point",
      reason: "Builds explosive concentric rate of force development from dead-stop at parallel.",
    },
    {
      name: "Tempo 3-1-0 Squat",
      targetWeakness: "Technique breakdown / knee cave",
      reason: "Reinforces motor unit control and adductor stability under load.",
    },
  ],
  bench: [
    {
      name: "Spoto Press (1 inch above chest)",
      targetWeakness: "Mid-range sticking point",
      reason: "Builds extreme pec tension and tricep recruitment without touching ribs.",
    },
    {
      name: "Close-Grip Bench Press",
      targetWeakness: "Lockout weakness / tricep fatigue",
      reason: "Overloads triceps long head and anterior delts with reduced shoulder impingement.",
    },
    {
      name: "Larsen Press (Feet up)",
      targetWeakness: "Arch instability / loss of tightness",
      reason: "Forces strict upper body stabilization and lat engagement without leg drive cheating.",
    },
  ],
  deadlift: [
    {
      name: "Deficit Deadlift (1-2 inch)",
      targetWeakness: "Breaking off the floor",
      reason: "Increases range of motion and strengthens deep quad/glute initiation.",
    },
    {
      name: "Paused Deadlift (Below Knee)",
      targetWeakness: "Lower back rounding / mid-shin stall",
      reason: "Strengthens isometric spinal erectors and lat engagement over the bar.",
    },
    {
      name: "Block Pull / Rack Pull",
      targetWeakness: "Upper lockout and hip extension",
      reason: "Overloads glutes and upper trapezius at supramaximal weights.",
    },
  ],
  press: [
    {
      name: "Z-Press (Seated on floor with legs flat)",
      targetWeakness: "Core collapse & thoracic instability",
      reason: "Zero leg assistance; forces 100% pure anterior delt and core stability.",
    },
    {
      name: "Pin Overhead Press",
      targetWeakness: "Head-clearance sticking point",
      reason: "Builds explosive shoulder drive through the eye-level transition zone.",
    },
  ],
  row: [
    {
      name: "Chest Supported T-Bar Row",
      targetWeakness: "Lower back fatigue limiting back training",
      reason: "Removes spinal loading so lats and rhomboids can be pushed to true mechanical failure.",
    },
    {
      name: "Kelso Shrugs / Scapular Retraction",
      targetWeakness: "Weak mid-back scapular retraction",
      reason: "Isolates rhomboids and lower traps for better bar control.",
    },
  ],
};

function normalizeLiftCategory(name: string): string {
  const norm = name.toLowerCase();
  if (norm.includes("squat")) return "squat";
  if (norm.includes("bench")) return "bench";
  if (norm.includes("deadlift") || norm.includes("rdl")) return "deadlift";
  if (norm.includes("press") && !norm.includes("bench") && !norm.includes("leg")) return "press";
  if (norm.includes("row") || norm.includes("pull")) return "row";
  return "bench";
}

/**
 * Evaluates lift logs for a specific lift and diagnoses potential plateaus
 */
export function analyzeLiftPlateau(
  liftName: string,
  history: LiftLogEntry[],
): LiftPlateauAnalysis {
  const normCategory = normalizeLiftCategory(liftName);

  // Filter and sort ascending by date
  const filtered = history
    .filter((l) => {
      const norm = l.name.toLowerCase().replace(/[\s\-_]/g, "");
      const target = liftName.toLowerCase().replace(/[\s\-_]/g, "");
      return norm === target || norm.includes(target) || target.includes(norm);
    })
    .map((l) => ({
      ...l,
      oneRM: l.oneRM || calculateEpley1RM(l.weight, l.reps),
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (filtered.length < 2) {
    const latest = filtered[0];
    return {
      liftName,
      status: "PROGRESSING",
      recentSessionsCount: filtered.length,
      peak1RM: latest?.oneRM || 0,
      current1RM: latest?.oneRM || 0,
      trendPercentage: 0,
      consecutiveStalledSessions: 0,
    };
  }

  // Calculate 1RM history
  const oneRMs = filtered.map((l) => l.oneRM || 0);
  const peak1RM = Math.max(...oneRMs);
  const current1RM = oneRMs[oneRMs.length - 1];

  // Look at the last 3-4 sessions
  const windowSlice = oneRMs.slice(-4);
  let consecutiveStalls = 0;

  for (let i = 1; i < windowSlice.length; i++) {
    if (windowSlice[i] <= windowSlice[i - 1] * 1.005) {
      consecutiveStalls++;
    } else {
      consecutiveStalls = 0;
    }
  }

  const baseline1RM = windowSlice[0] || 1;
  const trendPercentage = Math.round(((current1RM - baseline1RM) / baseline1RM) * 1000) / 10;

  let status: PlateauSeverity = "PROGRESSING";
  if (consecutiveStalls >= 2 || (filtered.length >= 3 && current1RM < peak1RM * 0.96)) {
    status = "PLATEAU_DETECTED";
  } else if (consecutiveStalls === 1) {
    status = "SLOWING";
  }

  let deloadPrescription: DeloadPrescription | undefined = undefined;

  if (status === "PLATEAU_DETECTED") {
    const latestLog = filtered[filtered.length - 1];
    const workingWeight = latestLog.weight || current1RM * 0.8;
    const recommendedWeight = Math.round((workingWeight * 0.7) / 2.5) * 2.5;

    deloadPrescription = {
      recommendedWeightKg: recommendedWeight,
      recommendedSets: 2, // 50% volume drop
      recommendedReps: "5-6 reps with explosive intent",
      targetRpe: "RPE 6 (4 reps in reserve)",
      focusRationale:
        "Your central nervous system and tendons require a supercompensation phase. Reduce intensity to 70% and volume by 50% for 1 week to dissipate accumulated fatigue.",
      weakPointVariations:
        WEAK_POINT_VARIATION_DATABASE[normCategory] || WEAK_POINT_VARIATION_DATABASE.bench,
    };
  }

  return {
    liftName,
    status,
    recentSessionsCount: filtered.length,
    peak1RM: Math.round(peak1RM * 10) / 10,
    current1RM: Math.round(current1RM * 10) / 10,
    trendPercentage,
    consecutiveStalledSessions: consecutiveStalls,
    deloadPrescription,
  };
}

/**
 * Diagnoses all major compound lifts across an athlete's entire PR/Lift log history
 */
export function diagnoseAllCompoundLifts(
  liftHistory: LiftLogEntry[],
): LiftPlateauAnalysis[] {
  const mainLifts = [
    "Barbell Squat",
    "Barbell Bench Press",
    "Barbell Deadlift",
    "Overhead Press",
    "Barbell Row",
  ];

  return mainLifts.map((liftName) => analyzeLiftPlateau(liftName, liftHistory));
}
