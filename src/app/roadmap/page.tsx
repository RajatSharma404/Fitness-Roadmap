"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import {
  Play,
  Settings,
  Shield,
  Dumbbell,
  Sparkles,
  Activity,
  Flame,
  Target,
} from "lucide-react";
import {
  ActionButton,
  Card,
  SectionHeader,
} from "@/components/shared/UIPrimitives";
import { ProgressRing } from "@/components/layout/ProgressRing";
import { RoadmapStepper } from "@/components/roadmap/RoadmapStepper";
import { calculateBodyPlan, TrackCategory, PlanNode } from "@/lib/bodyPlanner";
import {
  computeReadinessScore,
  getEnhancedNodeStatus,
} from "@/lib/planEnhancements";
import {
  defaultPlannerSnapshot,
  dedupeCheckinsByDate,
  persistPlannerSnapshot,
  readPlannerSnapshot,
  syncPlannerSnapshotFromServer,
} from "@/lib/plannerView";
import { NodeDrawer } from "@/components/roadmap/NodeDrawer";
import { PRLogger } from "@/components/shared/PRLogger";
import { cn } from "@/lib/cn";

const RoadmapFlow = dynamic(() => import("@/components/roadmap/RoadmapFlow"), {
  ssr: false,
  loading: () => (
    <div className="h-[calc(100vh-220px)] min-h-[580px] w-full rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] flex items-center justify-center">
      <div className="text-cyan-400 font-medium animate-pulse">
        Initializing RPG Skill Tree Matrix...
      </div>
    </div>
  ),
});

