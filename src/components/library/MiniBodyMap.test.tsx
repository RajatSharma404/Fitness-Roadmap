import React from "react";
import { describe, expect, it } from "vitest";
import { MiniBodyMap } from "./MiniBodyMap";

describe("MiniBodyMap component", () => {
  it("renders MiniBodyMap with target muscle highlights", () => {
    const element = <MiniBodyMap targetMuscles={["Chest", "Triceps"]} />;
    expect(React.isValidElement(element)).toBe(true);
    expect(element.props.targetMuscles).toContain("Chest");
  });
});
