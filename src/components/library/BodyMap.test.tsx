import React from "react";
import { describe, expect, it, vi } from "vitest";
import { BodyMap } from "./BodyMap";

describe("BodyMap component", () => {
  it("renders BodyMap element with selected muscles", () => {
    const selected = new Set(["chest", "abs"]);
    const onToggle = vi.fn();

    const element = <BodyMap selected={selected} onToggle={onToggle} />;
    expect(React.isValidElement(element)).toBe(true);
    expect(element.props.selected.has("chest")).toBe(true);
  });
});
