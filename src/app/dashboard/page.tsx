"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Beef,
  Calendar,
  Dumbbell,
  Droplets,
  Flame,
  Scale,
  Sparkles,
} from "lucide-react";
import {
  ActionButton,
  Card,
  MetricTile,
  SectionHeader,
  StackActionState,
  TodayStackPanel,
} from "@/components/shared/UIPrimitives";
import { PlannerInput, calculateBodyPlan } from "@/lib/bodyPlanner";
import {
  EquipmentType,
  ExperienceLevel,
  WeeklyCheckIn,
  buildDailyMealTemplates,
  computeReadinessScore,
  getBodyPartExerciseCatalog,
  getAdaptiveGymProgression,
  getDailyCoachMessage,
  getProgressBasedAdjustment,
  getExerciseDetail,
} from "@/lib/planEnhancements";

const fallbackInput: PlannerInput = {
  age: 28,
  sex: "male",
  heightCm: 170,
  weightKg: 82,
  goal: "fat_loss",
  activity: "moderate",
  workoutDays: 5,
  diet: "mixed",
};

type DashboardSectionId =
  | "overview"
  | "workouts"
  | "checkins"
  | "library"
  | "nutrition";

function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 animate-pulse">
      <div className="rounded-xl border border-[rgba(67,81,95,0.72)] bg-[#171d23] p-5">
        <div className="h-6 w-56 rounded bg-[#1d232a]" />
        <div className="mt-3 h-4 w-1/2 rounded bg-[#1d232a]" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={`dash-skeleton-card-${index}`}
            className="h-24 rounded-xl border border-[rgba(67,81,95,0.72)] bg-[#171d23]"
          />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <div className="rounded-xl border border-[rgba(67,81,95,0.72)] bg-[#171d23] p-3">
          <div className="h-4 w-24 rounded bg-[#1d232a]" />
          <div className="mt-3 space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={`dash-skeleton-nav-${index}`}
                className="h-8 rounded bg-[#1d232a]"
              />
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <div className="h-72 rounded-xl border border-[rgba(67,81,95,0.72)] bg-[#171d23]" />
          <div className="h-56 rounded-xl border border-[rgba(67,81,95,0.72)] bg-[#171d23]" />
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

function readCachedDashboardState(): {
  input: PlannerInput;
  checkins: WeeklyCheckIn[];
  equipment: EquipmentType;
  experience: ExperienceLevel;
} {
  if (typeof window === "undefined") {
    return {
      input: fallbackInput,
      checkins: [],
      equipment: "gym",
      experience: "beginner",
    };
  }

  let input = fallbackInput;
  let checkins: WeeklyCheckIn[] = [];
  let equipment: EquipmentType = "gym";
  let experience: ExperienceLevel = "beginner";

  try {
    const savedInput = localStorage.getItem("bodyPlanInput");
    if (savedInput) input = JSON.parse(savedInput) as PlannerInput;
  } catch {
    // fallback to defaults
  }

  try {
    const savedExtra = localStorage.getItem("bodyPlanEnhancedState");
    if (savedExtra) {
      const parsed = JSON.parse(savedExtra) as {
        checkins?: WeeklyCheckIn[];
        equipment?: EquipmentType;
        experience?: ExperienceLevel;
      };
      checkins = parsed.checkins ?? [];
      equipment = parsed.equipment ?? "gym";
      experience = parsed.experience ?? "beginner";
    }
  } catch {
    // fallback to defaults
  }

  return { input, checkins, equipment, experience };
}

