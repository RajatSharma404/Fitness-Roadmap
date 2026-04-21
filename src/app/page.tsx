"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { ArrowRight, Flame, Droplets, Scale, Beef } from "lucide-react";
import {
  ActionButton,
  Card,
  MetricTile,
  SectionHeader,
} from "@/components/shared/UIPrimitives";
import { ProgressRing } from "@/components/layout/ProgressRing";
import { calculateBodyPlan } from "@/lib/bodyPlanner";
import {
  computeReadinessScore,
  getDailyCoachMessage,
  getProgressBasedAdjustment,
} from "@/lib/planEnhancements";
import {
  getReadableActivity,
  getReadableGoal,
  defaultPlannerSnapshot,
  dedupeCheckinsByDate,
  readPlannerSnapshot,
} from "@/lib/plannerView";
import { cn } from "@/lib/cn";

function Sparkline({
  values,
  color,
}: Readonly<{ values: number[]; color: string }>) {
  const max = Math.max(...values, 1);
  const width = 120;
  const height = 28;
  const gap = 4;
  const barWidth = (width - gap * (values.length - 1)) / values.length;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-7 w-full">
      {values.map((value, index) => {
        const barHeight = (value / max) * height;
        const x = index * (barWidth + gap);
        const y = height - barHeight;
        return (
          <rect
            key={`${value}-${index}`}
            x={x}
            y={y}
            width={barWidth}
            height={Math.max(2, barHeight)}
            rx={2}
            fill={color}
            opacity={index === values.length - 1 ? 1 : 0.55}
          />
        );
      })}
    </svg>
  );
}

