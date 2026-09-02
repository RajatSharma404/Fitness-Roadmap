import React from "react";
import { describe, expect, it } from "vitest";
import { StrengthRadar } from "./StrengthRadar";

describe("StrengthRadar component", () => {
  it("renders StrengthRadar element with lift values", () => {
    const lifts = {
      squat: 140,
      bench: 100,
      deadlift: 180,
      ohp: 60,
      barbell_row: 80,
    };

    const element = <StrengthRadar lifts={lifts} bodyweight={80} />;
    expect(React.isValidElement(element)).toBe(true);
  });
});
