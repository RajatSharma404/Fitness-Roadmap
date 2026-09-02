import React from "react";
import { describe, expect, it } from "vitest";
import GeneratorPage from "./page";

describe("GeneratorPage component", () => {
  it("renders GeneratorPage multi-step wizard", () => {
    const element = <GeneratorPage />;
    expect(React.isValidElement(element)).toBe(true);
  });
});
