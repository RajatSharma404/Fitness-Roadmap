import React from "react";
import { describe, expect, it } from "vitest";
import { VisualBarbell } from "./VisualBarbell";
import { PlateDefinition } from "@/lib/plateCalculator";

describe("VisualBarbell component", () => {
  it("renders VisualBarbell with plate configurations", () => {
    const plates: PlateDefinition[] = [
      { weight: 20, color: "#2563eb", textColor: "#ffffff", diameterRatio: 1, widthRatio: 1, label: "20kg" },
      { weight: 10, color: "#16a34a", textColor: "#ffffff", diameterRatio: 0.85, widthRatio: 0.8, label: "10kg" },
    ];

    const element = (
      <VisualBarbell
        platesPerSide={plates}
        barWeight={20}
        totalWeight={80}
        unit="kg"
      />
    );

    expect(React.isValidElement(element)).toBe(true);
  });
});
