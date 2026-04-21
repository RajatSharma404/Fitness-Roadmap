"use client";

import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import { Search, X, Plus } from "lucide-react";
import {
  ActionButton,
  Card,
  SectionHeader,
} from "@/components/shared/UIPrimitives";
import { Skeleton } from "@/components/shared/Skeleton";
import { useLazyLoad } from "@/hooks/useLazyLoad";
import {
  getExerciseImageDataUrl,
  getBodyPartExerciseCatalog,
  getExerciseDetail,
  getExerciseSearchTerms,
  getRelatedExercises,
} from "@/lib/planEnhancements";

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

export default function LibraryPage() {
  const catalog = useMemo(() => getBodyPartExerciseCatalog(), []);
  const [selectedBodyPart, setSelectedBodyPart] = useState<string>("All");
  const [selectedModality, setSelectedModality] = useState<string>("All");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [query, setQuery] = useState("");
  const [activeExercise, setActiveExercise] = useState<string | null>(null);
  const [addedExercises, setAddedExercises] = useState<Set<string>>(() =>
    parseAddedExercises(),
  );
  const [scrollTop, setScrollTop] = useState(0);

  const VIRTUAL_ROW_HEIGHT = 152;
  const VIRTUAL_VIEWPORT_HEIGHT = 640;
  const VIRTUAL_OVERSCAN = 6;

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
      const typeMatch =
        selectedType === "All" ||
        getExerciseDetail(exercise.name).exerciseType === selectedType;
      const normalizedQuery = query
        .toLowerCase()
        .replace(/[\-_/]+/g, " ")
        .replace(/[^a-z0-9 ]+/g, "")
        .replace(/\s+/g, " ")
        .trim();
      const queryMatch =
        normalizedQuery.length === 0 ||
        getExerciseSearchTerms(exercise.name).some((term) =>
          term.includes(normalizedQuery),
        );
      return bodyMatch && modalityMatch && typeMatch && queryMatch;
    });
  }, [catalog, query, selectedBodyPart, selectedModality, selectedType]);

  const activeDetail = activeExercise
    ? getExerciseDetail(activeExercise)
    : null;

  const startIndex = Math.max(
    0,
    Math.floor(scrollTop / VIRTUAL_ROW_HEIGHT) - VIRTUAL_OVERSCAN,
  );
  const endIndex = Math.min(
    exercises.length,
    Math.ceil((scrollTop + VIRTUAL_VIEWPORT_HEIGHT) / VIRTUAL_ROW_HEIGHT) +
      VIRTUAL_OVERSCAN,
  );
  const visibleExercises = exercises.slice(startIndex, endIndex);
  const virtualTotalHeight = exercises.length * VIRTUAL_ROW_HEIGHT;

  // Handle keyboard navigation and Esc to close
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && activeExercise) {
        setActiveExercise(null);
        return;
      }

      if (!activeExercise) return;

      const currentIndex = exercises.findIndex(
        (ex) => ex.name === activeExercise,
      );
      if (currentIndex < 0) return;

      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        const nextIndex = (currentIndex + 1) % exercises.length;
        setActiveExercise(exercises[nextIndex]?.name ?? null);
      }

      if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        const prevIndex =
          currentIndex - 1 < 0 ? exercises.length - 1 : currentIndex - 1;
        setActiveExercise(exercises[prevIndex]?.name ?? null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
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
        <div className="flex flex-wrap gap-2">
          {["All", "Compound", "Isolation"].map((type) => {
            const typeValue = type === "All" ? "All" : type.toLowerCase();
            return (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedType(typeValue)}
                className={`rounded-full border px-3 py-2 text-sm ${selectedType === typeValue ? "border-lime-400 bg-lime-400/10 text-lime-300" : "border-[rgba(255,255,255,0.06)] text-[#636380]"}`}
              >
                {type}
              </button>
            );
          })}
        </div>
      </Card>

      {exercises.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-12">
          <p className="text-center text-[#636380]">
            No exercises match your filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSelectedBodyPart("All");
              setSelectedModality("All");
              setSelectedType("All");
            }}
            className="rounded-lg border border-cyan-400/40 px-4 py-2 text-sm text-cyan-300 hover:bg-cyan-400/5"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <Card level="base" className="space-y-3 p-3">
          <div className="flex items-center justify-between px-1 text-xs uppercase tracking-[0.16em] text-[#636380]">
            <span>{exercises.length} exercises</span>
            <span>Virtualized list active</span>
          </div>
          <div
            className="h-160 overflow-y-auto rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-2"
            onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
          >
            <div style={{ height: virtualTotalHeight, position: "relative" }}>
              {visibleExercises.map((exercise, offset) => {
                const index = startIndex + offset;
                return (
                  <div
                    key={`${exercise.bodyPart}-${exercise.modality}-${exercise.name}-${index}`}
                    style={{
                      position: "absolute",
                      top: index * VIRTUAL_ROW_HEIGHT,
                      left: 0,
                      right: 0,
                      paddingBottom: 8,
                    }}
                  >
                    <ExerciseCardWithLazyLoad
                      exercise={exercise}
                      onSelect={() => setActiveExercise(exercise.name)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}

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
              {activeExercise && addedExercises.has(activeExercise) && (
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
                <p className="mt-2 text-xs uppercase tracking-[0.2em]">Type</p>
                <div className="mt-1 inline-flex rounded-full bg-lime-400/10 px-2 py-1 text-xs text-lime-300">
                  {activeDetail.exerciseType === "compound" ? "💪" : "🎯"}{" "}
                  {activeDetail.exerciseType}
                </div>
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
              <Card level="base">
                <p className="text-xs uppercase tracking-[0.2em]">
                  Related Exercises
                </p>
                <div className="mt-2 space-y-1">
                  {getRelatedExercises(activeDetail.name, 3).map((related) => (
                    <button
                      key={related}
                      type="button"
                      onClick={() => setActiveExercise(related)}
                      className="block w-full text-left rounded-md border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-2 text-sm text-cyan-300 transition hover:border-cyan-400/40 hover:bg-cyan-400/5"
                    >
                      {related}
                    </button>
                  ))}
                </div>
              </Card>
              <ActionButton
                className="w-full"
                onClick={handleAddToWorkout}
                disabled={Boolean(
                  activeExercise && addedExercises.has(activeExercise),
                )}
              >
                <Plus className="h-4 w-4" />
                {activeExercise && addedExercises.has(activeExercise)
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

function ExerciseCardWithLazyLoad({
  exercise,
  onSelect,
}: {
  exercise: {
    name: string;
    bodyPart: string;
    modality: "Bodyweight" | "Machine";
  };
  onSelect: () => void;
}) {
  const { ref, isInView } = useLazyLoad({ threshold: 0.1 });
  const [imageLoaded, setImageLoaded] = useState(false);

  const localBodyPartColors: Record<string, string> = {
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

  return (
    <div ref={ref}>
      {isInView ? (
        <button
          type="button"
          onClick={onSelect}
          className="group w-full overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.06)] text-left transition hover:-translate-y-0.5 hover:border-cyan-400/40"
        >
          <div
            className={`h-24 bg-linear-to-br ${localBodyPartColors[exercise.bodyPart] ?? "from-cyan-400/50 to-slate-400/20"} relative p-4`}
          >
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/90">
              {exercise.bodyPart}
            </p>
            {!imageLoaded && (
              <Skeleton className="absolute inset-x-4 top-14 h-18 w-32 rounded-md" />
            )}
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
              className={`mt-2 h-18 w-32 rounded-md border border-white/10 object-cover transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
              onLoad={() => setImageLoaded(true)}
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
      ) : (
        // Show skeleton while not in view
        <div className="overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.06)]">
          <div className="h-24 bg-linear-to-br from-cyan-400/20 to-slate-400/5 p-4">
            <Skeleton className="mb-2 h-4 w-20" />
            <Skeleton className="h-18 w-32 rounded-md" />
          </div>
          <div className="space-y-2 bg-bg-surface p-4">
            <Skeleton className="h-6 w-24" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
