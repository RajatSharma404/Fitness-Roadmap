import { describe, it, expect } from "vitest";
import {
  FORM_ADVISOR_DATABASE,
  getFormGuideForExercise,
  diagnoseMovementFault,
} from "./formAdvisor";

describe("formAdvisor", () => {
  it("provides comprehensive setup and fault guides for major compound lifts", () => {
    expect(FORM_ADVISOR_DATABASE.squat).toBeDefined();
    expect(FORM_ADVISOR_DATABASE.bench).toBeDefined();
    expect(FORM_ADVISOR_DATABASE.deadlift).toBeDefined();

    const squatGuide = getFormGuideForExercise("Barbell Squat");
    expect(squatGuide.setupChecklist.length).toBeGreaterThan(2);
    expect(squatGuide.commonFaults.length).toBeGreaterThan(1);
  });

  it("diagnoses knee valgus fault with root causes and corrective drills", () => {
    const fault = diagnoseMovementFault("Squat", "squat-knee-valgus");
    expect(fault).toBeDefined();
    expect(fault?.name).toContain("Knees Caving");
    expect(fault?.instantVerbalCues.length).toBeGreaterThan(1);
    expect(fault?.correctiveDrills.some((d) => d.name.includes("Banded"))).toBe(true);
  });

  it("diagnoses bench flared elbows and warns about high injury risk", () => {
    const fault = diagnoseMovementFault("Bench Press", "bench-flared-elbows");
    expect(fault).toBeDefined();
    expect(fault?.severity).toBe("HIGH_INJURY_RISK");
    expect(fault?.rootCauses.length).toBeGreaterThan(1);
  });
});
