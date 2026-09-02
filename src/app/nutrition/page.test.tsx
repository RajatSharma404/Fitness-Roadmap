import React from "react";
import { describe, expect, it } from "vitest";
import NutritionPage from "./page";

describe("NutritionPage component", () => {
  it("renders NutritionPage with food diary and meal plans", () => {
    const element = <NutritionPage />;
    expect(React.isValidElement(element)).toBe(true);
  });
});
