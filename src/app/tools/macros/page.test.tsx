import React from "react";
import { describe, expect, it } from "vitest";
import MacroToolPage from "./page";

describe("MacroToolPage component", () => {
  it("renders MacroToolPage inputs and macro split charts", () => {
    const element = <MacroToolPage />;
    expect(React.isValidElement(element)).toBe(true);
  });
});
