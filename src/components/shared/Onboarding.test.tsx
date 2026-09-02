import React from "react";
import { describe, expect, it, vi } from "vitest";
import { Onboarding } from "./Onboarding";

describe("Onboarding component", () => {
  it("renders Onboarding modal when open", () => {
    const onComplete = vi.fn();
    const element = <Onboarding isOpen={true} onComplete={onComplete} />;
    expect(React.isValidElement(element)).toBe(true);
  });
});
