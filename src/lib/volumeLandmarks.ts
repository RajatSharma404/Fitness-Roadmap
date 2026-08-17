import { getExerciseDetail } from "./planEnhancements";

export interface MuscleLandmark {
  muscle: string;
  label: string;
  mev: number; // Minimum Effective Volume (sets/week)
  mavMin: number; // Max Adaptive Volume Lower Bound
  mavMax: number; // Max Adaptive Volume Upper Bound
  mrv: number; // Maximum Recoverable Volume
  recoveryTimeHours: number;
}

export type VolumeStatus =
  | "understimulated"
  | "maintenance"
  | "optimal"
  | "overreaching"
  | "overtraining";

export interface MuscleVolumeProgress {
  muscle: string;
  label: string;
  directSets: number;
  indirectSets: number;
  totalEffectiveSets: number;
  status: VolumeStatus;
  percentageOfMAV: number;
  landmarks: MuscleLandmark;
}

export const MUSCLE_LANDMARKS_DATABASE: Record<string, MuscleLandmark> = {
  chest: {
    muscle: "chest",
    label: "Chest",
    mev: 8,
    mavMin: 12,
    mavMax: 18,
    mrv: 22,
    recoveryTimeHours: 48,
  },
  back: {
    muscle: "back",
    label: "Back & Lats",
    mev: 10,
    mavMin: 14,
    mavMax: 22,
    mrv: 26,
    recoveryTimeHours: 48,
  },
  shoulders: {
    muscle: "shoulders",
    label: "Shoulders (Delts)",
    mev: 8,
    mavMin: 14,
    mavMax: 20,
    mrv: 24,
    recoveryTimeHours: 48,
  },
  biceps: {
    muscle: "biceps",
    label: "Biceps",
    mev: 6,
    mavMin: 10,
    mavMax: 16,
    mrv: 20,
    recoveryTimeHours: 36,
  },
  triceps: {
    muscle: "triceps",
    label: "Triceps",
    mev: 6,
    mavMin: 10,
    mavMax: 16,
    mrv: 20,
    recoveryTimeHours: 36,
  },
  quads: {
    muscle: "quads",
    label: "Quads",
    mev: 8,
    mavMin: 12,
    mavMax: 18,
    mrv: 22,
    recoveryTimeHours: 72,
  },
  hamstrings: {
    muscle: "hamstrings",
    label: "Hamstrings",
    mev: 6,
    mavMin: 10,
    mavMax: 16,
    mrv: 20,
    recoveryTimeHours: 72,
  },
  glutes: {
    muscle: "glutes",
    label: "Glutes",
    mev: 4,
    mavMin: 8,
    mavMax: 14,
    mrv: 18,
    recoveryTimeHours: 48,
  },
  calves: {
    muscle: "calves",
    label: "Calves",
    mev: 6,
    mavMin: 10,
    mavMax: 16,
    mrv: 20,
    recoveryTimeHours: 24,
  },
  abs: {
    muscle: "abs",
    label: "Abs & Core",
    mev: 4,
    mavMin: 8,
    mavMax: 14,
    mrv: 18,
    recoveryTimeHours: 24,
  },
};

/**
 * Maps an exercise name to its primary and secondary target muscle groups
 */
