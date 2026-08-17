"use client";

import { memo } from "react";
import { Handle, Position, NodeProps, Node } from "@xyflow/react";
import {
  Shield,
  Flame,
  Zap,
  Dumbbell,
  Trophy,
  Crown,
  Sparkles,
  Activity,
  Target,
  Award,
  CheckCircle2,
  Lock,
  Play,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { TrackCategory, PlanNodeTask } from "@/lib/bodyPlanner";

export interface SkillTreeNodeData extends Record<string, unknown> {
  title: string;
  description: string;
  level: number;
  track: TrackCategory;
  xpReward: number;
  icon?: string;
  tasks?: PlanNodeTask[];
  completedTasks?: number;
  status: "locked" | "active" | "completed";
  isDimmed?: boolean;
}

const TRACK_THEMES: Record<
  string,
  {
    border: string;
    activeBorder: string;
    bg: string;
    badge: string;
    accent: string;
    glow: string;
  }
> = {
  FOUNDATION: {
    border: "border-cyan-500/30",
    activeBorder: "border-cyan-400 ring-2 ring-cyan-400/40 shadow-[0_0_25px_rgba(6,182,212,0.35)]",
    bg: "bg-[#0b131e]/90",
    badge: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
    accent: "text-cyan-400",
    glow: "rgba(6, 182, 212, 0.4)",
  },
  STRENGTH: {
    border: "border-amber-500/30",
    activeBorder: "border-amber-400 ring-2 ring-amber-400/40 shadow-[0_0_25px_rgba(245,158,11,0.35)]",
    bg: "bg-[#1a1209]/90",
    badge: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    accent: "text-amber-400",
    glow: "rgba(245, 158, 11, 0.4)",
  },
  HYPERTROPHY: {
    border: "border-purple-500/30",
    activeBorder: "border-purple-400 ring-2 ring-purple-400/40 shadow-[0_0_25px_rgba(168,85,247,0.35)]",
    bg: "bg-[#150a21]/90",
    badge: "bg-purple-500/10 text-purple-300 border-purple-500/30",
    accent: "text-purple-400",
    glow: "rgba(168, 85, 247, 0.4)",
  },
  CALISTHENICS: {
    border: "border-emerald-500/30",
    activeBorder: "border-emerald-400 ring-2 ring-emerald-400/40 shadow-[0_0_25px_rgba(16,185,129,0.35)]",
    bg: "bg-[#071912]/90",
    badge: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    accent: "text-emerald-400",
    glow: "rgba(16, 185, 129, 0.4)",
  },
  METABOLIC: {
    border: "border-sky-500/30",
    activeBorder: "border-sky-400 ring-2 ring-sky-400/40 shadow-[0_0_25px_rgba(56,189,248,0.35)]",
    bg: "bg-[#081524]/90",
    badge: "bg-sky-500/10 text-sky-300 border-sky-500/30",
    accent: "text-sky-400",
    glow: "rgba(56, 189, 248, 0.4)",
  },
  APEX: {
    border: "border-yellow-400/40",
    activeBorder: "border-yellow-300 ring-2 ring-yellow-400/50 shadow-[0_0_35px_rgba(250,204,21,0.5)]",
    bg: "bg-gradient-to-b from-[#1f1704] to-[#12081c]",
    badge: "bg-yellow-400/15 text-yellow-300 border-yellow-400/40",
    accent: "text-yellow-400",
    glow: "rgba(250, 204, 21, 0.6)",
  },
};

function getTrackIcon(iconName?: string, track?: TrackCategory) {
  switch (iconName) {
    case "Shield":
      return <Shield className="h-4 w-4" />;
    case "Flame":
      return <Flame className="h-4 w-4" />;
    case "Zap":
      return <Zap className="h-4 w-4" />;
    case "Dumbbell":
      return <Dumbbell className="h-4 w-4" />;
    case "Trophy":
      return <Trophy className="h-4 w-4" />;
    case "Crown":
      return <Crown className="h-4 w-4" />;
    case "Sparkles":
      return <Sparkles className="h-4 w-4" />;
    case "Activity":
      return <Activity className="h-4 w-4" />;
    case "Award":
      return <Award className="h-4 w-4" />;
    case "Target":
      return <Target className="h-4 w-4" />;
    default:
      if (track === "STRENGTH") return <Dumbbell className="h-4 w-4" />;
      if (track === "HYPERTROPHY") return <Sparkles className="h-4 w-4" />;
      if (track === "CALISTHENICS") return <Activity className="h-4 w-4" />;
      if (track === "METABOLIC") return <Flame className="h-4 w-4" />;
      if (track === "APEX") return <Crown className="h-4 w-4" />;
      return <Shield className="h-4 w-4" />;
  }
}

export const SkillTreeNode = memo(function SkillTreeNode({
  data,
  selected,
}: NodeProps<Node<SkillTreeNodeData>>) {
  const theme =
    TRACK_THEMES[data.track] ||
    TRACK_THEMES.FOUNDATION;

  const isCompleted = data.status === "completed";
  const isActive = data.status === "active";
  const isLocked = data.status === "locked";

  const totalTasks = data.tasks?.length || 0;
  const completedTasks = isCompleted
    ? totalTasks
    : (data.completedTasks ?? (isActive ? 1 : 0));

  return (
    <div
      className={cn(
        "relative group w-64 rounded-2xl border p-4 transition-all duration-300 backdrop-blur-xl",
        theme.bg,
        isCompleted
          ? "border-green-500/40 shadow-[0_0_20px_rgba(34,197,94,0.15)]"
          : isActive
            ? theme.activeBorder
            : cn(theme.border, "hover:border-zinc-500"),
        data.isDimmed && "opacity-25 filter grayscale hover:opacity-80 transition",
        selected && "ring-2 ring-white/50",
      )}
    >
      {/* ReactFlow Connection Anchors */}
      <Handle
        type="target"
        position={Position.Top}
        className="!h-2.5 !w-2.5 !border-2 !border-[#07070d] !bg-zinc-400 transition group-hover:!bg-cyan-400"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-2.5 !w-2.5 !border-2 !border-[#07070d] !bg-zinc-400 transition group-hover:!bg-cyan-400"
      />

      {/* Top Meta Bar */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "inline-flex items-center justify-center p-1 rounded-lg border",
              theme.badge,
            )}
          >
            {getTrackIcon(data.icon, data.track)}
          </span>
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-400">
            {data.track === "FOUNDATION" ? "CORE" : data.track} · TIER {data.level}
          </span>
        </div>

        {/* XP Bounty Badge */}
        <span className="font-mono text-[10px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-md shrink-0">
          +{data.xpReward} XP
        </span>
      </div>

      {/* Node Title */}
      <h3 className="font-display text-base font-bold text-[#eeeef2] leading-tight line-clamp-1">
        {data.title}
      </h3>

      {/* Node Description */}
      <p className="mt-1 text-xs text-[#8e8ea6] leading-relaxed line-clamp-2 min-h-[32px]">
        {data.description}
      </p>

      {/* Task Micro Progress Bar */}
      {totalTasks > 0 ? (
        <div className="mt-3 space-y-1">
          <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
            <span>Tasks</span>
            <span>
              {completedTasks}/{totalTasks}
            </span>
          </div>
          <div className="h-1.5 w-full bg-zinc-800/80 rounded-full overflow-hidden border border-white/5">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                isCompleted
                  ? "bg-green-400"
                  : isActive
                    ? "bg-cyan-400"
                    : "bg-zinc-600",
              )}
              style={{
                width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      ) : null}

      {/* Bottom Status Pill */}
      <div className="mt-3.5 flex items-center justify-between pt-2.5 border-t border-white/5">
        <div
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
            isCompleted && "bg-green-500/10 text-green-300 border border-green-500/20",
            isActive && "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 animate-pulse",
            isLocked && "bg-zinc-800/80 text-zinc-500 border border-zinc-700/50",
          )}
        >
          {isCompleted ? <CheckCircle2 className="h-3 w-3" /> : null}
          {isActive ? <Play className="h-3 w-3 fill-cyan-300" /> : null}
          {isLocked ? <Lock className="h-3 w-3" /> : null}
          {data.status}
        </div>

        <span className="text-[10px] font-mono text-zinc-500 group-hover:text-zinc-300 transition">
          Details →
        </span>
      </div>
    </div>
  );
});
