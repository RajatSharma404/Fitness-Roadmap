"use client";

import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import { Search, X, Plus } from "lucide-react";
import {
  ActionButton,
  Card,
  SectionHeader,
} from "@/components/shared/UIPrimitives";
import {
  getExerciseImageDataUrl,
  getBodyPartExerciseCatalog,
  getExerciseDetail,
} from "@/lib/planEnhancements";

function getExercisePhotoUrl(exerciseName: string, bodyPart: string): string {
  // Try to load real photo, fallback to generated SVG
  const photoName = exerciseName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  // Return pattern that can be extended with real images in public/exercises/
  return `/exercises/${photoName}.jpg`; // Falls back gracefully with error boundary
}

function parseAddedExercises(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const saved = localStorage.getItem("addedExercises");
    return new Set(saved ? JSON.parse(saved) : []);
  } catch {
    return new Set();
  }
}

function saveAddedExercises(exercises: Set<string>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("addedExercises", JSON.stringify(Array.from(exercises)));
}

const bodyPartColors: Record<string, string> = {
  Chest: "from-sky-500/50 to-cyan-400/20",
  Back: "from-violet-500/50 to-fuchsia-400/20",
  Shoulders: "from-amber-500/50 to-yellow-400/20",
  Biceps: "from-emerald-500/50 to-green-400/20",
  Triceps: "from-rose-500/50 to-red-400/20",
  Legs: "from-lime-500/50 to-green-400/20",
  Hamstrings: "from-teal-500/50 to-cyan-400/20",
  Glutes: "from-pink-500/50 to-rose-400/20",
  Core: "from-blue-500/50 to-indigo-400/20",
};

