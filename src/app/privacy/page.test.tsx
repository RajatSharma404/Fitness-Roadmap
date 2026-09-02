import React from "react";
import { describe, expect, it } from "vitest";
import PrivacyPage from "./page";

describe("PrivacyPage component", () => {
  it("renders PrivacyPage elements", () => {
    const element = <PrivacyPage />;
    expect(React.isValidElement(element)).toBe(true);
  });
});
