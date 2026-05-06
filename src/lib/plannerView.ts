import { PlannerInput } from "@/lib/bodyPlanner";
import {
  EquipmentType,
  ExperienceLevel,
  WeeklyCheckIn,
} from "@/lib/planEnhancements";

interface PersistedPlanState {
  input: PlannerInput;
  progress: Record<string, boolean>;
  checkins: WeeklyCheckIn[];
  equipment: EquipmentType;
  experience: ExperienceLevel;
}

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
  progress: Record<string, boolean>;
}

export const defaultPlannerSnapshot: PlannerSnapshot = {
  input: defaultPlannerInput,
  checkins: [],
  equipment: "gym",
  experience: "beginner",
  progress: {},
};

function readPlanProgress(): Record<string, boolean> {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const saved = localStorage.getItem("bodyPlanProgress");
    return saved ? (JSON.parse(saved) as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

function writePlanProgress(progress: Record<string, boolean>): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem("bodyPlanProgress", JSON.stringify(progress));
}

function writeSnapshotToLocalStorage(snapshot: PlannerSnapshot): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem("bodyPlanInput", JSON.stringify(snapshot.input));
  localStorage.setItem(
    "bodyPlanEnhancedState",
    JSON.stringify({
      input: snapshot.input,
      progress: snapshot.progress,
      checkins: snapshot.checkins,
      equipment: snapshot.equipment,
      experience: snapshot.experience,
    }),
  );
  writePlanProgress(snapshot.progress);
}

export function readPlannerSnapshot(): PlannerSnapshot {
  if (typeof window === "undefined") {
    return defaultPlannerSnapshot;
  }

  let input = defaultPlannerInput;
  let checkins: WeeklyCheckIn[] = [];
  let equipment: EquipmentType = "gym";
  let experience: ExperienceLevel = "beginner";
  let progress: Record<string, boolean> = readPlanProgress();

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
        progress?: Record<string, boolean>;
      };
      checkins = parsed.checkins ?? [];
      equipment = parsed.equipment ?? "gym";
      experience = parsed.experience ?? "beginner";
      progress = parsed.progress ?? progress;
    }
  } catch {
    // ignore invalid local state
  }

  return { input, checkins, equipment, experience, progress };
}

export function savePlannerSnapshot(snapshot: PlannerSnapshot): void {
  writeSnapshotToLocalStorage(snapshot);
}

export async function syncPlannerSnapshotFromServer(): Promise<PlannerSnapshot> {
  const localSnapshot = readPlannerSnapshot();

  if (typeof window === "undefined") {
    return localSnapshot;
  }

  try {
    const response = await fetch("/api/user-plan-state", {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      return localSnapshot;
    }

    const payload = (await response.json()) as {
      ok?: boolean;
      state?: PersistedPlanState | null;
    };

    if (!payload.ok || !payload.state) {
      return localSnapshot;
    }

    const serverSnapshot: PlannerSnapshot = {
      input: payload.state.input,
      checkins: payload.state.checkins,
      equipment: payload.state.equipment,
      experience: payload.state.experience,
      progress: payload.state.progress ?? {},
    };

    writeSnapshotToLocalStorage(serverSnapshot);
    return serverSnapshot;
  } catch {
    return localSnapshot;
  }
}

export async function persistPlannerSnapshot(
  snapshot: PlannerSnapshot,
): Promise<boolean> {
  writeSnapshotToLocalStorage(snapshot);

  if (typeof window === "undefined") {
    return false;
  }

  try {
    const response = await fetch("/api/user-plan-state", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(snapshot),
    });
    return response.ok;
  } catch {
    return false;
  }
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
