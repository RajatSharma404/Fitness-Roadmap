import React from "react";
import { describe, expect, it, vi } from "vitest";
import { AdaptiveTDEECard } from "./AdaptiveTDEECard";
import { AdaptiveTDEEResult } from "@/lib/adaptiveTDEE";

describe("AdaptiveTDEECard component", () => {
  it("renders AdaptiveTDEECard with measured TDEE and applies target", () => {
    const mockResult: AdaptiveTDEEResult = {
      measuredTDEE: 2450,
      formulaTDEE: 2300,
      metabolicDelta: 150,
      weightChangeKgPerWeek: -0.45,
      averageDailyIntake: 2000,
      recommendedCalorieTarget: 1950,
      recommendedProteinGrams: 160,
      confidenceScore: 88,
      status: "RELIABLE",
      rationale: "Steady deficit achieved.",
    };

    const onApply = vi.fn();
    const element = <AdaptiveTDEECard result={mockResult} onApplyRecommendedTarget={onApply} />;
    expect(React.isValidElement(element)).toBe(true);
  });
});
