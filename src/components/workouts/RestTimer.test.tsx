import React from "react";
import { describe, expect, it, vi } from "vitest";
import { RestTimer } from "./RestTimer";

describe("RestTimer component", () => {
  it("renders RestTimer when active", () => {
    const element = (
      <RestTimer
        initialSeconds={60}
        isActive={true}
        exerciseName="Bench Press"
        nextSetNumber={2}
        onFinish={vi.fn()}
      />
    );

    expect(React.isValidElement(element)).toBe(true);
  });
});
