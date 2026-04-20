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
  Card,
  MetricTile,
  SectionHeader,
  StackActionState,
  TodayStackPanel,
} from "@/components/shared/UIPrimitives";
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
  getBodyPartExerciseCatalog,
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

type RoadmapSectionId =
  | "overview"
  | "workouts"
  | "checkins"
  | "library"
  | "nutrition";

function RoadmapSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 animate-pulse">
      <div className="rounded-xl border border-[rgba(67,81,95,0.72)] bg-[#171d23] p-5">
        <div className="h-6 w-64 rounded bg-[#1d232a]" />
        <div className="mt-3 h-4 w-full rounded bg-[#1d232a]" />
        <div className="mt-2 h-4 w-2/3 rounded bg-[#1d232a]" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <div className="rounded-xl border border-[rgba(67,81,95,0.72)] bg-[#171d23] p-4">
          <div className="h-4 w-24 rounded bg-[#1d232a]" />
          <div className="mt-3 space-y-2">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div
                key={`skeleton-nav-${idx}`}
                className="h-8 rounded bg-[#1d232a]"
              />
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-xl border border-[rgba(67,81,95,0.72)] bg-[#171d23] p-4">
            <div className="h-80 rounded bg-[#1d232a]" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={`skeleton-card-${idx}`}
                className="h-24 rounded-xl border border-[rgba(67,81,95,0.72)] bg-[#171d23]"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface LazyExerciseImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
}

function LazyExerciseImage({
  src,
  alt,
  className,
  loading = "lazy",
}: LazyExerciseImageProps) {
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const isLoaded = loadedSrc === src;

  return (
    <div className={`relative overflow-hidden ${className ?? ""}`}>
      <div
        className={`absolute inset-0 bg-linear-to-r from-[#1d232a] via-[#232b33] to-[#1d232a] transition-opacity duration-300 ${
          isLoaded ? "opacity-0" : "opacity-100 animate-pulse"
        }`}
      />
      <img
        src={src}
        alt={alt}
        loading={loading}
        decoding="async"
        onLoad={() => setLoadedSrc(src)}
        onError={() => setLoadedSrc(src)}
        className={`h-full w-full object-cover transition-all duration-300 ${
          isLoaded ? "opacity-100 blur-0" : "opacity-0 blur-sm"
        }`}
      />
    </div>
  );
}

