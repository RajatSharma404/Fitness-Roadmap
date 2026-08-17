"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Check,
  CheckCircle2,
  Trophy,
  Dumbbell,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { getExerciseDetail } from "@/lib/planEnhancements";
import { RestTimer } from "./RestTimer";
import { VisualBarbell } from "@/components/tools/VisualBarbell";
import { calculatePlates } from "@/lib/plateCalculator";
import { calculateEpley1RM } from "@/lib/formulas";
import { cn } from "@/lib/cn";

export interface LoggedSet {
  id: string;
  setNumber: number;
  type: "WARMUP" | "WORKING" | "DROP" | "FAILURE";
  weight: number;
  reps: number;
  rpe?: number;
  completed: boolean;
}

export interface ExerciseSessionState {
  name: string;
  sets: LoggedSet[];
}

interface LiveWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayName: string;
  focus: string;
  exercises: string[];
  userWeightKg?: number;
  onFinishWorkout: (summary: {
    durationSeconds: number;
    totalVolumeKg: number;
    totalSets: number;
    completedExercises: string[];
    prsAchieved: Array<{ name: string; weight: number; reps: number; oneRM: number }>;
  }) => void;
}

export function LiveWorkoutModal({
  isOpen,
  onClose,
  dayName,
  focus,
  exercises,
  onFinishWorkout,
}: LiveWorkoutModalProps) {
  // Session stopwatch
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Exercise states initialized with 3 default working sets
  const [sessionExercises, setSessionExercises] = useState<ExerciseSessionState[]>(() =>
    exercises.map((ex) => ({
      name: ex,
      sets: [
        { id: `${ex}-1`, setNumber: 1, type: "WORKING", weight: 60, reps: 8, rpe: 8, completed: false },
        { id: `${ex}-2`, setNumber: 2, type: "WORKING", weight: 60, reps: 8, rpe: 8, completed: false },
        { id: `${ex}-3`, setNumber: 3, type: "WORKING", weight: 60, reps: 8, rpe: 8.5, completed: false },
      ],
    })),
  );

  // Rest timer state
  const [restTimerActive, setRestTimerActive] = useState(false);
  const [restTimerExercise, setRestTimerExercise] = useState<string>("");
  const [restTimerSetNum, setRestTimerSetNum] = useState<number>(1);

  // Plate loader popup state
  const [plateLoaderWeight, setPlateLoaderWeight] = useState<number | null>(null);
  const [plateLoaderExercise, setPlateLoaderExercise] = useState<string>("");

  // In-session PR celebrations
  const [sessionPRs, setSessionPRs] = useState<
    Array<{ name: string; weight: number; reps: number; oneRM: number }>
  >([]);
  const [latestPRAlert, setLatestPRAlert] = useState<{
    name: string;
    weight: number;
    reps: number;
    oneRM: number;
  } | null>(null);

  // Expanded card toggle
  const [expandedExercise, setExpandedExercise] = useState<string>(exercises[0] || "");
  const [isFinished, setIsFinished] = useState(false);

  // Elapsed timer tick
  useEffect(() => {
    if (!isOpen || isFinished) return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, isFinished]);

  // Compute live session stats
  const totalVolume = useMemo(() => {
    let vol = 0;
    sessionExercises.forEach((ex) => {
      ex.sets.forEach((s) => {
        if (s.completed && s.weight > 0 && s.reps > 0) {
          vol += s.weight * s.reps;
        }
      });
    });
    return vol;
  }, [sessionExercises]);

  const totalSetsCount = useMemo(() => {
    return sessionExercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  }, [sessionExercises]);

  const completedSetsCount = useMemo(() => {
    return sessionExercises.reduce(
      (sum, ex) => sum + ex.sets.filter((s) => s.completed).length,
      0,
    );
  }, [sessionExercises]);

  // Set toggle & PR detection
  const handleToggleSetComplete = (exIdx: number, setIdx: number) => {
    const updated = [...sessionExercises];
    const targetSet = updated[exIdx].sets[setIdx];
    const newCompleted = !targetSet.completed;
    targetSet.completed = newCompleted;

    setSessionExercises(updated);

    if (newCompleted) {
      // Trigger Rest Timer
      setRestTimerExercise(updated[exIdx].name);
      setRestTimerSetNum(setIdx + 2 <= updated[exIdx].sets.length ? setIdx + 2 : 1);
      setRestTimerActive(true);

      // PR detection: calculate 1RM
      if (targetSet.weight > 0 && targetSet.reps > 0) {
        const epley1RM = Math.round(calculateEpley1RM(targetSet.weight, targetSet.reps) * 10) / 10;
        const prItem = {
          name: updated[exIdx].name,
          weight: targetSet.weight,
          reps: targetSet.reps,
          oneRM: epley1RM,
        };

        setSessionPRs((prev) => {
          const filtered = prev.filter((p) => p.name !== prItem.name || p.oneRM < prItem.oneRM);
          return [...filtered, prItem];
        });

        // Trigger celebratory flash
        setLatestPRAlert(prItem);
        setTimeout(() => setLatestPRAlert(null), 5000);
      }
    }
  };

  const handleUpdateSetValue = (
    exIdx: number,
    setIdx: number,
    field: "weight" | "reps" | "rpe" | "type",
    val: unknown,
  ) => {
    const updated = [...sessionExercises];
    const targetSet = updated[exIdx].sets[setIdx];
    if (field === "weight") targetSet.weight = Number(val) || 0;
    if (field === "reps") targetSet.reps = Number(val) || 0;
    if (field === "rpe") targetSet.rpe = Number(val) || 8;
    if (field === "type") targetSet.type = val as LoggedSet["type"];
    setSessionExercises(updated);
  };

  const handleAddSet = (exIdx: number) => {
    const updated = [...sessionExercises];
    const lastSet = updated[exIdx].sets[updated[exIdx].sets.length - 1];
    const nextSetNumber = updated[exIdx].sets.length + 1;
    const newSet: LoggedSet = {
      id: `${updated[exIdx].name}-set-${nextSetNumber}`,
      setNumber: nextSetNumber,
      type: "WORKING",
      weight: lastSet?.weight || 60,
      reps: lastSet?.reps || 8,
      rpe: 8,
      completed: false,
    };
    updated[exIdx].sets.push(newSet);
    setSessionExercises(updated);
  };

  const handleRemoveSet = (exIdx: number, setIdx: number) => {
    const updated = [...sessionExercises];
    updated[exIdx].sets.splice(setIdx, 1);
    updated[exIdx].sets.forEach((s, idx) => {
      s.setNumber = idx + 1;
    });
    setSessionExercises(updated);
  };

  const handleFinishSession = () => {
    setIsFinished(true);
    const completedExList = sessionExercises
      .filter((ex) => ex.sets.some((s) => s.completed))
      .map((ex) => ex.name);

    onFinishWorkout({
      durationSeconds: elapsedSeconds,
      totalVolumeKg: totalVolume,
      totalSets: completedSetsCount,
      completedExercises: completedExList,
      prsAchieved: sessionPRs,
    });
  };

  if (!isOpen) return null;

  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  const formattedDuration = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  // Plate calculation for popup
  const popupPlates = plateLoaderWeight
    ? calculatePlates({ targetWeight: plateLoaderWeight, barWeight: 20, unit: "kg" })
    : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 p-2 sm:p-4 backdrop-blur-md overflow-y-auto flex items-center justify-center">
      <div className="w-full max-w-4xl bg-[#0b0b14] border border-white/15 rounded-3xl overflow-hidden shadow-2xl flex flex-col my-auto max-h-[95vh]">
        {/* Session Top Bar */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-white/[0.02] flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold font-mono tracking-[0.2em] uppercase text-cyan-400">
                Live Training Session
              </span>
              <span className="text-zinc-500">·</span>
              <span className="text-xs font-semibold text-zinc-300">{dayName}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-white mt-0.5">
              {focus}
            </h2>
          </div>

          {/* Live Metrics Meter */}
          <div className="flex items-center gap-3 bg-white/[0.03] border border-white/10 px-4 py-2 rounded-2xl font-mono">
            <div className="text-left">
              <span className="text-[10px] uppercase text-zinc-400 block">Timer</span>
              <span className="text-sm sm:text-base font-bold text-cyan-300">
                {formattedDuration}
              </span>
            </div>
            <div className="h-6 w-px bg-white/10" />
            <div className="text-left">
              <span className="text-[10px] uppercase text-zinc-400 block">Volume</span>
              <span className="text-sm sm:text-base font-bold text-amber-400">
                {totalVolume.toLocaleString()} kg
              </span>
            </div>
            <div className="h-6 w-px bg-white/10" />
            <div className="text-left">
              <span className="text-[10px] uppercase text-zinc-400 block">Sets</span>
              <span className="text-sm sm:text-base font-bold text-green-400">
                {completedSetsCount}/{totalSetsCount}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live PR Celebration Toast */}
        <AnimatePresence>
          {latestPRAlert && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-amber-500/15 border-b border-amber-500/30 px-5 py-2.5 flex items-center justify-between text-xs font-mono text-amber-300"
            >
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  🔥 <strong>NEW PR:</strong> {latestPRAlert.weight}kg × {latestPRAlert.reps} reps on {latestPRAlert.name} ({latestPRAlert.oneRM}kg 1RM)!
                </span>
              </div>
              <span className="font-bold text-amber-400 uppercase tracking-wider text-[10px]">
                Milestone Progress +150 XP
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Exercises Scroll Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {sessionExercises.map((exerciseState, exIdx) => {
            const detail = getExerciseDetail(exerciseState.name);
            const isExpanded = expandedExercise === exerciseState.name;
            const completedCount = exerciseState.sets.filter((s) => s.completed).length;

            return (
              <div
                key={exerciseState.name}
                className={cn(
                  "rounded-2xl border transition-all overflow-hidden",
                  isExpanded
                    ? "border-cyan-500/40 bg-[#12121f]/90 shadow-xl"
                    : "border-white/10 bg-white/[0.02] hover:border-white/20",
                )}
              >
                {/* Exercise Header Accordion */}
                <div
                  onClick={() =>
                    setExpandedExercise(isExpanded ? "" : exerciseState.name)
                  }
                  className="p-4 flex items-center justify-between gap-3 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <Image
                      src={detail.imageUrl}
                      alt={detail.imageAlt}
                      width={64}
                      height={48}
                      unoptimized
                      className="h-12 w-16 rounded-xl border border-white/10 object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="font-display text-base font-bold text-white truncate">
                        {exerciseState.name}
                      </h4>
                      <p className="text-xs text-zinc-400 font-mono">
                        {detail.bodyPart} · {completedCount}/{exerciseState.sets.length} sets completed
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Quick Barbell Plate Loader Link */}
                    {["squat", "bench", "deadlift", "press", "row"].some((kw) =>
                      exerciseState.name.toLowerCase().includes(kw),
                    ) && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const activeSet = exerciseState.sets.find((s) => !s.completed) || exerciseState.sets[0];
                          setPlateLoaderWeight(activeSet.weight);
                          setPlateLoaderExercise(exerciseState.name);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-semibold transition"
                      >
                        <Dumbbell className="w-3.5 h-3.5" />
                        <span>Plates</span>
                      </button>
                    )}

                    <div className="p-1 text-zinc-400">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {/* Set-by-Set Logging Table */}
                {isExpanded && (
                  <div className="p-4 pt-0 space-y-3 border-t border-white/5">
                    <div className="grid grid-cols-[36px_1fr_1fr_1fr_40px] gap-2 text-[10px] uppercase font-mono text-zinc-400 px-2 pt-3">
                      <span>Set</span>
                      <span>Weight (kg)</span>
                      <span>Reps</span>
                      <span>RPE</span>
                      <span className="text-center">Done</span>
                    </div>

                    <div className="space-y-2">
                      {exerciseState.sets.map((set, setIdx) => (
                        <div
                          key={set.id}
                          className={cn(
                            "grid grid-cols-[36px_1fr_1fr_1fr_40px] gap-2 items-center p-2 rounded-xl border transition",
                            set.completed
                              ? "bg-green-500/[0.06] border-green-500/30"
                              : "bg-white/[0.02] border-white/5",
                          )}
                        >
                          {/* Set Badge */}
                          <span
                            className={cn(
                              "flex items-center justify-center w-7 h-7 rounded-lg text-xs font-mono font-bold border",
                              set.completed
                                ? "bg-green-500/20 text-green-300 border-green-500/40"
                                : "bg-white/5 text-zinc-400 border-white/10",
                            )}
                          >
                            {set.setNumber}
                          </span>

                          {/* Weight Input */}
                          <input
                            type="number"
                            step={2.5}
                            min={0}
                            value={set.weight}
                            onChange={(e) =>
                              handleUpdateSetValue(exIdx, setIdx, "weight", e.target.value)
                            }
                            className="h-9 w-full rounded-lg border border-white/10 bg-white/[0.04] px-2.5 font-mono text-sm font-bold text-center text-white focus:border-cyan-400 focus:outline-none"
                          />

                          {/* Reps Input */}
                          <input
                            type="number"
                            min={1}
                            max={100}
                            value={set.reps}
                            onChange={(e) =>
                              handleUpdateSetValue(exIdx, setIdx, "reps", e.target.value)
                            }
                            className="h-9 w-full rounded-lg border border-white/10 bg-white/[0.04] px-2.5 font-mono text-sm font-bold text-center text-white focus:border-cyan-400 focus:outline-none"
                          />

                          {/* RPE Selector */}
                          <select
                            value={set.rpe || 8}
                            onChange={(e) =>
                              handleUpdateSetValue(exIdx, setIdx, "rpe", e.target.value)
                            }
                            className="h-9 w-full rounded-lg border border-white/10 bg-white/[0.04] px-1 font-mono text-xs font-semibold text-center text-zinc-200 focus:border-cyan-400 focus:outline-none"
                          >
                            <option value="6">RPE 6 (4 RIR)</option>
                            <option value="7">RPE 7 (3 RIR)</option>
                            <option value="8">RPE 8 (2 RIR)</option>
                            <option value="8.5">RPE 8.5</option>
                            <option value="9">RPE 9 (1 RIR)</option>
                            <option value="9.5">RPE 9.5</option>
                            <option value="10">RPE 10 (Max)</option>
                          </select>

                          {/* Complete Checkbox */}
                          <button
                            type="button"
                            onClick={() => handleToggleSetComplete(exIdx, setIdx)}
                            className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center transition border mx-auto",
                              set.completed
                                ? "bg-green-500 text-black border-green-400 shadow-[0_0_10px_rgba(34,197,94,0.4)]"
                                : "bg-white/5 text-zinc-400 hover:text-white border-white/10",
                            )}
                          >
                            <Check className="w-4 h-4 stroke-[3]" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Set Modification Controls */}
                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => handleAddSet(exIdx)}
                        className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-mono transition"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Set
                      </button>

                      {exerciseState.sets.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSet(exIdx, exerciseState.sets.length - 1)}
                          className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-red-400 font-mono transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove Last Set
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-white/[0.02] flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-semibold uppercase tracking-wider text-zinc-400 transition"
          >
            Pause / Exit
          </button>

          <button
            type="button"
            onClick={handleFinishSession}
            disabled={completedSetsCount === 0}
            className={cn(
              "inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold font-display text-sm transition shadow-lg",
              completedSetsCount > 0
                ? "bg-green-500 hover:bg-green-400 text-black shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                : "bg-zinc-800 text-zinc-500 cursor-not-allowed",
            )}
          >
            <CheckCircle2 className="w-4 h-4" />
            Finish Workout Session ({completedSetsCount} sets)
          </button>
        </div>
      </div>

      {/* Embedded Plate Loader Modal */}
      {popupPlates && (
        <div className="fixed inset-0 z-60 bg-black/80 p-4 backdrop-blur-md flex items-center justify-center">
          <div className="w-full max-w-2xl bg-[#0c0c16] border border-white/20 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400 font-mono">
                  Plate Breakdown
                </span>
                <h3 className="text-xl font-bold text-white font-display">
                  {plateLoaderExercise}: {plateLoaderWeight} kg
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPlateLoaderWeight(null)}
                className="p-2 hover:bg-white/10 rounded-xl transition text-zinc-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <VisualBarbell
              platesPerSide={popupPlates.platesPerSide}
              barWeight={20}
              totalWeight={popupPlates.actualLoadedWeight}
              unit="kg"
            />

            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => setPlateLoaderWeight(null)}
                className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Audio / Vibrational Rest Timer */}
      <RestTimer
        isActive={restTimerActive}
        exerciseName={restTimerExercise}
        nextSetNumber={restTimerSetNum}
        onFinish={() => setRestTimerActive(false)}
      />
    </div>
  );
}
