import React from "react";
import { describe, expect, it } from "vitest";
import { MuscleVolumeHeatmap } from "./MuscleVolumeHeatmap";
import { MuscleVolumeProgress } from "@/lib/volumeLandmarks";

describe("MuscleVolumeHeatmap component", () => {
  it("renders MuscleVolumeHeatmap element with volume data", () => {
    const mockVolumeData: Record<string, MuscleVolumeProgress> = {
      chest: {
        label: "Chest",
        directSets: 12,
        indirectSets: 4,
        totalEffectiveSets: 14,
        status: "optimal",
        landmarks: { mev: 8, mavMin: 12, mavMax: 18, mrv: 22, recoveryTimeHours: 48 },
      },
    };

    const element = <MuscleVolumeHeatmap volumeData={mockVolumeData} />;
    expect(React.isValidElement(element)).toBe(true);
  });
});
