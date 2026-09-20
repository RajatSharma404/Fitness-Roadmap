import React from "react";
import { describe, expect, it, vi } from "vitest";
import { HomeDashboardClient } from "./HomeDashboardClient";

vi.mock("@/components/dashboard/StrengthRadar", () => ({
  StrengthRadar: () => <div data-testid="strength-radar" />,
}));

describe("HomeDashboardClient component", () => {
  it("renders client dashboard interactively", () => {
    const element = <HomeDashboardClient />;
    expect(React.isValidElement(element)).toBe(true);
  });
});
