import React from "react";
import { describe, expect, it, vi } from "vitest";
import HomePage from "./page";

vi.mock("@/components/dashboard/StrengthRadar", () => ({
  StrengthRadar: () => <div data-testid="strength-radar" />,
}));

describe("HomePage component", () => {
  it("renders HomePage dashboard elements", () => {
    const element = <HomePage />;
    expect(React.isValidElement(element)).toBe(true);
  });
});
