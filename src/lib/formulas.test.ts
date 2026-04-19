import { describe, expect, it } from "vitest";
import {
  calculateEpley1RM,
  calculateStrengthRatio,
  calculateVolume,
  kgToLbs,
  lbsToKg,
} from "./formulas";

describe("formulas", () => {
  it("calculates Epley 1RM", () => {
    expect(calculateEpley1RM(100, 5)).toBeCloseTo(116.67, 2);
    expect(calculateEpley1RM(100, 1)).toBe(100);
    expect(calculateEpley1RM(0, 5)).toBe(0);
  });

  it("converts units accurately", () => {
    expect(kgToLbs(100)).toBeCloseTo(220.462, 3);
    expect(lbsToKg(220.462)).toBeCloseTo(100, 3);
  });

  it("calculates volume and strength ratio", () => {
    expect(calculateVolume(100, 5, 3)).toBe(1500);
    expect(calculateStrengthRatio(150, 75)).toBe(2);
    expect(calculateStrengthRatio(100, 0)).toBe(0);
  });
});
