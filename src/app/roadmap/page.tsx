"use client";

import { useEffect, useMemo, useState } from "react";
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
import {
  Activity,
  Beef,
  CheckCircle2,
  Dumbbell,
  Droplets,
  Flame,
  PlayCircle,
  Scale,
  Sparkles,
} from "lucide-react";
import {
  ActivityLevel,
  DietType,
  GoalType,
  PlannerInput,
  calculateBodyPlan,
} from "@/lib/bodyPlanner";
import {
  EquipmentType,
  ExperienceLevel,
  WeeklyCheckIn,
  buildDailyMealTemplates,
  buildGroceryList,
  buildMealSwaps,
  computeReadinessScore,
  getAdaptiveGymProgression,
  getDailyCoachMessage,
  getEnhancedNodeStatus,
  getExerciseDetail,
  getProgressBasedAdjustment,
} from "@/lib/planEnhancements";

type NodeStatus = "locked" | "active" | "completed";

interface FlowNodeData {
  [key: string]: unknown;
  title: string;
  level: number;
  status: NodeStatus;
  description: string;
}

interface WorkoutSessionState {
  key: string;
  day: string;
  exercises: string[];
  startedAt: number;
  elapsedSec: number;
  completedSets: Record<string, number>;
}

interface PersistedPlanState {
  input: PlannerInput;
  progress: Record<string, boolean>;
  checkins: WeeklyCheckIn[];
  equipment: EquipmentType;
  experience: ExperienceLevel;
}

function PlanFlowNode({ data }: NodeProps<Node<FlowNodeData>>) {
  const palette: Record<NodeStatus, string> = {
    locked: "border-[#3c3c3c] bg-[#1e1e1e] text-[#808080]",
    active: "border-[#007acc] bg-[#0f2a3a] text-[#d4d4d4]",
    completed: "border-[#4ec9b0] bg-[#133a35] text-[#d4d4d4]",
  };

  return (
    <div
      className={`w-56 rounded-xl border p-4 shadow-sm ${palette[data.status]}`}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wider text-[#9cdcfe]">
          Phase {data.level}
        </span>
        {data.status === "completed" ? (
          <CheckCircle2 className="h-4 w-4 text-[#4ec9b0]" />
        ) : null}
      </div>
      <h3 className="text-sm font-semibold">{data.title}</h3>
      <p className="mt-2 text-xs text-[#9aa1a8]">{data.description}</p>
    </div>
  );
}

const nodeTypes = {
  plan: PlanFlowNode,
};

const initialInput: PlannerInput = {
  age: 28,
  sex: "male",
  heightCm: 170,
  weightKg: 82,
  goal: "fat_loss",
  activity: "moderate",
  workoutDays: 5,
  diet: "mixed",
};

const goalOptions: Array<{ label: string; value: GoalType }> = [
  { label: "Fat Loss", value: "fat_loss" },
  { label: "Weight Loss", value: "weight_loss" },
  { label: "Muscle Gain", value: "muscle_gain" },
  { label: "Recomposition", value: "recomposition" },
];

const activityOptions: Array<{ label: string; value: ActivityLevel }> = [
  { label: "Sedentary", value: "sedentary" },
  { label: "Light", value: "light" },
  { label: "Moderate", value: "moderate" },
  { label: "Active", value: "active" },
  { label: "Very Active", value: "very_active" },
];

function toMondayDayIndex(currentDay: number): number {
  return currentDay === 0 ? 6 : currentDay - 1;
}

function formatDuration(totalSec: number): string {
  const min = Math.floor(totalSec / 60)
    .toString()
    .padStart(2, "0");
  const sec = (totalSec % 60).toString().padStart(2, "0");
  return `${min}:${sec}`;
}

function readCachedEnhancedState(): PersistedPlanState | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem("bodyPlanEnhancedState");
    if (!raw) return null;
    return JSON.parse(raw) as PersistedPlanState;
  } catch {
    return null;
  }
}

function readCachedInput(): PlannerInput {
  if (typeof window === "undefined") return initialInput;

  try {
    const savedInput = localStorage.getItem("bodyPlanInput");
    if (savedInput) return JSON.parse(savedInput) as PlannerInput;
  } catch {
    // fallback to defaults
  }

  return readCachedEnhancedState()?.input ?? initialInput;
}

function readCachedProgress(): Record<string, boolean> {
  if (typeof window === "undefined") return {};

  try {
    const savedProgress = localStorage.getItem("bodyPlanProgress");
    if (savedProgress)
      return JSON.parse(savedProgress) as Record<string, boolean>;
  } catch {
    // fallback to defaults
  }

  return readCachedEnhancedState()?.progress ?? {};
}

