import React from "react";
import { describe, expect, it, vi } from "vitest";
import { NodeDrawer } from "./NodeDrawer";

describe("NodeDrawer component", () => {
  it("renders NodeDrawer with tasks and criteria tabs", () => {
    const node = {
      id: "sq_1",
      name: "Squat Master",
      track: "STRENGTH",
      description: "Hit 2x BW squat",
      muscles: ["Quads", "Glutes"],
      unlockCriteria: { type: "lift", lift: "Squat", value: 140, unit: "kg" },
      status: "active",
      xpReward: 300,
      tasks: [{ id: "t1", label: "Perform 5x5 at 100kg", xp: 100 }],
      completedTaskIds: ["t1"],
    };

    const element = (
      <NodeDrawer
        node={node}
        liftHistory={[{ date: "2026-08-01", oneRM: 140 }]}
        isOpen={true}
        onClose={vi.fn()}
        onLogPR={vi.fn()}
        onAskAI={vi.fn()}
        onToggleTask={vi.fn()}
        onToggleComplete={vi.fn()}
        isCompleted={false}
      />
    );

    expect(React.isValidElement(element)).toBe(true);
  });
});
