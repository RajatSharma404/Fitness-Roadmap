import { describe, it, expect } from "vitest";
import {
  calculateWarmupLadder,
  isBodyweightMovement,
} from "./warmupCalculator";

describe("warmupCalculator", () => {
  it("detects bodyweight movements correctly", () => {
    expect(isBodyweightMovement("Pull-Up")).toBe(true);
    expect(isBodyweightMovement("Chin-up")).toBe(true);
    expect(isBodyweightMovement("Dips")).toBe(true);
    expect(isBodyweightMovement("Push-ups")).toBe(true);
    expect(isBodyweightMovement("Barbell Squat")).toBe(false);
    expect(isBodyweightMovement("Bench Press")).toBe(false);
  });

  it("handles target weight <= bar weight gracefully", () => {
    const ladder = calculateWarmupLadder({
      targetWeight: 20,
      barWeight: 20,
      unit: "kg",
    });
    expect(ladder.length).toBe(1);
    expect(ladder[0].weight).toBe(20);
    expect(ladder[0].reps).toBe(10);
  });

  it("calculates progressive warmup ladder for 100kg Bench Press", () => {
    const ladder = calculateWarmupLadder({
      targetWeight: 100,
      barWeight: 20,
      unit: "kg",
      exerciseName: "Barbell Bench Press",
    });

    expect(ladder.length).toBeGreaterThanOrEqual(4);

    // Set 1: Empty Bar
    expect(ladder[0].weight).toBe(20);
    expect(ladder[0].reps).toBe(10);

    // Set 2: ~50%
    expect(ladder[1].weight).toBe(50);
    expect(ladder[1].reps).toBe(5);

    // Set 3: ~70%
    expect(ladder[2].weight).toBe(70);
    expect(ladder[2].reps).toBe(3);

    // Set 4: ~85%
    expect(ladder[3].weight).toBe(85);
    expect(ladder[3].reps).toBe(1);

    // Verify plate calculations are attached
    expect(ladder[3].plates).toBeDefined();
    expect(ladder[3].plates?.actualLoadedWeight).toBe(85);
  });

  it("adds a 92% acclimation single for very heavy loads (e.g. 180kg Squat)", () => {
    const ladder = calculateWarmupLadder({
      targetWeight: 180,
      barWeight: 20,
      unit: "kg",
      exerciseName: "Barbell Squat",
    });

    expect(ladder.length).toBe(5);
    const lastWarmup = ladder[ladder.length - 1];
    expect(lastWarmup.weight).toBeGreaterThanOrEqual(160);
    expect(lastWarmup.percentage).toBeGreaterThanOrEqual(90);
    expect(lastWarmup.reps).toBe(1);
  });
});