export default function RoadmapPage() {
  const [snapshot, setSnapshot] = useState(defaultPlannerSnapshot);
  const [progress, setProgress] = useState<Record<string, boolean>>(
    defaultPlannerSnapshot.progress,
  );
  const [completedTaskIdsByNode, setCompletedTaskIdsByNode] = useState<
    Record<string, string[]>
  >(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("roadmap_completed_tasks");
        if (stored) {
          return JSON.parse(stored);
        }
      } catch {}
    }
    return {};
  });
  const [selectedNodeId, setSelectedNodeId] = useState<string>("assessment");
  const [trackFilter, setTrackFilter] = useState<TrackCategory | "ALL">("ALL");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [draftInput, setDraftInput] = useState(snapshot.input);
  const [draftEquipment, setDraftEquipment] = useState(snapshot.equipment);
  const [draftExperience, setDraftExperience] = useState(snapshot.experience);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [liftHistory, setLiftHistory] = useState<Array<{ date: string; oneRM: number }>>([]);
  const [prLoggerOpen, setPrLoggerOpen] = useState(false);

  function getExerciseForNode(nodeId: string): string | undefined {
    const mapping: Record<string, string> = {
      assessment: "Squat",
      energy_foundation: "Bench Press",
      movement_literacy: "Deadlift",
      strength_t1: "Squat",
      strength_t2: "Deadlift",
      strength_t3: "Bench Press",
      hypertrophy_t1: "Incline Dumbbell Press",
      hypertrophy_t2: "Lat Pulldown",
      hypertrophy_t3: "Barbell Row",
      calisthenics_t1: "Pull-Up",
      calisthenics_t2: "Dips",
      calisthenics_t3: "Muscle-Up",
      metabolic_t1: "Overhead Press",
      metabolic_t2: "Romanian Deadlift",
      metabolic_t3: "Hip Thrust",
      apex_mastery: "Squat",
      // Legacy aliases
      calories: "Bench Press",
      macros: "Deadlift",
      hydration: "Overhead Press",
      training: "Squat",
      nutrition_execution: "Bench Press",
      progress_tracking: "Deadlift",
      adjustments: "Overhead Press",
    };
    return mapping[nodeId] || "Squat";
  }

  function getMusclesForNode(nodeId: string): string[] {
    const mapping: Record<string, string[]> = {
      assessment: ["Full Body", "Mobility", "Core"],
      energy_foundation: ["Metabolism", "Nutrition", "Hydration"],
      movement_literacy: ["Quads", "Hamstrings", "Back", "Chest"],
      strength_t1: ["Quads", "Chest", "Triceps"],
      strength_t2: ["Posterior Chain", "Hamstrings", "Lower Back"],
      strength_t3: ["Full SBD Chain", "Upper Body", "Core"],
      hypertrophy_t1: ["Chest", "Lats", "Deltoids", "Biceps"],
      hypertrophy_t2: ["Arms", "Shoulders", "Upper Back"],
      hypertrophy_t3: ["Vascularity", "Weak Points", "Symmetry"],
      calisthenics_t1: ["Lats", "Biceps", "Chest", "Triceps"],
      calisthenics_t2: ["Shoulder Stabilizers", "Core", "Wrist Extensors"],
      calisthenics_t3: ["Lats", "Explosive Pull", "Forearms"],
      metabolic_t1: ["Cardiovascular", "Energy Balance", "Steps"],
      metabolic_t2: ["Endocrine", "Glycogen", "Recovery"],
      metabolic_t3: ["Lean Muscle", "Insulin Sensitivity"],
      apex_mastery: ["Universal Athleticism", "Peak SBD", "Bioenergetics"],
    };
    return mapping[nodeId] ?? ["Full Body"];
  }

  function getUnlockCriteriaForNode(
    node: PlanNode,
  ): Record<string, unknown> {
    if (node.unlockCriteria) return node.unlockCriteria;
    return { type: "simple", lift: node.title, value: 0, unit: "" };
  }

  useEffect(() => {
    const sync = () => {
      const next = readPlannerSnapshot();
      setSnapshot(next);
      setDraftInput(next.input);
      setDraftEquipment(next.equipment);
      setDraftExperience(next.experience);
      setProgress(next.progress);
    };

    sync();
    void syncPlannerSnapshotFromServer().then((serverSnapshot) => {
      setSnapshot(serverSnapshot);
      setDraftInput(serverSnapshot.input);
      setDraftEquipment(serverSnapshot.equipment);
      setDraftExperience(serverSnapshot.experience);
      setProgress(serverSnapshot.progress);
    });
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const plan = useMemo(
    () => calculateBodyPlan(snapshot.input),
    [snapshot.input],
  );

  const readiness = useMemo(() => {
    const latest = dedupeCheckinsByDate(snapshot.checkins)[0];
    return latest ? computeReadinessScore(latest) : 74;
  }, [snapshot.checkins]);

  // Calculate Total Roadmap XP
  const totalXP = useMemo(() => {
    let xp = 0;
    plan.roadmapNodes.forEach((node) => {
      if (progress[node.id]) {
        xp += node.xpReward || 150;
      } else {
        const completedTasks = completedTaskIdsByNode[node.id] || [];
        node.tasks?.forEach((task) => {
          if (completedTasks.includes(task.id)) {
            xp += task.xp;
          }
        });
      }
    });
    return xp;
  }, [plan.roadmapNodes, progress, completedTaskIdsByNode]);

  // Determine Athlete Mastery Rank
  const masteryRank = useMemo(() => {
    if (totalXP >= 2500) return { title: "Apex Grandmaster", level: 5, color: "text-yellow-400" };
    if (totalXP >= 1500) return { title: "Titan of Discipline", level: 4, color: "text-purple-400" };
    if (totalXP >= 800) return { title: "Iron Vanguard", level: 3, color: "text-amber-400" };
    if (totalXP >= 300) return { title: "Barbell Adept", level: 2, color: "text-cyan-400" };
    return { title: "Novice Initiate", level: 1, color: "text-emerald-400" };
  }, [totalXP]);

  const completedCount = plan.roadmapNodes.filter(
    (node) => progress[node.id],
  ).length;

  const completionRate = Math.round(
    (completedCount / plan.roadmapNodes.length) * 100,
  );

  const selectedNode =
    plan.roadmapNodes.find((node) => node.id === selectedNodeId) ??
    plan.roadmapNodes[0];

  const selectedNodeStatus = getEnhancedNodeStatus(
    selectedNode,
    progress,
    snapshot.checkins,
  );

  const activeLift = selectedNode ? getExerciseForNode(selectedNode.id) : undefined;

  const nodeForDrawer = useMemo(() => {
    if (!selectedNode) return null;
    return {
      id: selectedNode.id,
      name: selectedNode.title,
      track: selectedNode.track,
      description: selectedNode.description,
      muscles: getMusclesForNode(selectedNode.id),
      unlockCriteria: getUnlockCriteriaForNode(selectedNode),
      status: selectedNodeStatus,
      xpReward: selectedNode.xpReward,
      tasks: selectedNode.tasks,
      completedTaskIds: completedTaskIdsByNode[selectedNode.id] || [],
    };
  }, [selectedNode, selectedNodeStatus, completedTaskIdsByNode]);

  // Toggle individual micro-task
  const handleToggleTask = (taskId: string) => {
    if (!selectedNode) return;
    const currentList = completedTaskIdsByNode[selectedNode.id] || [];
    const isDone = currentList.includes(taskId);
    const nextList = isDone
      ? currentList.filter((id) => id !== taskId)
      : [...currentList, taskId];

    const nextMap = {
      ...completedTaskIdsByNode,
      [selectedNode.id]: nextList,
    };
    setCompletedTaskIdsByNode(nextMap);
    try {
      localStorage.setItem("roadmap_completed_tasks", JSON.stringify(nextMap));
    } catch {}

    // If all tasks are completed, auto-mark node as complete!
    if (
      selectedNode.tasks &&
      selectedNode.tasks.length > 0 &&
      nextList.length === selectedNode.tasks.length &&
      !progress[selectedNode.id]
    ) {
      handleToggleCompleteNode(selectedNode.id, true);
    }
  };

  const handleToggleCompleteNode = async (nodeId: string, forcedValue?: boolean) => {
    const next = {
      ...progress,
      [nodeId]: forcedValue !== undefined ? forcedValue : !progress[nodeId],
    };
    setProgress(next);

    const saved = await persistPlannerSnapshot({
      input: snapshot.input,
      checkins: snapshot.checkins,
      equipment: snapshot.equipment,
      experience: snapshot.experience,
      progress: next,
    });
    setSnapshot((current) => ({ ...current, progress: next }));
    setSaveMessage(
      saved
        ? "Roadmap progress synced."
        : "Roadmap progress saved locally.",
    );
    setTimeout(() => setSaveMessage(null), 4000);
  };

  useEffect(() => {
    if (drawerOpen && selectedNode) {
      if (activeLift) {
        fetch(`/api/lifts?lift=${encodeURIComponent(activeLift)}`)
          .then((res) => (res.ok ? res.json() : Promise.reject(res)))
          .then((data) => {
            if (Array.isArray(data)) {
              const formatted = data
                .map((l: { date: string; oneRM: number }) => ({
                  date: l.date,
                  oneRM: l.oneRM ?? 0,
                }))
                .reverse();
              setLiftHistory(formatted);
            }
          })
          .catch(() => {
            try {
              const guestPRs = JSON.parse(localStorage.getItem("guestPRs") || "[]");
              const matching = guestPRs
                .filter((p: { name: string }) => p.name?.toLowerCase() === activeLift.toLowerCase())
                .map((p: { date: string; oneRM: number }) => ({
                  date: p.date,
                  oneRM: p.oneRM ?? 0,
                }))
                .reverse();
              setLiftHistory(matching);
            } catch {
              setLiftHistory([]);
            }
          });
      } else {
        const timer = setTimeout(() => {
          setLiftHistory([]);
        }, 0);
        return () => clearTimeout(timer);
      }
    }
  }, [drawerOpen, selectedNodeId, selectedNode, activeLift]);

  async function handleSavePR(data: {
    name: string;
    weight: number;
    reps: number;
    setType: "WORKING" | "MAX_EFFORT" | "COMPETITION";
    notes?: string;
    videoUrl?: string;
  }) {
    try {
      const res = await fetch("/api/lifts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const epley1RM = data.weight * (1 + data.reps / 30);
      const formattedDate = new Date().toISOString();

      if (res.ok) {
        setSaveMessage(`Successfully logged PR of ${data.weight}kg for ${data.name}!`);
        if (activeLift && data.name.toLowerCase() === activeLift.toLowerCase()) {
          setLiftHistory((prev) => [...prev, { date: formattedDate, oneRM: epley1RM }]);
        }
        setTimeout(() => setSaveMessage(null), 5000);
      } else {
        const guestPRs = JSON.parse(localStorage.getItem("guestPRs") || "[]");
        const newEntry = { ...data, oneRM: epley1RM, date: formattedDate };
        localStorage.setItem("guestPRs", JSON.stringify([newEntry, ...guestPRs]));

        if (activeLift && data.name.toLowerCase() === activeLift.toLowerCase()) {
          setLiftHistory((prev) => [...prev, { date: formattedDate, oneRM: epley1RM }]);
        }
        setSaveMessage(`Logged PR of ${data.weight}kg for ${data.name} (Saved locally)!`);
        setTimeout(() => setSaveMessage(null), 5000);
      }
    } catch (err) {
      console.error("Error saving PR:", err);
      const epley1RM = data.weight * (1 + data.reps / 30);
      const formattedDate = new Date().toISOString();
      const guestPRs = JSON.parse(localStorage.getItem("guestPRs") || "[]");
      localStorage.setItem("guestPRs", JSON.stringify([{ ...data, oneRM: epley1RM, date: formattedDate }, ...guestPRs]));
      setSaveMessage(`Logged PR of ${data.weight}kg for ${data.name} (Saved locally)!`);
      setTimeout(() => setSaveMessage(null), 5000);
    }
  }

  function handleAskAI() {
    window.dispatchEvent(new CustomEvent("open-ai-chat"));
  }

  const trackCategories: Array<{
    id: TrackCategory | "ALL";
    label: string;
    icon: React.ReactNode;
  }> = [
    { id: "ALL", label: "All Specializations", icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: "FOUNDATION", label: "Core Foundation", icon: <Shield className="w-3.5 h-3.5" /> },
    { id: "STRENGTH", label: "Iron Strength", icon: <Dumbbell className="w-3.5 h-3.5" /> },
    { id: "HYPERTROPHY", label: "Hypertrophy", icon: <Target className="w-3.5 h-3.5" /> },
    { id: "CALISTHENICS", label: "Calisthenics", icon: <Activity className="w-3.5 h-3.5" /> },
    { id: "METABOLIC", label: "Bioenergetics", icon: <Flame className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-4 pb-8">
      {/* RPG Athlete Mastery Header Banner */}
      <Card
        level="elevated"
        className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-[#0d131f] via-[#121124] to-[#1a111a] border-white/10"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="lab-kicker text-cyan-400">Skill Tree Matrix</span>
            <span className="text-zinc-500">·</span>
            <span className={cn("font-mono text-xs font-bold uppercase tracking-wider", masteryRank.color)}>
              Rank {masteryRank.level}: {masteryRank.title}
            </span>
          </div>
          <h2 className="font-display text-[28px] font-bold text-[#eeeef2] flex items-center gap-3">
            Adaptive RPG Fitness Roadmap
          </h2>
          <p className="text-sm text-[#8e8ea6]">
            Readiness {readiness}/100 · Total Earned: <span className="font-mono text-amber-400 font-bold">{totalXP} XP</span> · {completedCount}/{plan.roadmapNodes.length} Milestones Unlocked ({completionRate}%)
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-white/[0.02] border border-white/10 px-4 py-2 rounded-2xl">
            <ProgressRing value={completionRate} size={54} strokeWidth={4} />
            <div className="text-left">
              <div className="text-[11px] uppercase tracking-wider text-zinc-400">Mastery</div>
              <div className="font-mono text-lg font-bold text-cyan-300">{completionRate}%</div>
            </div>
          </div>

          <ActionButton
            onClick={() => setSettingsOpen(true)}
            variant="secondary"
            className="inline-flex items-center gap-2"
          >
            <Settings className="h-4 w-4" /> Calibration
          </ActionButton>
        </div>
      </Card>

      {/* Specialization Track Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <span className="text-xs uppercase tracking-[0.2em] text-[#636380] shrink-0 pl-1">
          Filter Track:
        </span>
        {trackCategories.map((item) => (
          <button
            key={item.id}
            onClick={() => setTrackFilter(item.id)}
            className={cn(
              "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition shrink-0 border",
              trackFilter === item.id
                ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                : "bg-white/[0.02] text-zinc-400 border-white/5 hover:text-white hover:border-white/15",
            )}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>

      {/* Canvas & Sidebar Grid */}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* Interactive Skill Tree Canvas */}
        <Card level="highlight" className="overflow-hidden p-0 border-white/10 shadow-2xl">
          <RoadmapFlow
            roadmapNodes={plan.roadmapNodes}
            progress={progress}
            selectedNodeId={selectedNodeId}
            trackFilter={trackFilter}
            onNodeSelect={(nodeId) => {
              setSelectedNodeId(nodeId);
              setDrawerOpen(true);
            }}
          />
        </Card>

        {/* Selected Phase Intelligence Sidebar */}
        <Card level="elevated" className="space-y-4 border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.2em] text-cyan-400 font-mono">
              {selectedNode.track} · Tier {selectedNode.level}
            </span>
            <span className="font-mono text-xs font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-md">
              +{selectedNode.xpReward || 150} XP
            </span>
          </div>

          <SectionHeader
            title={selectedNode.title}
            description={selectedNode.description}
          />

          <div className="flex items-center gap-3">
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-[#8e8ea6]">
              {selectedNodeStatus.toUpperCase()}
            </span>
            {selectedNodeStatus === "active" ? (
              <Play className="h-4 w-4 text-cyan-300 animate-pulse fill-cyan-300" />
            ) : null}
          </div>

          {/* Actionable Micro Checkpoints Preview */}
          {selectedNode.tasks && selectedNode.tasks.length > 0 && (
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span className="uppercase tracking-wider font-semibold">Phase Checkpoints</span>
                <span className="font-mono text-cyan-300">
                  {(completedTaskIdsByNode[selectedNode.id] || []).length}/
                  {selectedNode.tasks.length}
                </span>
              </div>
              <div className="space-y-1.5">
                {selectedNode.tasks.map((task) => {
                  const isDone =
                    (completedTaskIdsByNode[selectedNode.id] || []).includes(task.id) ||
                    progress[selectedNode.id];

                  return (
                    <div
                      key={task.id}
                      onClick={() => handleToggleTask(task.id)}
                      className="flex items-center justify-between text-xs py-1 cursor-pointer group"
                    >
                      <span className={cn("text-zinc-300 group-hover:text-cyan-300 transition line-clamp-1", isDone && "line-through text-zinc-500")}>
                        {isDone ? "✓ " : "○ "}
                        {task.label}
                      </span>
                      <span className="font-mono text-[10px] text-amber-400/70 shrink-0 ml-2">
                        +{task.xp} XP
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Prerequisites Box */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5 text-xs text-zinc-400 space-y-2">
            <div className="uppercase tracking-[0.15em] font-semibold text-zinc-400">
              Prerequisite Tree
            </div>
            <ul className="space-y-1.5">
              {selectedNode.dependencies.length > 0 ? (
                selectedNode.dependencies.map((dependencyId) => {
                  const dependency = plan.roadmapNodes.find(
                    (node) => node.id === dependencyId,
                  );
                  return (
                    <li
                      key={dependencyId}
                      className="flex items-center justify-between"
                    >
                      <span className="text-zinc-300">{dependency?.title ?? dependencyId}</span>
                      <span
                        className={
                          progress[dependencyId]
                            ? "text-green-400 font-mono"
                            : "text-amber-400 font-mono"
                        }
                      >
                        {progress[dependencyId] ? "✓ Met" : "Pending"}
                      </span>
                    </li>
                  );
                })
              ) : (
                <li className="text-zinc-500">Root Node — No prerequisites.</li>
              )}
            </ul>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <div className="flex gap-2">
              <ActionButton
                onClick={() => handleToggleCompleteNode(selectedNode.id)}
                disabled={selectedNodeStatus === "locked"}
                className="flex-1"
              >
                {progress[selectedNode.id] ? "Completed ✓" : "Mark Done"}
              </ActionButton>
              <ActionButton
                variant="secondary"
                className="flex-1"
                onClick={() => setDrawerOpen(true)}
              >
                Deep-Dive & PR
              </ActionButton>
            </div>
            <ActionButton
              variant="secondary"
              className="w-full text-xs text-zinc-400 hover:text-white"
              onClick={() => setSelectedNodeId(plan.roadmapNodes[0].id)}
            >
              Center Core Trunk
            </ActionButton>
          </div>

          {saveMessage ? (
            <p className="text-xs text-cyan-300 font-mono text-center">{saveMessage}</p>
          ) : null}
        </Card>
      </div>

      {settingsOpen ? (
        <RoadmapStepper
          input={draftInput}
          experience={draftExperience}
          equipment={draftEquipment}
          onInputChange={setDraftInput}
          onExperienceChange={(exp: string) =>
            setDraftExperience(exp as "beginner" | "intermediate" | "advanced")
          }
          onEquipmentChange={(eq: string) =>
            setDraftEquipment(eq as "home" | "gym")
          }
          onClose={() => setSettingsOpen(false)}
          onSave={() => {
            const nextSnapshot = {
              input: draftInput,
              checkins: snapshot.checkins,
              equipment: draftEquipment,
              experience: draftExperience,
              progress,
            };
            setSnapshot(nextSnapshot);
            void persistPlannerSnapshot({
              input: draftInput,
              checkins: dedupeCheckinsByDate(snapshot.checkins),
              equipment: draftEquipment,
              experience: draftExperience,
              progress,
            }).then((saved) => {
              setSaveMessage(
                saved ? "Inputs saved and synced." : "Inputs saved locally.",
              );
            });
          }}
        />
      ) : null}

      <NodeDrawer
        node={nodeForDrawer}
        liftHistory={liftHistory}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onLogPR={() => setPrLoggerOpen(true)}
        onAskAI={handleAskAI}
        onToggleTask={handleToggleTask}
        onToggleComplete={() => handleToggleCompleteNode(selectedNode.id)}
        isCompleted={Boolean(progress[selectedNode.id])}
      />

      <PRLogger
        isOpen={prLoggerOpen}
        onClose={() => setPrLoggerOpen(false)}
        initialLiftName={activeLift}
        onSave={handleSavePR}
      />
    </div>
  );
}
