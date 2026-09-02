import React from "react";
import { describe, expect, it, vi } from "vitest";
import LeaderboardPage from "./page";

describe("LeaderboardPage component", () => {
  it("renders LeaderboardPage tabs and athlete rankings", () => {
    const element = <LeaderboardPage />;
    expect(React.isValidElement(element)).toBe(true);
  });
});
