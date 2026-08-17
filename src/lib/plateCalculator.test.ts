import { describe, expect, it } from "vitest";
import {
  calculatePlates,
  generateWarmupPyramid,
  METRIC_PLATES,
} from "./plateCalculator";

describe("plateCalculator", () => {
  it("calculates 100kg barbell load with Olympic 25kg plates correctly (25 + 15)", () => {
    // 100kg total - 20kg bar = 80kg plates (40kg per side) -> 25kg + 15kg per side
    const result = calculatePlates({
      targetWeight: 100,
      barWeight: 20,
      unit: "kg",
    });

    expect(result.actualLoadedWeight).toBe(100);
    expect(result.weightPerSide).toBe(40);
    expect(result.isExact).toBe(true);
    expect(result.remainder).toBe(0);
    expect(result.platesPerSide.map((p) => p.weight)).toEqual([25, 15]);
  });

  it("calculates 100kg load when 25kg plates are disabled (commercial gym mode -> 20 + 20)", () => {
    const result = calculatePlates({
      targetWeight: 100,
      barWeight: 20,
      unit: "kg",
      availablePlateWeights: [20, 15, 10, 5, 2.5, 1.25],
    });

    expect(result.actualLoadedWeight).toBe(100);
    expect(result.platesPerSide.map((p) => p.weight)).toEqual([20, 20]);
    expect(result.plateCounts).toEqual([
      {
        plate: METRIC_PLATES.find((p) => p.weight === 20),
        countPerSide: 2,
        totalCount: 4,
      },
    ]);
  });

  it("calculates asymmetric/fractional plates (e.g. 142.5 kg)", () => {
    // 142.5kg - 20kg = 122.5kg total -> 61.25kg per side (25 + 25 + 10 + 1.25)
    const result = calculatePlates({
      targetWeight: 142.5,
      barWeight: 20,
      unit: "kg",
    });

    expect(result.actualLoadedWeight).toBe(142.5);
    expect(result.isExact).toBe(true);
    expect(result.platesPerSide.map((p) => p.weight)).toEqual([25, 25, 10, 1.25]);
  });

  it("handles custom collars weight correctly", () => {
    // 100kg target, 20kg bar, 2.5kg collars total -> 77.5kg needed -> 38.75kg per side (25 + 10 + 2.5 + 1.25)
    const result = calculatePlates({
      targetWeight: 100,
      barWeight: 20,
      collarWeight: 2.5,
      unit: "kg",
    });

    expect(result.actualLoadedWeight).toBe(100);
    expect(result.isExact).toBe(true);
    expect(result.platesPerSide.map((p) => p.weight)).toEqual([25, 10, 2.5, 1.25]);
  });

  it("calculates imperial lbs weights (e.g. 225 lbs on 45 lb bar without 55s)", () => {
    // 225 - 45 = 180 lbs -> 90 lbs per side -> 45 + 45
    const result = calculatePlates({
      targetWeight: 225,
      barWeight: 45,
      unit: "lbs",
      availablePlateWeights: [45, 35, 25, 10, 5, 2.5, 1.25],
    });

    expect(result.actualLoadedWeight).toBe(225);
    expect(result.isExact).toBe(true);
    expect(result.platesPerSide.map((p) => p.weight)).toEqual([45, 45]);
  });

  it("generates progressive 6-stage warm-up pyramid sets", () => {
    const pyramid = generateWarmupPyramid(140, 20, "kg");
    expect(pyramid.length).toBe(6);
    expect(pyramid[0].targetWeight).toBe(20); // Empty bar
    expect(pyramid[5].targetWeight).toBe(140); // 100% target
    expect(pyramid[5].reps).toBe(5);
  });
});