export default function RoadmapPage() {
  const [input, setInput] = useState<PlannerInput>(() => readCachedInput());
  const [progress, setProgress] = useState<Record<string, boolean>>(() =>
    readCachedProgress(),
  );
  const [selectedNodeId, setSelectedNodeId] = useState<string>("assessment");
  const [openGymDayKey, setOpenGymDayKey] = useState<string | null>(null);
  const [equipment, setEquipment] = useState<EquipmentType>(
    () => readCachedEnhancedState()?.equipment ?? "gym",
  );
  const [experience, setExperience] = useState<ExperienceLevel>(
    () => readCachedEnhancedState()?.experience ?? "beginner",
  );
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [workoutSession, setWorkoutSession] =
    useState<WorkoutSessionState | null>(null);
  const [checkins, setCheckins] = useState<WeeklyCheckIn[]>(
    () => readCachedEnhancedState()?.checkins ?? [],
  );
  const [checkinForm, setCheckinForm] = useState<WeeklyCheckIn>({
    date: new Date().toISOString().slice(0, 10),
    weightKg: 82,
    waistCm: 90,
    sleepHours: 7,
    stepsAvg: 8500,
    stress: 4,
    energy: 7,
    workoutCompletion: 75,
  });
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "offline"
  >("idle");

  const plan = useMemo(() => calculateBodyPlan(input), [input]);

  const adaptiveGymProgression = useMemo(
    () =>
      getAdaptiveGymProgression(
        plan.gymProgression,
        experience,
        input.workoutDays,
        equipment,
      ),
    [plan.gymProgression, experience, input.workoutDays, equipment],
  );

  const todayWorkout = useMemo(() => {
    const mondayIndex = toMondayDayIndex(new Date().getDay());
    const dayNames = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    const todayName = dayNames[mondayIndex];
    const currentPhase = adaptiveGymProgression[0];
    return currentPhase?.days.find((day) => day.day === todayName) ?? null;
  }, [adaptiveGymProgression]);

  const autoAdjustment = useMemo(
    () => getProgressBasedAdjustment(input, checkins),
    [input, checkins],
  );

  const adjustedCalories = Math.max(
    1200,
    plan.targetCalories + autoAdjustment.calorieDelta,
  );

  const nutritionTemplates = useMemo(
    () =>
      buildDailyMealTemplates(
        adjustedCalories,
        plan.macros,
        input.diet,
        plan.mealOptions,
      ),
    [adjustedCalories, plan.macros, input.diet, plan.mealOptions],
  );

  const groceryList = useMemo(
    () => buildGroceryList(nutritionTemplates),
    [nutritionTemplates],
  );

  const mealSwaps = useMemo(
    () => buildMealSwaps(plan.mealOptions),
    [plan.mealOptions],
  );

  const latestCheckin = checkins[checkins.length - 1];
  const readinessScore = latestCheckin
    ? computeReadinessScore(latestCheckin)
    : 62;

  const aiCoachMessage = useMemo(
    () => getDailyCoachMessage(input.goal, readinessScore, autoAdjustment),
    [input.goal, readinessScore, autoAdjustment],
  );

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch("/api/user-plan-state", {
          cache: "no-store",
        });
        if (!response.ok) return;

        const payload = (await response.json()) as {
          ok: boolean;
          state: PersistedPlanState | null;
        };

        if (!payload.ok || !payload.state) return;

        setInput(payload.state.input ?? initialInput);
        setProgress(payload.state.progress ?? {});
        setCheckins(payload.state.checkins ?? []);
        setEquipment(payload.state.equipment ?? "gym");
        setExperience(payload.state.experience ?? "beginner");
      } catch {
        // no-op fallback to local mode
      }
    })();
  }, []);

  useEffect(() => {
    localStorage.setItem("bodyPlanInput", JSON.stringify(input));
    localStorage.setItem("bodyPlanProgress", JSON.stringify(progress));

    const state: PersistedPlanState = {
      input,
      progress,
      checkins,
      equipment,
      experience,
    };

    localStorage.setItem("bodyPlanEnhancedState", JSON.stringify(state));

    const timer = window.setTimeout(() => {
      setSaveStatus("saving");

      void fetch("/api/user-plan-state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state),
      })
        .then((response) => {
          setSaveStatus(response.ok ? "saved" : "offline");
        })
        .catch(() => {
          // offline or unauthenticated - local save still works
          setSaveStatus("offline");
        });
    }, 400);

    return () => window.clearTimeout(timer);
  }, [input, progress, checkins, equipment, experience]);

  useEffect(() => {
    if (!workoutSession) return;

    const timer = setInterval(() => {
      setWorkoutSession((prev) =>
        prev
          ? {
              ...prev,
              elapsedSec: Math.floor((Date.now() - prev.startedAt) / 1000),
            }
          : null,
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [workoutSession]);

  const getNodeStatus = (nodeId: string): NodeStatus => {
    const node = plan.roadmapNodes.find((item) => item.id === nodeId);
    if (!node) return "locked";
    return getEnhancedNodeStatus(node, progress, checkins);
  };

  const flowNodes: Node<FlowNodeData>[] = plan.roadmapNodes.map((node) => ({
    id: node.id,
    position: node.position,
    type: "plan",
    style: { width: 224, height: 118 },
    data: {
      title: node.title,
      level: node.level,
      status: getNodeStatus(node.id),
      description: node.description,
    },
  }));

  const flowEdges: Edge[] = plan.roadmapNodes.flatMap((node) =>
    node.dependencies.map((dependencyId) => ({
      id: `${dependencyId}-${node.id}`,
      source: dependencyId,
      target: node.id,
      style: {
        stroke: progress[dependencyId] ? "#4ec9b0" : "#3c3c3c",
        strokeWidth: 2,
      },
      animated: Boolean(progress[dependencyId]),
    })),
  );

  const selectedNode =
    plan.roadmapNodes.find((node) => node.id === selectedNodeId) ??
    plan.roadmapNodes[0];
  const selectedNodeStatus = getNodeStatus(selectedNode.id);

  const completedCount = plan.roadmapNodes.filter(
    (node) => progress[node.id],
  ).length;
  const completionRate = Math.round(
    (completedCount / plan.roadmapNodes.length) * 100,
  );

  const exerciseDetail = selectedExercise
    ? getExerciseDetail(selectedExercise)
    : null;

  return (
    <div className="min-h-screen bg-[#1e1e1e] px-4 py-6 text-[#d4d4d4] md:px-8">
      {todayWorkout ? (
        <div className="sticky top-2 z-10 mb-3 rounded-lg border border-[#3c3c3c] bg-[#252526]/95 p-3 shadow-lg md:hidden">
          <p className="text-[11px] uppercase tracking-wider text-[#9cdcfe]">
            Today&apos;s Workout
          </p>
          <p className="text-sm font-semibold text-[#dcdcaa]">
            {todayWorkout.day}: {todayWorkout.bodyParts[0]} +{" "}
            {todayWorkout.bodyParts[1]}
          </p>
          <button
            type="button"
            className="mt-2 rounded border border-[#007acc] bg-[#04395e] px-3 py-1 text-xs"
            onClick={() => {
              setWorkoutSession({
                key: `today-${todayWorkout.day}`,
                day: todayWorkout.day,
                exercises: todayWorkout.exercises,
                startedAt: Date.now(),
                elapsedSec: 0,
                completedSets: {},
              });
            }}
          >
            Start Today Session
          </button>
        </div>
      ) : null}

      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-xl border border-[#30363d] bg-[#252526] p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#569cd6]">
                Roadmap
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-[#dcdcaa]">
                Adaptive Body Transformation Planner
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-[#9aa1a8]">
                Auto-adjusted coaching with adaptive workouts, weekly check-ins,
                execution mode, nutrition templates, and progress-gated roadmap.
              </p>
            </div>
            <div className="rounded-lg border border-[#3c3c3c] bg-[#1e1e1e] px-4 py-3 text-right">
              <div className="text-xs text-[#9aa1a8]">Roadmap Completion</div>
              <div className="text-xl font-semibold text-[#4ec9b0]">
                {completionRate}%
              </div>
              <div className="text-xs text-[#9aa1a8]">
                Readiness {readinessScore}/100
              </div>
              <div className="mt-1 text-xs text-[#9aa1a8]">
                Sync: {saveStatus === "saving" ? "Saving..." : null}
                {saveStatus === "saved" ? "Saved" : null}
                {saveStatus === "offline" ? "Local only" : null}
                {saveStatus === "idle" ? "Idle" : null}
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[350px_1fr]">
          <div className="rounded-xl border border-[#30363d] bg-[#252526] p-4">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#9cdcfe]">
              Your Inputs
            </h2>
            <div className="space-y-3 text-sm">
              <label className="block">
                <span className="mb-1 block text-[#9aa1a8]">Age</span>
                <input
                  type="number"
                  className="w-full rounded-md border border-[#3c3c3c] bg-[#1e1e1e] px-3 py-2"
                  value={input.age}
                  onChange={(event) =>
                    setInput((prev) => ({
                      ...prev,
                      age: Number(event.target.value),
                    }))
                  }
                />
              </label>

              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <span className="mb-1 block text-[#9aa1a8]">Height (cm)</span>
                  <input
                    type="number"
                    className="w-full rounded-md border border-[#3c3c3c] bg-[#1e1e1e] px-3 py-2"
                    value={input.heightCm}
                    onChange={(event) =>
                      setInput((prev) => ({
                        ...prev,
                        heightCm: Number(event.target.value),
                      }))
                    }
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[#9aa1a8]">Weight (kg)</span>
                  <input
                    type="number"
                    className="w-full rounded-md border border-[#3c3c3c] bg-[#1e1e1e] px-3 py-2"
                    value={input.weightKg}
                    onChange={(event) =>
                      setInput((prev) => ({
                        ...prev,
                        weightKg: Number(event.target.value),
                      }))
                    }
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-1 block text-[#9aa1a8]">Goal</span>
                <select
                  className="w-full rounded-md border border-[#3c3c3c] bg-[#1e1e1e] px-3 py-2"
                  value={input.goal}
                  onChange={(event) =>
                    setInput((prev) => ({
                      ...prev,
                      goal: event.target.value as GoalType,
                    }))
                  }
                >
                  {goalOptions.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-[#9aa1a8]">Activity</span>
                <select
                  className="w-full rounded-md border border-[#3c3c3c] bg-[#1e1e1e] px-3 py-2"
                  value={input.activity}
                  onChange={(event) =>
                    setInput((prev) => ({
                      ...prev,
                      activity: event.target.value as ActivityLevel,
                    }))
                  }
                >
                  {activityOptions.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <span className="mb-1 block text-[#9aa1a8]">
                    Workout Days
                  </span>
                  <input
                    type="number"
                    min={3}
                    max={7}
                    className="w-full rounded-md border border-[#3c3c3c] bg-[#1e1e1e] px-3 py-2"
                    value={input.workoutDays}
                    onChange={(event) =>
                      setInput((prev) => ({
                        ...prev,
                        workoutDays: Number(event.target.value),
                      }))
                    }
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-[#9aa1a8]">Diet</span>
                  <select
                    className="w-full rounded-md border border-[#3c3c3c] bg-[#1e1e1e] px-3 py-2"
                    value={input.diet}
                    onChange={(event) =>
                      setInput((prev) => ({
                        ...prev,
                        diet: event.target.value as DietType,
                      }))
                    }
                  >
                    <option value="veg">Veg</option>
                    <option value="non_veg">Non-Veg</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <span className="mb-1 block text-[#9aa1a8]">Experience</span>
                  <select
                    className="w-full rounded-md border border-[#3c3c3c] bg-[#1e1e1e] px-3 py-2"
                    value={experience}
                    onChange={(event) =>
                      setExperience(event.target.value as ExperienceLevel)
                    }
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1 block text-[#9aa1a8]">Equipment</span>
                  <select
                    className="w-full rounded-md border border-[#3c3c3c] bg-[#1e1e1e] px-3 py-2"
                    value={equipment}
                    onChange={(event) =>
                      setEquipment(event.target.value as EquipmentType)
                    }
                  >
                    <option value="gym">Gym</option>
                    <option value="home">Home + Bands/Dumbbells</option>
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="mb-1 block text-[#9aa1a8]">Sex</span>
                <div className="grid grid-cols-2 gap-2">
                  {(["male", "female"] as const).map((option) => (
                    <button
                      type="button"
                      key={option}
                      onClick={() =>
                        setInput((prev) => ({ ...prev, sex: option }))
                      }
                      className={`rounded-md border px-3 py-2 capitalize ${
                        input.sex === option
                          ? "border-[#007acc] bg-[#04395e] text-white"
                          : "border-[#3c3c3c] bg-[#1e1e1e]"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </label>
            </div>
          </div>

          <div className="rounded-xl border border-[#30363d] bg-[#252526] p-4">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#9cdcfe]">
              Visual Roadmap (Readiness Gated)
            </h2>
            <div
              className="overflow-hidden rounded-lg border border-[#3c3c3c] bg-[#1e1e1e]"
              style={{ height: 420 }}
            >
              <ReactFlow
                nodes={flowNodes}
                edges={flowEdges}
                nodeTypes={nodeTypes}
                onNodeClick={(_, node) => setSelectedNodeId(node.id)}
                fitView
                minZoom={0.4}
                maxZoom={1.5}
              >
                <Background color="#2d2d2d" gap={24} />
                <MiniMap
                  bgColor="#1e1e1e"
                  maskColor="rgba(30,30,30,0.35)"
                  maskStrokeColor="#3c3c3c"
                  maskStrokeWidth={1}
                  nodeStrokeColor="#1e1e1e"
                  nodeStrokeWidth={1.5}
                  nodeBorderRadius={2}
                  style={{
                    backgroundColor: "#1e1e1e",
                    border: "1px solid #3c3c3c",
                  }}
                  nodeColor={(node) => {
                    const status = flowNodes.find((item) => item.id === node.id)
                      ?.data.status;
                    if (status === "completed") return "#4ec9b0";
                    if (status === "active") return "#007acc";
                    return "#6b7280";
                  }}
                />
                <Controls />
              </ReactFlow>
            </div>
            <div className="mt-4 rounded-lg border border-[#3c3c3c] bg-[#1e1e1e] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-medium text-[#dcdcaa]">
                    {selectedNode.title}
                  </h3>
                  <p className="mt-1 text-sm text-[#9aa1a8]">
                    {selectedNode.description}
                  </p>
                  <p className="mt-1 text-xs text-[#9aa1a8]">
                    Status: {selectedNodeStatus.toUpperCase()}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={selectedNodeStatus === "locked"}
                  className={`rounded-md border px-4 py-2 text-sm ${
                    selectedNodeStatus === "locked"
                      ? "cursor-not-allowed border-[#3c3c3c] bg-[#252526] text-[#6b7280]"
                      : progress[selectedNode.id]
                        ? "border-[#4ec9b0] bg-[#133a35] text-[#4ec9b0]"
                        : "border-[#007acc] bg-[#04395e] text-white"
                  }`}
                  onClick={() =>
                    setProgress((prev) => ({
                      ...prev,
                      [selectedNode.id]: !prev[selectedNode.id],
                    }))
                  }
                >
                  {progress[selectedNode.id] ? "Completed" : "Mark Done"}
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-xl border border-[#30363d] bg-[#252526] p-4">
            <div className="mb-2 flex items-center gap-2 text-[#4ec9b0]">
              <Scale className="h-4 w-4" /> BMI
            </div>
            <p className="text-2xl font-semibold">{plan.bmi}</p>
            <p className="text-sm text-[#9aa1a8]">{plan.bmiCategory}</p>
          </article>

          <article className="rounded-xl border border-[#30363d] bg-[#252526] p-4">
            <div className="mb-2 flex items-center gap-2 text-[#f14c4c]">
              <Flame className="h-4 w-4" /> Calories
            </div>
            <p className="text-2xl font-semibold">{adjustedCalories}</p>
            <p className="text-sm text-[#9aa1a8]">
              Base {plan.targetCalories} | {autoAdjustment.note}
            </p>
          </article>

          <article className="rounded-xl border border-[#30363d] bg-[#252526] p-4">
            <div className="mb-2 flex items-center gap-2 text-[#9cdcfe]">
              <Beef className="h-4 w-4" /> Protein
            </div>
            <p className="text-2xl font-semibold">{plan.macros.proteinG}g</p>
            <p className="text-sm text-[#9aa1a8]">
              Carbs {plan.macros.carbsG}g · Fats {plan.macros.fatsG}g
            </p>
          </article>

          <article className="rounded-xl border border-[#30363d] bg-[#252526] p-4">
            <div className="mb-2 flex items-center gap-2 text-[#4fc1ff]">
              <Droplets className="h-4 w-4" /> Hydration
            </div>
            <p className="text-2xl font-semibold">{plan.waterLiters}L</p>
            <p className="text-sm text-[#9aa1a8]">Daily water target</p>
          </article>
        </section>

        <section className="rounded-xl border border-[#30363d] bg-[#252526] p-4">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[#9cdcfe]">
            <Sparkles className="h-4 w-4" /> AI Daily Coach
          </h2>
          <p className="rounded-lg border border-[#3c3c3c] bg-[#1e1e1e] p-3 text-sm text-[#d4d4d4]">
            {aiCoachMessage}
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-xl border border-[#30363d] bg-[#252526] p-4">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[#9cdcfe]">
              <Dumbbell className="h-4 w-4" /> Adaptive Gym Plan
            </h2>
            <div className="grid gap-4 lg:grid-cols-1">
              {adaptiveGymProgression.map((phase) => (
                <article
                  key={phase.level}
                  className="rounded-lg border border-[#3c3c3c] bg-[#1e1e1e] p-3"
                >
                  <h3 className="text-base font-semibold text-[#dcdcaa]">
                    {phase.level}
                  </h3>
                  <p className="mb-3 text-xs text-[#9aa1a8]">
                    {phase.weeklySplit}
                  </p>
                  <div className="space-y-2">
                    {phase.days.map((dayPlan) => (
                      <div
                        role="button"
                        tabIndex={0}
                        key={`${phase.level}-${dayPlan.day}`}
                        className="w-full rounded-md border border-[#323232] p-2 text-left"
                        onClick={() => {
                          const dayKey = `${phase.level}-${dayPlan.day}`;
                          setOpenGymDayKey((prev) =>
                            prev === dayKey ? null : dayKey,
                          );
                        }}
                        onKeyDown={(event) => {
                          if (event.key !== "Enter" && event.key !== " ")
                            return;
                          event.preventDefault();
                          const dayKey = `${phase.level}-${dayPlan.day}`;
                          setOpenGymDayKey((prev) =>
                            prev === dayKey ? null : dayKey,
                          );
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-[#9cdcfe]">
                            {dayPlan.day}
                          </p>
                          <p className="text-[11px] text-[#4ec9b0]">
                            {dayPlan.setsReps}
                          </p>
                        </div>
                        <p className="mt-1 text-xs text-[#d4d4d4]">
                          {dayPlan.bodyParts[0]} + {dayPlan.bodyParts[1]}
                        </p>
                        <p className="mt-1 text-[11px] text-[#9aa1a8]">
                          {dayPlan.focus}
                        </p>
                        <p className="mt-2 text-[11px] text-[#569cd6]">
                          {openGymDayKey === `${phase.level}-${dayPlan.day}`
                            ? "Click to hide exercises"
                            : "Click to view exercises"}
                        </p>
                        {openGymDayKey === `${phase.level}-${dayPlan.day}` ? (
                          <>
                            <div className="mt-2 flex flex-wrap gap-2">
                              <button
                                type="button"
                                className="inline-flex items-center gap-1 rounded border border-[#007acc] bg-[#04395e] px-2 py-1 text-[11px]"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setWorkoutSession({
                                    key: `${phase.level}-${dayPlan.day}`,
                                    day: dayPlan.day,
                                    exercises: dayPlan.exercises,
                                    startedAt: Date.now(),
                                    elapsedSec: 0,
                                    completedSets: {},
                                  });
                                }}
                              >
                                <PlayCircle className="h-3.5 w-3.5" /> Start
                                Workout Mode
                              </button>
                            </div>
                            <p className="mt-2 text-[11px] font-medium uppercase tracking-wide text-[#c586c0]">
                              Exercises (6)
                            </p>
                            <ul className="mt-1 space-y-1 text-[11px] text-[#9aa1a8]">
                              {dayPlan.exercises.map((exercise) => (
                                <li key={exercise}>
                                  <button
                                    type="button"
                                    className="text-left underline-offset-2 hover:text-[#dcdcaa] hover:underline"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      setSelectedExercise(exercise);
                                    }}
                                  >
                                    - {exercise}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </article>

          <article className="rounded-xl border border-[#30363d] bg-[#252526] p-4">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[#9cdcfe]">
              <Activity className="h-4 w-4" /> Weekly Check-in + Readiness
            </h2>
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="text-xs text-[#9aa1a8]">
                Date
                <input
                  type="date"
                  className="mt-1 w-full rounded border border-[#3c3c3c] bg-[#1e1e1e] px-2 py-1"
                  value={checkinForm.date}
                  onChange={(event) =>
                    setCheckinForm((prev) => ({
                      ...prev,
                      date: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="text-xs text-[#9aa1a8]">
                Weight (kg)
                <input
                  type="number"
                  className="mt-1 w-full rounded border border-[#3c3c3c] bg-[#1e1e1e] px-2 py-1"
                  value={checkinForm.weightKg}
                  onChange={(event) =>
                    setCheckinForm((prev) => ({
                      ...prev,
                      weightKg: Number(event.target.value),
                    }))
                  }
                />
              </label>
              <label className="text-xs text-[#9aa1a8]">
                Waist (cm)
                <input
                  type="number"
                  className="mt-1 w-full rounded border border-[#3c3c3c] bg-[#1e1e1e] px-2 py-1"
                  value={checkinForm.waistCm}
                  onChange={(event) =>
                    setCheckinForm((prev) => ({
                      ...prev,
                      waistCm: Number(event.target.value),
                    }))
                  }
                />
              </label>
              <label className="text-xs text-[#9aa1a8]">
                Sleep (hours)
                <input
                  type="number"
                  step="0.5"
                  className="mt-1 w-full rounded border border-[#3c3c3c] bg-[#1e1e1e] px-2 py-1"
                  value={checkinForm.sleepHours}
                  onChange={(event) =>
                    setCheckinForm((prev) => ({
                      ...prev,
                      sleepHours: Number(event.target.value),
                    }))
                  }
                />
              </label>
              <label className="text-xs text-[#9aa1a8]">
                Avg Steps
                <input
                  type="number"
                  className="mt-1 w-full rounded border border-[#3c3c3c] bg-[#1e1e1e] px-2 py-1"
                  value={checkinForm.stepsAvg}
                  onChange={(event) =>
                    setCheckinForm((prev) => ({
                      ...prev,
                      stepsAvg: Number(event.target.value),
                    }))
                  }
                />
              </label>
              <label className="text-xs text-[#9aa1a8]">
                Stress (1-10)
                <input
                  type="number"
                  min={1}
                  max={10}
                  className="mt-1 w-full rounded border border-[#3c3c3c] bg-[#1e1e1e] px-2 py-1"
                  value={checkinForm.stress}
                  onChange={(event) =>
                    setCheckinForm((prev) => ({
                      ...prev,
                      stress: Number(event.target.value),
                    }))
                  }
                />
              </label>
              <label className="text-xs text-[#9aa1a8]">
                Energy (1-10)
                <input
                  type="number"
                  min={1}
                  max={10}
                  className="mt-1 w-full rounded border border-[#3c3c3c] bg-[#1e1e1e] px-2 py-1"
                  value={checkinForm.energy}
                  onChange={(event) =>
                    setCheckinForm((prev) => ({
                      ...prev,
                      energy: Number(event.target.value),
                    }))
                  }
                />
              </label>
              <label className="text-xs text-[#9aa1a8]">
                Workout Completion %
                <input
                  type="number"
                  min={0}
                  max={100}
                  className="mt-1 w-full rounded border border-[#3c3c3c] bg-[#1e1e1e] px-2 py-1"
                  value={checkinForm.workoutCompletion}
                  onChange={(event) =>
                    setCheckinForm((prev) => ({
                      ...prev,
                      workoutCompletion: Number(event.target.value),
                    }))
                  }
                />
              </label>
            </div>

            <button
              type="button"
              className="mt-3 rounded border border-[#007acc] bg-[#04395e] px-3 py-1.5 text-xs"
              onClick={() => {
                const next = [...checkins, checkinForm]
                  .sort((a, b) => a.date.localeCompare(b.date))
                  .slice(-12);
                setCheckins(next);
                setCheckinForm((prev) => ({
                  ...prev,
                  date: new Date().toISOString().slice(0, 10),
                }));
              }}
            >
              Save Weekly Check-in
            </button>

            <div className="mt-3 rounded border border-[#3c3c3c] bg-[#1e1e1e] p-3 text-xs text-[#9aa1a8]">
              <p className="font-semibold text-[#dcdcaa]">
                Latest Readiness: {readinessScore}/100
              </p>
              <p className="mt-1">{autoAdjustment.note}</p>
            </div>

            <div className="mt-3 space-y-2">
              {checkins
                .slice(-4)
                .reverse()
                .map((entry, index) => (
                  <div
                    key={`${entry.date}-${entry.weightKg}-${entry.waistCm}-${entry.stepsAvg}-${index}`}
                    className="rounded border border-[#3c3c3c] bg-[#1e1e1e] p-2 text-xs"
                  >
                    <p className="text-[#dcdcaa]">{entry.date}</p>
                    <p className="text-[#9aa1a8]">
                      Wt {entry.weightKg} kg | Waist {entry.waistCm} cm | Sleep{" "}
                      {entry.sleepHours}h | Completion {entry.workoutCompletion}
                      %
                    </p>
                  </div>
                ))}
            </div>
          </article>
        </section>

        <section className="rounded-xl border border-[#30363d] bg-[#252526] p-4">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[#9cdcfe]">
            <Sparkles className="h-4 w-4" /> Nutrition Planner Upgrade
          </h2>
          <div className="grid gap-4 lg:grid-cols-3">
            {nutritionTemplates.map((template) => (
              <article
                key={template.name}
                className="rounded-md border border-[#3c3c3c] bg-[#1e1e1e] p-3"
              >
                <h3 className="font-semibold text-[#dcdcaa]">
                  {template.name}
                </h3>
                <p className="mt-1 text-xs text-[#9aa1a8]">
                  {Math.round(template.calories)} kcal | Protein{" "}
                  {Math.round(template.proteinG)}g | Carbs{" "}
                  {Math.round(template.carbsG)}g | Fats{" "}
                  {Math.round(template.fatsG)}g
                </p>
                <div className="mt-2 space-y-1 text-xs text-[#9aa1a8]">
                  {template.meals.map((meal) => (
                    <p key={`${template.name}-${meal.slot}`}>
                      {meal.slot}: {meal.mealName}
                    </p>
                  ))}
                </div>
              </article>
            ))}
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <article className="rounded-md border border-[#3c3c3c] bg-[#1e1e1e] p-3">
              <h3 className="text-sm font-semibold text-[#dcdcaa]">
                Grocery List
              </h3>
              <ul className="mt-2 space-y-1 text-xs text-[#9aa1a8]">
                {groceryList.map((item) => (
                  <li key={item.item}>
                    {item.item}: {item.qty}
                  </li>
                ))}
              </ul>
            </article>

            <article className="rounded-md border border-[#3c3c3c] bg-[#1e1e1e] p-3">
              <h3 className="text-sm font-semibold text-[#dcdcaa]">
                Meal Swaps
              </h3>
              <ul className="mt-2 space-y-1 text-xs text-[#9aa1a8]">
                {mealSwaps.map((swap) => (
                  <li key={`${swap.from}-${swap.to}`}>
                    Swap {swap.from} {"->"} {swap.to} ({swap.kcalDelta} kcal,{" "}
                    {swap.proteinDelta}g protein)
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </section>
      </div>

      {exerciseDetail ? (
        <div className="fixed inset-0 z-40 flex items-end justify-end bg-black/50 p-4 md:items-center">
          <div className="max-h-[85vh] w-full max-w-md overflow-auto rounded-lg border border-[#3c3c3c] bg-[#1e1e1e] p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-[#dcdcaa]">
                {exerciseDetail.name}
              </h3>
              <button
                type="button"
                className="rounded border border-[#3c3c3c] px-2 py-1 text-xs"
                onClick={() => setSelectedExercise(null)}
              >
                Close
              </button>
            </div>

            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-[#9cdcfe]">
              How To
            </p>
            <ul className="mt-1 space-y-1 text-xs text-[#9aa1a8]">
              {exerciseDetail.howTo.map((step) => (
                <li key={step}>- {step}</li>
              ))}
            </ul>

            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-[#9cdcfe]">
              Common Mistakes
            </p>
            <ul className="mt-1 space-y-1 text-xs text-[#9aa1a8]">
              {exerciseDetail.commonMistakes.map((mistake) => (
                <li key={mistake}>- {mistake}</li>
              ))}
            </ul>

            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-[#9cdcfe]">
              Targets
            </p>
            <p className="mt-1 text-xs text-[#9aa1a8]">
              {exerciseDetail.targetMuscles.join(", ")}
            </p>

            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-[#9cdcfe]">
              Alternatives
            </p>
            <p className="mt-1 text-xs text-[#9aa1a8]">
              {exerciseDetail.alternatives.join(" | ")}
            </p>

            <p className="mt-3 rounded border border-[#3c3c3c] bg-[#252526] p-2 text-xs text-[#dcdcaa]">
              Demo Tip: {exerciseDetail.demoTip}
            </p>
          </div>
        </div>
      ) : null}

      {workoutSession ? (
        <div className="fixed bottom-4 right-4 z-30 w-[92vw] max-w-sm rounded-lg border border-[#3c3c3c] bg-[#1e1e1e] p-4 shadow-2xl">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#dcdcaa]">
              Workout Mode: {workoutSession.day}
            </h3>
            <button
              type="button"
              className="rounded border border-[#3c3c3c] px-2 py-1 text-xs"
              onClick={() => setWorkoutSession(null)}
            >
              End
            </button>
          </div>

          <p className="text-xs text-[#9cdcfe]">
            Session Timer: {formatDuration(workoutSession.elapsedSec)}
          </p>
          <div className="mt-2 space-y-2">
            {workoutSession.exercises.map((exercise) => {
              const doneSets = workoutSession.completedSets[exercise] ?? 0;
              return (
                <div
                  key={`${workoutSession.key}-${exercise}`}
                  className="rounded border border-[#3c3c3c] p-2"
                >
                  <p className="text-xs text-[#d4d4d4]">{exercise}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <button
                      type="button"
                      className="rounded border border-[#007acc] bg-[#04395e] px-2 py-0.5 text-[11px]"
                      onClick={() =>
                        setWorkoutSession((prev) =>
                          prev
                            ? {
                                ...prev,
                                completedSets: {
                                  ...prev.completedSets,
                                  [exercise]: Math.min(
                                    6,
                                    (prev.completedSets[exercise] ?? 0) + 1,
                                  ),
                                },
                              }
                            : null,
                        )
                      }
                    >
                      + Set
                    </button>
                    <span className="text-[11px] text-[#9aa1a8]">
                      Completed Sets: {doneSets}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
