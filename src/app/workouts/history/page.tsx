"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  Clock,
  Dumbbell,
  Trophy,
  Download,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Flame,
  CheckCircle2,
  Filter,
} from "lucide-react";
import {
  ActionButton,
  Card,
  MetricTile,
  SectionHeader,
} from "@/components/shared/UIPrimitives";
import { getExerciseDetail } from "@/lib/planEnhancements";
import { cn } from "@/lib/cn";

interface SavedWorkoutSession {
  id: string;
  day: string;
  tier: string;
  phase?: string | null;
  focus: string;
  setsReps: string;
  exercises: string[];
  completedExercises: string[];
  durationMinutes?: number | null;
  completedAt: string;
  totalVolumeKg?: number;
  totalSets?: number;
}

export default function WorkoutHistoryPage() {
  const [sessions, setSessions] = useState<SavedWorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [detailModalSession, setDetailModalSession] = useState<SavedWorkoutSession | null>(null);

  useEffect(() => {
    async function loadSessions() {
      try {
        const res = await fetch("/api/workout-sessions");
        if (res.ok) {
          const data = await res.json();
          if (data.ok && Array.isArray(data.sessions)) {
            setSessions(data.sessions);
            setLoading(false);
            return;
          }
        }
      } catch {
        // ignore network error
      }

      // Guest LocalStorage fallback
      try {
        const local = localStorage.getItem("guestWorkoutSessions");
        if (local) {
          setSessions(JSON.parse(local));
        }
      } catch {
        setSessions([]);
      }
      setLoading(false);
    }

    loadSessions();
  }, []);

  // Compute lifetime / month stats
  const stats = useMemo(() => {
    const totalSessions = sessions.length;
    let totalMinutes = 0;
    let totalVolume = 0;

    sessions.forEach((s) => {
      totalMinutes += s.durationMinutes || 45;
      totalVolume += s.totalVolumeKg || s.completedExercises.length * 3 * 8 * 50; // estimate if not recorded
    });

    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;

    return {
      totalSessions,
      totalDurationFormatted: `${hours}h ${mins}m`,
      totalVolumeKg: totalVolume,
    };
  }, [sessions]);

  // Calendar Day Generation
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const datesWithSessions = new Set(
      sessions.map((s) => new Date(s.completedAt).toISOString().slice(0, 10)),
    );

    const days: Array<{
      dateStr: string;
      dayNumber: number;
      hasWorkout: boolean;
      isCurrentMonth: boolean;
    }> = [];

    // Preceding blanks
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({
        dateStr: `prev-${i}`,
        dayNumber: 0,
        hasWorkout: false,
        isCurrentMonth: false,
      });
    }

    // Days in current month
    for (let day = 1; day <= daysInMonth; day++) {
      const monthStr = String(month + 1).padStart(2, "0");
      const dayStr = String(day).padStart(2, "0");
      const fullDate = `${year}-${monthStr}-${dayStr}`;

      days.push({
        dateStr: fullDate,
        dayNumber: day,
        hasWorkout: datesWithSessions.has(fullDate),
        isCurrentMonth: true,
      });
    }

    return days;
  }, [currentMonth, sessions]);

  // Filtered Sessions List
  const filteredSessions = useMemo(() => {
    if (!selectedDate) return sessions;
    return sessions.filter((s) =>
      new Date(s.completedAt).toISOString().startsWith(selectedDate),
    );
  }, [sessions, selectedDate]);

  // CSV Export Handler
  const handleExportCSV = () => {
    if (sessions.length === 0) return;

    const headers = [
      "ID",
      "Date",
      "Day",
      "Focus",
      "Tier",
      "DurationMinutes",
      "CompletedExercisesCount",
      "CompletedExercises",
    ];

    const rows = sessions.map((s) => [
      s.id,
      new Date(s.completedAt).toISOString(),
      `"${s.day}"`,
      `"${s.focus}"`,
      s.tier,
      s.durationMinutes || 0,
      s.completedExercises.length,
      `"${s.completedExercises.join(", ")}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `fitflow_workout_history_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const monthName = currentMonth.toLocaleString("default", { month: "long", year: "numeric" });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/workouts"
            className="p-2 rounded-xl bg-white/[0.03] border border-white/10 hover:bg-white/10 text-zinc-400 hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold font-mono tracking-widest uppercase text-cyan-400">
                Logbook & Analytics
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
              Workout History
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={sessions.length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/10 hover:bg-white/10 text-xs font-mono font-semibold text-zinc-300 transition"
          >
            <Download className="w-4 h-4 text-cyan-400" /> Export CSV
          </button>
        </div>
      </div>

      {/* Lifetime Stat Tiles */}
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricTile
          label="Total Workouts Logged"
          value={`${stats.totalSessions} Sessions`}
          note="Consistent gym execution"
        />
        <MetricTile
          label="Cumulative Time"
          value={stats.totalDurationFormatted}
          note="Total time under tension"
        />
        <MetricTile
          label="Estimated Tonnage"
          value={`${stats.totalVolumeKg.toLocaleString()} kg`}
          note="Total volume accumulated"
        />
      </div>

      {/* Calendar & Log Layout */}
      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        {/* Monthly Calendar Card */}
        <Card level="elevated" className="space-y-4 h-fit">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="font-display text-base font-bold text-white">
              {monthName}
            </h3>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() =>
                  setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
                }
                className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
                }
                className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center font-mono text-[10px] text-zinc-500 uppercase">
            <span>Su</span>
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {calendarDays.map((d, i) => {
              if (!d.isCurrentMonth) {
                return <div key={`blank-${i}`} className="h-9 w-full" />;
              }

              const isSelected = selectedDate === d.dateStr;

              return (
                <button
                  key={d.dateStr}
                  type="button"
                  onClick={() => setSelectedDate(isSelected ? null : d.dateStr)}
                  className={cn(
                    "h-9 w-full rounded-xl flex flex-col items-center justify-center font-mono text-xs transition relative",
                    isSelected
                      ? "bg-cyan-500 text-black font-bold shadow-[0_0_10px_rgba(6,182,212,0.4)]"
                      : d.hasWorkout
                        ? "bg-green-500/15 border border-green-500/40 text-green-300 hover:bg-green-500/25 font-bold"
                        : "bg-white/[0.02] border border-white/5 text-zinc-400 hover:bg-white/5",
                  )}
                >
                  <span>{d.dayNumber}</span>
                  {d.hasWorkout && !isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 absolute bottom-1" />
                  )}
                </button>
              );
            })}
          </div>

          {selectedDate && (
            <div className="pt-2 flex items-center justify-between border-t border-white/10 text-xs font-mono">
              <span className="text-zinc-400">Filtered: {selectedDate}</span>
              <button
                type="button"
                onClick={() => setSelectedDate(null)}
                className="text-cyan-400 hover:underline"
              >
                Clear Filter
              </button>
            </div>
          )}
        </Card>

        {/* Sessions Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-cyan-400" />
              Logged Sessions ({filteredSessions.length})
            </h3>
          </div>

          {loading ? (
            <Card level="base" className="p-8 text-center text-sm text-zinc-500">
              Loading workout history...
            </Card>
          ) : filteredSessions.length === 0 ? (
            <Card level="base" className="p-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-center mx-auto text-zinc-500">
                <Dumbbell className="w-6 h-6" />
              </div>
              <h4 className="font-display text-base font-bold text-white">
                No Workouts Found
              </h4>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                {selectedDate
                  ? `No workouts recorded on ${selectedDate}.`
                  : "You haven't logged any workouts yet. Launch Live Workout mode on the Workouts tab to record your training sessions!"}
              </p>
              <Link
                href="/workouts"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 text-black font-bold text-xs uppercase tracking-wider transition hover:bg-cyan-400"
              >
                Go to Workouts
              </Link>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredSessions.map((session) => {
                const dateObj = new Date(session.completedAt);
                const formattedDate = dateObj.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                });
                const formattedTime = dateObj.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <Card
                    key={session.id}
                    level="base"
                    onClick={() => setDetailModalSession(session)}
                    className="p-4 sm:p-5 hover:border-cyan-500/40 cursor-pointer transition group"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/5 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                            {session.tier}
                          </span>
                          <span className="text-xs text-zinc-400 font-mono">
                            {formattedDate} · {formattedTime}
                          </span>
                        </div>
                        <h4 className="font-display text-lg font-bold text-white group-hover:text-cyan-300 transition mt-1">
                          {session.day}: {session.focus}
                        </h4>
                      </div>

                      <div className="flex items-center gap-4 text-right font-mono">
                        <div>
                          <span className="text-[10px] uppercase text-zinc-500 block">Duration</span>
                          <span className="text-sm font-bold text-zinc-200">
                            {session.durationMinutes || 45} mins
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase text-zinc-500 block">Completed</span>
                          <span className="text-sm font-bold text-green-400">
                            {session.completedExercises.length} / {session.exercises.length} Ex
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Exercises tags preview */}
                    <div className="pt-3 flex flex-wrap gap-1.5">
                      {session.completedExercises.map((exName) => (
                        <span
                          key={exName}
                          className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/10 text-zinc-300 flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3 h-3 text-green-400" />
                          {exName}
                        </span>
                      ))}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Session Drill-Down Detail Modal */}
      {detailModalSession && (
        <div className="fixed inset-0 z-60 bg-black/85 p-4 backdrop-blur-md flex items-center justify-center overflow-y-auto">
          <div className="w-full max-w-xl bg-[#0d0d18] border border-white/15 rounded-3xl p-6 shadow-2xl space-y-5 my-auto">
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase font-mono tracking-widest text-cyan-400">
                  Session Breakdown
                </span>
                <h3 className="font-display text-2xl font-bold text-white mt-1">
                  {detailModalSession.day}: {detailModalSession.focus}
                </h3>
                <p className="text-xs text-zinc-400 font-mono mt-1">
                  {new Date(detailModalSession.completedAt).toLocaleString()} · {detailModalSession.durationMinutes || 45} mins
                </p>
              </div>

              <button
                type="button"
                onClick={() => setDetailModalSession(null)}
                className="p-2 text-zinc-400 hover:text-white rounded-xl"
              >
                ✕
              </button>
            </div>

            {/* Exercise List */}
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              <span className="text-[11px] uppercase font-mono font-semibold text-zinc-400">
                Exercises Completed ({detailModalSession.completedExercises.length})
              </span>
              {detailModalSession.completedExercises.map((name, idx) => {
                const detail = getExerciseDetail(name);
                return (
                  <div
                    key={`${name}-${idx}`}
                    className="p-3 rounded-xl border border-white/10 bg-white/[0.02] flex items-center justify-between"
                  >
                    <div>
                      <h5 className="font-display text-sm font-bold text-white">{name}</h5>
                      <span className="text-xs text-zinc-400 font-mono">
                        {detail.bodyPart} · {detail.equipment} · {detail.exerciseType}
                      </span>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setDetailModalSession(null)}
                className="px-5 py-2 rounded-xl bg-cyan-500 text-black font-bold text-xs transition hover:bg-cyan-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
