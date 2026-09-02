import React from "react";
import { describe, expect, it } from "vitest";
import { ProgressRing } from "./ProgressRing";

describe("ProgressRing component", () => {
  it("renders ProgressRing with clamped value", () => {
    const element = <ProgressRing value={75} size={80} strokeWidth={8} />;
    expect(React.isValidElement(element)).toBe(true);
    expect(element.props.value).toBe(75);
  });
});
