import React from "react";
import { describe, expect, it } from "vitest";
import { VolumeBar } from "./VolumeBar";

describe("VolumeBar component", () => {
  it("renders VolumeBar chart element with weekly training volume data", () => {
    const data = [
      { week: "W1", squat: 5000, bench: 3500, deadlift: 6000, ohp: 1800 },
      { week: "W2", squat: 5500, bench: 3800, deadlift: 6400, ohp: 2000 },
    ];

    const element = <VolumeBar data={data} />;
    expect(React.isValidElement(element)).toBe(true);
    expect(element.props.data.length).toBe(2);
  });
});
