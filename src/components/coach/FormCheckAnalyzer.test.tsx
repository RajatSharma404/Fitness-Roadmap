import React from "react";
import { describe, expect, it } from "vitest";
import { FormCheckAnalyzer } from "./FormCheckAnalyzer";

describe("FormCheckAnalyzer component", () => {
  it("renders FormCheckAnalyzer component element", () => {
    const element = <FormCheckAnalyzer />;
    expect(React.isValidElement(element)).toBe(true);
  });
});
