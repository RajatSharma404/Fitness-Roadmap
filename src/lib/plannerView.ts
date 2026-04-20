import { PlannerInput } from "@/lib/bodyPlanner";
import {
  EquipmentType,
  ExperienceLevel,
  WeeklyCheckIn,
} from "@/lib/planEnhancements";

export const defaultPlannerInput: PlannerInput = {
  age: 28,
  sex: "male",
  heightCm: 170,
  weightKg: 82,
  goal: "fat_loss",
  activity: "moderate",
  workoutDays: 5,
  diet: "mixed",
};

export interface PlannerSnapshot {
  input: PlannerInput;
  checkins: WeeklyCheckIn[];
  equipment: EquipmentType;
  experience: ExperienceLevel;
}

export const defaultPlannerSnapshot: PlannerSnapshot = {
  input: defaultPlannerInput,
  checkins: [],
  equipment: "gym",
  experience: "beginner",
};

export function readPlannerSnapshot(): PlannerSnapshot {
  if (typeof window === "undefined") {
    return defaultPlannerSnapshot;
  }

  let input = defaultPlannerInput;
  let checkins: WeeklyCheckIn[] = [];
  let equipment: EquipmentType = "gym";
  let experience: ExperienceLevel = "beginner";

  try {
    const savedInput = localStorage.getItem("bodyPlanInput");
    if (savedInput) input = JSON.parse(savedInput) as PlannerInput;
  } catch {
    // ignore invalid local state
  }

  try {
    const savedExtra = localStorage.getItem("bodyPlanEnhancedState");
    if (savedExtra) {
      const parsed = JSON.parse(savedExtra) as {
        checkins?: WeeklyCheckIn[];
        equipment?: EquipmentType;
        experience?: ExperienceLevel;
      };
      checkins = parsed.checkins ?? [];
      equipment = parsed.equipment ?? "gym";
      experience = parsed.experience ?? "beginner";
    }
  } catch {
    // ignore invalid local state
  }

  return { input, checkins, equipment, experience };
}

export function dedupeCheckinsByDate(
  checkins: WeeklyCheckIn[],
): WeeklyCheckIn[] {
  const seen = new Set<string>();
  const unique: WeeklyCheckIn[] = [];

  for (const entry of [...checkins].sort((a, b) =>
    b.date.localeCompare(a.date),
  )) {
    if (seen.has(entry.date)) continue;
    seen.add(entry.date);
    unique.push(entry);
  }

  return unique;
}

export function getReadableGoal(goal: string): string {
  return goal.replaceAll("_", " ");
}

export function getReadableActivity(activity: string): string {
  return activity.replaceAll("_", " ");
}
