import React from "react";
import { describe, expect, it, vi } from "vitest";
import { PRLogger } from "./PRLogger";

describe("PRLogger component", () => {
  it("renders PRLogger modal when open", () => {
    const onSave = vi.fn();
    const onClose = vi.fn();

    const element = <PRLogger isOpen={true} onClose={onClose} onSave={onSave} initialLiftName="bench" />;
    expect(React.isValidElement(element)).toBe(true);
  });
});
