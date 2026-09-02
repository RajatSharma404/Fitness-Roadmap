import React from "react";
import { describe, expect, it } from "vitest";
import { PlateauDiagnosisCard } from "./PlateauDiagnosisCard";
import { LiftPlateauAnalysis } from "@/lib/plateauDetector";

describe("PlateauDiagnosisCard component", () => {
  it("renders PlateauDiagnosisCard element with diagnoses", () => {
    const diagnoses: LiftPlateauAnalysis[] = [
      {
        liftName: "Barbell Bench Press",
        status: "PLATEAU_DETECTED",
        consecutiveStalledSessions: 3,
        current1RM: 100,
        peak1RM: 102.5,
        recentSessionsCount: 5,
        trendPercentage: -2.4,
        deloadPrescription: {
          recommendedWeightKg: 70,
          recommendedSets: 3,
          recommendedReps: "5",
          targetRpe: "RPE 6-7",
          focusRationale: "Deload chest fatigue",
          weakPointVariations: [],
        },
      },
    ];

    const element = <PlateauDiagnosisCard diagnoses={diagnoses} />;
    expect(React.isValidElement(element)).toBe(true);
  });
});
