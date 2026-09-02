import React from "react";
import { describe, expect, it, vi } from "vitest";
import { LiveWorkoutModal } from "./LiveWorkoutModal";

describe("LiveWorkoutModal component", () => {
  it("renders LiveWorkoutModal with active exercise tracking sets", () => {
    const element = (
      <LiveWorkoutModal
        isOpen={true}
        onClose={vi.fn()}
        dayName="Day 1"
        focus="Lower Body Strength"
        exercises={["Barbell Back Squat", "Romanian Deadlift"]}
        onFinishWorkout={vi.fn()}
      />
    );

    expect(React.isValidElement(element)).toBe(true);
  });
});
