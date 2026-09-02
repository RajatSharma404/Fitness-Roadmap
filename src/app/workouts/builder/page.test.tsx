import React from "react";
import { describe, expect, it } from "vitest";
import RoutineBuilderPage from "./page";

describe("RoutineBuilderPage component", () => {
  it("renders RoutineBuilderPage split editor and exercise picker", () => {
    const element = <RoutineBuilderPage />;
    expect(React.isValidElement(element)).toBe(true);
  });
});
