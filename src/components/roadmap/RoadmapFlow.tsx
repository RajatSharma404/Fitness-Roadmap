"use client";

import {
  Background,
  Controls,
  Edge,
  MiniMap,
  Node,
  NodeProps,
  ReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { CheckCircle2, Lock } from "lucide-react";

interface RoadmapNodeData extends Record<string, unknown> {
  title: string;
  description: string;
  level: number;
  status: "locked" | "active" | "completed";
}

interface RoadmapNodeLike {
  id: string;
  position: { x: number; y: number };
  title: string;
  description: string;
  level: number;
  dependencies: string[];
}

interface RoadmapFlowProps {
  roadmapNodes: RoadmapNodeLike[];
  progress: Record<string, boolean>;
  selectedNodeId: string;
  onNodeSelect: (nodeId: string) => void;
}

const nodeTypes = {
  phase: PhaseNode,
};

function PhaseNode({ data }: NodeProps<Node<RoadmapNodeData>>) {
  const statusStyles = {
    locked:
      "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] text-[#636380]",
    active: "border-cyan-400 bg-cyan-400/5 text-[#eeeef2]",
    completed: "border-green-400 bg-green-400/5 text-[#eeeef2]",
  };

  const badgeStyles = {
    locked: "bg-white/5 text-[#636380]",
    active: "bg-cyan-400/10 text-cyan-300",
    completed: "bg-green-400/10 text-green-300",
  };

  return (
    <div className={`w-50 rounded-xl border p-4 ${statusStyles[data.status]}`}>
      <p className="text-[11px] uppercase tracking-[0.22em] text-[#636380]">
        Phase {data.level}
      </p>
      <h3 className="mt-1 font-display text-lg font-semibold text-[#eeeef2]">
        {data.title}
      </h3>
      <p className="mt-2 text-xs leading-5 text-[#636380]">
        {data.description}
      </p>
      <div
        className={`mt-4 inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium ${badgeStyles[data.status]}`}
      >
        {data.status === "completed" ? (
          <CheckCircle2 className="h-3.5 w-3.5" />
        ) : null}
        {data.status === "locked" ? <Lock className="h-3.5 w-3.5" /> : null}
        {data.status.toUpperCase()}
      </div>
    </div>
  );
}

export default function RoadmapFlow({
  roadmapNodes,
  progress,
  selectedNodeId,
  onNodeSelect,
}: RoadmapFlowProps) {
  const flowNodes: Node<RoadmapNodeData>[] = roadmapNodes.map((node) => ({
    id: node.id,
    position: node.position,
    type: "phase",
    data: {
      title: node.title,
      description: node.description,
      level: node.level,
      status: progress[node.id]
        ? "completed"
        : node.id === selectedNodeId
          ? "active"
          : "locked",
    },
    style: {
      opacity:
        selectedNodeId &&
        selectedNodeId !== node.id &&
        !node.dependencies.includes(selectedNodeId)
          ? 0.35
          : 1,
    },
  }));

  const flowEdges: Edge[] = roadmapNodes.flatMap((node) =>
    node.dependencies.map((dependencyId) => ({
      id: `${dependencyId}-${node.id}`,
      source: dependencyId,
      target: node.id,
      animated: Boolean(progress[dependencyId]),
      style: {
        stroke: progress[dependencyId] ? "#00d4ff" : "rgba(255,255,255,0.14)",
        strokeWidth: 2,
        strokeDasharray: progress[dependencyId] ? "5 5" : undefined,
      },
    })),
  );

  return (
    <div className="h-[calc(100vh-240px)] min-h-130 w-full">
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.5}
        maxZoom={1.2}
        onNodeClick={(_, node) => onNodeSelect(node.id)}
      >
        <Background color="rgba(255,255,255,0.05)" gap={22} />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            const status = flowNodes.find((item) => item.id === node.id)?.data
              .status;
            if (status === "completed") return "#00e676";
            if (status === "active") return "#00d4ff";
            return "#636380";
          }}
          maskColor="rgba(7,7,13,0.72)"
          style={{
            backgroundColor: "#12121e",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        />
      </ReactFlow>
    </div>
  );
}
