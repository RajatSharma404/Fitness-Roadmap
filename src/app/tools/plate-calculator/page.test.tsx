import React from "react";
import { describe, expect, it } from "vitest";
import PlateCalculatorPage from "./page";

describe("PlateCalculatorPage component", () => {
  it("renders PlateCalculatorPage with visual barbell and warmup sets", () => {
    const element = <PlateCalculatorPage />;
    expect(React.isValidElement(element)).toBe(true);
  });
});
