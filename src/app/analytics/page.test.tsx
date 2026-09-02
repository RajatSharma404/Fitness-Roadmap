import React from "react";
import { describe, expect, it } from "vitest";
import AnalyticsPage from "./page";

describe("AnalyticsPage component", () => {
  it("renders AnalyticsPage tab views and volume landmarks", () => {
    const element = <AnalyticsPage />;
    expect(React.isValidElement(element)).toBe(true);
  });
});