function PlanFlowNode({ data }: NodeProps<Node<FlowNodeData>>) {
  const palette: Record<NodeStatus, string> = {
    locked: "border-[rgba(74,92,108,0.72)] bg-[#10161b] text-[#7f95a5]",
    active: "border-[#16d9ff] bg-[#10313f] text-[#edf3f7]",
    completed: "border-[#6be9af] bg-[#123a31] text-[#edf3f7]",
  };

  return (
    <div
      className={`w-56 rounded-xl border p-4 shadow-sm ${palette[data.status]}`}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wider text-[#7fe8ff]">
          Phase {data.level}
        </span>
        {data.status === "completed" ? (
          <CheckCircle2 className="h-4 w-4 text-[#6be9af]" />
        ) : null}
      </div>
      <h3 className="text-sm font-semibold">{data.title}</h3>
      <p className="mt-2 text-xs text-[#adc0cd]">{data.description}</p>
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

export default function RoadmapPage() {
  const [initialCachedState] = useState(() => readCachedEnhancedState());
  const [input, setInput] = useState<PlannerInput>(
    initialCachedState?.input ?? initialInput,
  );
  const [progress, setProgress] = useState<Record<string, boolean>>(
    initialCachedState?.progress ?? {},
  );
  const [selectedNodeId, setSelectedNodeId] = useState<string>("assessment");
  const [openGymDayKey, setOpenGymDayKey] = useState<string | null>(null);
  const [equipment, setEquipment] = useState<EquipmentType>(
    initialCachedState?.equipment ?? "gym",
  );
  const [experience, setExperience] = useState<ExperienceLevel>(
    initialCachedState?.experience ?? "beginner",
  );
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [selectedBodyPart, setSelectedBodyPart] = useState<string>("Chest");
  const [activeSection, setActiveSection] =
    useState<RoadmapSectionId>("overview");
  const [workoutSession, setWorkoutSession] =
    useState<WorkoutSessionState | null>(null);
  const [checkins, setCheckins] = useState<WeeklyCheckIn[]>(
    initialCachedState?.checkins ?? [],
  );
  const [nodeFocusId, setNodeFocusId] = useState<string | null>(null);
  const [stackState, setStackState] = useState<
    Record<string, StackActionState>
  >({
    warmup: "start",
    main_lifts: "start",
    accessories: "start",
    recovery: "start",
  });
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
  const [hasLoadedInitialState] = useState(true);

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

  const todayStackItems = useMemo(
    () => [
      {
        id: "warmup",
        title: "Warmup",
        detail: "8-10 minutes mobility + pulse raise",
        state: stackState.warmup,
      },
      {
        id: "main_lifts",
        title: "Main Lifts",
        detail: todayWorkout
          ? `${todayWorkout.bodyParts[0]} + ${todayWorkout.bodyParts[1]}`
          : "Primary movement block",
        state: stackState.main_lifts,
      },
      {
        id: "accessories",
        title: "Accessories",
        detail:
          todayWorkout?.focus ?? "Volume and form-focused assistance work",
        state: stackState.accessories,
      },
      {
        id: "recovery",
        title: "Recovery",
        detail: `${plan.waterLiters}L hydration + mobility cooldown`,
        state: stackState.recovery,
      },
    ],
    [plan.waterLiters, stackState, todayWorkout],
  );

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

  const bodyPartCatalog = useMemo(() => getBodyPartExerciseCatalog(), []);

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
    if (!hasLoadedInitialState) return;

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
  }, [input, progress, checkins, equipment, experience, hasLoadedInitialState]);

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

  const focusedNodeIds = useMemo(() => {
    if (!nodeFocusId) return null;

    const selected = plan.roadmapNodes.find((node) => node.id === nodeFocusId);
    if (!selected) return null;

    const dependents = plan.roadmapNodes
      .filter((node) => node.dependencies.includes(nodeFocusId))
      .map((node) => node.id);

    return new Set([nodeFocusId, ...selected.dependencies, ...dependents]);
  }, [nodeFocusId, plan.roadmapNodes]);

  const flowNodes: Node<FlowNodeData>[] = plan.roadmapNodes.map((node) => ({
    id: node.id,
    position: node.position,
    type: "plan",
    style: {
      width: 224,
      height: 118,
      opacity: focusedNodeIds && !focusedNodeIds.has(node.id) ? 0.4 : 1,
    },
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
        stroke: progress[dependencyId] ? "#6be9af" : "rgba(74,92,108,0.72)",
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

  const phaseProgress = useMemo(() => {
    const levelMap = new Map<
      number,
      { level: number; total: number; completed: number }
    >();

    for (const node of plan.roadmapNodes) {
      const current = levelMap.get(node.level) ?? {
        level: node.level,
        total: 0,
        completed: 0,
      };
      current.total += 1;
      if (progress[node.id]) current.completed += 1;
      levelMap.set(node.level, current);
    }

    return [...levelMap.values()]
      .sort((a, b) => a.level - b.level)
      .map((entry) => ({
        ...entry,
        percent: Math.round((entry.completed / entry.total) * 100),
      }));
  }, [plan.roadmapNodes, progress]);

  const exerciseDetail = selectedExercise
    ? getExerciseDetail(selectedExercise)
    : null;

  const activeBodyPartCatalog =
    bodyPartCatalog.find((entry) => entry.bodyPart === selectedBodyPart) ??
    bodyPartCatalog[0];

  const sidebarSections: Array<{ id: RoadmapSectionId; label: string }> = [
    { id: "overview", label: "Overview" },
    { id: "workouts", label: "Workouts" },
    { id: "checkins", label: "Check-ins" },
    { id: "library", label: "Exercise Library" },
    { id: "nutrition", label: "Nutrition" },
  ];

  const jumpToSection = (sectionId: RoadmapSectionId) => {
    setActiveSection(sectionId);
    document
      .getElementById(`section-${sectionId}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (!hasLoadedInitialState) {
    return (
      <div className="lab-shell px-4 py-6 text-[#edf3f7] md:px-8">
        <RoadmapSkeleton />
      </div>
    );
  }

  return (
    <div className="lab-shell px-4 py-6 text-[#edf3f7] md:px-8">
      {todayWorkout ? (
        <div className="sticky top-2 z-10 mb-3 rounded-lg border border-[rgba(74,92,108,0.72)] bg-[#171d23]/95 p-3 shadow-lg md:hidden">
          <p className="text-[11px] uppercase tracking-wider text-[#7fe8ff]">
            Today&apos;s Workout
          </p>
          <p className="text-sm font-semibold text-[#dcff9d]">
            {todayWorkout.day}: {todayWorkout.bodyParts[0]} +{" "}
            {todayWorkout.bodyParts[1]}
          </p>
          <button
            type="button"
            className="mt-2 rounded border border-[#16d9ff] bg-[#0b2f3a] px-3 py-1 text-xs"
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
        <header className="lab-elevated p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="lab-kicker text-[#7fe8ff]">Roadmap</p>
              <h1 className="lab-display mt-2 text-2xl font-semibold text-[#edf3f7]">
                Adaptive Body Transformation Planner
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-[#adc0cd]">
                Auto-adjusted coaching with adaptive workouts, weekly check-ins,
                execution mode, nutrition templates, and progress-gated roadmap.
              </p>
            </div>
            <div className="rounded-lg border border-[rgba(74,92,108,0.72)] bg-[#10161b] px-4 py-3 text-right">
              <div className="text-xs text-[#adc0cd]">Roadmap Completion</div>
              <div className="text-xl font-semibold text-[#6be9af]">
                {completionRate}%
              </div>
              <div className="text-xs text-[#adc0cd]">
                Readiness {readinessScore}/100
              </div>
              <div className="mt-1 text-xs text-[#adc0cd]">
                Sync: {saveStatus === "saving" ? "Saving..." : null}
                {saveStatus === "saved" ? "Saved" : null}
                {saveStatus === "offline" ? "Local only" : null}
                {saveStatus === "idle" ? "Idle" : null}
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <TodayStackPanel
            items={todayStackItems}
            onStateChange={(id, next) =>
              setStackState((prev) => ({ ...prev, [id]: next }))
            }
          />
          <Card level="base">
            <SectionHeader
              kicker="Phase Progress"
              title="Unlock Momentum"
              description="Rings show completed milestones per phase"
            />
            <div className="mt-3 flex flex-wrap gap-3">
              {phaseProgress.map((phase) => (
                <div key={`phase-ring-${phase.level}`} className="text-center">
                  <div
                    className="mx-auto grid h-14 w-14 place-items-center rounded-full"
                    style={{
                      background: `conic-gradient(${phase.percent >= 100 ? "#6be9af" : "#16d9ff"} ${phase.percent * 3.6}deg, rgba(74,92,108,0.35) 0deg)`,
                    }}
                  >
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-[#10161b] text-xs font-semibold text-[#edf3f7]">
                      {phase.percent}%
                    </div>
                  </div>
                  <p className="mt-1 text-[11px] text-[#adc0cd]">
                    Phase {phase.level}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
          <aside className="h-fit rounded-xl border border-[rgba(67,81,95,0.72)] bg-[#171d23] p-3 lg:sticky lg:top-4">
            <p className="px-2 pb-2 text-[11px] uppercase tracking-wide text-[#7fe8ff]">
              Quick Sections
            </p>
            <div className="space-y-1">
              {sidebarSections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => jumpToSection(section.id)}
                  className={`w-full rounded border px-3 py-2 text-left text-xs ${
                    activeSection === section.id
                      ? "border-[#16d9ff] bg-[#0b2f3a] text-white"
                      : "border-[rgba(74,92,108,0.72)] bg-[#10161b] text-[#adc0cd]"
                  }`}
                >
                  {section.label}
                </button>
              ))}
            </div>
          </aside>

          <div className="space-y-6">
            <section
              id="section-overview"
              className="grid gap-6 lg:grid-cols-[350px_1fr]"
            >
              <div className="rounded-xl border border-[rgba(67,81,95,0.72)] bg-[#171d23] p-4">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#7fe8ff]">
                  Your Inputs
                </h2>
                <div className="space-y-3 text-sm">
                  <label className="block">
                    <span className="mb-1 block text-[#adc0cd]">Age</span>
                    <input
                      type="number"
                      className="w-full rounded-md border border-[rgba(74,92,108,0.72)] bg-[#10161b] px-3 py-2"
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
                      <span className="mb-1 block text-[#adc0cd]">
                        Height (cm)
                      </span>
                      <input
                        type="number"
                        className="w-full rounded-md border border-[rgba(74,92,108,0.72)] bg-[#10161b] px-3 py-2"
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
                      <span className="mb-1 block text-[#adc0cd]">
                        Weight (kg)
                      </span>
                      <input
                        type="number"
                        className="w-full rounded-md border border-[rgba(74,92,108,0.72)] bg-[#10161b] px-3 py-2"
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
                    <span className="mb-1 block text-[#adc0cd]">Goal</span>
                    <select
                      className="w-full rounded-md border border-[rgba(74,92,108,0.72)] bg-[#10161b] px-3 py-2"
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
                    <span className="mb-1 block text-[#adc0cd]">Activity</span>
                    <select
                      className="w-full rounded-md border border-[rgba(74,92,108,0.72)] bg-[#10161b] px-3 py-2"
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
                      <span className="mb-1 block text-[#adc0cd]">
                        Workout Days
                      </span>
                      <input
                        type="number"
                        min={3}
                        max={7}
                        className="w-full rounded-md border border-[rgba(74,92,108,0.72)] bg-[#10161b] px-3 py-2"
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
                      <span className="mb-1 block text-[#adc0cd]">Diet</span>
                      <select
                        className="w-full rounded-md border border-[rgba(74,92,108,0.72)] bg-[#10161b] px-3 py-2"
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
                      <span className="mb-1 block text-[#adc0cd]">
                        Experience
                      </span>
                      <select
                        className="w-full rounded-md border border-[rgba(74,92,108,0.72)] bg-[#10161b] px-3 py-2"
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
                      <span className="mb-1 block text-[#adc0cd]">
                        Equipment
                      </span>
                      <select
                        className="w-full rounded-md border border-[rgba(74,92,108,0.72)] bg-[#10161b] px-3 py-2"
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
                    <span className="mb-1 block text-[#adc0cd]">Sex</span>
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
                              ? "border-[#16d9ff] bg-[#0b2f3a] text-white"
                              : "border-[rgba(74,92,108,0.72)] bg-[#10161b]"
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </label>
                </div>
              </div>

              <div className="rounded-xl border border-[rgba(67,81,95,0.72)] bg-[#171d23] p-4">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#7fe8ff]">
                  Visual Roadmap (Readiness Gated)
                </h2>
                <div
                  className="overflow-hidden rounded-lg border border-[rgba(74,92,108,0.72)] bg-[#10161b]"
                  style={{ height: 420 }}
                >
                  <ReactFlow
                    nodes={flowNodes}
                    edges={flowEdges}
                    nodeTypes={nodeTypes}
                    onNodeClick={(_, node) => {
                      setSelectedNodeId(node.id);
                      setNodeFocusId(node.id);
                    }}
                    fitView
                    minZoom={0.4}
                    maxZoom={1.5}
                  >
                    <Background color="#28343f" gap={24} />
                    <MiniMap
                      bgColor="#10161b"
                      maskColor="rgba(30,30,30,0.35)"
                      maskStrokeColor="rgba(74,92,108,0.72)"
                      maskStrokeWidth={1}
                      nodeStrokeColor="#10161b"
                      nodeStrokeWidth={1.5}
                      nodeBorderRadius={2}
                      style={{
                        backgroundColor: "#10161b",
                        border: "1px solid rgba(74,92,108,0.72)",
                      }}
                      nodeColor={(node) => {
                        const status = flowNodes.find(
                          (item) => item.id === node.id,
                        )?.data.status;
                        if (status === "completed") return "#6be9af";
                        if (status === "active") return "#16d9ff";
                        return "#7f95a5";
                      }}
                    />
                    <Controls />
                  </ReactFlow>
                </div>
                <div className="mt-4 rounded-lg border border-[rgba(74,92,108,0.72)] bg-[#10161b] p-4">
                  <div className="mb-3 flex justify-end">
                    <button
                      type="button"
                      className="rounded border border-[rgba(74,92,108,0.72)] px-2 py-1 text-xs text-[#adc0cd]"
                      onClick={() => setNodeFocusId(null)}
                    >
                      Clear Focus Dimming
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-medium text-[#dcff9d]">
                        {selectedNode.title}
                      </h3>
                      <p className="mt-1 text-sm text-[#adc0cd]">
                        {selectedNode.description}
                      </p>
                      <p className="mt-1 text-xs text-[#adc0cd]">
                        Status: {selectedNodeStatus.toUpperCase()}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={selectedNodeStatus === "locked"}
                      className={`rounded-md border px-4 py-2 text-sm ${
                        selectedNodeStatus === "locked"
                          ? "cursor-not-allowed border-[rgba(74,92,108,0.72)] bg-[#171d23] text-[#7f95a5]"
                          : progress[selectedNode.id]
                            ? "border-[#6be9af] bg-[#123a31] text-[#6be9af]"
                            : "border-[#16d9ff] bg-[#0b2f3a] text-white"
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
                  <div className="mt-3 rounded border border-[rgba(74,92,108,0.72)] bg-[#171d23] p-3 text-xs text-[#adc0cd]">
                    <p className="font-semibold text-[#7fe8ff]">
                      Unlock Criteria
                    </p>
                    {selectedNode.dependencies.length ? (
                      <ul className="mt-1 space-y-1">
                        {selectedNode.dependencies.map((dependencyId) => {
                          const dependencyNode = plan.roadmapNodes.find(
                            (node) => node.id === dependencyId,
                          );

                          return (
                            <li key={`${selectedNode.id}-${dependencyId}`}>
                              {progress[dependencyId] ? "Done" : "Pending"} -{" "}
                              {dependencyNode?.title ?? dependencyId}
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <p className="mt-1">
                        No prerequisite nodes. You can start now.
                      </p>
                    )}
                    <p className="mt-2 text-[#adc0cd]">
                      Why this phase now: this node is scheduled after its
                      dependencies and reflects current readiness progression.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {activeSection === "overview" ? (
              <>
                <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <MetricTile
                    label="BMI"
                    icon={<Scale className="h-4 w-4" />}
                    value={plan.bmi}
                    note={plan.bmiCategory}
                    intent="progress"
                  />
                  <MetricTile
                    label="Calories"
                    icon={<Flame className="h-4 w-4" />}
                    value={adjustedCalories}
                    note={`Base ${plan.targetCalories} | ${autoAdjustment.note}`}
                    intent="caution"
                  />
                  <MetricTile
                    label="Protein"
                    icon={<Beef className="h-4 w-4" />}
                    value={`${plan.macros.proteinG}g`}
                    note={`Carbs ${plan.macros.carbsG}g · Fats ${plan.macros.fatsG}g`}
                    intent="action"
                  />
                  <MetricTile
                    label="Hydration"
                    icon={<Droplets className="h-4 w-4" />}
                    value={`${plan.waterLiters}L`}
                    note="Daily water target"
                    intent="action"
                  />
                </section>

                <section className="rounded-xl border border-[rgba(67,81,95,0.72)] bg-[#171d23] p-4">
                  <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[#7fe8ff]">
                    <Sparkles className="h-4 w-4" /> AI Daily Coach
                  </h2>
                  <p className="rounded-lg border border-[rgba(74,92,108,0.72)] bg-[#10161b] p-3 text-sm text-[#edf3f7]">
                    {aiCoachMessage}
                  </p>
                </section>
              </>
            ) : null}

            {activeSection === "workouts" ? (
              <section
                id="section-workouts"
                className="grid gap-6 lg:grid-cols-2"
              >
                <article className="rounded-xl border border-[rgba(67,81,95,0.72)] bg-[#171d23] p-4">
                  <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[#7fe8ff]">
                    <Dumbbell className="h-4 w-4" /> Adaptive Gym Plan
                  </h2>
                  <div className="grid gap-4 lg:grid-cols-1">
                    {adaptiveGymProgression.map((phase) => (
                      <article
                        key={phase.level}
                        className="rounded-lg border border-[rgba(74,92,108,0.72)] bg-[#10161b] p-3"
                      >
                        <h3 className="text-base font-semibold text-[#dcff9d]">
                          {phase.level}
                        </h3>
                        <p className="mb-3 text-xs text-[#adc0cd]">
                          {phase.weeklySplit}
                        </p>
                        <div className="space-y-2">
                          {phase.days.map((dayPlan) => (
                            <div
                              role="button"
                              tabIndex={0}
                              key={`${phase.level}-${dayPlan.day}`}
                              className="w-full rounded-md border border-[rgba(74,92,108,0.6)] p-2 text-left"
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
                                <p className="text-xs font-semibold text-[#7fe8ff]">
                                  {dayPlan.day}
                                </p>
                                <p className="text-[11px] text-[#6be9af]">
                                  {dayPlan.setsReps}
                                </p>
                              </div>
                              <p className="mt-1 text-xs text-[#edf3f7]">
                                {dayPlan.bodyParts[0]} + {dayPlan.bodyParts[1]}
                              </p>
                              <p className="mt-1 text-[11px] text-[#adc0cd]">
                                {dayPlan.focus}
                              </p>
                              <p className="mt-2 text-[11px] text-[#4abbe0]">
                                {openGymDayKey ===
                                `${phase.level}-${dayPlan.day}`
                                  ? "Click to hide exercises"
                                  : "Click to view exercises"}
                              </p>
                              {openGymDayKey ===
                              `${phase.level}-${dayPlan.day}` ? (
                                <>
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    <button
                                      type="button"
                                      className="inline-flex items-center gap-1 rounded border border-[#16d9ff] bg-[#0b2f3a] px-2 py-1 text-[11px]"
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
                                      <PlayCircle className="h-3.5 w-3.5" />{" "}
                                      Start Workout Mode
                                    </button>
                                  </div>
                                  <p className="mt-2 text-[11px] font-medium uppercase tracking-wide text-[#b88cff]">
                                    Exercises (6)
                                  </p>
                                  <ul className="mt-1 space-y-1 text-[11px] text-[#adc0cd]">
                                    {dayPlan.exercises.map((exercise) => (
                                      <li key={exercise}>
                                        <button
                                          type="button"
                                          className="flex w-full items-center gap-2 text-left underline-offset-2 hover:text-[#dcff9d] hover:underline"
                                          onClick={(event) => {
                                            event.stopPropagation();
                                            setSelectedExercise(exercise);
                                          }}
                                        >
                                          <LazyExerciseImage
                                            src={
                                              getExerciseDetail(exercise)
                                                .imageUrl
                                            }
                                            alt={
                                              getExerciseDetail(exercise)
                                                .imageAlt
                                            }
                                            className="h-7 w-10 rounded border border-[rgba(74,92,108,0.72)]"
                                          />
                                          <span>- {exercise}</span>
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

                <article
                  id="section-checkins"
                  className="rounded-xl border border-[rgba(67,81,95,0.72)] bg-[#171d23] p-4"
                >
                  <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[#7fe8ff]">
                    <Activity className="h-4 w-4" /> Weekly Check-in + Readiness
                  </h2>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <label className="text-xs text-[#adc0cd]">
                      Date
                      <input
                        type="date"
                        className="mt-1 w-full rounded border border-[rgba(74,92,108,0.72)] bg-[#10161b] px-2 py-1"
                        value={checkinForm.date}
                        onChange={(event) =>
                          setCheckinForm((prev) => ({
                            ...prev,
                            date: event.target.value,
                          }))
                        }
                      />
                    </label>
                    <label className="text-xs text-[#adc0cd]">
                      Weight (kg)
                      <input
                        type="number"
                        className="mt-1 w-full rounded border border-[rgba(74,92,108,0.72)] bg-[#10161b] px-2 py-1"
                        value={checkinForm.weightKg}
                        onChange={(event) =>
                          setCheckinForm((prev) => ({
                            ...prev,
                            weightKg: Number(event.target.value),
                          }))
                        }
                      />
                    </label>
                    <label className="text-xs text-[#adc0cd]">
                      Waist (cm)
                      <input
                        type="number"
                        className="mt-1 w-full rounded border border-[rgba(74,92,108,0.72)] bg-[#10161b] px-2 py-1"
                        value={checkinForm.waistCm}
                        onChange={(event) =>
                          setCheckinForm((prev) => ({
                            ...prev,
                            waistCm: Number(event.target.value),
                          }))
                        }
                      />
                    </label>
                    <label className="text-xs text-[#adc0cd]">
                      Sleep (hours)
                      <input
                        type="number"
                        step="0.5"
                        className="mt-1 w-full rounded border border-[rgba(74,92,108,0.72)] bg-[#10161b] px-2 py-1"
                        value={checkinForm.sleepHours}
                        onChange={(event) =>
                          setCheckinForm((prev) => ({
                            ...prev,
                            sleepHours: Number(event.target.value),
                          }))
                        }
                      />
                    </label>
                    <label className="text-xs text-[#adc0cd]">
                      Avg Steps
                      <input
                        type="number"
                        className="mt-1 w-full rounded border border-[rgba(74,92,108,0.72)] bg-[#10161b] px-2 py-1"
                        value={checkinForm.stepsAvg}
                        onChange={(event) =>
                          setCheckinForm((prev) => ({
                            ...prev,
                            stepsAvg: Number(event.target.value),
                          }))
                        }
                      />
                    </label>
                    <label className="text-xs text-[#adc0cd]">
                      Stress (1-10)
                      <input
                        type="number"
                        min={1}
                        max={10}
                        className="mt-1 w-full rounded border border-[rgba(74,92,108,0.72)] bg-[#10161b] px-2 py-1"
                        value={checkinForm.stress}
                        onChange={(event) =>
                          setCheckinForm((prev) => ({
                            ...prev,
                            stress: Number(event.target.value),
                          }))
                        }
                      />
                    </label>
                    <label className="text-xs text-[#adc0cd]">
                      Energy (1-10)
                      <input
                        type="number"
                        min={1}
                        max={10}
                        className="mt-1 w-full rounded border border-[rgba(74,92,108,0.72)] bg-[#10161b] px-2 py-1"
                        value={checkinForm.energy}
                        onChange={(event) =>
                          setCheckinForm((prev) => ({
                            ...prev,
                            energy: Number(event.target.value),
                          }))
                        }
                      />
                    </label>
                    <label className="text-xs text-[#adc0cd]">
                      Workout Completion %
                      <input
                        type="number"
                        min={0}
                        max={100}
                        className="mt-1 w-full rounded border border-[rgba(74,92,108,0.72)] bg-[#10161b] px-2 py-1"
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
                    className="mt-3 rounded border border-[#16d9ff] bg-[#0b2f3a] px-3 py-1.5 text-xs"
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

                  <div className="mt-3 rounded border border-[rgba(74,92,108,0.72)] bg-[#10161b] p-3 text-xs text-[#adc0cd]">
                    <p className="font-semibold text-[#dcff9d]">
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
                          className="rounded border border-[rgba(74,92,108,0.72)] bg-[#10161b] p-2 text-xs"
                        >
                          <p className="text-[#dcff9d]">{entry.date}</p>
                          <p className="text-[#adc0cd]">
                            Wt {entry.weightKg} kg | Waist {entry.waistCm} cm |
                            Sleep {entry.sleepHours}h | Completion{" "}
                            {entry.workoutCompletion}%
                          </p>
                        </div>
                      ))}
                  </div>
                </article>
              </section>
            ) : null}

            {activeSection === "library" ? (
              <section
                id="section-library"
                className="rounded-xl border border-[rgba(67,81,95,0.72)] bg-[#171d23] p-4"
              >
                <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[#7fe8ff]">
                  <Dumbbell className="h-4 w-4" /> Body-Part Exercise Explorer
                </h2>

                <p className="mb-3 text-xs text-[#adc0cd]">
                  Browse comprehensive exercise options by body part. Click any
                  movement to open step-by-step instructions, form cues, picture
                  example, and rep targets.
                </p>

                <div className="mb-4 flex flex-wrap gap-2">
                  {bodyPartCatalog.map((entry) => (
                    <button
                      type="button"
                      key={entry.bodyPart}
                      onClick={() => setSelectedBodyPart(entry.bodyPart)}
                      className={`rounded border px-3 py-1.5 text-xs ${
                        selectedBodyPart === entry.bodyPart
                          ? "border-[#16d9ff] bg-[#0b2f3a] text-white"
                          : "border-[rgba(74,92,108,0.72)] bg-[#10161b] text-[#adc0cd]"
                      }`}
                    >
                      {entry.bodyPart}
                    </button>
                  ))}
                </div>

                {activeBodyPartCatalog ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    <article className="rounded-md border border-[rgba(74,92,108,0.72)] bg-[#10161b] p-3">
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-[#dcff9d]">
                        Bodyweight ({activeBodyPartCatalog.bodyweight.length})
                      </h3>
                      <ul className="mt-2 space-y-1 text-xs text-[#adc0cd]">
                        {activeBodyPartCatalog.bodyweight.map((exercise) => (
                          <li
                            key={`${activeBodyPartCatalog.bodyPart}-${exercise}`}
                          >
                            <button
                              type="button"
                              className="flex w-full items-center gap-2 text-left underline-offset-2 hover:text-[#dcff9d] hover:underline"
                              onClick={() => setSelectedExercise(exercise)}
                            >
                              <LazyExerciseImage
                                src={getExerciseDetail(exercise).imageUrl}
                                alt={getExerciseDetail(exercise).imageAlt}
                                className="h-7 w-10 rounded border border-[rgba(74,92,108,0.72)]"
                              />
                              <span>- {exercise}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </article>

                    <article className="rounded-md border border-[rgba(74,92,108,0.72)] bg-[#10161b] p-3">
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-[#dcff9d]">
                        Machine / Gym ({activeBodyPartCatalog.machine.length})
                      </h3>
                      <ul className="mt-2 space-y-1 text-xs text-[#adc0cd]">
                        {activeBodyPartCatalog.machine.map((exercise) => (
                          <li
                            key={`${activeBodyPartCatalog.bodyPart}-${exercise}`}
                          >
                            <button
                              type="button"
                              className="flex w-full items-center gap-2 text-left underline-offset-2 hover:text-[#dcff9d] hover:underline"
                              onClick={() => setSelectedExercise(exercise)}
                            >
                              <LazyExerciseImage
                                src={getExerciseDetail(exercise).imageUrl}
                                alt={getExerciseDetail(exercise).imageAlt}
                                className="h-7 w-10 rounded border border-[rgba(74,92,108,0.72)]"
                              />
                              <span>- {exercise}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </article>
                  </div>
                ) : null}
              </section>
            ) : null}

            {activeSection === "nutrition" ? (
              <section
                id="section-nutrition"
                className="rounded-xl border border-[rgba(67,81,95,0.72)] bg-[#171d23] p-4"
              >
                <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[#7fe8ff]">
                  <Sparkles className="h-4 w-4" /> Nutrition Planner Upgrade
                </h2>
                <div className="grid gap-4 lg:grid-cols-3">
                  {nutritionTemplates.map((template) => (
                    <article
                      key={template.name}
                      className="rounded-md border border-[rgba(74,92,108,0.72)] bg-[#10161b] p-3"
                    >
                      <h3 className="font-semibold text-[#dcff9d]">
                        {template.name}
                      </h3>
                      <p className="mt-1 text-xs text-[#adc0cd]">
                        {Math.round(template.calories)} kcal | Protein{" "}
                        {Math.round(template.proteinG)}g | Carbs{" "}
                        {Math.round(template.carbsG)}g | Fats{" "}
                        {Math.round(template.fatsG)}g
                      </p>
                      <div className="mt-2 space-y-1 text-xs text-[#adc0cd]">
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
                  <article className="rounded-md border border-[rgba(74,92,108,0.72)] bg-[#10161b] p-3">
                    <h3 className="text-sm font-semibold text-[#dcff9d]">
                      Grocery List
                    </h3>
                    <ul className="mt-2 space-y-1 text-xs text-[#adc0cd]">
                      {groceryList.map((item) => (
                        <li key={item.item}>
                          {item.item}: {item.qty}
                        </li>
                      ))}
                    </ul>
                  </article>

                  <article className="rounded-md border border-[rgba(74,92,108,0.72)] bg-[#10161b] p-3">
                    <h3 className="text-sm font-semibold text-[#dcff9d]">
                      Meal Swaps
                    </h3>
                    <ul className="mt-2 space-y-1 text-xs text-[#adc0cd]">
                      {mealSwaps.map((swap) => (
                        <li key={`${swap.from}-${swap.to}`}>
                          Swap {swap.from} {"->"} {swap.to} ({swap.kcalDelta}{" "}
                          kcal, {swap.proteinDelta}g protein)
                        </li>
                      ))}
                    </ul>
                  </article>
                </div>
              </section>
            ) : null}
          </div>
        </div>
      </div>

      {exerciseDetail ? (
        <div className="fixed inset-0 z-40 flex items-end justify-end bg-black/50 p-4 md:items-center">
          <div className="max-h-[85vh] w-full max-w-md overflow-auto rounded-lg border border-[rgba(74,92,108,0.72)] bg-[#10161b] p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-[#dcff9d]">
                {exerciseDetail.name}
              </h3>
              <button
                type="button"
                className="rounded border border-[rgba(74,92,108,0.72)] px-2 py-1 text-xs"
                onClick={() => setSelectedExercise(null)}
              >
                Close
              </button>
            </div>

            <LazyExerciseImage
              src={exerciseDetail.imageUrl}
              alt={exerciseDetail.imageAlt}
              loading="eager"
              className="mt-3 h-44 w-full rounded border border-[rgba(74,92,108,0.72)]"
            />

            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded border border-[rgba(74,92,108,0.72)] bg-[#171d23] p-2">
                <p className="text-[11px] uppercase tracking-wide text-[#7fe8ff]">
                  Body Part
                </p>
                <p className="text-xs text-[#dcff9d]">
                  {exerciseDetail.bodyPart}
                </p>
              </div>
              <div className="rounded border border-[rgba(74,92,108,0.72)] bg-[#171d23] p-2">
                <p className="text-[11px] uppercase tracking-wide text-[#7fe8ff]">
                  Recommended Reps
                </p>
                <p className="text-xs text-[#dcff9d]">
                  {exerciseDetail.recommendedReps}
                </p>
              </div>
            </div>

            <p className="mt-2 text-[11px] uppercase tracking-wide text-[#adc0cd]">
              Modality: {exerciseDetail.modality}
            </p>

            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-[#7fe8ff]">
              Step-by-Step
            </p>
            <ul className="mt-1 space-y-1 text-xs text-[#adc0cd]">
              {exerciseDetail.howTo.map((step, index) => (
                <li key={step}>
                  {index + 1}. {step}
                </li>
              ))}
            </ul>

            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-[#7fe8ff]">
              Common Mistakes
            </p>
            <ul className="mt-1 space-y-1 text-xs text-[#adc0cd]">
              {exerciseDetail.commonMistakes.map((mistake) => (
                <li key={mistake}>- {mistake}</li>
              ))}
            </ul>

            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-[#7fe8ff]">
              Targets
            </p>
            <p className="mt-1 text-xs text-[#adc0cd]">
              {exerciseDetail.targetMuscles.join(", ")}
            </p>

            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-[#7fe8ff]">
              Alternatives
            </p>
            <p className="mt-1 text-xs text-[#adc0cd]">
              {exerciseDetail.alternatives.join(" | ")}
            </p>

            <p className="mt-3 rounded border border-[rgba(74,92,108,0.72)] bg-[#171d23] p-2 text-xs text-[#dcff9d]">
              Demo Tip: {exerciseDetail.demoTip}
            </p>
          </div>
        </div>
      ) : null}

      {workoutSession ? (
        <div className="fixed bottom-4 right-4 z-30 w-[92vw] max-w-sm rounded-lg border border-[rgba(74,92,108,0.72)] bg-[#10161b] p-4 shadow-2xl">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#dcff9d]">
              Workout Mode: {workoutSession.day}
            </h3>
            <button
              type="button"
              className="rounded border border-[rgba(74,92,108,0.72)] px-2 py-1 text-xs"
              onClick={() => setWorkoutSession(null)}
            >
              End
            </button>
          </div>

          <p className="text-xs text-[#7fe8ff]">
            Session Timer: {formatDuration(workoutSession.elapsedSec)}
          </p>
          <div className="mt-2 space-y-2">
            {workoutSession.exercises.map((exercise) => {
              const doneSets = workoutSession.completedSets[exercise] ?? 0;
              return (
                <div
                  key={`${workoutSession.key}-${exercise}`}
                  className="rounded border border-[rgba(74,92,108,0.72)] p-2"
                >
                  <p className="text-xs text-[#edf3f7]">{exercise}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <button
                      type="button"
                      className="rounded border border-[#16d9ff] bg-[#0b2f3a] px-2 py-0.5 text-[11px]"
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
                    <span className="text-[11px] text-[#adc0cd]">
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
