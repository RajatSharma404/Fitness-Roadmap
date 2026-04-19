"use client";

import { useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { NodeCard } from "./NodeCard";
import { EdgeAnimated } from "./EdgeAnimated";

interface RoadmapNode {
  id: string;
  name: string;
  track: string;
  level: number;
  position: { x: number; y: number };
  description?: string;
  muscles?: string[];
  unlockCriteria: Record<string, unknown>;
  dependencies: string[];
  status: "locked" | "active" | "completed";
  criteriaMet?: boolean;
}

interface RoadmapFlowNodeData extends RoadmapNode {
  [key: string]: unknown;
  onClick: () => void;
}

interface RoadmapCanvasProps {
  nodes: RoadmapNode[];
  onNodeClick: (node: RoadmapNode) => void;
}

const nodeTypes = {
  default: NodeCard,
};

const edgeTypes = {
  animated: EdgeAnimated,
};

export function RoadmapCanvas({
  nodes: roadmapNodes,
  onNodeClick,
}: RoadmapCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<
    Node<RoadmapFlowNodeData>
  >([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Convert roadmap nodes to ReactFlow nodes
  useEffect(() => {
    const rfNodes: Node<RoadmapFlowNodeData>[] = roadmapNodes.map((node) => ({
      id: node.id,
      position: node.position,
      type: "default",
      data: {
        ...node,
        onClick: () => onNodeClick(node),
      },
      style: {
        width: 192,
        height: "auto",
      },
    }));

    const rfEdges: Edge[] = [];

    // Create edges from dependencies
    roadmapNodes.forEach((node) => {
      node.dependencies.forEach((depId) => {
        const depNode = roadmapNodes.find((n) => n.id === depId);

        if (depNode) {
          const isCompleted = depNode.status === "completed";
          rfEdges.push({
            id: `${depId}-${node.id}`,
            source: depId,
            target: node.id,
            type: isCompleted ? "animated" : "default",
            style: {
              stroke: isCompleted ? "#7c3aed" : "#3f3f46",
              strokeWidth: 2,
            },
            animated: isCompleted,
          });
        }
      });
    });

    setNodes(rfNodes);
    setEdges(rfEdges);
  }, [roadmapNodes, onNodeClick, setNodes, setEdges]);

  return (
    <div className="w-full h-full bg-[#08080f]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        minZoom={0.3}
        maxZoom={1.5}
        defaultViewport={{ x: 0, y: 0, zoom: 0.6 }}
        fitView
        attributionPosition="bottom-left"
      >
        <Background color="#3f3f46" gap={20} size={1} />
        <Controls className="!bg-zinc-900 !border-zinc-800" />
        <MiniMap
          className="!bg-zinc-900 !border-zinc-800"
          nodeColor={(node) => {
            const status = roadmapNodes.find((n) => n.id === node.id)?.status;
            if (status === "completed") return "#10b981";
            if (status === "active") return "#7c3aed";
            return "#52525b";
          }}
          maskColor="rgba(8, 8, 15, 0.7)"
        />
      </ReactFlow>
    </div>
  );
}
