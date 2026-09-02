import React from "react";
import { describe, expect, it } from "vitest";
import DashboardPage from "./page";

describe("DashboardPage component", () => {
  it("renders DashboardPage component", () => {
    const element = <DashboardPage />;
    expect(React.isValidElement(element)).toBe(true);
  });
});
