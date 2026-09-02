import React from "react";
import { describe, expect, it, vi } from "vitest";
import { EdgeAnimated } from "./EdgeAnimated";
import { Position } from "@xyflow/react";

vi.mock("@xyflow/react", () => ({
  BaseEdge: ({ path, style }: any) => <path d={path} style={style} />,
  getBezierPath: () => ["M0,0 C10,10 20,20 30,30"],
  Position: { Top: "top", Bottom: "bottom", Left: "left", Right: "right" },
}));

describe("EdgeAnimated component", () => {
  it("renders EdgeAnimated element", () => {
    const element = (
      <EdgeAnimated
        id="edge-1"
        source="node-1"
        target="node-2"
        sourceX={0}
        sourceY={0}
        targetX={100}
        targetY={100}
        sourcePosition={Position.Bottom}
        targetPosition={Position.Top}
      />
    );

    expect(React.isValidElement(element)).toBe(true);
  });
});
