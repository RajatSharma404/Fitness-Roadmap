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
  Target,
} from "lucide-react";
import { PlannerInput, calculateBodyPlan } from "@/lib/bodyPlanner";
import {
  EquipmentType,
  ExperienceLevel,
  WeeklyCheckIn,
  buildDailyMealTemplates,
  computeReadinessScore,
  getAdaptiveGymProgression,
  getDailyCoachMessage,
  getProgressBasedAdjustment,
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
  const [input, setInput] = useState<PlannerInput | null>(
    () => readCachedDashboardState().input,
  );
  const [openGymDayKey, setOpenGymDayKey] = useState<string | null>(null);
  const [checkins, setCheckins] = useState<WeeklyCheckIn[]>(
    () => readCachedDashboardState().checkins,
  );
  const [equipment, setEquipment] = useState<EquipmentType>(
    () => readCachedDashboardState().equipment,
  );
  const [experience, setExperience] = useState<ExperienceLevel>(
    () => readCachedDashboardState().experience,
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

  if (!plan || !input) {
    return (
      <div className="min-h-screen bg-[#1e1e1e] px-6 py-10 text-[#d4d4d4]">
        <div className="mx-auto max-w-5xl rounded-xl border border-[#30363d] bg-[#252526] p-8 text-center">
          Loading your plan...
        </div>
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

  return (
    <div className="min-h-screen bg-[#1e1e1e] px-6 py-8 text-[#d4d4d4]">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-xl border border-[#30363d] bg-[#252526] p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#569cd6]">
                Dashboard
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-[#dcdcaa]">
                Body Transformation Command Center
              </h1>
              <p className="mt-1 text-sm text-[#9aa1a8]">
                Goal: {input.goal.replace("_", " ")} · Activity:{" "}
                {input.activity.replace("_", " ")}
              </p>
            </div>
            <Link
              href="/roadmap"
              className="rounded-md border border-[#007acc] bg-[#04395e] px-4 py-2 text-sm font-medium text-white hover:bg-[#005a9e]"
            >
              Edit Roadmap Inputs
            </Link>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-xl border border-[#30363d] bg-[#252526] p-4">
            <p className="mb-2 flex items-center gap-2 text-[#4ec9b0]">
              <Scale className="h-4 w-4" /> BMI
            </p>
            <p className="text-2xl font-semibold">{plan.bmi}</p>
            <p className="text-sm text-[#9aa1a8]">{plan.bmiCategory}</p>
          </article>
          <article className="rounded-xl border border-[#30363d] bg-[#252526] p-4">
            <p className="mb-2 flex items-center gap-2 text-[#f14c4c]">
              <Flame className="h-4 w-4" /> Calories
            </p>
            <p className="text-2xl font-semibold">{adjustedCalories}</p>
            <p className="text-sm text-[#9aa1a8]">
              Base {plan.targetCalories} | {adjustment.note}
            </p>
          </article>
          <article className="rounded-xl border border-[#30363d] bg-[#252526] p-4">
            <p className="mb-2 flex items-center gap-2 text-[#9cdcfe]">
              <Beef className="h-4 w-4" /> Protein
            </p>
            <p className="text-2xl font-semibold">{plan.macros.proteinG}g</p>
            <p className="text-sm text-[#9aa1a8]">
              Fiber {plan.macros.fiberG}g
            </p>
          </article>
          <article className="rounded-xl border border-[#30363d] bg-[#252526] p-4">
            <p className="mb-2 flex items-center gap-2 text-[#4fc1ff]">
              <Droplets className="h-4 w-4" /> Water
            </p>
            <p className="text-2xl font-semibold">{plan.waterLiters}L</p>
            <p className="text-sm text-[#9aa1a8]">Readiness {readiness}/100</p>
          </article>
        </section>

        <section className="rounded-xl border border-[#30363d] bg-[#252526] p-4">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[#9cdcfe]">
            <Sparkles className="h-4 w-4" /> AI Daily Coach
          </h2>
          <p className="rounded border border-[#3c3c3c] bg-[#1e1e1e] p-3 text-sm text-[#d4d4d4]">
            {coachMessage}
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-xl border border-[#30363d] bg-[#252526] p-4">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[#9cdcfe]">
              <Activity className="h-4 w-4" /> Weekly Training Plan
            </h2>
            <div className="space-y-2">
              {plan.workoutPlan.map((day) => (
                <div
                  key={day.day}
                  className="rounded-md border border-[#3c3c3c] bg-[#1e1e1e] p-3 text-sm"
                >
                  <div className="flex justify-between">
                    <p className="font-medium text-[#dcdcaa]">{day.day}</p>
                    <p className="text-[#9aa1a8]">{day.durationMin} min</p>
                  </div>
                  <p className="mt-1 text-xs text-[#4ec9b0]">{day.focus}</p>
                  <p className="mt-1 text-xs text-[#9aa1a8]">
                    {day.prescription}
                  </p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-xl border border-[#30363d] bg-[#252526] p-4">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[#9cdcfe]">
              <Target className="h-4 w-4" /> Target Guidance
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-md border border-[#3c3c3c] bg-[#1e1e1e] p-3">
                <p className="text-xs text-[#9aa1a8]">Expected weekly change</p>
                <p className="text-xl font-semibold text-[#4ec9b0]">
                  {plan.weeklyWeightChangeKg} kg
                </p>
              </div>
              <div className="rounded-md border border-[#3c3c3c] bg-[#1e1e1e] p-3">
                <p className="text-xs text-[#9aa1a8]">Target weight</p>
                <p className="text-xl font-semibold text-[#dcdcaa]">
                  {plan.suggestedTargetWeightKg} kg
                </p>
              </div>
              <div className="rounded-md border border-[#3c3c3c] bg-[#1e1e1e] p-3 md:col-span-2">
                <p className="text-xs text-[#9aa1a8]">Estimated timeline</p>
                <p className="text-xl font-semibold text-[#9cdcfe]">
                  {plan.estimatedWeeksToTarget} weeks
                </p>
                <p className="mt-2 text-xs text-[#9aa1a8]">
                  {plan.calorieAdjustmentNote}
                </p>
              </div>
            </div>

            <h3 className="mt-6 mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[#9cdcfe]">
              <Calendar className="h-4 w-4" /> Meal Combinations
            </h3>
            <div className="space-y-2">
              {plan.mealOptions.slice(0, 6).map((meal) => (
                <div
                  key={meal.name}
                  className="rounded-md border border-[#3c3c3c] bg-[#1e1e1e] p-3 text-sm"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-[#dcdcaa]">{meal.name}</p>
                    <span className="text-xs text-[#9aa1a8]">
                      {meal.category.replace("_", "-")}
                    </span>
                  </div>
                  <p className="text-xs text-[#9aa1a8]">
                    {meal.calories} kcal · {meal.proteinG}g protein
                  </p>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="rounded-xl border border-[#30363d] bg-[#252526] p-4">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[#9cdcfe]">
            <Dumbbell className="h-4 w-4" /> Gym Workout Progression (2 Body
            Parts / Day)
          </h2>
          <div className="grid gap-4 lg:grid-cols-3">
            {adaptiveGym.map((phase) => (
              <article
                key={phase.level}
                className="rounded-md border border-[#3c3c3c] bg-[#1e1e1e] p-3"
              >
                <h3 className="text-base font-semibold text-[#dcdcaa]">
                  {phase.level}
                </h3>
                <p className="mb-2 text-xs text-[#9aa1a8]">
                  {phase.weeklySplit}
                </p>
                <div className="space-y-2">
                  {phase.days.map((dayPlan) => (
                    <button
                      type="button"
                      key={`${phase.level}-${dayPlan.day}`}
                      className="w-full rounded-md border border-[#2f2f2f] p-2 text-left text-xs"
                      onClick={() => {
                        const dayKey = `${phase.level}-${dayPlan.day}`;
                        setOpenGymDayKey((prev) =>
                          prev === dayKey ? null : dayKey,
                        );
                      }}
                    >
                      <div className="flex justify-between">
                        <p className="font-medium text-[#9cdcfe]">
                          {dayPlan.day}
                        </p>
                        <p className="text-[#4ec9b0]">{dayPlan.setsReps}</p>
                      </div>
                      <p className="mt-1 text-[#d4d4d4]">
                        {dayPlan.bodyParts[0]} + {dayPlan.bodyParts[1]}
                      </p>
                      <p className="mt-1 text-[#9aa1a8]">{dayPlan.focus}</p>
                      <p className="mt-2 text-[11px] text-[#569cd6]">
                        {openGymDayKey === `${phase.level}-${dayPlan.day}`
                          ? "Click to hide exercises"
                          : "Click to view exercises"}
                      </p>
                      {openGymDayKey === `${phase.level}-${dayPlan.day}` ? (
                        <>
                          <p className="mt-2 text-[11px] font-medium uppercase tracking-wide text-[#c586c0]">
                            Exercises (6)
                          </p>
                          <ul className="mt-1 space-y-1 text-[11px] text-[#9aa1a8]">
                            {dayPlan.exercises.map((exercise) => (
                              <li key={exercise}>- {exercise}</li>
                            ))}
                          </ul>
                        </>
                      ) : null}
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-[#30363d] bg-[#252526] p-4">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[#9cdcfe]">
            <Calendar className="h-4 w-4" /> Nutrition Templates
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {nutritionTemplates.map((template) => (
              <article
                key={template.name}
                className="rounded border border-[#3c3c3c] bg-[#1e1e1e] p-3"
              >
                <p className="font-semibold text-[#dcdcaa]">{template.name}</p>
                <p className="mt-1 text-xs text-[#9aa1a8]">
                  {Math.round(template.calories)} kcal | P{" "}
                  {Math.round(template.proteinG)}g
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
