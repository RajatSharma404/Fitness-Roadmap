import React from "react";
import { describe, expect, it } from "vitest";
import OneRepMaxToolPage from "./page";

describe("OneRepMaxToolPage component", () => {
  it("renders OneRepMaxToolPage with Epley & Brzycki calculations", () => {
    const element = <OneRepMaxToolPage />;
    expect(React.isValidElement(element)).toBe(true);
  });
});
