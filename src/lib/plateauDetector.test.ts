import { describe, it, expect } from "vitest";
import { analyzeLiftPlateau, diagnoseAllCompoundLifts } from "./plateauDetector";

describe("plateauDetector", () => {
  it("detects linear progress without flagging a plateau", () => {
    const history = [
      { name: "Barbell Squat", weight: 90, reps: 5, date: "2026-01-01" },
      { name: "Barbell Squat", weight: 92.5, reps: 5, date: "2026-01-08" },
      { name: "Barbell Squat", weight: 95, reps: 5, date: "2026-01-15" },
    ];

    const result = analyzeLiftPlateau("Barbell Squat", history);
    expect(result.status).toBe("PROGRESSING");
    expect(result.deloadPrescription).toBeUndefined();
    expect(result.trendPercentage).toBeGreaterThan(0);
  });

  it("detects a confirmed plateau after 3 consecutive stalled sessions and generates a deload protocol", () => {
    const history = [
      { name: "Barbell Bench Press", weight: 100, reps: 5, date: "2026-01-01" },
      { name: "Barbell Bench Press", weight: 100, reps: 5, date: "2026-01-08" },
      { name: "Barbell Bench Press", weight: 100, reps: 4, date: "2026-01-15" },
      { name: "Barbell Bench Press", weight: 97.5, reps: 5, date: "2026-01-22" },
    ];

    const result = analyzeLiftPlateau("Barbell Bench Press", history);
    expect(result.status).toBe("PLATEAU_DETECTED");
    expect(result.deloadPrescription).toBeDefined();

    // Verify deload prescription details
    expect(result.deloadPrescription?.recommendedSets).toBe(2); // 50% drop
    expect(result.deloadPrescription?.recommendedWeightKg).toBeLessThan(100);
    expect(result.deloadPrescription?.weakPointVariations.length).toBeGreaterThan(0);
  });

  it("diagnoses all compound lifts in bulk", () => {
    const history = [
      { name: "Barbell Squat", weight: 100, reps: 5, date: "2026-01-01" },
      { name: "Barbell Deadlift", weight: 140, reps: 5, date: "2026-01-01" },
    ];

    const diagnoses = diagnoseAllCompoundLifts(history);
    expect(diagnoses.length).toBe(5);
    expect(diagnoses.some((d) => d.liftName === "Barbell Squat")).toBe(true);
  });
});
