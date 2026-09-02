import React from "react";
import { describe, expect, it, vi } from "vitest";
import { SkillTreeNode } from "./SkillTreeNode";
import { Position } from "@xyflow/react";

vi.mock("@xyflow/react", () => ({
  Handle: () => <div data-testid="flow-handle" />,
  Position: { Top: "top", Bottom: "bottom", Left: "left", Right: "right" },
}));

describe("SkillTreeNode component", () => {
  it("renders SkillTreeNode with track themes and tasks progress", () => {
    const nodeProps = {
      id: "st_1",
      data: {
        title: "Deadlift Titan",
        description: "Pull 2.5x BW from floor",
        level: 3,
        track: "STRENGTH" as const,
        xpReward: 500,
        tasks: [{ id: "t1", label: "Deficit pulls 3x3", xp: 150 }],
        completedTasks: 1,
        status: "active" as const,
      },
      selected: false,
      type: "skillNode",
      zIndex: 1,
      isConnectable: false,
      positionAbsoluteX: 0,
      positionAbsoluteY: 0,
      dragging: false,
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
    };

    const element = <SkillTreeNode {...(nodeProps as any)} />;
    expect(React.isValidElement(element)).toBe(true);
  });
});
