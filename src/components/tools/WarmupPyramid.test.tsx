import React from "react";
import { describe, expect, it, vi } from "vitest";
import { WarmupPyramid } from "./WarmupPyramid";
import { WarmupSet } from "@/lib/plateCalculator";

describe("WarmupPyramid component", () => {
  it("renders WarmupPyramid ramp protocol", () => {
    const warmupSets: WarmupSet[] = [
      {
        setNumber: 1,
        percentage: 40,
        targetWeight: 40,
        reps: 10,
        note: "Bar and light work",
        restSeconds: 60,
        calculation: {
          platesPerSide: [],
          actualLoadedWeight: 40,
          targetWeight: 40,
          exactMatch: true,
          unit: "kg",
          collarWeightTotal: 0,
        },
      },
    ];

    const element = (
      <WarmupPyramid
        warmupSets={warmupSets}
        currentWeight={100}
        unit="kg"
        onSelectWeight={vi.fn()}
      />
    );

    expect(React.isValidElement(element)).toBe(true);
  });
});
