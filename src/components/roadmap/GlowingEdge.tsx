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

  const isUnlocked = animated || style.stroke === "#00d4ff" || style.stroke === "#10b981" || style.stroke === "#f59e0b" || style.stroke === "#a855f7" || style.stroke === "#facc15" || style.stroke === "#38bdf8";

  const strokeColor = style.stroke || "#00d4ff";

  return (
    <>
      {/* Outer Glow Halo */}
      {isUnlocked && (
        <path
          d={edgePath}
          fill="none"
          stroke={strokeColor}
          strokeWidth={7}
          strokeOpacity={0.25}
          className="blur-[3px]"
        />
      )}

      {/* Main Conduit Wire */}
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: isUnlocked ? 2.5 : 1.5,
          stroke: isUnlocked ? strokeColor : "rgba(255, 255, 255, 0.12)",
        }}
      />

      {/* Animated Flowing Energy Photons */}
      {isUnlocked && (
        <>
          {/* Primary Lead Photon */}
          <circle r="4" fill="#ffffff" filter="drop-shadow(0 0 6px #ffffff)">
            <animateMotion
              dur="2.4s"
              repeatCount="indefinite"
              path={edgePath}
            />
          </circle>

          {/* Secondary Pulse Photon */}
          <circle r="3" fill={strokeColor} opacity={0.85} filter={`drop-shadow(0 0 5px ${strokeColor})`}>
            <animateMotion
              dur="2.4s"
              repeatCount="indefinite"
              begin="1.2s"
              path={edgePath}
            />
          </circle>
        </>
      )}
    </>
  );
});
