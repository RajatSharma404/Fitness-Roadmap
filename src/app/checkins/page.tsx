"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ActionButton,
  Card,
  SectionHeader,
} from "@/components/shared/UIPrimitives";
import { calculateBodyPlan } from "@/lib/bodyPlanner";
import {
  computeReadinessScore,
  getDailyCoachMessage,
  getProgressBasedAdjustment,
  WeeklyCheckIn,
} from "@/lib/planEnhancements";
import {
  defaultPlannerSnapshot,
  dedupeCheckinsByDate,
  readPlannerSnapshot,
} from "@/lib/plannerView";

function saveCheckins(next: WeeklyCheckIn[]) {
  const current = readPlannerSnapshot();
  localStorage.setItem(
    "bodyPlanEnhancedState",
    JSON.stringify({
      input: current.input,
      checkins: next,
      equipment: current.equipment,
      experience: current.experience,
    }),
  );
}

export default function CheckinsPage() {
  const [snapshot] = useState(defaultPlannerSnapshot);
  const [entries, setEntries] = useState<WeeklyCheckIn[]>(() =>
    dedupeCheckinsByDate(snapshot.checkins),
  );
  const [draft, setDraft] = useState<WeeklyCheckIn>({
    date: new Date().toISOString().slice(0, 10),
    weightKg: snapshot.input.weightKg,
    waistCm: 90,
    sleepHours: 7,
    stepsAvg: 8500,
    stress: 4,
    energy: 7,
    workoutCompletion: 75,
  });

  const plan = useMemo(
    () => calculateBodyPlan(snapshot.input),
    [snapshot.input],
  );
  const readiness = entries.length ? computeReadinessScore(entries[0]) : 74;
  const coachMessage = getDailyCoachMessage(
    snapshot.input.goal,
    readiness,
    getProgressBasedAdjustment(snapshot.input, entries),
  );

  const lineData = [...entries].reverse();
  const recoveryData = lineData.map((entry) => ({
    date: entry.date,
    score: Math.round(
      (entry.sleepHours * 10 + entry.energy * 8 + (10 - entry.stress) * 6) / 3,
    ),
  }));

  const handleSave = () => {
    const next = dedupeCheckinsByDate([...entries, draft])
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 12);
    setEntries(next);
    saveCheckins(next);
  };

  return (
    <div className="space-y-6 pb-8">
      <Card level="elevated">
        <SectionHeader
          kicker="Check-ins"
          title="Log this week"
          description="Use the form to capture recovery signals and feed them back into the planner."
        />
      </Card>

      <div className="grid gap-6 xl:grid-cols-[45%_55%]">
        <Card level="base" className="space-y-4">
          <SectionHeader
            kicker="Form"
            title="Weekly check-in"
            description="Required metrics first, optional readiness details below."
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm text-[#636380]">
              Date
              <input
                className="mt-1 w-full rounded-md border border-[rgba(255,255,255,0.06)] bg-bg-surface px-3 py-2 text-[#eeeef2]"
                type="date"
                value={draft.date}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, date: event.target.value }))
                }
              />
            </label>
            <label className="text-sm text-[#636380]">
              Weight (kg)
              <input
                className="mt-1 w-full rounded-md border border-[rgba(255,255,255,0.06)] bg-bg-surface px-3 py-2 text-[#eeeef2]"
                type="number"
                value={draft.weightKg}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    weightKg: Number(event.target.value),
                  }))
                }
              />
            </label>
            <label className="text-sm text-[#636380]">
              Waist (cm)
              <input
                className="mt-1 w-full rounded-md border border-[rgba(255,255,255,0.06)] bg-bg-surface px-3 py-2 text-[#eeeef2]"
                type="number"
                value={draft.waistCm}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    waistCm: Number(event.target.value),
                  }))
                }
              />
            </label>
            <label className="text-sm text-[#636380]">
              Sleep (hrs)
              <input
                className="mt-1 w-full rounded-md border border-[rgba(255,255,255,0.06)] bg-bg-surface px-3 py-2 text-[#eeeef2]"
                type="range"
                min={3}
                max={10}
                step={0.5}
                value={draft.sleepHours}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    sleepHours: Number(event.target.value),
                  }))
                }
              />
              <p className="mt-1 font-mono text-xs text-[#60a5fa]">
                {draft.sleepHours.toFixed(1)}h
              </p>
            </label>
            <label className="text-sm text-[#636380]">
              Steps
              <input
                className="mt-1 w-full rounded-md border border-[rgba(255,255,255,0.06)] bg-bg-surface px-3 py-2 text-[#eeeef2]"
                type="number"
                value={draft.stepsAvg}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    stepsAvg: Number(event.target.value),
                  }))
                }
              />
            </label>
            <label className="text-sm text-[#636380]">
              Workout completion %
              <input
                className="mt-1 w-full rounded-md border border-[rgba(255,255,255,0.06)] bg-bg-surface px-3 py-2 text-[#eeeef2]"
                type="range"
                min={0}
                max={100}
                value={draft.workoutCompletion}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    workoutCompletion: Number(event.target.value),
                  }))
                }
              />
              <p className="mt-1 font-mono text-xs text-[#00d4ff]">
                {draft.workoutCompletion}%
              </p>
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm text-[#636380]">
              Stress
              <div className="mt-2 grid grid-cols-10 gap-2">
                {Array.from({ length: 10 }).map((_, index) => {
                  const value = index + 1;
                  const active = draft.stress === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        setDraft((prev) => ({ ...prev, stress: value }))
                      }
                      className={`h-8 rounded-md border text-xs transition ${active ? "border-cyan-400 bg-cyan-400 text-[#07070d] font-bold" : "border-[rgba(255,255,255,0.06)] text-[#636380]"}`}
                    >
                      {value}
                    </button>
                  );
                })}
              </div>
            </label>
            <label className="text-sm text-[#636380]">
              Energy
              <div className="mt-2 grid grid-cols-10 gap-2">
                {Array.from({ length: 10 }).map((_, index) => {
                  const value = index + 1;
                  const active = draft.energy === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        setDraft((prev) => ({ ...prev, energy: value }))
                      }
                      className={`h-8 rounded-md border text-xs transition ${active ? "border-cyan-400 bg-cyan-400 text-[#07070d] font-bold" : "border-[rgba(255,255,255,0.06)] text-[#636380]"}`}
                    >
                      {value}
                    </button>
                  );
                })}
              </div>
            </label>
          </div>

          <ActionButton
            className="btn-primary h-13 w-full"
            onClick={handleSave}
          >
            Save Weekly Check-in
          </ActionButton>
          <Card level="elevated">
            <p className="text-xs uppercase tracking-[0.2em] text-[#636380]">
              Instant coach response
            </p>
            <p className="mt-2 text-sm text-[#eeeef2]">{coachMessage}</p>
            <p className="mt-2 text-xs text-[#636380]">
              Plan target: {Math.round(plan.targetCalories)} kcal · Protein{" "}
              {Math.round(plan.macros.proteinG)}g
            </p>
          </Card>
        </Card>

        <div className="space-y-6">
          <Card level="base" className="space-y-4">
            <SectionHeader kicker="Trend" title="Weight and recovery charts" />
            <div className="h-64 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-3">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData}>
                  <CartesianGrid
                    stroke="rgba(255,255,255,0.06)"
                    strokeDasharray="3 3"
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#636380", fontSize: 12 }}
                  />
                  <YAxis tick={{ fill: "#636380", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      background: "#1a1a2e",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="weightKg"
                    stroke="#00d4ff"
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card level="base" className="space-y-4">
            <SectionHeader
              kicker="Recovery"
              title="Sleep, energy, and stress"
            />
            <div className="h-64 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={recoveryData}>
                  <CartesianGrid
                    stroke="rgba(255,255,255,0.06)"
                    strokeDasharray="3 3"
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#636380", fontSize: 12 }}
                  />
                  <YAxis tick={{ fill: "#636380", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      background: "#1a1a2e",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#00e676"
                    fill="#00e676"
                    fillOpacity={0.15}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card level="elevated" className="space-y-3">
            <SectionHeader kicker="Recent Entries" title="Deduped history" />
            {entries.length ? (
              <div className="space-y-2">
                {entries.map((entry) => (
                  <div
                    key={entry.date}
                    className="rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-3 text-sm"
                  >
                    <p className="font-mono text-[#eeeef2]">{entry.date}</p>
                    <p className="mt-1 text-[#636380]">
                      {entry.weightKg}kg · {entry.waistCm}cm waist ·{" "}
                      {entry.sleepHours}h sleep
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-[rgba(255,255,255,0.08)] p-4 text-sm text-[#636380]">
                No entries yet. Save your first weekly check-in to start
                tracking recovery.
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
