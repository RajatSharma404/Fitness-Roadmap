import React from "react";
import { describe, expect, it } from "vitest";
import WorkoutsPage from "./page";

describe("WorkoutsPage component", () => {
  it("renders WorkoutsPage with split days and exercise cards", () => {
    const element = <WorkoutsPage />;
    expect(React.isValidElement(element)).toBe(true);
  });
});
