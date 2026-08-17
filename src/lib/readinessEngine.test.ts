import { describe, it, expect } from "vitest";
import { calculateDailyReadiness } from "./readinessEngine";

describe("readinessEngine", () => {
  it("calculates optimal readiness when sleep, energy, and recovery are high", () => {
    const evaluation = calculateDailyReadiness({
      sleepHours: 8.5,
      sleepQualityRating: 9,
      sorenessRating: 2,
      stressRating: 2,
      energyRating: 9,
      workoutsInPast48Hours: 0,
    });

    expect(evaluation.readinessScore).toBeGreaterThanOrEqual(85);
    expect(evaluation.tier).toBe("OPTIMAL");
    expect(evaluation.recommendedSetMultiplier).toBe(1.0);
    expect(evaluation.recommendedIntensityAdjustmentPercent).toBe(0);
  });

  it("auto-reduces volume when fatigue is elevated", () => {
    const evaluation = calculateDailyReadiness({
      sleepHours: 5.0,
      sleepQualityRating: 4,
      sorenessRating: 8,
      stressRating: 8,
      energyRating: 3,
      workoutsInPast48Hours: 2,
    });

    expect(evaluation.readinessScore).toBeLessThan(65);
    expect(evaluation.recommendedSetMultiplier).toBeLessThan(1.0);
    expect(evaluation.actionProtocol.length).toBeGreaterThan(1);
  });
});
