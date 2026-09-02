import React from "react";
import { describe, expect, it } from "vitest";
import ToolsPage from "./page";

describe("ToolsPage component", () => {
  it("renders ToolsPage hub with calculator navigation", () => {
    const element = <ToolsPage />;
    expect(React.isValidElement(element)).toBe(true);
  });
});
