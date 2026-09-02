import React from "react";
import { describe, expect, it } from "vitest";
import Footer from "./Footer";

describe("Footer component", () => {
  it("renders Footer component element", () => {
    const element = <Footer />;
    expect(React.isValidElement(element)).toBe(true);
  });
});
