"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Trash2,
  Copy,
  Check,
  Dumbbell,
  Layers,
  Sparkles,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Save,
  Search,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import {
  ActionButton,
  Card,
  SectionHeader,
} from "@/components/shared/UIPrimitives";
import {
  CustomRoutine,
  RoutineDay,
  RoutineExercise,
  PRESET_ROUTINE_TEMPLATES,
  cloneRoutineTemplate,
  createNewRoutine,
} from "@/lib/workoutRoutines";
import {
  readPlannerSnapshot,
  persistPlannerSnapshot,
  syncPlannerSnapshotFromServer,
} from "@/lib/plannerView";
import {
  getBodyPartExerciseCatalog,
  getExerciseDetail,
} from "@/lib/planEnhancements";
import { cn } from "@/lib/cn";

export default function RoutineBuilderPage() {
  const [snapshot, setSnapshot] = useState(readPlannerSnapshot());
  const [customRoutines, setCustomRoutines] = useState<CustomRoutine[]>(
    () => snapshot.customRoutines || [],
  );
  const [activeRoutineId, setActiveRoutineId] = useState<string | null>(
    snapshot.activeRoutineId || null,
  );
  const [selectedRoutineId, setSelectedRoutineId] = useState<string | null>(null);

  // Exercise picker state
  const [exercisePickerDayIndex, setExercisePickerDayIndex] = useState<number | null>(null);
  const [exerciseSearchQuery, setExerciseSearchQuery] = useState("");
  const [selectedMuscleFilter, setSelectedMuscleFilter] = useState("All");

  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Sync snapshot
  useEffect(() => {
    const current = readPlannerSnapshot();
    setSnapshot(current);
    if (current.customRoutines && current.customRoutines.length > 0) {
      setCustomRoutines(current.customRoutines);
      setSelectedRoutineId(current.activeRoutineId || current.customRoutines[0].id);
    } else {
      // If none, default to cloned PPL
      const defaultPPL = cloneRoutineTemplate("template-ppl-6day", "My Push / Pull / Legs");
      if (defaultPPL) {
        setCustomRoutines([defaultPPL]);
        setSelectedRoutineId(defaultPPL.id);
      }
    }
    setActiveRoutineId(current.activeRoutineId || null);

    void syncPlannerSnapshotFromServer().then((serverSnap) => {
      if (serverSnap.customRoutines && serverSnap.customRoutines.length > 0) {
        setCustomRoutines(serverSnap.customRoutines);
        if (!selectedRoutineId) {
          setSelectedRoutineId(serverSnap.activeRoutineId || serverSnap.customRoutines[0].id);
        }
      }
      setActiveRoutineId(serverSnap.activeRoutineId || null);
    });
  }, []);

  const currentRoutine = useMemo(() => {
    return customRoutines.find((r) => r.id === selectedRoutineId) || customRoutines[0] || null;
  }, [customRoutines, selectedRoutineId]);

  const catalog = useMemo(() => getBodyPartExerciseCatalog(), []);
  const allExercises = useMemo(() => {
    const list: Array<{ name: string; bodyPart: string; modality: string }> = [];
    catalog.forEach((entry) => {
      entry.bodyweight.forEach((name) =>
        list.push({ name, bodyPart: entry.bodyPart, modality: "bodyweight" }),
      );
      entry.machine.forEach((name) =>
        list.push({ name, bodyPart: entry.bodyPart, modality: "machine" }),
      );
    });
    return list;
  }, [catalog]);

  const filteredCatalogExercises = useMemo(() => {
    return allExercises.filter((item) => {
      const matchSearch =
        !exerciseSearchQuery.trim() ||
        item.name.toLowerCase().includes(exerciseSearchQuery.toLowerCase()) ||
        item.bodyPart.toLowerCase().includes(exerciseSearchQuery.toLowerCase());
      const matchMuscle =
        selectedMuscleFilter === "All" || item.bodyPart === selectedMuscleFilter;
      return matchSearch && matchMuscle;
    });
  }, [allExercises, exerciseSearchQuery, selectedMuscleFilter]);

  // Routine mutation helpers
  const handleUpdateCurrentRoutine = (updater: (prev: CustomRoutine) => CustomRoutine) => {
    if (!currentRoutine) return;
    const updated = updater(currentRoutine);
    const list = customRoutines.map((r) => (r.id === updated.id ? updated : r));
    setCustomRoutines(list);
  };

  const handleCreateNewRoutine = (splitType: CustomRoutine["splitType"] = "custom", daysCount = 4) => {
    const newRoutine = createNewRoutine(`Custom ${daysCount}-Day Routine`, splitType, daysCount);
    setCustomRoutines((prev) => [newRoutine, ...prev]);
    setSelectedRoutineId(newRoutine.id);
  };

  const handleCloneTemplate = (templateId: string) => {
    const cloned = cloneRoutineTemplate(templateId);
    if (!cloned) return;
    setCustomRoutines((prev) => [cloned, ...prev]);
    setSelectedRoutineId(cloned.id);
  };

  const handleDeleteRoutine = (routineId: string) => {
    const remaining = customRoutines.filter((r) => r.id !== routineId);
    setCustomRoutines(remaining);
    if (activeRoutineId === routineId) {
      setActiveRoutineId(remaining[0]?.id || null);
    }
    if (selectedRoutineId === routineId) {
      setSelectedRoutineId(remaining[0]?.id || null);
    }
  };

  const handleSetActiveRoutine = (routineId: string) => {
    setActiveRoutineId((prev) => (prev === routineId ? null : routineId));
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    const updatedSnapshot = {
      ...snapshot,
      customRoutines,
      activeRoutineId,
    };

    const ok = await persistPlannerSnapshot(updatedSnapshot);
    setSnapshot(updatedSnapshot);
    setIsSaving(false);
    setSaveMessage(
      ok
        ? "Routine changes saved & synced to profile!"
        : "Routine saved locally in your browser.",
    );
    setTimeout(() => setSaveMessage(null), 4000);
  };

  // Day Modifications
  const handleAddDay = () => {
    handleUpdateCurrentRoutine((prev) => {
      const nextNum = prev.days.length + 1;
      const newDay: RoutineDay = {
        id: `${prev.id}-day-${nextNum}-${Date.now()}`,
        dayName: `Day ${nextNum}`,
        focus: "General Training",
        bodyParts: ["Full Body"],
        exercises: [
          {
            id: `${prev.id}-day-${nextNum}-ex-1-${Date.now()}`,
            name: "Barbell Squat",
            targetSets: 3,
            targetReps: "8-10",
            targetRpe: 8,
            restSeconds: 120,
          },
        ],
      };
      return {
        ...prev,
        daysPerWeek: nextNum,
        days: [...prev.days, newDay],
      };
    });
  };

  const handleRemoveDay = (dayIdx: number) => {
    handleUpdateCurrentRoutine((prev) => {
      const updatedDays = [...prev.days];
      updatedDays.splice(dayIdx, 1);
      return {
        ...prev,
        daysPerWeek: updatedDays.length,
        days: updatedDays,
      };
    });
  };

  const handleAddExerciseToDay = (dayIdx: number, exerciseName: string) => {
    handleUpdateCurrentRoutine((prev) => {
      const updatedDays = [...prev.days];
      const targetDay = updatedDays[dayIdx];
      const newEx: RoutineExercise = {
        id: `${targetDay.id}-ex-${targetDay.exercises.length + 1}-${Date.now()}`,
        name: exerciseName,
        targetSets: 3,
        targetReps: "8-12",
        targetRpe: 8,
        restSeconds: 90,
      };
      targetDay.exercises.push(newEx);
      return { ...prev, days: updatedDays };
    });
  };

  const handleRemoveExerciseFromDay = (dayIdx: number, exIdx: number) => {
    handleUpdateCurrentRoutine((prev) => {
      const updatedDays = [...prev.days];
      updatedDays[dayIdx].exercises.splice(exIdx, 1);
      return { ...prev, days: updatedDays };
    });
  };

  const handleUpdateExerciseValue = (
    dayIdx: number,
    exIdx: number,
    field: "name" | "targetSets" | "targetReps" | "targetRpe" | "restSeconds",
    val: unknown,
  ) => {
    handleUpdateCurrentRoutine((prev) => {
      const updatedDays = [...prev.days];
      const targetEx = updatedDays[dayIdx].exercises[exIdx];
      if (field === "targetSets") targetEx.targetSets = Number(val) || 1;
      if (field === "targetReps") targetEx.targetReps = String(val);
      if (field === "targetRpe") targetEx.targetRpe = Number(val) || 8;
      if (field === "restSeconds") targetEx.restSeconds = Number(val) || 90;
      return { ...prev, days: updatedDays };
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Navigation Sub-Header */}
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
                Custom Architecture
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
              Workout Routine Builder
            </h1>
          </div>
        </div>

        {/* Global Save Trigger */}
        <div className="flex items-center gap-3">
          {saveMessage && (
            <span className="text-xs font-mono text-cyan-400 animate-fade-in">
              {saveMessage}
            </span>
          )}
          <ActionButton
            onClick={handleSaveAll}
            disabled={isSaving}
            className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs uppercase tracking-wider"
          >
            <Save className="w-4 h-4 mr-1.5" />
            {isSaving ? "Saving..." : "Save Routines"}
          </ActionButton>
        </div>
      </div>

      {/* Routine Selector Bar & Template Presets */}
      <Card level="elevated" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold uppercase font-mono text-zinc-300">
              My Workout Routines ({customRoutines.length})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleCreateNewRoutine("custom", 4)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-semibold transition"
            >
              <Plus className="w-3.5 h-3.5" /> New Blank Split
            </button>
          </div>
        </div>

        {/* Routine Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {customRoutines.map((routine) => {
            const isSelected = routine.id === currentRoutine?.id;
            const isActive = routine.id === activeRoutineId;
            return (
              <button
                key={routine.id}
                type="button"
                onClick={() => setSelectedRoutineId(routine.id)}
                className={cn(
                  "flex items-center gap-2.5 px-4 py-2 rounded-xl border text-xs font-mono font-semibold whitespace-nowrap transition",
                  isSelected
                    ? "bg-cyan-500/15 border-cyan-500/50 text-cyan-300 shadow-md"
                    : "bg-white/[0.02] border-white/10 text-zinc-400 hover:text-white hover:border-white/20",
                )}
              >
                <span>{routine.name}</span>
                {isActive && (
                  <span className="px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-300 text-[9px] font-bold border border-green-500/40">
                    ACTIVE
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Clone Templates Accordion */}
        <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
          <span className="text-[10px] font-bold uppercase font-mono tracking-widest text-zinc-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> 1-Click Template Cloners:
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESET_ROUTINE_TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => handleCloneTemplate(tmpl.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/10 text-zinc-300 border border-white/10 text-xs font-mono transition"
              >
                <Copy className="w-3 h-3 text-cyan-400" />
                Clone {tmpl.name} ({tmpl.daysPerWeek}D)
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Routine Detail Workspace */}
      {currentRoutine && (
        <div className="space-y-6">
          {/* Routine Meta Information Card */}
          <Card level="base" className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1 flex-1 min-w-[240px]">
                <label className="text-[10px] uppercase font-mono text-zinc-500 block">
                  Routine Name
                </label>
                <input
                  type="text"
                  value={currentRoutine.name}
                  onChange={(e) =>
                    handleUpdateCurrentRoutine((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full h-10 px-3 rounded-xl border border-white/10 bg-white/[0.03] font-display text-lg font-bold text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex items-center gap-3">
                {/* Active Toggle */}
                <button
                  type="button"
                  onClick={() => handleSetActiveRoutine(currentRoutine.id)}
                  className={cn(
                    "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-mono font-bold transition",
                    currentRoutine.id === activeRoutineId
                      ? "bg-green-500/20 text-green-300 border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.2)]"
                      : "bg-white/[0.02] text-zinc-400 border-white/10 hover:text-white",
                  )}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {currentRoutine.id === activeRoutineId
                    ? "Active Schedule"
                    : "Set as Active Routine"}
                </button>

                {/* Delete Button */}
                {customRoutines.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleDeleteRoutine(currentRoutine.id)}
                    className="p-2.5 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-red-500/10 hover:border-red-500/30 text-zinc-500 hover:text-red-400 transition"
                    title="Delete Routine"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </Card>

          {/* Routine Days List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-display text-lg font-bold text-white">
                Workout Days ({currentRoutine.days.length})
              </h3>
              <button
                type="button"
                onClick={handleAddDay}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-semibold transition"
              >
                <Plus className="w-3.5 h-3.5" /> Add Day
              </button>
            </div>

            {currentRoutine.days.map((day, dayIdx) => (
              <Card key={day.id} level="base" className="space-y-4">
                {/* Day Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
                  <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[200px]">
                    <span className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-mono font-bold text-xs flex items-center justify-center">
                      D{dayIdx + 1}
                    </span>
                    <input
                      type="text"
                      value={day.dayName}
                      onChange={(e) =>
                        handleUpdateCurrentRoutine((prev) => {
                          const updated = [...prev.days];
                          updated[dayIdx].dayName = e.target.value;
                          return { ...prev, days: updated };
                        })
                      }
                      className="h-9 px-2.5 rounded-lg border border-white/10 bg-white/[0.03] text-sm font-bold text-white font-display focus:border-cyan-400 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Focus (e.g. Chest & Triceps)"
                      value={day.focus}
                      onChange={(e) =>
                        handleUpdateCurrentRoutine((prev) => {
                          const updated = [...prev.days];
                          updated[dayIdx].focus = e.target.value;
                          return { ...prev, days: updated };
                        })
                      }
                      className="h-9 px-2.5 rounded-lg border border-white/10 bg-white/[0.03] text-xs font-mono text-zinc-300 focus:border-cyan-400 focus:outline-none flex-1"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setExercisePickerDayIndex(dayIdx)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-mono font-bold transition shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Exercise
                    </button>

                    {currentRoutine.days.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveDay(dayIdx)}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Day Exercise List */}
                <div className="space-y-2">
                  <div className="grid grid-cols-[1fr_80px_90px_80px_40px] gap-2 text-[10px] uppercase font-mono text-zinc-400 px-2">
                    <span>Exercise</span>
                    <span className="text-center">Sets</span>
                    <span className="text-center">Reps</span>
                    <span className="text-center">Rest</span>
                    <span />
                  </div>

                  {day.exercises.map((ex, exIdx) => {
                    const detail = getExerciseDetail(ex.name);
                    return (
                      <div
                        key={ex.id}
                        className="grid grid-cols-[1fr_80px_90px_80px_40px] gap-2 items-center p-2.5 rounded-xl border border-white/5 bg-white/[0.01] hover:border-white/15 transition"
                      >
                        {/* Exercise Name & Preview */}
                        <div className="flex items-center gap-3 min-w-0">
                          <Image
                            src={detail.imageUrl}
                            alt={detail.imageAlt}
                            width={48}
                            height={36}
                            unoptimized
                            className="h-9 w-12 rounded-lg border border-white/10 object-cover shrink-0"
                          />
                          <div className="min-w-0">
                            <h5 className="font-display text-sm font-bold text-white truncate">
                              {ex.name}
                            </h5>
                            <span className="text-[10px] font-mono text-zinc-500 truncate block">
                              {detail.bodyPart} · {detail.equipment}
                            </span>
                          </div>
                        </div>

                        {/* Sets Input */}
                        <input
                          type="number"
                          min={1}
                          max={20}
                          value={ex.targetSets}
                          onChange={(e) =>
                            handleUpdateExerciseValue(dayIdx, exIdx, "targetSets", e.target.value)
                          }
                          className="h-8 rounded-lg border border-white/10 bg-white/[0.04] text-xs font-mono font-bold text-center text-white focus:border-cyan-400 focus:outline-none"
                        />

                        {/* Reps Input */}
                        <input
                          type="text"
                          value={ex.targetReps}
                          onChange={(e) =>
                            handleUpdateExerciseValue(dayIdx, exIdx, "targetReps", e.target.value)
                          }
                          className="h-8 rounded-lg border border-white/10 bg-white/[0.04] text-xs font-mono font-bold text-center text-white focus:border-cyan-400 focus:outline-none"
                        />

                        {/* Rest Input */}
                        <input
                          type="number"
                          step={15}
                          min={0}
                          max={600}
                          value={ex.restSeconds || 90}
                          onChange={(e) =>
                            handleUpdateExerciseValue(dayIdx, exIdx, "restSeconds", e.target.value)
                          }
                          className="h-8 rounded-lg border border-white/10 bg-white/[0.04] text-xs font-mono font-bold text-center text-white focus:border-cyan-400 focus:outline-none"
                        />

                        {/* Delete Exercise */}
                        <button
                          type="button"
                          onClick={() => handleRemoveExerciseFromDay(dayIdx, exIdx)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Exercise Picker Modal */}
      {exercisePickerDayIndex !== null && (
        <div className="fixed inset-0 z-60 bg-black/85 p-3 sm:p-6 backdrop-blur-md flex items-center justify-center overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#0d0d18] border border-white/15 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 my-auto max-h-[95vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase font-mono tracking-widest text-cyan-400">
                  Catalog Browser
                </span>
                <h4 className="font-display text-xl font-bold text-white">
                  Add Exercise to Day {exercisePickerDayIndex + 1}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setExercisePickerDayIndex(null)}
                className="p-2 text-zinc-400 hover:text-white rounded-xl"
              >
                ✕
              </button>
            </div>

            {/* Search and Filters */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search exercises by name..."
                  value={exerciseSearchQuery}
                  onChange={(e) => setExerciseSearchQuery(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-white/10 bg-white/[0.04] text-sm text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {["All", "Chest", "Back", "Shoulders", "Arms", "Legs", "Abs", "Calves"].map((muscle) => (
                  <button
                    key={muscle}
                    type="button"
                    onClick={() => setSelectedMuscleFilter(muscle)}
                    className={cn(
                      "px-3 py-1 rounded-lg border font-mono transition",
                      selectedMuscleFilter === muscle
                        ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-300"
                        : "border-white/5 bg-white/[0.02] text-zinc-400 hover:text-white",
                    )}
                  >
                    {muscle}
                  </button>
                ))}
              </div>
            </div>

            {/* Catalog List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredCatalogExercises.slice(0, 30).map((item) => {
                const detail = getExerciseDetail(item.name);
                return (
                  <div
                    key={item.name}
                    onClick={() => {
                      handleAddExerciseToDay(exercisePickerDayIndex, item.name);
                      setExercisePickerDayIndex(null);
                    }}
                    className="p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:border-cyan-500/40 hover:bg-cyan-500/5 cursor-pointer flex items-center justify-between gap-3 group transition"
                  >
                    <div className="flex items-center gap-3">
                      <Image
                        src={detail.imageUrl}
                        alt={detail.imageAlt}
                        width={52}
                        height={40}
                        unoptimized
                        className="h-10 w-14 rounded-lg border border-white/10 object-cover shrink-0"
                      />
                      <div>
                        <h5 className="font-display text-sm font-bold text-white group-hover:text-cyan-300 transition">
                          {item.name}
                        </h5>
                        <p className="text-xs text-zinc-500 font-mono">
                          {detail.bodyPart} · {detail.equipment} · {detail.exerciseType}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-lg bg-white/5 group-hover:bg-cyan-500 group-hover:text-black text-xs font-mono font-semibold text-zinc-300 transition"
                    >
                      Add
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
