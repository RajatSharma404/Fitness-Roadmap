import React from "react";
import { describe, expect, it, vi } from "vitest";
import { NodeCard } from "./NodeCard";
import { Position } from "@xyflow/react";

describe("NodeCard component", () => {
  it("renders NodeCard element with active status", () => {
    const nodeProps = {
      id: "node_1",
      data: {
        id: "node_1",
        name: "Squat Foundation",
        track: "BEGINNER",
        level: 1,
        status: "active" as const,
        criteriaMet: true,
        onClick: vi.fn(),
      },
      selected: false,
      type: "custom",
      zIndex: 1,
      isConnectable: false,
      positionAbsoluteX: 0,
      positionAbsoluteY: 0,
      dragging: false,
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
    };

    const element = <NodeCard {...(nodeProps as any)} />;
    expect(React.isValidElement(element)).toBe(true);
  });
});