export default function HomePage() {
  const [snapshot, setSnapshot] = useState(defaultPlannerSnapshot);
  const [selectedStep, setSelectedStep] = useState<
    "warmup" | "main" | "accessories" | "recovery"
  >("warmup");
  const [stepState, setStepState] = useState<
    Record<string, "idle" | "active" | "done">
  >({
    warmup: "active",
    main: "idle",
    accessories: "idle",
    recovery: "idle",
  });
  const [, startTransition] = useTransition();

  useEffect(() => {
    const sync = () => setSnapshot(readPlannerSnapshot());
    sync();
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const plan = useMemo(
    () => calculateBodyPlan(snapshot.input),
    [snapshot.input],
  );
  const readiness = useMemo(() => {
    if (!snapshot.checkins.length) return 74;
    return computeReadinessScore(
      snapshot.checkins[snapshot.checkins.length - 1],
    );
  }, [snapshot.checkins]);

  const latestCheckins = useMemo(
    () => dedupeCheckinsByDate(snapshot.checkins).slice(0, 2),
    [snapshot.checkins],
  );

  const progressAdjustment = useMemo(
    () => getProgressBasedAdjustment(snapshot.input, snapshot.checkins),
    [snapshot.input, snapshot.checkins],
  );

  const coachMessage = useMemo(
    () =>
      getDailyCoachMessage(snapshot.input.goal, readiness, progressAdjustment),
    [snapshot.input.goal, readiness, progressAdjustment],
  );

  const adjustedCalories = Math.max(
    1200,
    plan.targetCalories + progressAdjustment.calorieDelta,
  );
  const trendValues = [78, 82, 80, 84, 83, 81, 85];
  const calorieDelta = adjustedCalories - plan.maintenanceCalories;

  const stepDescriptions: Record<typeof selectedStep, string> = {
    warmup: "8-10 minutes mobility + pulse raise",
    main: "Primary movement block with the highest output",
    accessories: "Volume, balance, and posture work",
    recovery: "Hydration, sleep, and cooldown check",
  };

  const stepOrder: Array<{ id: keyof typeof stepDescriptions; title: string }> =
    [
      { id: "warmup", title: "Warmup" },
      { id: "main", title: "Main Lifts" },
      { id: "accessories", title: "Accessories" },
      { id: "recovery", title: "Recovery" },
    ];

  const activeStepLabel =
    stepOrder.find((step) => stepState[step.id] === "active")?.title ??
    "Warmup";

  return (
    <div className="space-y-6 pb-6">
      <Card
        level="highlight"
        className="flex flex-wrap items-center justify-between gap-4"
      >
        <div>
          <p className="lab-kicker text-[#60a5fa]">Today&apos;s Mission</p>
          <h2 className="font-display text-[28px] font-bold text-[#eeeef2]">
            Good morning. Today&apos;s mission is {activeStepLabel}.
          </h2>
          <p className="mt-1 text-sm text-[#636380]">
            Goal: {getReadableGoal(snapshot.input.goal)} · Activity:{" "}
            {getReadableActivity(snapshot.input.activity)} · Readiness{" "}
            {readiness}/100
          </p>
        </div>
        <Link
          href="/roadmap"
          className="lab-btn-primary inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium"
        >
          Open Roadmap <ArrowRight className="h-4 w-4" />
        </Link>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricTile
              label="BMI"
              value={plan.bmi.toFixed(1)}
              note={plan.bmiCategory}
              icon={<Scale className="h-4 w-4" />}
              intent="caution"
            />
            <MetricTile
              label="Calories"
              value={adjustedCalories}
              note={`${calorieDelta >= 0 ? "+" : ""}${calorieDelta} today`}
              icon={<Flame className="h-4 w-4" />}
              intent="caution"
            />
            <MetricTile
              label="Protein"
              value={`${plan.macros.proteinG}g`}
              note={`Fiber ${plan.macros.fiberG}g`}
              icon={<Beef className="h-4 w-4" />}
              intent="progress"
            />
            <MetricTile
              label="Hydration"
              value={`${plan.waterLiters.toFixed(1)}L`}
              note={`Readiness ${readiness}/100`}
              icon={<Droplets className="h-4 w-4" />}
              intent="action"
            />
          </section>

          <Card level="elevated" className="space-y-4">
            <SectionHeader
              kicker="Today Stack"
              title="Execute in order"
              description="Only one primary action is emphasized per step."
            />
            <div className="space-y-3">
              {stepOrder.map((step, index) => {
                const state = stepState[step.id];
                const isSelected = selectedStep === step.id;

                return (
                  <div
                    key={step.id}
                    className={cn(
                      "rounded-xl border bg-[rgba(255,255,255,0.02)] p-4 transition",
                      state === "active"
                        ? "step-active border-cyan-400/40"
                        : state === "done"
                          ? "step-done border-green-400/40 opacity-70"
                          : "step-idle border-[rgba(255,255,255,0.06)]",
                      isSelected ? "ring-1 ring-cyan-400/25" : "",
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-[#636380]">
                          Step {index + 1}
                        </p>
                        <h3 className="font-display text-lg font-semibold text-[#eeeef2]">
                          {step.title}
                        </h3>
                        <p className="mt-1 text-sm text-[#636380]">
                          {stepDescriptions[step.id]}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "rounded-full px-3 py-1 text-xs font-medium",
                          state === "active"
                            ? "bg-cyan-400/10 text-cyan-300"
                            : state === "done"
                              ? "bg-green-400/10 text-green-300"
                              : "bg-white/5 text-[#636380]",
                        )}
                      >
                        {state.toUpperCase()}
                      </span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {state === "idle" ? (
                        <ActionButton
                          onClick={() => {
                            startTransition(() => {
                              setSelectedStep(step.id);
                              setStepState((prev) => ({
                                ...prev,
                                [step.id]: "active",
                              }));
                            });
                          }}
                          variant="secondary"
                        >
                          Start
                        </ActionButton>
                      ) : null}
                      {state === "active" ? (
                        <ActionButton
                          onClick={() => {
                            startTransition(() => {
                              const next = stepOrder[index + 1];
                              setStepState((prev) => {
                                const nextState = {
                                  ...prev,
                                  [step.id]: "done" as const,
                                };
                                if (next) nextState[next.id] = "active";
                                return nextState;
                              });
                              if (next) setSelectedStep(next.id);
                            });
                          }}
                        >
                          Mark Done
                        </ActionButton>
                      ) : null}
                      {state === "done" ? (
                        <span className="rounded-full border border-green-400/30 bg-green-400/10 px-3 py-2 text-xs text-green-300">
                          Done
                        </span>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
            <ol className="grid grid-cols-4 gap-3 text-center text-xs text-[#636380]">
              {stepOrder.map((step) => (
                <li
                  key={step.id}
                  className="rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] px-2 py-3"
                >
                  {step.title}
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card level="base" className="space-y-4">
            <SectionHeader
              kicker="Weekly Trend"
              title="Readiness and recent history"
            />
            <div className="flex items-center gap-4">
              <ProgressRing value={readiness} size={88} strokeWidth={6} />
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#636380]">
                  Readiness
                </p>
                <p className="font-mono text-3xl font-bold text-[#eeeef2] metric-number">
                  {readiness}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#636380]">
                  Weight trend
                </p>
                <p className="font-mono text-2xl font-bold text-[#60a5fa] metric-number">
                  -0.8 kg
                </p>
                <Sparkline values={trendValues} color="#60a5fa" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#636380]">
                  Calorie delta
                </p>
                <p className="font-mono text-2xl font-bold text-[#ffb347] metric-number">
                  {calorieDelta}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#636380]">
                  Coach
                </p>
                <p className="text-sm text-[#eeeef2]">{coachMessage}</p>
              </div>
            </div>
          </Card>

          <Card level="base" className="space-y-4">
            <SectionHeader
              kicker="Recent Check-ins"
              title="Most recent unique entries"
            />
            {latestCheckins.length > 0 ? (
              <div className="space-y-2">
                {latestCheckins.map((entry) => (
                  <div
                    key={entry.date}
                    className="rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-3"
                  >
                    <p className="font-mono text-sm text-[#eeeef2]">
                      {entry.date}
                    </p>
                    <p className="mt-1 text-xs text-[#636380]">
                      {entry.weightKg}kg · {entry.waistCm}cm waist ·{" "}
                      {entry.sleepHours}h sleep
                    </p>
                  </div>
                ))}
                {latestCheckins.length === 1 ? (
                  <p className="text-xs text-[#636380]">
                    Log your second check-in after next week&apos;s weigh-in.
                  </p>
                ) : null}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-[rgba(255,255,255,0.08)] p-4 text-sm text-[#636380]">
                No check-in history yet. Your first logged week will appear
                here.
              </div>
            )}
          </Card>
        </aside>
      </div>
    </div>
  );
}
