"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Play, ChevronDown, ChevronUp, CircleCheckBig } from "lucide-react";
import {
  ActionButton,
  Card,
  SectionHeader,
} from "@/components/shared/UIPrimitives";
import { calculateBodyPlan } from "@/lib/bodyPlanner";
import {
  getAdaptiveGymProgression,
  getExerciseDetail,
} from "@/lib/planEnhancements";
import { defaultPlannerSnapshot } from "@/lib/plannerView";
import { cn } from "@/lib/cn";

const tiers = ["beginner", "intermediate", "advanced"] as const;

export default function WorkoutsPage() {
  const [snapshot] = useState(defaultPlannerSnapshot);
  const [selectedTier, setSelectedTier] = useState<(typeof tiers)[number]>(
    snapshot.experience,
  );
  const [selectedDay, setSelectedDay] = useState<string>("Monday");
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  const [workoutModeOpen, setWorkoutModeOpen] = useState(false);

  const plan = useMemo(
    () => calculateBodyPlan(snapshot.input),
    [snapshot.input],
  );
  const adaptiveGym = useMemo(
    () =>
      getAdaptiveGymProgression(
        plan.gymProgression,
        selectedTier,
        snapshot.input.workoutDays,
        snapshot.equipment,
      ),
    [
      plan.gymProgression,
      selectedTier,
      snapshot.input.workoutDays,
      snapshot.equipment,
    ],
  );

  const activePhase = adaptiveGym[0] ?? adaptiveGym.at(-1) ?? null;
  const activeDay =
    activePhase?.days.find((day) => day.day === selectedDay) ??
    activePhase?.days[0] ??
    null;

  return (
    <div className="space-y-6 pb-8">
      <Card
        level="elevated"
        className="flex flex-wrap items-center justify-between gap-4"
      >
        <div>
          <p className="lab-kicker text-[#60a5fa]">Workouts</p>
          <h2 className="font-display text-[28px] font-bold text-[#eeeef2]">
            Your adaptive training plan
          </h2>
          <p className="mt-1 text-sm text-[#636380]">
            Choose one tier, select a day, and keep the next workout in focus.
          </p>
        </div>
        <div className="inline-flex rounded-full border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-1">
          {tiers.map((tier) => (
            <button
              key={tier}
              type="button"
              onClick={() => setSelectedTier(tier)}
              className={cn(
                "rounded-full px-4 py-2 text-sm capitalize transition",
                selectedTier === tier
                  ? "bg-cyan-400/10 text-cyan-300"
                  : "text-[#636380] hover:text-[#eeeef2]",
              )}
            >
              {tier}
            </button>
          ))}
        </div>
      </Card>

      <Card level="base" className="space-y-4">
        <SectionHeader
          kicker="Week View"
          title="Tap a day to reveal the session"
          description="Active days glow cyan, completed days show green, and rest days stay muted."
        />
        <div className="flex gap-3 overflow-x-auto pb-1">
          {activePhase?.days.map((day, index) => {
            const isActive = selectedDay === day.day;
            const isToday = index === 0;
            return (
              <button
                key={day.day}
                type="button"
                onClick={() => setSelectedDay(day.day)}
                className={cn(
                  "grid h-11 w-11 shrink-0 place-items-center rounded-full border text-xs font-semibold transition",
                  isActive
                    ? "border-cyan-400 bg-cyan-400/10 text-cyan-300"
                    : isToday
                      ? "border-green-400/40 bg-green-400/10 text-green-300"
                      : "border-[rgba(255,255,255,0.06)] text-[#636380]",
                )}
              >
                {day.day.slice(0, 3)}
              </button>
            );
          })}
        </div>
      </Card>

      {activeDay ? (
        <Card level="elevated" className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="lab-kicker text-[#60a5fa]">{selectedDay}</p>
              <h3 className="font-display text-2xl font-bold text-[#eeeef2]">
                {activeDay.bodyParts[0]} + {activeDay.bodyParts[1]}
              </h3>
              <p className="mt-1 text-sm text-[#636380]">{activeDay.focus}</p>
            </div>
            <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-300">
              {activeDay.setsReps}
            </span>
          </div>

          <div className="space-y-3">
            {activeDay.exercises.map((exercise) => {
              const detail = getExerciseDetail(exercise);

              return (
              <div
                key={exercise}
                className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Image
                      src={detail.imageUrl}
                      alt={detail.imageAlt}
                      width={96}
                      height={68}
                      unoptimized
                      className="h-17 w-24 rounded-lg border border-[rgba(255,255,255,0.08)] object-cover"
                    />
                    <div>
                      <p className="font-display text-lg font-semibold text-[#eeeef2]">
                </div>
                );
              })}
                      <p className="text-xs uppercase tracking-[0.2em] text-[#636380]">
                        {activeDay.setsReps}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ActionButton variant="secondary">Log PR</ActionButton>
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedExercise((current) =>
                          current === exercise ? null : exercise,
                        )
                      }
                      className="rounded-md border border-[rgba(255,255,255,0.06)] px-3 py-2 text-sm text-[#eeeef2]"
                    >
                      {expandedExercise === exercise ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {expandedExercise === exercise ? (
                  <div className="mt-4 grid gap-2 md:grid-cols-3">
                    {[1, 2, 3].map((setIndex) => (
                      <label key={setIndex} className="text-xs text-[#636380]">
                        Set {setIndex}
                        <input
                          type="text"
                          placeholder="Weight × Reps"
                          className="mt-1 w-full rounded-md border border-[rgba(255,255,255,0.06)] bg-bg-surface px-3 py-2 text-[#eeeef2]"
                        />
                      </label>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          <ActionButton
            className="btn-primary flex h-13 w-full items-center justify-center gap-2"
            onClick={() => setWorkoutModeOpen(true)}
          >
            <Play className="h-4 w-4" /> Start Workout Mode
          </ActionButton>
        </Card>
      ) : null}

      {workoutModeOpen && activeDay ? (
        <div className="fixed inset-0 z-50 bg-black/70 p-4 backdrop-blur-sm">
          <div className="mx-auto flex h-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-[rgba(255,255,255,0.08)] bg-bg-elevated">
            <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.06)] p-5">
              <div>
                <p className="lab-kicker text-[#60a5fa]">Workout Mode</p>
                <h3 className="font-display text-2xl font-bold text-[#eeeef2]">
                  {selectedDay}
                </h3>
              </div>
              <button
                type="button"
                className="text-sm text-[#636380]"
                onClick={() => setWorkoutModeOpen(false)}
              >
                Close
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {activeDay.exercises.map((exercise) => {
                const detail = getExerciseDetail(exercise);

                return (
                <div
                  key={exercise}
                  className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-bg-surface p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Image
                        src={detail.imageUrl}
                        alt={detail.imageAlt}
                        width={72}
                        height={52}
                        unoptimized
                        className="h-13 w-18 rounded-md border border-[rgba(255,255,255,0.08)] object-cover"
                      />
                      <div>
                        <p className="font-display text-xl font-semibold text-[#eeeef2]">
                          {exercise}
                        </p>
                        <p className="text-sm text-[#636380]">
                          {activeDay.setsReps}
                        </p>
                      </div>
                    </div>
                    <CircleCheckBig className="h-5 w-5 text-green-300" />
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