export function getExerciseMuscleContributions(exerciseName: string): {
  primary: string[];
  secondary: string[];
} {
  const norm = exerciseName.toLowerCase().replace(/[\s\-_]/g, "");
  const detail = getExerciseDetail(exerciseName);
  const bodyPart = (detail.bodyPart || "").toLowerCase();
  const targetMuscles = (detail.targetMuscles || []).map((m) => m.toLowerCase());

  const primary = new Set<string>();
  const secondary = new Set<string>();

  // 1. Direct match by bodyPart & targetMuscles
  if (bodyPart === "chest" || norm.includes("chest") || norm.includes("bench") || norm.includes("fly") || norm.includes("pushup") || norm.includes("incline") || norm.includes("decline") || norm.includes("pec")) {
    primary.add("chest");
    secondary.add("triceps");
    secondary.add("shoulders");
  }

  if (bodyPart === "back" || norm.includes("back") || norm.includes("row") || norm.includes("pulldown") || norm.includes("pullup") || norm.includes("chinup") || norm.includes("lat") || norm.includes("deadlift")) {
    primary.add("back");
    if (norm.includes("deadlift") || norm.includes("rdl")) {
      primary.add("hamstrings");
      primary.add("glutes");
    }
    secondary.add("biceps");
  }

  if (bodyPart === "shoulders" || norm.includes("shoulder") || norm.includes("overhead") || norm.includes("ohp") || norm.includes("military") || norm.includes("lateral") || norm.includes("delt") || norm.includes("facepull")) {
    primary.add("shoulders");
    secondary.add("triceps");
  }

  if (bodyPart === "arms" || bodyPart === "biceps" || norm.includes("curl") || norm.includes("bicep")) {
    primary.add("biceps");
  }

  if (bodyPart === "triceps" || norm.includes("tricep") || norm.includes("dip") || norm.includes("skullcrusher") || norm.includes("pushdown") || norm.includes("extension")) {
    if (!norm.includes("legextension") && !norm.includes("backextension")) {
      primary.add("triceps");
    }
  }

  if (bodyPart === "legs" || norm.includes("squat") || norm.includes("legpress") || norm.includes("quad") || norm.includes("lunge") || norm.includes("split") || norm.includes("legextension")) {
    primary.add("quads");
    secondary.add("glutes");
  }

  if (norm.includes("hamstring") || norm.includes("legcurl") || norm.includes("lyingcurl") || norm.includes("seatedcurl") || norm.includes("rdl") || norm.includes("romanian")) {
    primary.add("hamstrings");
  }

  if (norm.includes("thrust") || norm.includes("glute") || norm.includes("hipthrust") || norm.includes("kickback") || norm.includes("abductor")) {
    primary.add("glutes");
  }

  if (bodyPart === "calves" || norm.includes("calf") || norm.includes("calves") || norm.includes("calfraises")) {
    primary.add("calves");
  }

  if (bodyPart === "abs" || norm.includes("abs") || norm.includes("plank") || norm.includes("crunch") || norm.includes("legraise") || norm.includes("hanging")) {
    primary.add("abs");
  }

  // Fallback if none matched
  if (primary.size === 0) {
    if (MUSCLE_LANDMARKS_DATABASE[bodyPart]) {
      primary.add(bodyPart);
    } else {
      primary.add("chest");
    }
  }

  return {
    primary: Array.from(primary),
    secondary: Array.from(secondary).filter((s) => !primary.has(s)),
  };
}

/**
 * Calculates current volume status for a given set count and landmark definition
 */
export function getVolumeStatus(sets: number, landmarks: MuscleLandmark): VolumeStatus {
  if (sets < landmarks.mev) return "understimulated";
  if (sets < landmarks.mavMin) return "maintenance";
  if (sets <= landmarks.mavMax) return "optimal";
  if (sets <= landmarks.mrv) return "overreaching";
  return "overtraining";
}

export interface WorkoutSessionSummaryInput {
  completedExercises: string[];
  completedAt: string;
}

/**
 * Calculates weekly direct and indirect set volume per muscle group over the last 7 days
 */
export function calculateWeeklyMuscleVolume(
  sessions: WorkoutSessionSummaryInput[],
  daysWindow: number = 7,
): Record<string, MuscleVolumeProgress> {
  const now = new Date();
  const cutoffTime = now.getTime() - daysWindow * 24 * 60 * 60 * 1000;

  // Filter sessions within the daysWindow
  const recentSessions = sessions.filter((s) => {
    const sessionTime = new Date(s.completedAt).getTime();
    return sessionTime >= cutoffTime;
  });

  const muscleDirectSets: Record<string, number> = {};
  const muscleIndirectSets: Record<string, number> = {};

  // Initialize
  Object.keys(MUSCLE_LANDMARKS_DATABASE).forEach((muscle) => {
    muscleDirectSets[muscle] = 0;
    muscleIndirectSets[muscle] = 0;
  });

  // Tally sets (standard assumption: ~3 completed working sets per completed exercise in a session)
  recentSessions.forEach((session) => {
    session.completedExercises.forEach((exName) => {
      const { primary, secondary } = getExerciseMuscleContributions(exName);
      primary.forEach((m) => {
        if (muscleDirectSets[m] !== undefined) {
          muscleDirectSets[m] += 3;
        }
      });
      secondary.forEach((m) => {
        if (muscleIndirectSets[m] !== undefined) {
          muscleIndirectSets[m] += 1.5; // Half credit for indirect synergy
        }
      });
    });
  });

  const result: Record<string, MuscleVolumeProgress> = {};

  Object.entries(MUSCLE_LANDMARKS_DATABASE).forEach(([muscle, landmarks]) => {
    const direct = muscleDirectSets[muscle] || 0;
    const indirect = muscleIndirectSets[muscle] || 0;
    const totalEffectiveSets = Math.round((direct + indirect * 0.5) * 10) / 10;
    const status = getVolumeStatus(totalEffectiveSets, landmarks);
    const midMAV = (landmarks.mavMin + landmarks.mavMax) / 2;
    const percentageOfMAV = Math.min(150, Math.round((totalEffectiveSets / midMAV) * 100));

    result[muscle] = {
      muscle,
      label: landmarks.label,
      directSets: direct,
      indirectSets: indirect,
      totalEffectiveSets,
      status,
      percentageOfMAV,
      landmarks,
    };
  });

  return result;
}
