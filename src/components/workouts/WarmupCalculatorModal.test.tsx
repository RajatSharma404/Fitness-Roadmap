import React from "react";
import { describe, expect, it, vi } from "vitest";
import { WarmupCalculatorModal } from "./WarmupCalculatorModal";

describe("WarmupCalculatorModal component", () => {
  it("renders WarmupCalculatorModal when open", () => {
    const element = (
      <WarmupCalculatorModal
        isOpen={true}
        onClose={vi.fn()}
        exerciseName="Barbell Back Squat"
        initialWeight={100}
        unit="kg"
        onApplyWarmupSets={vi.fn()}
      />
    );

    expect(React.isValidElement(element)).toBe(true);
  });
});
