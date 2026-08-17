"use client";

import { useMemo, useEffect, useCallback } from "react";
import {
  Background,
  Controls,
  Edge,
  MiniMap,
  Node,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Target, Maximize2 } from "lucide-react";
import { SkillTreeNode, SkillTreeNodeData } from "./SkillTreeNode";
import { GlowingEdge } from "./GlowingEdge";
import { PlanNode, TrackCategory } from "@/lib/bodyPlanner";

interface RoadmapFlowProps {
  roadmapNodes: PlanNode[];
  progress: Record<string, boolean>;
  selectedNodeId: string;
  onNodeSelect: (nodeId: string) => void;
  trackFilter?: TrackCategory | "ALL";
}

const nodeTypes = {
  skillNode: SkillTreeNode,
  phase: SkillTreeNode,
};

const edgeTypes = {
  glowing: GlowingEdge,
};

const TRACK_STROKES: Record<string, string> = {
  FOUNDATION: "#06b6d4",
  STRENGTH: "#f59e0b",
  HYPERTROPHY: "#a855f7",
  CALISTHENICS: "#10b981",
  METABOLIC: "#38bdf8",
  APEX: "#facc15",
};

function FlowCanvas({
  roadmapNodes,
  progress,
  selectedNodeId,
  onNodeSelect,
  trackFilter = "ALL",
}: RoadmapFlowProps) {
  const { setCenter, fitView } = useReactFlow();

  // Check if prerequisites are satisfied for each node
  const flowNodes: Node<SkillTreeNodeData>[] = useMemo(() => {
    return roadmapNodes.map((node) => {
      const isCompleted = Boolean(progress[node.id]);
      const prereqsMet =
        node.dependencies.length === 0 ||
        node.dependencies.every((depId) => Boolean(progress[depId]));

      let status: "locked" | "active" | "completed" = "locked";
      if (isCompleted) {
        status = "completed";
      } else if (prereqsMet || node.id === selectedNodeId) {
        status = "active";
      }

      const matchesFilter =
        trackFilter === "ALL" ||
        node.track === trackFilter ||
        node.track === "FOUNDATION" ||
        node.track === "APEX";

      const isDimmed = !matchesFilter;

      return {
        id: node.id,
        position: node.position,
        type: "skillNode",
        data: {
          title: node.title,
          description: node.description,
          level: node.level,
          track: node.track,
          xpReward: node.xpReward || 100,
          icon: node.icon,
          tasks: node.tasks,
          status,
          isDimmed,
        },
      };
    });
  }, [roadmapNodes, progress, selectedNodeId, trackFilter]);

  const flowEdges: Edge[] = useMemo(() => {
    return roadmapNodes.flatMap((node) =>
      node.dependencies.map((dependencyId) => {
        const sourceNode = roadmapNodes.find((n) => n.id === dependencyId);
        const sourceCompleted = Boolean(progress[dependencyId]);
        const trackColor = sourceNode ? TRACK_STROKES[sourceNode.track] : "#00d4ff";

        return {
          id: `${dependencyId}->${node.id}`,
          source: dependencyId,
          target: node.id,
          type: "glowing",
          animated: sourceCompleted,
          style: {
            stroke: sourceCompleted ? trackColor : "rgba(255,255,255,0.12)",
          },
        };
      }),
    );
  }, [roadmapNodes, progress]);

  // Smooth camera panning when a node is selected
  const handleFocusNode = useCallback(
    (nodeId: string) => {
      const target = roadmapNodes.find((n) => n.id === nodeId);
      if (target) {
        setCenter(target.position.x + 128, target.position.y + 80, {
          duration: 700,
          zoom: 0.9,
        });
      }
    },
    [roadmapNodes, setCenter],
  );

  // Focus active frontier node on initial mount / filter change
  useEffect(() => {
    if (selectedNodeId) {
      handleFocusNode(selectedNodeId);
    }
  }, [selectedNodeId, handleFocusNode]);

  return (
    <div className="h-[calc(100vh-220px)] min-h-[580px] w-full relative bg-[#07070d]">
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.3}
        maxZoom={1.3}
        onNodeClick={(_, node) => {
          onNodeSelect(node.id);
          handleFocusNode(node.id);
        }}
      >
        <Background color="rgba(255,255,255,0.04)" gap={24} size={1.5} />
        <Controls
          className="!bg-[#12121e] !border !border-white/10 !rounded-xl !overflow-hidden !shadow-2xl"
          showInteractive={false}
        />
        <MiniMap
          nodeColor={(node) => {
            const data = flowNodes.find((item) => item.id === node.id)?.data;
            if (!data) return "#636380";
            if (data.status === "completed") return "#22c55e";
            if (data.status === "active") {
              return TRACK_STROKES[data.track] || "#06b6d4";
            }
            return "#3f3f46";
          }}
          maskColor="rgba(7,7,13,0.8)"
          className="!bg-[#0e0e17] !border !border-white/10 !rounded-xl !shadow-2xl"
        />
      </ReactFlow>

      {/* Floating Canvas Camera Controls */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-[#12121e]/90 border border-white/10 p-1.5 rounded-xl shadow-2xl backdrop-blur-md">
        <button
          type="button"
          onClick={() => handleFocusNode(selectedNodeId)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-cyan-300 hover:bg-white/10 transition"
          title="Smooth pan to currently focused milestone"
        >
          <Target className="w-3.5 h-3.5" />
          <span>Focus Active</span>
        </button>
        <div className="h-4 w-px bg-white/10" />
        <button
          type="button"
          onClick={() => fitView({ padding: 0.2, duration: 600 })}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-300 hover:bg-white/10 transition"
          title="Reset camera and fit all branches"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>Fit Tree</span>
        </button>
      </div>
    </div>
  );
}

export default function RoadmapFlow(props: RoadmapFlowProps) {
  return (
    <ReactFlowProvider>
      <FlowCanvas {...props} />
    </ReactFlowProvider>
  );
}
