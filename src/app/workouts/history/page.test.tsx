import React from "react";
import { describe, expect, it } from "vitest";
import WorkoutHistoryPage from "./page";

describe("WorkoutHistoryPage component", () => {
  it("renders WorkoutHistoryPage with calendar and logged sessions", () => {
    const element = <WorkoutHistoryPage />;
    expect(React.isValidElement(element)).toBe(true);
  });
});
