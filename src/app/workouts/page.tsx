"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  Play,
  ChevronDown,
  ChevronUp,
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
  persistPlannerSnapshot,
  syncPlannerSnapshotFromServer,
} from "@/lib/plannerView";
import { cn } from "@/lib/cn";
import { PRLogger } from "@/components/shared/PRLogger";
import { LiveWorkoutModal } from "@/components/workouts/LiveWorkoutModal";
import { evaluateMilestoneUnlocks } from "@/lib/roadmapUnlockEngine";

const tiers = ["beginner", "intermediate", "advanced"] as const;

export default function WorkoutsPage() {
  const [snapshot, setSnapshot] = useState(defaultPlannerSnapshot);
  const [selectedTier, setSelectedTier] = useState<(typeof tiers)[number]>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tierParam = params.get("tier");
      if (
        tierParam &&
        ["beginner", "intermediate", "advanced"].includes(tierParam)
      ) {
        return tierParam as (typeof tiers)[number];
      }
    }
    return "beginner";
  });
  const [selectedGoal, setSelectedGoal] = useState<string>("all");
  const [selectedDay, setSelectedDay] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const dayParam = params.get("day");
      if (dayParam) {
        return dayParam.replace("-", " ");
      }
    }
    return "Monday";
  });
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  const [workoutModeOpen, setWorkoutModeOpen] = useState(false);
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

      const epley1RM = data.weight * (1 + data.reps / 30);
      const formattedDate = new Date().toISOString();

      if (res.ok) {
        setSaveFeedback(`Successfully logged PR of ${data.weight}kg for ${data.name}!`);
        setTimeout(() => setSaveFeedback(null), 5000);
      } else {
        const guestPRs = JSON.parse(localStorage.getItem("guestPRs") || "[]");
        localStorage.setItem(
          "guestPRs",
          JSON.stringify([{ ...data, oneRM: epley1RM, date: formattedDate }, ...guestPRs]),
        );
        setSaveFeedback(`Logged PR of ${data.weight}kg for ${data.name} (Saved locally)!`);
        setTimeout(() => setSaveFeedback(null), 5000);
      }
    } catch (err) {
      console.error("Error saving PR:", err);
      const epley1RM = data.weight * (1 + data.reps / 30);
      const guestPRs = JSON.parse(localStorage.getItem("guestPRs") || "[]");
      localStorage.setItem(
        "guestPRs",
        JSON.stringify([{ ...data, oneRM: epley1RM, date: new Date().toISOString() }, ...guestPRs]),
      );
      setSaveFeedback(`Logged PR of ${data.weight}kg for ${data.name} (Saved locally)!`);
      setTimeout(() => setSaveFeedback(null), 5000);
    }
  }

  useEffect(() => {
    const sync = () => {
      const next = readPlannerSnapshot();
      setSnapshot(next);
      const params = new URLSearchParams(window.location.search);
      if (!params.get("tier")) {
        setSelectedTier(next.experience);
      }
    };

    sync();
    void syncPlannerSnapshotFromServer().then((serverSnapshot) => {
      setSnapshot(serverSnapshot);
      const params = new URLSearchParams(window.location.search);
      if (!params.get("tier")) {
        setSelectedTier(serverSnapshot.experience);
      }
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
        <LiveWorkoutModal
          isOpen={workoutModeOpen}
          onClose={() => setWorkoutModeOpen(false)}
          dayName={selectedDay}
          focus={activeDay.focus}
          exercises={activeDay.exercises}
          userWeightKg={snapshot.input.weightKg}
          onFinishWorkout={async (summary) => {
            const durationMinutes = Math.max(1, Math.round(summary.durationSeconds / 60));

            const payload = {
              day: selectedDay,
              tier: selectedTier,
              phase: activePhase?.level || "foundation",
              focus: activeDay.focus,
              setsReps: activeDay.setsReps,
              exercises: activeDay.exercises,
              completedExercises: summary.completedExercises,
              durationMinutes,
              totalVolumeKg: summary.totalVolumeKg,
              totalSets: summary.totalSets,
              completedAt: new Date().toISOString(),
            };

            try {
              await fetch("/api/workout-sessions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
              }).catch(() => {
                const history = JSON.parse(localStorage.getItem("guestWorkoutSessions") || "[]");
                localStorage.setItem("guestWorkoutSessions", JSON.stringify([payload, ...history]));
              });

              // Evaluate any PRs logged during this live session against roadmap milestones
              if (summary.prsAchieved.length > 0) {
                const unlockResult = evaluateMilestoneUnlocks({
                  lifts: summary.prsAchieved,
                  checkins: snapshot.checkins,
                  currentProgress: snapshot.progress,
                  userWeightKg: snapshot.input.weightKg,
                  userGender: snapshot.input.sex,
                  roadmapNodes: plan.roadmapNodes,
                });

                if (unlockResult.newlyUnlockedNodeIds.length > 0) {
                  await persistPlannerSnapshot({
                    ...snapshot,
                    progress: unlockResult.updatedProgress,
                  });

                  unlockResult.unlockEvents.forEach((ev) => {
                    window.dispatchEvent(
                      new CustomEvent("roadmap-milestone-unlocked", {
                        detail: ev,
                      }),
                    );
                  });
                }
              }

              setSaveFeedback(
                `🎉 Session Complete! Logged ${summary.totalVolumeKg.toLocaleString()}kg total volume across ${summary.totalSets} sets (+200 Workout XP)!`,
              );
              setWorkoutModeOpen(false);
              setTimeout(() => setSaveFeedback(null), 7000);
            } catch (err) {
              console.error("Failed to save workout session:", err);
              setWorkoutModeOpen(false);
            }
          }}
        />
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
