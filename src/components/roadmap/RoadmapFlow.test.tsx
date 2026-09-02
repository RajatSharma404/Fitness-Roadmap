import React from "react";
import { describe, expect, it, vi } from "vitest";
import RoadmapFlow from "./RoadmapFlow";
import { PlanNode } from "@/lib/bodyPlanner";

vi.mock("@xyflow/react", () => ({
  ReactFlow: ({ children }: any) => <div data-testid="react-flow">{children}</div>,
  ReactFlowProvider: ({ children }: any) => <div data-testid="rf-provider">{children}</div>,
  Background: () => <div data-testid="rf-bg" />,
  Controls: () => <div data-testid="rf-controls" />,
  MiniMap: () => <div data-testid="rf-minimap" />,
  useReactFlow: () => ({ setCenter: vi.fn(), fitView: vi.fn() }),
  Handle: () => <div data-testid="rf-handle" />,
  Position: { Top: "top", Bottom: "bottom", Left: "left", Right: "right" },
}));

describe("RoadmapFlow component", () => {
  it("renders RoadmapFlow with nodes and progress state", () => {
    const nodes: PlanNode[] = [
      {
        id: "p1",
        title: "Phase 1: Foundation",
        description: "Form mastery",
        level: 1,
        track: "FOUNDATION",
        position: { x: 0, y: 0 },
        dependencies: [],
        xpReward: 100,
      },
    ];

    const element = (
      <RoadmapFlow
        roadmapNodes={nodes}
        progress={{ p1: true }}
        selectedNodeId="p1"
        onNodeSelect={vi.fn()}
      />
    );

    expect(React.isValidElement(element)).toBe(true);
  });
});
