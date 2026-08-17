"use client";

import { memo } from "react";
import { BaseEdge, EdgeProps, getBezierPath } from "@xyflow/react";

export const GlowingEdge = memo(function GlowingEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  animated,
}: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const isUnlocked = animated || style.stroke === "#00d4ff" || style.stroke === "#10b981";

  return (
    <>
      {/* Outer Glow Halo */}
      {isUnlocked && (
        <path
          d={edgePath}
          fill="none"
          stroke={style.stroke || "#00d4ff"}
          strokeWidth={6}
          strokeOpacity={0.25}
          className="blur-[2px]"
        />
      )}

      {/* Main Conduit Edge */}
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: isUnlocked ? 2.5 : 1.5,
          stroke: isUnlocked ? style.stroke || "#00d4ff" : "rgba(255, 255, 255, 0.12)",
        }}
      />
    </>
  );
});
