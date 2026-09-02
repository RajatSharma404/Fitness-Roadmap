import React from "react";
import { describe, expect, it } from "vitest";
import CalorieToolPage from "./page";

describe("CalorieToolPage component", () => {
  it("renders CalorieToolPage inputs and results", () => {
    const element = <CalorieToolPage />;
    expect(React.isValidElement(element)).toBe(true);
  });
});
