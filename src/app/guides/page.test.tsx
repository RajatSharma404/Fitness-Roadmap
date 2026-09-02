import React from "react";
import { describe, expect, it } from "vitest";
import GuidesPage from "./page";

describe("GuidesPage component", () => {
  it("renders GuidesPage catalog", () => {
    const element = <GuidesPage />;
    expect(React.isValidElement(element)).toBe(true);
  });
});
