'use client';

import { useEffect, useRef } from 'react';
import { BaseEdge, EdgeProps, getBezierPath } from '@xyflow/react';

export function EdgeAnimated({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <g className="neon-edge">
      <defs>
        <filter id={`glow-${id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: '#7c3aed',
          strokeWidth: 3,
          filter: `url(#glow-${id})`,
        }}
      />
      <path
        d={edgePath}
        fill="none"
        stroke="rgba(124, 58, 237, 0.3)"
        strokeWidth={6}
        className="animate-pulse"
      />
    </g>
  );
}