export default function DashboardPage() {
  const [initialState] = useState(() => readCachedDashboardState());
  const [input, setInput] = useState<PlannerInput | null>(initialState.input);
  const [openGymDayKey, setOpenGymDayKey] = useState<string | null>(null);
  const [checkins, setCheckins] = useState<WeeklyCheckIn[]>(
    initialState.checkins,
  );
  const [equipment, setEquipment] = useState<EquipmentType>(
    initialState.equipment,
  );
  const [experience, setExperience] = useState<ExperienceLevel>(
    initialState.experience,
  );
  const [hasLoadedState] = useState(true);
  const [selectedSection, setSelectedSection] =
    useState<DashboardSectionId>("overview");
  const [selectedBodyPart, setSelectedBodyPart] = useState<string>("Chest");
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [isCheckinOpen, setIsCheckinOpen] = useState(false);
  const [showOptionalCheckinFields, setShowOptionalCheckinFields] =
    useState(false);
  const [quickCheckin, setQuickCheckin] = useState<WeeklyCheckIn>({
    date: new Date().toISOString().slice(0, 10),
    weightKg: fallbackInput.weightKg,
    waistCm: 90,
    sleepHours: 7,
    stepsAvg: 8500,
    stress: 4,
    energy: 7,
    workoutCompletion: 75,
  });
  const [stackState, setStackState] = useState<
    Record<string, StackActionState>
  >({
    warmup: "start",
    main_lifts: "start",
    accessories: "start",
    recovery: "start",
  });

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch("/api/user-plan-state", {
          cache: "no-store",
        });
        if (!response.ok) return;
        const payload = (await response.json()) as {
          ok: boolean;
          state: {
            input?: PlannerInput;
            checkins?: WeeklyCheckIn[];
            equipment?: EquipmentType;
            experience?: ExperienceLevel;
          } | null;
        };

        if (!payload.ok || !payload.state) return;
        if (payload.state.input) setInput(payload.state.input);
        if (payload.state.checkins) setCheckins(payload.state.checkins);
        if (payload.state.equipment) setEquipment(payload.state.equipment);
        if (payload.state.experience) setExperience(payload.state.experience);
      } catch {
        // no-op
      }
    })();
  }, []);

  const plan = useMemo(() => {
    if (!input) return null;
    return calculateBodyPlan(input);
  }, [input]);

  const bodyPartCatalog = useMemo(() => getBodyPartExerciseCatalog(), []);

  const adjustment = useMemo(() => {
    if (!input) {
      return {
        calorieDelta: 0,
        stepsDelta: 0,
        cardioMinutesDelta: 0,
        note: "No adjustments yet.",
      };
    }
    return getProgressBasedAdjustment(input, checkins);
  }, [input, checkins]);

  const readiness = useMemo(() => {
    if (!checkins.length) return 62;
    return computeReadinessScore(checkins[checkins.length - 1]);
  }, [checkins]);

  if (!plan || !input || !hasLoadedState) {
    return (
      <div className="lab-shell px-6 py-10 text-[#edf3f7]">
        <DashboardSkeleton />
      </div>
    );
  }

  const adaptiveGym = getAdaptiveGymProgression(
    plan.gymProgression,
    experience,
    input.workoutDays,
    equipment,
  );

  const adjustedCalories = Math.max(
    1200,
    plan.targetCalories + adjustment.calorieDelta,
  );
  const nutritionTemplates = buildDailyMealTemplates(
    adjustedCalories,
    plan.macros,
    input.diet,
    plan.mealOptions,
  );
  const coachMessage = getDailyCoachMessage(input.goal, readiness, adjustment);

  const activeBodyPartCatalog =
    bodyPartCatalog.find((entry) => entry.bodyPart === selectedBodyPart) ??
    bodyPartCatalog[0];

  const sidebarSections: Array<{ id: DashboardSectionId; label: string }> = [
    { id: "overview", label: "Overview" },
    { id: "workouts", label: "Workouts" },
    { id: "checkins", label: "Check-ins" },
    { id: "library", label: "Exercise Library" },
    { id: "nutrition", label: "Nutrition" },
  ];

  const exerciseDetail = selectedExercise
    ? getExerciseDetail(selectedExercise)
    : null;

  const mondayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
  const dayNames = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const todayWorkout = adaptiveGym[0]?.days.find(
    (dayPlan) => dayPlan.day === dayNames[mondayIndex],
  );

  const recentCheckins = checkins.slice(-4).reverse();
  const latestCheckin = checkins[checkins.length - 1];
  const previousCheckin = checkins[checkins.length - 2];
  const weightTrendKg =
    latestCheckin && previousCheckin
      ? Number((latestCheckin.weightKg - previousCheckin.weightKg).toFixed(1))
      : null;

  const todayStackItems = [
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
      detail: todayWorkout?.focus ?? "Volume and form-focused accessories",
      state: stackState.accessories,
    },
    {
      id: "recovery",
      title: "Recovery",
      detail: `${plan.waterLiters}L hydration + sleep quality check`,
      state: stackState.recovery,
    },
  ];

  const nextBestAction =
    todayStackItems.find((item) => item.state !== "done")?.title ??
    "Log weekly check-in";

  const quickCheckinCoachMessage = getDailyCoachMessage(
    input.goal,
    computeReadinessScore(quickCheckin),
    getProgressBasedAdjustment(input, [...checkins, quickCheckin]),
  );

  const jumpToSection = (sectionId: DashboardSectionId) => {
    setSelectedSection(sectionId);
    document
      .getElementById(`dashboard-section-${sectionId}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="lab-shell px-6 py-8 text-[#edf3f7]">
      <div className="mx-auto max-w-7xl space-y-6">
        <Card level="elevated" className="p-5">
          <SectionHeader
            kicker="Dashboard"
            title="Performance Console"
            description={`Goal: ${input.goal.replace("_", " ")} · Activity: ${input.activity.replace("_", " ")}`}
            action={
              <Link href="/roadmap">
                <ActionButton>Edit Roadmap Inputs</ActionButton>
              </Link>
            }
          />
        </Card>

        <Card
          level="highlight"
          className="sticky top-2 z-20 flex flex-wrap items-center justify-between gap-4"
        >
          <div>
            <p className="lab-kicker text-[#abf2ff]">Today Mission</p>
            <p className="mt-1 text-base font-semibold text-[#edf3f7]">
              What do I do now? Start with {nextBestAction}.
            </p>
            <p className="mt-1 text-sm text-[#adc0cd]">
              Finish all 4 stack steps to close the day with intent.
            </p>
          </div>
          <ActionButton
            onClick={() => {
              if (nextBestAction === "Log weekly check-in") {
                setIsCheckinOpen(true);
              } else {
                setSelectedSection("workouts");
              }
            }}
            className="min-w-44"
          >
            Next Best Action: {nextBestAction}
          </ActionButton>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[220px_minmax(0,1fr)_320px]">
          <aside className="h-fit rounded-xl lab-surface-base p-3 xl:sticky xl:top-20">
            <p className="px-2 pb-2 text-[11px] uppercase tracking-wide text-[#7fe8ff]">
              Weekly Status
            </p>
            <div className="mb-3 rounded-md border border-[rgba(74,92,108,0.55)] bg-[#10161b] p-2 text-xs text-[#adc0cd]">
              <p className="text-[#dcff9d]">Readiness {readiness}/100</p>
              <p className="mt-1">
                Completion{" "}
                {
                  Object.values(stackState).filter((item) => item === "done")
                    .length
                }
                /4 steps done
              </p>
            </div>
            <p className="px-2 pb-2 text-[11px] uppercase tracking-wide text-[#7fe8ff]">
              Sections
            </p>
            <div className="space-y-1">
              {sidebarSections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => jumpToSection(section.id)}
                  className={`w-full rounded border px-3 py-2 text-left text-xs ${
                    selectedSection === section.id
                      ? "border-[#16d9ff] bg-[#0b2f3a] text-white"
                      : "border-[rgba(74,92,108,0.72)] bg-[#10161b] text-[#adc0cd]"
                  }`}
                >
                  {section.label}
                </button>
              ))}
            </div>

            <ActionButton
              className="mt-3 w-full"
              variant="secondary"
              onClick={() => setIsCheckinOpen(true)}
            >
              Open Check-in Panel
            </ActionButton>
          </aside>

          <div className="space-y-6">
            <TodayStackPanel
              items={todayStackItems}
              onStateChange={(id, next) =>
                setStackState((prev) => ({ ...prev, [id]: next }))
              }
            />

            {selectedSection === "overview" ? (
              <>
                <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                    note={`Base ${plan.targetCalories} | ${adjustment.note}`}
                    intent="caution"
                  />
                  <MetricTile
                    label="Protein"
                    icon={<Beef className="h-4 w-4" />}
                    value={`${plan.macros.proteinG}g`}
                    note={`Fiber ${plan.macros.fiberG}g`}
                    intent="action"
                  />
                  <MetricTile
                    label="Hydration"
                    icon={<Droplets className="h-4 w-4" />}
                    value={`${plan.waterLiters}L`}
                    note={`Readiness ${readiness}/100`}
                    intent="action"
                  />
                </section>

                <section className="rounded-xl border border-[rgba(67,81,95,0.72)] bg-[#171d23] p-4">
                  <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[#7fe8ff]">
                    <Sparkles className="h-4 w-4" /> AI Daily Coach
                  </h2>
                  <p className="rounded border border-[rgba(74,92,108,0.72)] bg-[#10161b] p-3 text-sm text-[#edf3f7]">
                    {coachMessage}
                  </p>
                </section>
              </>
            ) : null}

            {selectedSection === "workouts" ? (
              <section
                id="dashboard-section-workouts"
                className="grid gap-6 lg:grid-cols-2"
              >
                <article className="rounded-xl border border-[rgba(67,81,95,0.72)] bg-[#171d23] p-4">
                  <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[#7fe8ff]">
                    <Activity className="h-4 w-4" /> Weekly Training Plan
                  </h2>
                  <div className="space-y-2">
                    {plan.workoutPlan.map((day) => (
                      <div
                        key={day.day}
                        className="rounded-md border border-[rgba(74,92,108,0.72)] bg-[#10161b] p-3 text-sm"
                      >
                        <div className="flex justify-between">
                          <p className="font-medium text-[#dcff9d]">
                            {day.day}
                          </p>
                          <p className="text-[#adc0cd]">
                            {day.durationMin} min
                          </p>
                        </div>
                        <p className="mt-1 text-xs text-[#6be9af]">
                          {day.focus}
                        </p>
                        <p className="mt-1 text-xs text-[#adc0cd]">
                          {day.prescription}
                        </p>
                      </div>
                    ))}
                  </div>
                </article>

                <article className="rounded-xl border border-[rgba(67,81,95,0.72)] bg-[#171d23] p-4">
                  <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[#7fe8ff]">
                    <Dumbbell className="h-4 w-4" /> Gym Workout Progression
                  </h2>
                  <div className="space-y-3">
                    {adaptiveGym.map((phase) => (
                      <article
                        key={phase.level}
                        className="rounded-md border border-[rgba(74,92,108,0.72)] bg-[#10161b] p-3"
                      >
                        <h3 className="text-base font-semibold text-[#dcff9d]">
                          {phase.level}
                        </h3>
                        <p className="mb-2 text-xs text-[#adc0cd]">
                          {phase.weeklySplit}
                        </p>
                        <div className="space-y-2">
                          {phase.days.map((dayPlan) => (
                            <button
                              type="button"
                              key={`${phase.level}-${dayPlan.day}`}
                              className="w-full rounded-md border border-[rgba(74,92,108,0.6)] p-2 text-left text-xs"
                              onClick={() => {
                                const dayKey = `${phase.level}-${dayPlan.day}`;
                                setOpenGymDayKey((prev) =>
                                  prev === dayKey ? null : dayKey,
                                );
                              }}
                            >
                              <div className="flex justify-between">
                                <p className="font-medium text-[#7fe8ff]">
                                  {dayPlan.day}
                                </p>
                                <p className="text-[#6be9af]">
                                  {dayPlan.setsReps}
                                </p>
                              </div>
                              <p className="mt-1 text-[#edf3f7]">
                                {dayPlan.bodyParts[0]} + {dayPlan.bodyParts[1]}
                              </p>
                              <p className="mt-1 text-[#adc0cd]">
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
                                <ul className="mt-2 space-y-1 text-[11px] text-[#adc0cd]">
                                  {dayPlan.exercises.map((exercise) => (
                                    <li key={exercise}>- {exercise}</li>
                                  ))}
                                </ul>
                              ) : null}
                            </button>
                          ))}
                        </div>
                      </article>
                    ))}
                  </div>
                </article>
              </section>
            ) : null}

            {selectedSection === "checkins" ? (
              <section
                id="dashboard-section-checkins"
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
                      value={new Date().toISOString().slice(0, 10)}
                      readOnly
                    />
                  </label>

                  <label className="text-xs text-[#adc0cd]">
                    Readiness
                    <input
                      className="mt-1 w-full rounded border border-[rgba(74,92,108,0.72)] bg-[#10161b] px-2 py-1"
                      value={`${readiness}/100`}
                      readOnly
                    />
                  </label>
                </div>

                <div className="mt-3 rounded border border-[rgba(74,92,108,0.72)] bg-[#10161b] p-3 text-xs text-[#adc0cd]">
                  <p className="font-semibold text-[#dcff9d]">
                    Latest Readiness: {readiness}/100
                  </p>
                  <p className="mt-1">{adjustment.note}</p>
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
              </section>
            ) : null}

            {selectedSection === "library" ? (
              <section
                id="dashboard-section-library"
                className="rounded-xl border border-[rgba(67,81,95,0.72)] bg-[#171d23] p-4"
              >
                <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[#7fe8ff]">
                  <Sparkles className="h-4 w-4" /> Body-Part Exercise Explorer
                </h2>
                <div className="mb-4 flex flex-wrap gap-2">
                  {bodyPartCatalog.map((entry) => (
                    <button
                      key={entry.bodyPart}
                      type="button"
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

            {selectedSection === "nutrition" ? (
              <section
                id="dashboard-section-nutrition"
                className="rounded-xl border border-[rgba(67,81,95,0.72)] bg-[#171d23] p-4"
              >
                <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[#7fe8ff]">
                  <Calendar className="h-4 w-4" /> Nutrition Templates
                </h2>
                <div className="grid gap-4 md:grid-cols-3">
                  {nutritionTemplates.map((template) => (
                    <article
                      key={template.name}
                      className="rounded border border-[rgba(74,92,108,0.72)] bg-[#10161b] p-3"
                    >
                      <p className="font-semibold text-[#dcff9d]">
                        {template.name}
                      </p>
                      <p className="mt-1 text-xs text-[#adc0cd]">
                        {Math.round(template.calories)} kcal | P{" "}
                        {Math.round(template.proteinG)}g
                      </p>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <aside className="h-fit space-y-4 xl:sticky xl:top-20">
            <Card level="base">
              <SectionHeader
                kicker="Analytics"
                title="Weekly Trend"
                description="Secondary signals: history, recovery and intake"
              />
              <div className="mt-3 space-y-2 text-sm text-[#adc0cd]">
                <p>
                  Weight trend:{" "}
                  {weightTrendKg === null
                    ? "Need 2 check-ins"
                    : `${weightTrendKg > 0 ? "+" : ""}${weightTrendKg} kg`}
                </p>
                <p>Latest readiness: {readiness}/100</p>
                <p>Target calories: {adjustedCalories} kcal</p>
                <p>Protein target: {plan.macros.proteinG} g</p>
              </div>
            </Card>

            <Card level="base">
              <SectionHeader kicker="Recent Check-ins" title="Last 4 Entries" />
              <div className="mt-3 space-y-2">
                {recentCheckins.length ? (
                  recentCheckins.map((entry, index) => (
                    <div
                      key={`${entry.date}-${entry.weightKg}-${entry.waistCm}-${index}`}
                      className="rounded border border-[rgba(74,92,108,0.55)] bg-[#10161b] p-2 text-xs"
                    >
                      <p className="text-[#dcff9d]">{entry.date}</p>
                      <p className="text-[#adc0cd]">
                        Wt {entry.weightKg} kg | Waist {entry.waistCm} cm |
                        Sleep {entry.sleepHours}h
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#adc0cd]">
                    No check-ins logged yet.
                  </p>
                )}
              </div>
            </Card>
          </aside>
        </div>
      </div>

      {isCheckinOpen ? (
        <div className="fixed inset-0 z-40 flex justify-end bg-black/45 p-2 sm:p-4">
          <div className="h-full w-full max-w-md overflow-auto rounded-xl border border-[rgba(74,92,108,0.72)] bg-[#10161b] p-4">
            <SectionHeader
              kicker="Check-in"
              title="Weekly Check-in"
              description="Required metrics first, optional readiness details below"
              action={
                <button
                  type="button"
                  className="rounded border border-[rgba(74,92,108,0.72)] px-2 py-1 text-xs text-[#adc0cd]"
                  onClick={() => setIsCheckinOpen(false)}
                >
                  Close
                </button>
              }
            />

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <label className="text-xs text-[#adc0cd]">
                Date
                <input
                  type="date"
                  value={quickCheckin.date}
                  onChange={(event) =>
                    setQuickCheckin((prev) => ({
                      ...prev,
                      date: event.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded border border-[rgba(74,92,108,0.72)] bg-[#171d23] px-2 py-1"
                />
              </label>
              <label className="text-xs text-[#adc0cd]">
                Weight (kg)
                <input
                  type="number"
                  value={quickCheckin.weightKg}
                  onChange={(event) =>
                    setQuickCheckin((prev) => ({
                      ...prev,
                      weightKg: Number(event.target.value),
                    }))
                  }
                  className="mt-1 w-full rounded border border-[rgba(74,92,108,0.72)] bg-[#171d23] px-2 py-1"
                />
              </label>
              <label className="text-xs text-[#adc0cd]">
                Waist (cm)
                <input
                  type="number"
                  value={quickCheckin.waistCm}
                  onChange={(event) =>
                    setQuickCheckin((prev) => ({
                      ...prev,
                      waistCm: Number(event.target.value),
                    }))
                  }
                  className="mt-1 w-full rounded border border-[rgba(74,92,108,0.72)] bg-[#171d23] px-2 py-1"
                />
              </label>
              <label className="text-xs text-[#adc0cd]">
                Sleep (hours)
                <input
                  type="number"
                  step="0.5"
                  value={quickCheckin.sleepHours}
                  onChange={(event) =>
                    setQuickCheckin((prev) => ({
                      ...prev,
                      sleepHours: Number(event.target.value),
                    }))
                  }
                  className="mt-1 w-full rounded border border-[rgba(74,92,108,0.72)] bg-[#171d23] px-2 py-1"
                />
              </label>
              <label className="text-xs text-[#adc0cd] sm:col-span-2">
                Avg Steps
                <input
                  type="number"
                  value={quickCheckin.stepsAvg}
                  onChange={(event) =>
                    setQuickCheckin((prev) => ({
                      ...prev,
                      stepsAvg: Number(event.target.value),
                    }))
                  }
                  className="mt-1 w-full rounded border border-[rgba(74,92,108,0.72)] bg-[#171d23] px-2 py-1"
                />
              </label>
            </div>

            <button
              type="button"
              className="mt-3 text-xs text-[#7fe8ff] underline underline-offset-2"
              onClick={() => setShowOptionalCheckinFields((prev) => !prev)}
            >
              {showOptionalCheckinFields
                ? "Hide optional readiness fields"
                : "Show optional readiness fields"}
            </button>

            {showOptionalCheckinFields ? (
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                <label className="text-xs text-[#adc0cd]">
                  Stress (1-10)
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={quickCheckin.stress}
                    onChange={(event) =>
                      setQuickCheckin((prev) => ({
                        ...prev,
                        stress: Number(event.target.value),
                      }))
                    }
                    className="mt-1 w-full rounded border border-[rgba(74,92,108,0.72)] bg-[#171d23] px-2 py-1"
                  />
                </label>
                <label className="text-xs text-[#adc0cd]">
                  Energy (1-10)
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={quickCheckin.energy}
                    onChange={(event) =>
                      setQuickCheckin((prev) => ({
                        ...prev,
                        energy: Number(event.target.value),
                      }))
                    }
                    className="mt-1 w-full rounded border border-[rgba(74,92,108,0.72)] bg-[#171d23] px-2 py-1"
                  />
                </label>
                <label className="text-xs text-[#adc0cd]">
                  Completion %
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={quickCheckin.workoutCompletion}
                    onChange={(event) =>
                      setQuickCheckin((prev) => ({
                        ...prev,
                        workoutCompletion: Number(event.target.value),
                      }))
                    }
                    className="mt-1 w-full rounded border border-[rgba(74,92,108,0.72)] bg-[#171d23] px-2 py-1"
                  />
                </label>
              </div>
            ) : null}

            <Card level="base" className="mt-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#7fe8ff]">
                Instant Coach Response
              </p>
              <p className="mt-2 text-sm text-[#adc0cd]">
                {quickCheckinCoachMessage}
              </p>
            </Card>

            <div className="mt-4 flex gap-2">
              <ActionButton
                onClick={() => {
                  const next = [...checkins, quickCheckin]
                    .sort((a, b) => a.date.localeCompare(b.date))
                    .slice(-12);
                  setCheckins(next);
                  setIsCheckinOpen(false);
                  setSelectedSection("checkins");
                }}
                className="flex-1"
              >
                Save Check-in
              </ActionButton>
              <ActionButton
                variant="secondary"
                onClick={() => setIsCheckinOpen(false)}
                className="flex-1"
              >
                Cancel
              </ActionButton>
            </div>
          </div>
        </div>
      ) : null}

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

            <p className="mt-3 rounded border border-[rgba(74,92,108,0.72)] bg-[#171d23] p-2 text-xs text-[#dcff9d]">
              Demo Tip: {exerciseDetail.demoTip}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
