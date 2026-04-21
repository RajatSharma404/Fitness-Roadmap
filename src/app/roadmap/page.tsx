"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { Play, Settings } from "lucide-react";
import {
  ActionButton,
  Card,
  SectionHeader,
} from "@/components/shared/UIPrimitives";
import { ProgressRing } from "@/components/layout/ProgressRing";
import { calculateBodyPlan } from "@/lib/bodyPlanner";
import {
  computeReadinessScore,
  getEnhancedNodeStatus,
} from "@/lib/planEnhancements";
import {
  defaultPlannerInput,
  defaultPlannerSnapshot,
  dedupeCheckinsByDate,
  readPlannerSnapshot,
} from "@/lib/plannerView";
const RoadmapFlow = dynamic(() => import("@/components/roadmap/RoadmapFlow"), {
  ssr: false,
  loading: () => (
    <div className="h-[calc(100vh-240px)] min-h-130 w-full rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]" />
  ),
});

function readProgress(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const saved = localStorage.getItem("bodyPlanProgress");
    return saved ? (JSON.parse(saved) as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

function saveProgress(progress: Record<string, boolean>) {
  localStorage.setItem("bodyPlanProgress", JSON.stringify(progress));
}

function saveSnapshot(
  input: typeof defaultPlannerInput,
  checkins: ReturnType<typeof dedupeCheckinsByDate>,
  equipment: string,
  experience: string,
) {
  localStorage.setItem("bodyPlanInput", JSON.stringify(input));
  localStorage.setItem(
    "bodyPlanEnhancedState",
    JSON.stringify({
      input,
      checkins,
      equipment,
      experience,
      progress: readProgress(),
    }),
  );
}

export default function RoadmapPage() {
  const [snapshot, setSnapshot] = useState(defaultPlannerSnapshot);
  const [progress, setProgress] = useState<Record<string, boolean>>(() =>
    readProgress(),
  );
  const [selectedNodeId, setSelectedNodeId] = useState<string>("assessment");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [draftInput, setDraftInput] = useState(snapshot.input);
  const [draftEquipment, setDraftEquipment] = useState(snapshot.equipment);
  const [draftExperience, setDraftExperience] = useState(snapshot.experience);

  useEffect(() => {
    const sync = () => {
      const next = readPlannerSnapshot();
      setSnapshot(next);
      setDraftInput(next.input);
      setDraftEquipment(next.equipment);
      setDraftExperience(next.experience);
      setProgress(readProgress());
    };

    sync();
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

  const phaseGroups = useMemo(() => {
    const map = new Map<number, (typeof plan.roadmapNodes)[number][]>();
    plan.roadmapNodes.forEach((node) => {
      const current = map.get(node.level) ?? [];
      current.push(node);
      map.set(node.level, current);
    });
    return [...map.entries()].sort(([left], [right]) => left - right);
  }, [plan]);

  return (
    <div className="space-y-4">
      <Card
        level="elevated"
        className="flex flex-wrap items-center justify-between gap-4"
      >
        <div>
          <p className="lab-kicker text-[#60a5fa]">Roadmap</p>
          <h2 className="font-display text-[28px] font-bold text-[#eeeef2]">
            Adaptive Body Transformation Planner
          </h2>
          <p className="mt-1 text-sm text-[#636380]">
            Readiness {readiness}/100 · {completionRate}% completion
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ProgressRing value={completionRate} size={64} strokeWidth={5} />
          <ActionButton
            onClick={() => setSettingsOpen(true)}
            variant="secondary"
            className="inline-flex items-center gap-2"
          >
            <Settings className="h-4 w-4" /> Inputs
          </ActionButton>
        </div>
      </Card>

      <Card level="base" className="space-y-4">
        <SectionHeader
          kicker="Phase Progress"
          title="Unlock Momentum"
          description="Active phases glow cyan, completed phases turn green, and locked phases stay muted."
        />
        <div className="flex flex-wrap items-center gap-4">
          {phaseGroups.map(([level, nodes], index) => {
            const phaseProgress =
              nodes.filter((node) => progress[node.id]).length /
              Math.max(1, nodes.length);
            const isActive = nodes.some((node) => node.id === selectedNodeId);
            const done = phaseProgress === 1;
            const locked = !isActive && !done;

            return (
              <div key={level} className="flex items-center gap-4">
                <div className="text-center">
                  <div className={locked ? "opacity-40" : ""}>
                    <ProgressRing
                      value={Math.round(phaseProgress * 100)}
                      size={48}
                      strokeWidth={3}
                      valueClassName={
                        locked
                          ? "text-[#636380]"
                          : done
                            ? "text-[#00e676]"
                            : "text-cyan-300"
                      }
                    />
                  </div>
                  <p className="mt-1 text-xs text-[#636380]">Phase {level}</p>
                  <p
                    className={`text-[11px] uppercase tracking-[0.2em] ${done ? "text-green-300" : isActive ? "text-cyan-300" : "text-[#636380]"}`}
                  >
                    {done ? "Done" : isActive ? "Active" : "Locked"}
                  </p>
                </div>
                {index < phaseGroups.length - 1 ? (
                  <div className="h-px w-10 bg-[rgba(255,255,255,0.08)]" />
                ) : null}
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card level="highlight" className="overflow-hidden p-0">
          <RoadmapFlow
            roadmapNodes={plan.roadmapNodes}
            progress={progress}
            selectedNodeId={selectedNodeId}
            onNodeSelect={setSelectedNodeId}
          />
        </Card>

        <Card level="elevated" className="space-y-4">
          <SectionHeader
            kicker="Selected Phase"
            title={selectedNode.title}
            description={selectedNode.description}
          />
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-[rgba(255,255,255,0.08)] px-3 py-1 text-xs uppercase tracking-[0.2em] text-[#636380]">
              {selectedNodeStatus.toUpperCase()}
            </span>
            {selectedNodeStatus === "active" ? (
              <Play className="h-4 w-4 text-cyan-300" />
            ) : null}
          </div>

          <div className="space-y-3 text-sm text-[#636380]">
            <p>
              <span className="text-[#eeeef2]">Why this phase now:</span> the
              roadmap only unlocks when its prerequisites are ready and your
              recent check-ins support the next step.
            </p>
            <div className="rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[#636380]">
                Unlock Criteria
              </p>
              <ul className="mt-2 space-y-2">
                {selectedNode.dependencies.length > 0 ? (
                  selectedNode.dependencies.map((dependencyId) => {
                    const dependency = plan.roadmapNodes.find(
                      (node) => node.id === dependencyId,
                    );
                    return (
                      <li
                        key={dependencyId}
                        className="flex items-center justify-between gap-2"
                      >
                        <span>{dependency?.title ?? dependencyId}</span>
                        <span
                          className={
                            progress[dependencyId]
                              ? "text-green-300"
                              : "text-amber-300"
                          }
                        >
                          {progress[dependencyId] ? "Done" : "Pending"}
                        </span>
                      </li>
                    );
                  })
                ) : (
                  <li>No prerequisites. You can start here.</li>
                )}
              </ul>
            </div>
          </div>

          <div className="flex gap-2">
            <ActionButton
              onClick={() => {
                if (selectedNodeStatus !== "locked") {
                  const next = {
                    ...progress,
                    [selectedNode.id]: !progress[selectedNode.id],
                  };
                  setProgress(next);
                  saveProgress(next);
                }
              }}
              disabled={selectedNodeStatus === "locked"}
              className="flex-1"
            >
              {progress[selectedNode.id] ? "Completed" : "Mark Done"}
            </ActionButton>
            <ActionButton
              variant="secondary"
              className="flex-1"
              onClick={() => setSelectedNodeId(plan.roadmapNodes[0].id)}
            >
              Clear Focus Dimming
            </ActionButton>
          </div>
        </Card>
      </div>

      {settingsOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 p-3 backdrop-blur-sm">
          <div className="h-full w-full max-w-md overflow-y-auto rounded-2xl border border-[rgba(255,255,255,0.06)] bg-bg-elevated p-5">
            <SectionHeader
              kicker="Settings"
              title="Your Inputs"
              description="Update the planner inputs from a modal instead of the main page."
              action={
                <button
                  type="button"
                  className="text-sm text-[#636380]"
                  onClick={() => setSettingsOpen(false)}
                >
                  Close
                </button>
              }
            />
            <div className="mt-4 space-y-3">
              <label className="block text-sm text-[#636380]">
                Age
                <input
                  className="mt-1 w-full rounded-md border border-[rgba(255,255,255,0.06)] bg-bg-surface px-3 py-2 text-[#eeeef2]"
                  type="number"
                  value={draftInput.age}
                  onChange={(event) =>
                    setDraftInput((prev) => ({
                      ...prev,
                      age: Number(event.target.value),
                    }))
                  }
                />
              </label>
              <label className="block text-sm text-[#636380]">
                Weight (kg)
                <input
                  className="mt-1 w-full rounded-md border border-[rgba(255,255,255,0.06)] bg-bg-surface px-3 py-2 text-[#eeeef2]"
                  type="number"
                  value={draftInput.weightKg}
                  onChange={(event) =>
                    setDraftInput((prev) => ({
                      ...prev,
                      weightKg: Number(event.target.value),
                    }))
                  }
                />
              </label>
              <label className="block text-sm text-[#636380]">
                Goal
                <select
                  className="mt-1 w-full rounded-md border border-[rgba(255,255,255,0.06)] bg-bg-surface px-3 py-2 text-[#eeeef2]"
                  value={draftInput.goal}
                  onChange={(event) =>
                    setDraftInput((prev) => ({
                      ...prev,
                      goal: event.target.value as typeof draftInput.goal,
                    }))
                  }
                >
                  {(
                    [
                      "fat_loss",
                      "weight_loss",
                      "muscle_gain",
                      "recomposition",
                    ] as const
                  ).map((goal) => (
                    <option key={goal} value={goal}>
                      {goal.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm text-[#636380]">
                Activity
                <select
                  className="mt-1 w-full rounded-md border border-[rgba(255,255,255,0.06)] bg-bg-surface px-3 py-2 text-[#eeeef2]"
                  value={draftInput.activity}
                  onChange={(event) =>
                    setDraftInput((prev) => ({
                      ...prev,
                      activity: event.target
                        .value as typeof draftInput.activity,
                    }))
                  }
                >
                  {(
                    [
                      "sedentary",
                      "light",
                      "moderate",
                      "active",
                      "very_active",
                    ] as const
                  ).map((activity) => (
                    <option key={activity} value={activity}>
                      {activity.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-sm text-[#636380]">
                  Experience
                  <select
                    className="mt-1 w-full rounded-md border border-[rgba(255,255,255,0.06)] bg-bg-surface px-3 py-2 text-[#eeeef2]"
                    value={draftExperience}
                    onChange={(event) =>
                      setDraftExperience(
                        event.target.value as typeof draftExperience,
                      )
                    }
                  >
                    {(["beginner", "intermediate", "advanced"] as const).map(
                      (value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ),
                    )}
                  </select>
                </label>
                <label className="block text-sm text-[#636380]">
                  Equipment
                  <select
                    className="mt-1 w-full rounded-md border border-[rgba(255,255,255,0.06)] bg-bg-surface px-3 py-2 text-[#eeeef2]"
                    value={draftEquipment}
                    onChange={(event) =>
                      setDraftEquipment(
                        event.target.value as typeof draftEquipment,
                      )
                    }
                  >
                    {(["gym", "home"] as const).map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <ActionButton
                className="flex-1"
                onClick={() => {
                  const nextSnapshot = {
                    input: draftInput,
                    checkins: snapshot.checkins,
                    equipment: draftEquipment,
                    experience: draftExperience,
                  };
                  setSnapshot(nextSnapshot);
                  saveSnapshot(
                    draftInput,
                    dedupeCheckinsByDate(snapshot.checkins),
                    draftEquipment,
                    draftExperience,
                  );
                  setSettingsOpen(false);
                }}
              >
                Save Inputs
              </ActionButton>
              <ActionButton
                variant="secondary"
                className="flex-1"
                onClick={() => setSettingsOpen(false)}
              >
                Cancel
              </ActionButton>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
