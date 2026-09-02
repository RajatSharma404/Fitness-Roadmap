import React from "react";
import { describe, expect, it, vi } from "vitest";
import { AIChat } from "./AIChat";

describe("AIChat component", () => {
  it("renders AIChat component element", () => {
    const context = {
      goal: "STRENGTH",
      PRs: [{ name: "Squat", weight: 140, reps: 5 }],
      unlockedNodes: 5,
      bodyweight: 80,
    };

    const element = <AIChat isOpen={true} onToggle={vi.fn()} context={context} />;
    expect(React.isValidElement(element)).toBe(true);
  });
});
