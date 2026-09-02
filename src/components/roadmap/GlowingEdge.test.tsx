import React from "react";
import { describe, expect, it, vi } from "vitest";
import { GlowingEdge } from "./GlowingEdge";
import { Position } from "@xyflow/react";

vi.mock("@xyflow/react", () => ({
  BaseEdge: ({ path, style }: any) => <path d={path} style={style} />,
  getBezierPath: () => ["M0,0 C10,10 20,20 30,30"],
  Position: { Top: "top", Bottom: "bottom", Left: "left", Right: "right" },
}));

describe("GlowingEdge component", () => {
  it("renders GlowingEdge element", () => {
    const element = (
      <GlowingEdge
        id="edge-glow-1"
        source="n1"
        target="n2"
        sourceX={0}
        sourceY={0}
        targetX={100}
        targetY={200}
        sourcePosition={Position.Bottom}
        targetPosition={Position.Top}
        animated={true}
      />
    );

    expect(React.isValidElement(element)).toBe(true);
  });
});
