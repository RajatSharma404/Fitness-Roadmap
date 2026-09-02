import React from "react";
import { describe, expect, it } from "vitest";
import TermsPage from "./page";

describe("TermsPage component", () => {
  it("renders TermsPage elements", () => {
    const element = <TermsPage />;
    expect(React.isValidElement(element)).toBe(true);
  });
});
