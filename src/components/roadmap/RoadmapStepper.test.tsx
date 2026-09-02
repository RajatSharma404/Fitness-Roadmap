import React from "react";
import { describe, expect, it, vi } from "vitest";
import { RoadmapStepper } from "./RoadmapStepper";
import { defaultPlannerSnapshot } from "@/lib/plannerView";

describe("RoadmapStepper component", () => {
  it("renders RoadmapStepper modal steps", () => {
    const element = (
      <RoadmapStepper
        input={defaultPlannerSnapshot.input}
        experience="intermediate"
        equipment="gym"
        onInputChange={vi.fn()}
        onExperienceChange={vi.fn()}
        onEquipmentChange={vi.fn()}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );

    expect(React.isValidElement(element)).toBe(true);
  });
});
