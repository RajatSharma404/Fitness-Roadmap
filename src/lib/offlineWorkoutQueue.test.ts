import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearQueuedOfflineWorkouts,
  enqueueOfflineWorkout,
  getQueuedOfflineWorkouts,
  syncQueuedWorkouts,
} from "./offlineWorkoutQueue";

describe("offlineWorkoutQueue", () => {
  beforeEach(() => {
    clearQueuedOfflineWorkouts();
  });

  afterEach(() => {
    clearQueuedOfflineWorkouts();
    vi.restoreAllMocks();
  });

  it("enqueues and retrieves offline workout sessions", () => {
    const session = {
      day: "Monday",
      tier: "Intermediate",
      focus: "Heavy Bench Press",
      setsReps: "4x6 @ 100kg",
      exercises: ["Bench Press", "Incline DB Press"],
      completedExercises: ["Bench Press", "Incline DB Press"],
      completedAt: new Date().toISOString(),
    };

    const enqueued = enqueueOfflineWorkout(session);
    expect(enqueued.id).toContain("offline-");

    const queued = getQueuedOfflineWorkouts();
    expect(queued).toHaveLength(1);
    expect(queued[0].focus).toBe("Heavy Bench Press");
  });

  it("syncs queued sessions and clears queue on success", async () => {
    enqueueOfflineWorkout({
      day: "Wednesday",
      tier: "Intermediate",
      focus: "Squat Volume",
      setsReps: "5x5 @ 140kg",
      exercises: ["Squat"],
      completedExercises: ["Squat"],
      completedAt: new Date().toISOString(),
    });

    // Mock fetch for sync
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    });

    const result = await syncQueuedWorkouts();
    expect(result.syncedCount).toBe(1);
    expect(result.errors).toBe(0);
    expect(getQueuedOfflineWorkouts()).toHaveLength(0);
  });
});
