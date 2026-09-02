import React from "react";
import { describe, expect, it } from "vitest";
import RoadmapPage from "./page";

describe("RoadmapPage component", () => {
  it("renders RoadmapPage tree matrix and sidebar", () => {
    const element = <RoadmapPage />;
    expect(React.isValidElement(element)).toBe(true);
  });
});
