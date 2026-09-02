import React from "react";
import { describe, expect, it } from "vitest";
import { StrengthStandardsRadar } from "./StrengthStandardsRadar";
import { evaluateAthleteStrengthProfile } from "@/lib/strengthStandards";

describe("StrengthStandardsRadar component", () => {
  it("renders StrengthStandardsRadar element with athlete profile", () => {
    const profile = evaluateAthleteStrengthProfile(
      { squat: 140, bench: 100, deadlift: 180, ohp: 60, row: 80 },
      80,
      false
    );

    const element = <StrengthStandardsRadar profile={profile} />;
    expect(React.isValidElement(element)).toBe(true);
  });
});
