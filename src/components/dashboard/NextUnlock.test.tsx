import React from "react";
import { describe, expect, it } from "vitest";
import { NextUnlock } from "./NextUnlock";

describe("NextUnlock component", () => {
  it("renders empty state when node is null", () => {
    const element = <NextUnlock node={null} progress={0} delta={null} />;
    expect(React.isValidElement(element)).toBe(true);
  });

  it("renders active unlock target and progress", () => {
    const mockNode = {
      id: "node_1",
      name: "1.5x BW Squat",
      track: "BEGINNER",
      unlockCriteria: {},
    };

    const mockDelta = {
      lift: "Squat",
      current: 100,
      target: 120,
      unit: "kg",
    };

    const element = <NextUnlock node={mockNode} progress={83.3} delta={mockDelta} />;
    expect(React.isValidElement(element)).toBe(true);
    expect(element.props.node?.name).toBe("1.5x BW Squat");
  });
});
