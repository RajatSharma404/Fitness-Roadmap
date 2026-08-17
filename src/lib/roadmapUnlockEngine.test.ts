import { describe, expect, it } from "vitest";
import { evaluateMilestoneUnlocks } from "./roadmapUnlockEngine";

describe("roadmapUnlockEngine", () => {
  it("unlocks assessment on first recorded lift", () => {
    const result = evaluateMilestoneUnlocks({
      lifts: [{ name: "Squat", weight: 60, reps: 5 }],
      checkins: [],
      currentProgress: {},
      userWeightKg: 70,
    });

    expect(result.newlyUnlockedNodeIds).toContain("assessment");
    expect(result.totalXpAwarded).toBeGreaterThan(0);
    expect(result.updatedProgress["assessment"]).toBe(true);
  });

  it("unlocks strength_t1 when 1.0x BW Squat is achieved and prerequisites are met", () => {
    const result = evaluateMilestoneUnlocks({
      lifts: [
        { name: "Squat", weight: 75, reps: 5 }, // 75 * (1 + 5/30) = 87.5kg 1RM (> 70kg BW)
        { name: "Bench Press", weight: 60, reps: 5 },
        { name: "Deadlift", weight: 90, reps: 5 },
      ],
      checkins: [
        { date: "2026-08-01", sleepHours: 8 },
        { date: "2026-08-02", sleepHours: 8 },
        { date: "2026-08-03", sleepHours: 8 },
      ],
      currentProgress: {
        assessment: true,
        energy_foundation: true,
        movement_literacy: true,
      },
      userWeightKg: 70,
    });

    expect(result.newlyUnlockedNodeIds).toContain("strength_t1");
    expect(result.unlockEvents.some((e) => e.nodeId === "strength_t1")).toBe(true);
  });

  it("does not unlock nodes if prerequisites are locked", () => {
    const result = evaluateMilestoneUnlocks({
      lifts: [{ name: "Squat", weight: 140, reps: 1 }], // 2.0x BW Squat
      checkins: [],
      currentProgress: {}, // No prerequisites completed
      userWeightKg: 70,
    });

    // Only assessment should unlock (it has no prerequisites)
    expect(result.newlyUnlockedNodeIds).toContain("assessment");
    expect(result.newlyUnlockedNodeIds).not.toContain("strength_t1");
    expect(result.newlyUnlockedNodeIds).not.toContain("strength_t2");
  });
});
