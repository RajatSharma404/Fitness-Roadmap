"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Play,
  ChevronDown,
  ChevronUp,
  Share2,
  Check,
  Layers,
  Calendar,
  Sparkles,
  Dumbbell,
  ArrowRight,
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
  const [planSource, setPlanSource] = useState<"standard" | "custom">("standard");
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
      if (next.activeRoutineId && next.customRoutines?.some((r) => r.id === next.activeRoutineId)) {
        setPlanSource("custom");
      }
    };

    sync();
    void syncPlannerSnapshotFromServer().then((serverSnapshot) => {
      setSnapshot(serverSnapshot);
      const params = new URLSearchParams(window.location.search);
      if (!params.get("tier")) {
        setSelectedTier(serverSnapshot.experience);
      }
      if (
        serverSnapshot.activeRoutineId &&
        serverSnapshot.customRoutines?.some((r) => r.id === serverSnapshot.activeRoutineId)
      ) {
        setPlanSource("custom");
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

  // Active custom routine resolution
  const activeCustomRoutine = useMemo(() => {
    if (!snapshot.customRoutines || snapshot.customRoutines.length === 0) return null;
    return (
      snapshot.customRoutines.find((r) => r.id === snapshot.activeRoutineId) ||
      snapshot.customRoutines[0]
    );
  }, [snapshot.customRoutines, snapshot.activeRoutineId]);

  // Standard or Custom active day resolution
  const activeDay = useMemo(() => {
    if (planSource === "custom" && activeCustomRoutine) {
      const matched = activeCustomRoutine.days.find((d) => d.dayName === selectedDay);
      const chosen = matched || activeCustomRoutine.days[0];
      return {
        day: chosen.dayName,
        bodyParts: chosen.bodyParts.length >= 2 ? [chosen.bodyParts[0], chosen.bodyParts[1]] : [chosen.bodyParts[0] || "Full Body", "All"],
        focus: chosen.focus,
        exercises: chosen.exercises.map((e) => e.name),
        setsReps: `${chosen.exercises[0]?.targetSets || 3} sets × ${chosen.exercises[0]?.targetReps || "8-12"}`,
      };
    }

    return (
      activePhase?.days.find((day) => day.day === selectedDay) ??
      activePhase?.days[0] ??
      null
    );
  }, [planSource, activeCustomRoutine, selectedDay, activePhase]);

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

  const customDaysList = activeCustomRoutine ? activeCustomRoutine.days : [];

  return (
    <div className="space-y-6 pb-8">
      {/* Sub-Hub Tabs Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            className="px-4 py-2 rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-bold uppercase tracking-wider shadow-sm"
          >
            Workout Execution
          </button>

          <Link
            href="/workouts/builder"
            className="px-4 py-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] text-zinc-400 hover:text-white border border-white/10 text-xs font-mono font-semibold uppercase tracking-wider transition flex items-center gap-2"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Routine Builder</span>
            {snapshot.customRoutines && snapshot.customRoutines.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px]">
                {snapshot.customRoutines.length}
              </span>
            )}
          </Link>

          <Link
            href="/workouts/history"
            className="px-4 py-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] text-zinc-400 hover:text-white border border-white/10 text-xs font-mono font-semibold uppercase tracking-wider transition flex items-center gap-2"
          >
            <Calendar className="w-3.5 h-3.5 text-green-400" />
            <span>History & Logbook</span>
          </Link>
        </div>

        {/* Custom Split Indicator Link */}
        {activeCustomRoutine && (
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <span>Split:</span>
            <button
              type="button"
              onClick={() => setPlanSource((prev) => (prev === "custom" ? "standard" : "custom"))}
              className={cn(
                "px-2.5 py-1 rounded-lg border font-bold text-xs transition",
                planSource === "custom"
                  ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                  : "bg-white/[0.02] text-zinc-400 border-white/10",
              )}
            >
              {planSource === "custom" ? `✨ ${activeCustomRoutine.name}` : "Standard Tier"}
            </button>
          </div>
        )}
      </div>

      {/* Main Header Card */}
      <Card
        level="elevated"
        className="flex flex-wrap items-center justify-between gap-4"
      >
        <div>
          <p className="lab-kicker text-[#60a5fa]">
            {planSource === "custom" && activeCustomRoutine
              ? `Custom Routine · ${activeCustomRoutine.name}`
              : "Adaptive Training Matrix"}
          </p>
          <h2 className="font-display text-[28px] font-bold text-[#eeeef2]">
            {planSource === "custom" && activeCustomRoutine
              ? activeCustomRoutine.name
              : "Your adaptive training plan"}
          </h2>
          <p className="mt-1 text-sm text-[#636380]">
            {planSource === "custom"
              ? "Executing your custom split. Edit anytime in the Routine Builder."
              : "Choose one tier, select a day, and keep the next workout in focus."}
          </p>
        </div>

        {planSource === "standard" ? (
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
        ) : (
          <Link
            href="/workouts/builder"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-mono font-semibold transition"
          >
            <Layers className="w-3.5 h-3.5" /> Edit in Builder
          </Link>
        )}
      </Card>

      {/* Week / Days Selector */}
      <Card level="base" className="space-y-4">
        <SectionHeader
          kicker="Split Days"
          title={
            planSource === "custom"
              ? "Select Day to Execute"
              : "Tap a day to reveal the session"
          }
          description="Active days glow cyan, completed days show green, and rest days stay muted."
        />
        <div className="flex gap-3 overflow-x-auto pb-1">
          {planSource === "custom" && activeCustomRoutine ? (
            customDaysList.map((d, index) => {
              const isActive = selectedDay === d.dayName;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setSelectedDay(d.dayName)}
                  className={cn(
                    "px-4 py-2 shrink-0 rounded-xl border text-xs font-mono font-semibold transition",
                    isActive
                      ? "border-cyan-400 bg-cyan-400/10 text-cyan-300 shadow-md"
                      : "border-[rgba(255,255,255,0.06)] text-[#636380] hover:text-[#eeeef2]",
                  )}
                >
                  {d.dayName}
                </button>
              );
            })
          ) : (
            activePhase?.days.map((day, index) => {
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
            })
          )}
        </div>
      </Card>

      {/* Active Day Detail Card */}
      {activeDay ? (
        <Card level="elevated" className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="lab-kicker text-[#60a5fa]">{activeDay.day}</p>
              <h3 className="font-display text-2xl font-bold text-[#eeeef2]">
                {activeDay.bodyParts[0]} {activeDay.bodyParts[1] ? `+ ${activeDay.bodyParts[1]}` : ""}
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
                          {detail.bodyPart} · {detail.equipment}
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
            className="btn-primary flex h-13 w-full items-center justify-center gap-2 text-base font-bold shadow-lg"
            onClick={openWorkoutMode}
          >
            <Play className="h-5 w-5 fill-current" /> Start Live Workout Mode ({activeDay.exercises.length} Exercises)
          </ActionButton>
          {saveFeedback ? (
            <p className="text-sm text-cyan-300 font-mono">{saveFeedback}</p>
          ) : null}
          {copyFeedback ? (
            <p className="text-sm text-green-300 font-mono">{copyFeedback}</p>
          ) : null}
        </Card>
      ) : null}

      {workoutModeOpen && activeDay ? (
        <LiveWorkoutModal
          isOpen={workoutModeOpen}
          onClose={() => setWorkoutModeOpen(false)}
          dayName={activeDay.day}
          focus={activeDay.focus}
          exercises={activeDay.exercises}
          userWeightKg={snapshot.input.weightKg}
          onFinishWorkout={async (summary) => {
            const durationMinutes = Math.max(1, Math.round(summary.durationSeconds / 60));

            const payload = {
              day: activeDay.day,
              tier: planSource === "custom" ? "custom" : selectedTier,
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

              // Save locally as well for offline logbook
              try {
                const history = JSON.parse(localStorage.getItem("guestWorkoutSessions") || "[]");
                localStorage.setItem("guestWorkoutSessions", JSON.stringify([payload, ...history]));
              } catch {}

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
