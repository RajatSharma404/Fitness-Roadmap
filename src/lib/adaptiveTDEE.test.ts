import { describe, it, expect } from "vitest";
import { calculateAdaptiveTDEE } from "./adaptiveTDEE";

describe("adaptiveTDEE", () => {
  it("returns calibrating state when data is insufficient", () => {
    const result = calculateAdaptiveTDEE({
      weightHistory: [{ date: "2026-01-01", weightKg: 80 }],
      foodLogs: {},
      formulaTDEE: 2200,
      goal: "fat_loss",
    });

    expect(result.status).toBe("CALIBRATING");
    expect(result.measuredTDEE).toBe(2200);
    expect(result.recommendedCalorieTarget).toBe(1750); // 2200 - 450
  });

  it("calculates accurate measured TDEE when steady weight loss occurs at known intake", () => {
    // User lost 1.0 kg over 2 weeks (0.5 kg/week loss = 550 kcal/day deficit) while eating 2000 kcal/day
    // True TDEE should be ~2550 kcal
    const weightHistory = [
      { date: "2026-01-01", weightKg: 80.0 },
      { date: "2026-01-08", weightKg: 79.5 },
      { date: "2026-01-15", weightKg: 79.0 },
    ];

    const foodLogs: Record<string, any> = {
      "2026-01-01": { entries: [{ calories: 2000 }] },
      "2026-01-02": { entries: [{ calories: 2000 }] },
      "2026-01-03": { entries: [{ calories: 2000 }] },
      "2026-01-04": { entries: [{ calories: 2000 }] },
      "2026-01-05": { entries: [{ calories: 2000 }] },
    };

    const result = calculateAdaptiveTDEE({
      weightHistory,
      foodLogs,
      formulaTDEE: 2400,
      goal: "fat_loss",
    });

    expect(result.status).toBe("RELIABLE");
    expect(result.weightChangeKgPerWeek).toBeCloseTo(-0.5, 1);
    expect(result.measuredTDEE).toBeGreaterThan(2400); // Measured higher than formula
    expect(result.recommendedCalorieTarget).toBeLessThan(result.measuredTDEE);
  });
});
