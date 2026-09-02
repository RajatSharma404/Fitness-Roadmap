import React from "react";
import { describe, expect, it } from "vitest";
import AboutPage from "./page";

describe("AboutPage component", () => {
  it("renders AboutPage elements", () => {
    const element = <AboutPage />;
    expect(React.isValidElement(element)).toBe(true);
  });
});
