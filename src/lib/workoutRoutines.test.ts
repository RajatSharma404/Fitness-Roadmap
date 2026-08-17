import { describe, it, expect } from "vitest";
import {
  PRESET_ROUTINE_TEMPLATES,
  cloneRoutineTemplate,
  createNewRoutine,
} from "./workoutRoutines";

describe("workoutRoutines", () => {
  it("provides preset templates with valid splits", () => {
    expect(PRESET_ROUTINE_TEMPLATES.length).toBeGreaterThanOrEqual(3);

    const ppl = PRESET_ROUTINE_TEMPLATES.find((t) => t.id === "template-ppl-6day");
    expect(ppl).toBeDefined();
    expect(ppl?.days.length).toBe(6);
    expect(ppl?.days[0].exercises.length).toBeGreaterThanOrEqual(4);

    const upperLower = PRESET_ROUTINE_TEMPLATES.find((t) => t.id === "template-upper-lower-4day");
    expect(upperLower).toBeDefined();
    expect(upperLower?.days.length).toBe(4);
  });

  it("creates a new custom routine with unique IDs", () => {
    const routine = createNewRoutine("My 4-Day Hypertrophy", "custom", 4);
    expect(routine.name).toBe("My 4-Day Hypertrophy");
    expect(routine.daysPerWeek).toBe(4);
    expect(routine.days.length).toBe(4);
    expect(routine.isTemplate).toBe(false);
  });

  it("clones a template without mutating the original", () => {
    const cloned = cloneRoutineTemplate("template-ppl-6day", "My PPL Split");
    expect(cloned).not.toBeNull();
    expect(cloned?.id).not.toBe("template-ppl-6day");
    expect(cloned?.name).toBe("My PPL Split");
    expect(cloned?.isTemplate).toBe(false);
    expect(cloned?.days.length).toBe(6);

    // Verify deep ID regeneration
    expect(cloned?.days[0].id).not.toBe(PRESET_ROUTINE_TEMPLATES[0].days[0].id);
    expect(cloned?.days[0].exercises[0].id).not.toBe(
      PRESET_ROUTINE_TEMPLATES[0].days[0].exercises[0].id,
    );
  });
});
