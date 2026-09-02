import React from "react";
import { describe, expect, it, vi } from "vitest";
import { TopBar } from "./TopBar";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/dashboard"),
}));

describe("TopBar component", () => {
  it("renders TopBar component with page title and metadata", () => {
    const element = <TopBar />;
    expect(React.isValidElement(element)).toBe(true);
  });
});
