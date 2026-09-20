import { describe, expect, it } from "vitest";
import {
  calculateE1RMFromRPE,
  calculateFatigueDropWeight,
  calculateTargetWeightForRPE,
  getPercentageOf1RM,
  rirToRpe,
  rpeToRir,
} from "./rpeCalculator";

describe("rpeCalculator", () => {
  it("converts between RIR and RPE correctly", () => {
    expect(rirToRpe(2)).toBe(8);
    expect(rirToRpe(0)).toBe(10);
    expect(rpeToRir(8.5)).toBe(1.5);
    expect(rpeToRir(10)).toBe(0);
  });

  it("calculates estimated 1RM using RTS percentages", () => {
    // 100kg for 5 reps @ RPE 8 (81.1% of 1RM) -> ~123.3 kg 1RM
    const e1RM = calculateE1RMFromRPE(100, 5, 8.0);
    expect(e1RM).toBeCloseTo(123.3, 0);

    // 1 rep @ RPE 10 is 100% of 1RM
    expect(calculateE1RMFromRPE(140, 1, 10)).toBe(140);
  });

  it("calculates target weight for given planned reps and RPE", () => {
    const e1RM = 100;
    // 5 reps @ RPE 8 is 81.1% -> 81kg
    const target = calculateTargetWeightForRPE(e1RM, 5, 8.0);
    expect(target).toBeCloseTo(81, 0);
  });

  it("auto-regulates fatigue drop when lifter overshoots planned RPE", () => {
    // Lifter planned RPE 8 but hit RPE 9.5 on 100kg
    const adjustment = calculateFatigueDropWeight(100, 5, 9.5, 8.0);
    expect(adjustment.recommendedWeight).toBeLessThan(100);
    expect(adjustment.percentageDelta).toBeLessThan(0);
    expect(adjustment.feedback).toContain("Overshot");
  });
});
