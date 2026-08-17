import { describe, it, expect } from "vitest";
import {
  calculateWeeklyMuscleVolume,
  getExerciseMuscleContributions,
  getVolumeStatus,
  MUSCLE_LANDMARKS_DATABASE,
} from "./volumeLandmarks";

describe("volumeLandmarks", () => {
  it("maps compound exercises to primary and secondary muscles correctly", () => {
    const bench = getExerciseMuscleContributions("Barbell Bench Press");
    expect(bench.primary).toContain("chest");
    expect(bench.secondary).toContain("triceps");

    const squat = getExerciseMuscleContributions("Barbell Squat");
    expect(squat.primary).toContain("quads");
    expect(squat.secondary).toContain("glutes");

    const deadlift = getExerciseMuscleContributions("Barbell Deadlift");
    expect(deadlift.primary).toContain("back");
  });

  it("evaluates volume status correctly against landmark thresholds", () => {
    const chest = MUSCLE_LANDMARKS_DATABASE.chest; // MEV: 8, MAV: 12-18, MRV: 22

    expect(getVolumeStatus(4, chest)).toBe("understimulated");
    expect(getVolumeStatus(10, chest)).toBe("maintenance");
    expect(getVolumeStatus(15, chest)).toBe("optimal");
    expect(getVolumeStatus(20, chest)).toBe("overreaching");
    expect(getVolumeStatus(25, chest)).toBe("overtraining");
  });

  it("tallies weekly volume accurately from completed workout sessions", () => {
    const now = new Date().toISOString();
    const sessions = [
      {
        completedExercises: ["Barbell Bench Press", "Incline Dumbbell Press", "Dips"],
        completedAt: now,
      },
      {
        completedExercises: ["Barbell Bench Press", "Chest Fly"],
        completedAt: now,
      },
    ];

    const volume = calculateWeeklyMuscleVolume(sessions, 7);

    expect(volume.chest).toBeDefined();
    // 4 direct chest exercises completed = 12 direct working sets
    expect(volume.chest.directSets).toBe(12);
    expect(volume.chest.status).toBe("optimal");
    expect(volume.chest.percentageOfMAV).toBeGreaterThan(70);
  });
});
