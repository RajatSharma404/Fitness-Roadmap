"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Target,
  TrendingUp,
  MessageSquare,
  CheckCircle2,
  Circle,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/cn";
import { PlanNodeTask, TrackCategory } from "@/lib/bodyPlanner";

interface NodeDrawerProps {
  node: {
    id: string;
    name: string;
    track: TrackCategory | string;
    description?: string;
    muscles?: string[];
    unlockCriteria?: Record<string, unknown>;
    status: string;
    xpReward?: number;
    tasks?: PlanNodeTask[];
    completedTaskIds?: string[];
  } | null;
  liftHistory: Array<{ date: string; oneRM: number }>;
  isOpen: boolean;
  onClose: () => void;
  onLogPR: () => void;
  onAskAI: () => void;
  onToggleTask?: (taskId: string) => void;
  onToggleComplete?: () => void;
  isCompleted?: boolean;
}

const TRACK_BADGES: Record<string, { label: string; style: string }> = {
  FOUNDATION: { label: "Core Foundation", style: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30" },
  STRENGTH: { label: "Iron Strength", style: "bg-amber-500/10 text-amber-300 border-amber-500/30" },
  HYPERTROPHY: { label: "Aesthetic Hypertrophy", style: "bg-purple-500/10 text-purple-300 border-purple-500/30" },
  CALISTHENICS: { label: "Kinetic Calisthenics", style: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30" },
  METABOLIC: { label: "Metabolic Bioenergetics", style: "bg-sky-500/10 text-sky-300 border-sky-500/30" },
  APEX: { label: "Apex Capstone", style: "bg-yellow-400/15 text-yellow-300 border-yellow-400/40" },
};

export function NodeDrawer({
  node,
  liftHistory,
  isOpen,
  onClose,
  onLogPR,
  onAskAI,
  onToggleTask,
  onToggleComplete,
  isCompleted = false,
}: NodeDrawerProps) {
  const [activeTab, setActiveTab] = useState<"tasks" | "criteria" | "history">(
    "tasks",
  );

  const trackInfo =
    (node && TRACK_BADGES[node.track]) || {
      label: String(node?.track || "CORE"),
      style: "bg-zinc-800 text-zinc-300 border-zinc-700",
    };

  const criteria = ((node?.unlockCriteria as Record<string, unknown>) || {}) as {
    lift?: string;
    metric?: string;
    value?: number;
    type?: string;
    unit?: string;
  };

  const tasks = node?.tasks || [];
  const completedTaskIds = new Set(node?.completedTaskIds || []);
  const taskProgressPct =
    tasks.length > 0
      ? Math.round(
          (tasks.filter((t) => completedTaskIds.has(t.id)).length /
            tasks.length) *
            100,
        )
      : isCompleted
        ? 100
        : 0;

  return (
    <AnimatePresence>
      {isOpen && node ? (
        <div key="node-drawer-root">
          <motion.div
            key="node-drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          <motion.div
            key="node-drawer-panel"
            initial={{ opacity: 0, x: 450 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 450 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-lg z-50"
          >
            <div className="h-full bg-[#0d0d15] border-l border-white/10 flex flex-col shadow-2xl">
              {/* Header */}
              <div className="p-6 border-b border-white/10 bg-white/[0.02]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={cn(
                          "text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border",
                          trackInfo.style,
                        )}
                      >
                        {trackInfo.label}
                      </span>
                      {node.xpReward ? (
                        <span className="font-mono text-xs font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-md">
                          +{node.xpReward} XP
                        </span>
                      ) : null}
                    </div>
                    <h2 className="text-2xl font-bold font-display text-white">
                      {node.name}
                    </h2>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/10 rounded-xl transition text-zinc-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Description */}
                {node.description && (
                  <p className="mt-3 text-sm text-[#8e8ea6] leading-relaxed">
                    {node.description}
                  </p>
                )}

                {/* Progress Bar Header */}
                {tasks.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/5 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                      <span>Phase Completion</span>
                      <span className="text-cyan-300 font-bold">{taskProgressPct}%</span>
                    </div>
                    <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden border border-white/5">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          isCompleted || taskProgressPct === 100
                            ? "bg-green-400"
                            : "bg-cyan-400",
                        )}
                        style={{ width: `${taskProgressPct}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Tabs */}
              <div className="flex border-b border-white/10 bg-white/[0.01]">
                {[
                  { id: "tasks", label: `Tasks (${tasks.length})` },
                  { id: "criteria", label: "Prerequisites" },
                  { id: "history", label: "PR History" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={cn(
                      "flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition-colors",
                      activeTab === tab.id
                        ? "text-cyan-300 border-b-2 border-cyan-400 bg-cyan-400/5"
                        : "text-zinc-400 hover:text-white",
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {activeTab === "tasks" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-[0.2em] text-[#636380]">
                        Actionable Checkpoints
                      </span>
                      <span className="text-xs text-zinc-400 font-mono">
                        Check off as you train
                      </span>
                    </div>

                    {tasks.length > 0 ? (
                      <div className="space-y-2.5">
                        {tasks.map((task) => {
                          const isTaskDone =
                            completedTaskIds.has(task.id) || isCompleted;

                          return (
                            <div
                              key={task.id}
                              onClick={() => onToggleTask?.(task.id)}
                              className={cn(
                                "flex items-start gap-3 p-3.5 rounded-xl border transition cursor-pointer select-none",
                                isTaskDone
                                  ? "bg-green-500/[0.04] border-green-500/30 text-zinc-200"
                                  : "bg-white/[0.02] border-white/5 text-zinc-300 hover:border-white/15",
                              )}
                            >
                              <button
                                type="button"
                                className="mt-0.5 shrink-0 transition"
                              >
                                {isTaskDone ? (
                                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                                ) : (
                                  <Circle className="w-5 h-5 text-zinc-500 hover:text-cyan-400" />
                                )}
                              </button>
                              <div className="flex-1 min-w-0">
                                <p
                                  className={cn(
                                    "text-sm font-medium leading-snug",
                                    isTaskDone && "line-through text-zinc-400",
                                  )}
                                >
                                  {task.label}
                                </p>
                              </div>
                              <span className="font-mono text-[10px] font-bold text-amber-400/80 shrink-0">
                                +{task.xp} XP
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-zinc-400">
                        No individual micro-tasks for this phase. Complete the main workout objectives to advance.
                      </div>
                    )}

                    {/* Target Muscles */}
                    {node.muscles && node.muscles.length > 0 && (
                      <div className="pt-2">
                        <div className="flex items-center gap-2 text-zinc-400 mb-2.5 text-xs uppercase tracking-wider">
                          <Target className="w-4 h-4 text-cyan-400" />
                          <span>Primary Muscle Groups</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {node.muscles.map((muscle) => (
                            <span
                              key={muscle}
                              className="px-3 py-1 bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 rounded-lg text-xs font-medium"
                            >
                              {muscle}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "criteria" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-zinc-400 text-xs uppercase tracking-wider">
                      <TrendingUp className="w-4 h-4 text-amber-400" />
                      <span>Phase Unlock Requirement</span>
                    </div>

                    <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] space-y-2">
                      <div className="text-sm text-white font-medium">
                        {criteria.type === "wilks" ? (
                          `Achieve a ${criteria.value}+ Wilks strength score across SBD.`
                        ) : criteria.type === "lift" ? (
                          `Record a ${criteria.lift} of ${criteria.value}${criteria.unit || "x BW"}.`
                        ) : (
                          `Complete prior roadmap milestones and maintain consistent training.`
                        )}
                      </div>
                      <p className="text-xs text-[#8e8ea6]">
                        This milestone automatically unlocks as soon as matching personal records or check-in adherence criteria are met.
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === "history" && (
                  <div className="space-y-4">
                    {liftHistory.length > 0 ? (
                      <div className="space-y-4">
                        <div className="h-60 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={liftHistory}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                              <XAxis
                                dataKey="date"
                                tickFormatter={(date) =>
                                  new Date(date).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                  })
                                }
                                stroke="#71717a"
                                fontSize={11}
                              />
                              <YAxis stroke="#71717a" fontSize={11} />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "#12121e",
                                  border: "1px solid rgba(255,255,255,0.1)",
                                  borderRadius: "8px",
                                }}
                                labelStyle={{ color: "#ffffff" }}
                                itemStyle={{ color: "#00d4ff" }}
                              />
                              <Line
                                type="monotone"
                                dataKey="oneRM"
                                stroke="#00d4ff"
                                strokeWidth={2.5}
                                dot={{ fill: "#00d4ff", r: 4 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>

                        <div className="text-center text-zinc-400 text-xs font-mono">
                          {liftHistory.length} PR record(s) logged
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-zinc-500 rounded-xl border border-dashed border-white/10 p-6">
                        No PR history for this phase yet. Log your first set to establish a baseline!
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="p-6 border-t border-white/10 bg-white/[0.02] space-y-3">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onToggleComplete}
                    className={cn(
                      "flex-1 font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2 text-sm",
                      isCompleted
                        ? "bg-green-500/20 text-green-300 border border-green-500/40 hover:bg-green-500/30"
                        : "bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_20px_rgba(6,182,212,0.3)]",
                    )}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {isCompleted ? "Mark Incomplete" : "Mark Phase Completed"}
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onLogPR}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white text-xs font-medium py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 border border-white/10"
                  >
                    <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                    Log Lift PR
                  </button>
                  <button
                    type="button"
                    onClick={onAskAI}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white text-xs font-medium py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 border border-white/10"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                    Consult AI Coach
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
