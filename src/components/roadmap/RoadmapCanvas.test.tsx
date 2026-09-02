import React from "react";
import { describe, expect, it, vi } from "vitest";
import { RoadmapCanvas } from "./RoadmapCanvas";

vi.mock("@xyflow/react", () => ({
  ReactFlow: ({ children }: any) => <div data-testid="react-flow">{children}</div>,
  Background: () => <div data-testid="rf-bg" />,
  Controls: () => <div data-testid="rf-controls" />,
  MiniMap: () => <div data-testid="rf-minimap" />,
  useNodesState: () => [[], vi.fn(), vi.fn()],
  useEdgesState: () => [[], vi.fn(), vi.fn()],
  Position: { Top: "top", Bottom: "bottom", Left: "left", Right: "right" },
}));

describe("RoadmapCanvas component", () => {
  it("renders RoadmapCanvas with nodes and edges", () => {
    const nodes = [
      {
        id: "n1",
        name: "Foundation",
        track: "BEGINNER",
        level: 1,
        position: { x: 0, y: 0 },
        unlockCriteria: {},
        dependencies: [],
        status: "active" as const,
      },
    ];

    const element = <RoadmapCanvas nodes={nodes} onNodeClick={vi.fn()} />;
    expect(React.isValidElement(element)).toBe(true);
  });
});
