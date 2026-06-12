"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  Play,
  ChevronDown,
  ChevronUp,
  CircleCheckBig,
  Share2,
  Check,
} from "lucide-react";
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
import {
  defaultPlannerSnapshot,
  readPlannerSnapshot,
  syncPlannerSnapshotFromServer,
} from "@/lib/plannerView";
import { cn } from "@/lib/cn";
import { PRLogger } from "@/components/shared/PRLogger";

const tiers = ["beginner", "intermediate", "advanced"] as const;

export default function WorkoutsPage() {
  const [snapshot, setSnapshot] = useState(defaultPlannerSnapshot);
  const [selectedTier, setSelectedTier] = useState<(typeof tiers)[number]>(
    snapshot.experience,
  );
  const [selectedGoal, setSelectedGoal] = useState<string>("all");
  const [selectedDay, setSelectedDay] = useState<string>("Monday");
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  const [workoutModeOpen, setWorkoutModeOpen] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(
    () => new Set(),
  );
  const [workoutStartedAt, setWorkoutStartedAt] = useState<number | null>(null);
  const [isSavingWorkout, setIsSavingWorkout] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [prLoggerOpen, setPrLoggerOpen] = useState(false);
  const [activePRName, setActivePRName] = useState<string | undefined>(undefined);

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

      if (res.ok) {
        setSaveFeedback(`Successfully logged PR of ${data.weight}kg for ${data.name}!`);
        setTimeout(() => setSaveFeedback(null), 5000);
      } else if (res.status === 401) {
        setSaveFeedback("Please sign in to save PRs.");
      } else {
        setSaveFeedback("Failed to save PR. Please try again.");
      }
    } catch (err) {
      console.error("Error saving PR:", err);
      setSaveFeedback("An error occurred while saving the PR.");
    }
  }

  useEffect(() => {
    const sync = () => {
      const next = readPlannerSnapshot();
      setSnapshot(next);
      setSelectedTier(next.experience);
    };

    sync();
    void syncPlannerSnapshotFromServer().then((serverSnapshot) => {
      setSnapshot(serverSnapshot);
      setSelectedTier(serverSnapshot.experience);
    });

    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const plan = useMemo(
    () =>
      calculateBodyPlan({
        ...snapshot.input,
        goal:
          selectedGoal === "all"
            ? snapshot.input.goal
            : (selectedGoal as typeof snapshot.input.goal),
      }),
    [snapshot, selectedGoal],
  );
  const adaptiveGym = useMemo(
    () =>
      getAdaptiveGymProgression(
        plan.gymProgression,
        selectedTier,
        snapshot.input.workoutDays,
        snapshot.equipment,
      ),
    [plan.gymProgression, selectedTier, snapshot],
  );

  const activePhase = adaptiveGym[0] ?? adaptiveGym.at(-1) ?? null;
  const activeDay =
    activePhase?.days.find((day) => day.day === selectedDay) ??
    activePhase?.days[0] ??
    null;

  function openWorkoutMode() {
    setCompletedExercises(new Set());
    setWorkoutStartedAt(Date.now());
    setSaveFeedback(null);
    setWorkoutModeOpen(true);
  }

  function copyWorkoutDeeplink() {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const deeplink = `${baseUrl}/workouts?tier=${selectedTier}&day=${selectedDay.replace(" ", "-")}`;
    navigator.clipboard.writeText(deeplink);
    setCopyFeedback("Deeplink copied!");
    setTimeout(() => setCopyFeedback(null), 2000);
  }

  function toggleCompletedExercise(exercise: string) {
    setCompletedExercises((current) => {
      const next = new Set(current);
      if (next.has(exercise)) {
        next.delete(exercise);
      } else {
        next.add(exercise);
      }
      return next;
    });
  }

  async function saveWorkoutSession() {
    if (!activeDay || !activePhase || isSavingWorkout) return;

    setIsSavingWorkout(true);
    setSaveFeedback(null);

    const durationMinutes = workoutStartedAt
      ? Math.max(1, Math.round((Date.now() - workoutStartedAt) / 60000))
      : null;

    const response = await fetch("/api/workout-sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        day: selectedDay,
        tier: selectedTier,
        phase: activePhase.level,
        focus: activeDay.focus,
        setsReps: activeDay.setsReps,
        exercises: activeDay.exercises,
        completedExercises: Array.from(completedExercises),
        durationMinutes,
        completedAt: new Date().toISOString(),
      }),
    });

    if (response.ok) {
      setSaveFeedback("Workout saved to your profile.");
      setWorkoutModeOpen(false);
    } else if (response.status === 401) {
      setSaveFeedback("Sign in to save workout sessions.");
    } else {
      setSaveFeedback("Could not save workout. Please try again.");
    }

    setIsSavingWorkout(false);
  }

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
        <div className="flex flex-wrap gap-3">
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
          <select
            value={selectedGoal}
            onChange={(e) => setSelectedGoal(e.target.value)}
            className="rounded-full border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] px-4 py-2 text-sm text-[#eeeef2] hover:border-cyan-400/40"
          >
            <option value="all">All Goals</option>
            <option value="fat_loss">Fat Loss</option>
            <option value="muscle_gain">Muscle Gain</option>
            <option value="recomposition">Recomposition</option>
          </select>
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
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-300">
                {activeDay.setsReps}
              </span>
              <button
                type="button"
                onClick={copyWorkoutDeeplink}
                className="rounded-md border border-[rgba(255,255,255,0.06)] p-2 text-[#636380] hover:bg-[rgba(255,255,255,0.03)] hover:text-cyan-300 transition"
                title="Copy workout link"
              >
                {copyFeedback ? (
                  <Check className="h-4 w-4 text-green-300" />
                ) : (
                  <Share2 className="h-4 w-4" />
                )}
              </button>
            </div>
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
                          {exercise}
                        </p>
                        <p className="text-xs uppercase tracking-[0.2em] text-[#636380]">
                          {detail.bodyPart}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <ActionButton
                        variant="secondary"
                        onClick={() => {
                          setActivePRName(exercise);
                          setPrLoggerOpen(true);
                        }}
                      >
                        Log PR
                      </ActionButton>
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
                        <label
                          key={setIndex}
                          className="text-xs text-[#636380]"
                        >
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
              );
            })}
          </div>

          <ActionButton
            className="btn-primary flex h-13 w-full items-center justify-center gap-2"
            onClick={openWorkoutMode}
          >
            <Play className="h-4 w-4" /> Start Workout Mode
          </ActionButton>
          {saveFeedback ? (
            <p className="text-sm text-cyan-300">{saveFeedback}</p>
          ) : null}
          {copyFeedback ? (
            <p className="text-sm text-green-300">{copyFeedback}</p>
          ) : null}
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
                const isCompleted = completedExercises.has(exercise);

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
                      <button
                        type="button"
                        onClick={() => toggleCompletedExercise(exercise)}
                        className="rounded-full p-1"
                        aria-label={
                          isCompleted
                            ? "Mark as not completed"
                            : "Mark as completed"
                        }
                      >
                        <CircleCheckBig
                          className={`h-5 w-5 ${isCompleted ? "text-green-300" : "text-[#636380]"}`}
                        />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-[rgba(255,255,255,0.06)] p-5">
              <div className="mb-3 flex items-center justify-between text-sm text-[#636380]">
                <span>
                  Completed: {completedExercises.size}/
                  {activeDay.exercises.length}
                </span>
                <span>{activeDay.setsReps}</span>
              </div>
              <ActionButton
                className="btn-primary flex h-11 w-full items-center justify-center"
                onClick={saveWorkoutSession}
                disabled={isSavingWorkout}
              >
                {isSavingWorkout
                  ? "Saving workout..."
                  : "Complete and Save Workout"}
              </ActionButton>
            </div>
          </div>
        </div>
      ) : null}
      <PRLogger
        isOpen={prLoggerOpen}
        onClose={() => setPrLoggerOpen(false)}
        initialLiftName={activePRName}
        onSave={handleSavePR}
      />
    </div>
  );
}
