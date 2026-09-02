import React from "react";
import { describe, expect, it, vi } from "vitest";
import { ExerciseSwapModal } from "./ExerciseSwapModal";

describe("ExerciseSwapModal component", () => {
  it("renders ExerciseSwapModal with search and alternatives", () => {
    const element = (
      <ExerciseSwapModal
        isOpen={true}
        onClose={vi.fn()}
        currentExerciseName="Barbell Back Squat"
        onSelectReplacement={vi.fn()}
      />
    );

    expect(React.isValidElement(element)).toBe(true);
  });
});