export default function LibraryPage() {
  const catalog = useMemo(() => getBodyPartExerciseCatalog(), []);
  const [selectedBodyPart, setSelectedBodyPart] = useState<string>("All");
  const [selectedModality, setSelectedModality] = useState<string>("All");
  const [query, setQuery] = useState("");
  const [activeExercise, setActiveExercise] = useState<string | null>(null);
  const [addedExercises, setAddedExercises] = useState<Set<string>>(new Set());
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const exercises = useMemo(() => {
    const entries = catalog.flatMap((entry) => [
      ...entry.bodyweight.map((exercise) => ({
        bodyPart: entry.bodyPart,
        modality: "Bodyweight" as const,
        name: exercise,
      })),
      ...entry.machine.map((exercise) => ({
        bodyPart: entry.bodyPart,
        modality: "Machine" as const,
        name: exercise,
      })),
    ]);

    return entries.filter((exercise) => {
      const bodyMatch =
        selectedBodyPart === "All" || exercise.bodyPart === selectedBodyPart;
      const modalityMatch =
        selectedModality === "All" || exercise.modality === selectedModality;
      const queryMatch = exercise.name
        .toLowerCase()
        .includes(query.toLowerCase());
      return bodyMatch && modalityMatch && queryMatch;
    });
  }, [catalog, query, selectedBodyPart, selectedModality]);

  const activeDetail = activeExercise
    ? getExerciseDetail(activeExercise)
    : null;

  // Load added exercises on mount
  useEffect(() => {
    setAddedExercises(parseAddedExercises());
  }, []);

  // Handle keyboard navigation and Esc to close
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && activeExercise) {
        setActiveExercise(null);
        return;
      }

      if (!activeExercise) return;

      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        const nextIndex = (activeIndex + 1) % exercises.length;
        setActiveIndex(nextIndex);
        setActiveExercise(exercises[nextIndex]?.name ?? null);
      }

      if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        const prevIndex =
          activeIndex - 1 < 0 ? exercises.length - 1 : activeIndex - 1;
        setActiveIndex(prevIndex);
        setActiveExercise(exercises[prevIndex]?.name ?? null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeExercise, activeIndex, exercises]);

  // Update activeIndex when exercises change or activeExercise changes
  useEffect(() => {
    if (activeExercise) {
      const idx = exercises.findIndex((ex) => ex.name === activeExercise);
      setActiveIndex(idx);
    }
  }, [activeExercise, exercises]);

  function handleAddToWorkout() {
    if (!activeExercise) return;
    const updated = new Set(addedExercises);
    updated.add(activeExercise);
    setAddedExercises(updated);
    saveAddedExercises(updated);
  }

  return (
    <div className="space-y-6 pb-8">
      <Card level="elevated">
        <SectionHeader
          kicker="Library"
          title="Exercise cards and movement details"
          description="Search by muscle group, filter by equipment, and open any exercise to see form cues."
        />
      </Card>

      <Card level="base" className="space-y-4">
        <div className="grid gap-3 xl:grid-cols-[1fr_auto]">
          <label className="flex items-center gap-3 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] px-4 py-3 text-[#636380]">
            <Search className="h-4 w-4" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search exercises..."
              className="w-full bg-transparent text-[#eeeef2] outline-none placeholder:text-[#636380]"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            {["All", ...catalog.map((entry) => entry.bodyPart)].map((part) => (
              <button
                key={part}
                type="button"
                onClick={() => setSelectedBodyPart(part)}
                className={`rounded-full border px-3 py-2 text-sm ${selectedBodyPart === part ? "border-cyan-400 bg-cyan-400/10 text-cyan-300" : "border-[rgba(255,255,255,0.06)] text-[#636380]"}`}
              >
                {part}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {["All", "Bodyweight", "Machine"].map((modality) => (
            <button
              key={modality}
              type="button"
              onClick={() => setSelectedModality(modality)}
              className={`rounded-full border px-3 py-2 text-sm ${selectedModality === modality ? "border-cyan-400 bg-cyan-400/10 text-cyan-300" : "border-[rgba(255,255,255,0.06)] text-[#636380]"}`}
            >
              {modality}
            </button>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {exercises.map((exercise, index) => (
          <button
            key={`${exercise.bodyPart}-${exercise.modality}-${exercise.name}-${index}`}
            type="button"
            onClick={() => setActiveExercise(exercise.name)}
            className="group overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.06)] text-left transition hover:-translate-y-0.5 hover:border-cyan-400/40"
          >
            <div
              className={`h-24 bg-linear-to-br ${bodyPartColors[exercise.bodyPart] ?? "from-cyan-400/50 to-slate-400/20"} p-4`}
            >
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/90">
                {exercise.bodyPart}
              </p>
              <Image
                src={getExerciseImageDataUrl(
                  exercise.name,
                  exercise.bodyPart,
                  exercise.modality.toLowerCase() as "bodyweight" | "machine",
                )}
                alt={`${exercise.name} preview`}
                width={128}
                height={72}
                unoptimized
                className="mt-2 h-18 w-32 rounded-md border border-white/10 object-cover"
              />
            </div>
            <div className="space-y-2 bg-bg-surface p-4">
              <p className="font-display text-lg font-semibold text-[#eeeef2]">
                {exercise.name}
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-white/5 px-2 py-1 text-[#636380]">
                  {exercise.bodyPart}
                </span>
                <span className="rounded-full bg-white/5 px-2 py-1 text-[#636380]">
                  {exercise.modality}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {activeDetail ? (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={() => setActiveExercise(null)}
        >
          <div
            className="absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto border-l border-[rgba(255,255,255,0.06)] bg-bg-elevated p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="lab-kicker text-[#60a5fa]">Exercise</p>
                <h3 className="font-display text-2xl font-bold text-[#eeeef2]">
                  {activeDetail.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveExercise(null)}
                className="rounded-md border border-[rgba(255,255,255,0.06)] p-2 text-[#eeeef2]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-sm text-[#636380]">
              <Card level="base" className="overflow-hidden p-0">
                <Image
                  src={activeDetail.imageUrl}
                  alt={activeDetail.imageAlt}
                  width={720}
                  height={420}
                  unoptimized
                  className="h-48 w-full object-cover"
                  onError={(e) => {
                    // Fallback: ensure SVG displays if photo fails
                    const img = e.target as HTMLImageElement;
                    if (img.src !== activeDetail.imageUrl) {
                      img.src = activeDetail.imageUrl;
                    }
                  }}
                />
              </Card>
              {addedExercises.has(activeExercise) && (
                <div className="rounded-md border border-green-500/30 bg-green-500/10 p-2 text-xs text-green-300">
                  ✓ Added to your workout
                </div>
              )}
              <Card level="base">
                <p className="text-xs uppercase tracking-[0.2em]">Muscle</p>
                <p className="mt-1 text-[#eeeef2]">{activeDetail.bodyPart}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.2em]">
                  Recommended Reps
                </p>
                <p className="mt-1 text-[#eeeef2]">
                  {activeDetail.recommendedReps}
                </p>
              </Card>
              <Card level="base">
                <p className="text-xs uppercase tracking-[0.2em]">
                  Instructions
                </p>
                <ol className="mt-2 space-y-2 text-[#eeeef2]">
                  {activeDetail.howTo.map((step, index) => (
                    <li key={step} className="flex gap-2">
                      <span className="text-cyan-300">{index + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </Card>
              <Card level="base">
                <p className="text-xs uppercase tracking-[0.2em]">Form Cues</p>
                <ul className="mt-2 space-y-2 text-[#eeeef2]">
                  {activeDetail.commonMistakes.map((mistake) => (
                    <li key={mistake}>• {mistake}</li>
                  ))}
                </ul>
              </Card>
              <ActionButton
                className="w-full"
                onClick={handleAddToWorkout}
                disabled={addedExercises.has(activeExercise)}
              >
                <Plus className="h-4 w-4" />
                {addedExercises.has(activeExercise)
                  ? "Added to Workout"
                  : "Add to Workout"}
              </ActionButton>
              <p className="text-xs text-[#636380]">
                💡 Use arrow keys to navigate · Esc to close
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
