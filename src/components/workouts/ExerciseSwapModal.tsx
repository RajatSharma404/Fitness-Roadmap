"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { X, Search, RefreshCw, Sparkles, Dumbbell, Filter } from "lucide-react";
import {
  getExerciseDetail,
  getRelatedExercises,
  getBodyPartExerciseCatalog,
  ExerciseDetail,
} from "@/lib/planEnhancements";
import { cn } from "@/lib/cn";

interface ExerciseSwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentExerciseName: string;
  onSelectReplacement: (newExerciseName: string) => void;
}

export function ExerciseSwapModal({
  isOpen,
  onClose,
  currentExerciseName,
  onSelectReplacement,
}: ExerciseSwapModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModality, setSelectedModality] = useState<string>("All");

  const currentDetail = useMemo(
    () => getExerciseDetail(currentExerciseName),
    [currentExerciseName],
  );

  const directAlternatives = useMemo(() => {
    return currentDetail.alternatives || [];
  }, [currentDetail]);

  const relatedExercises = useMemo(() => {
    return getRelatedExercises(currentExerciseName, 6);
  }, [currentExerciseName]);

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

  const filteredCatalog = useMemo(() => {
    if (!searchQuery.trim() && selectedModality === "All") return [];

    return allExercises.filter((item) => {
      const matchesSearch =
        !searchQuery.trim() ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.bodyPart.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesModality =
        selectedModality === "All" || item.modality === selectedModality.toLowerCase();
      return matchesSearch && matchesModality && item.name !== currentExerciseName;
    });
  }, [allExercises, searchQuery, selectedModality, currentExerciseName]);

  if (!isOpen) return null;

  const handleSelect = (name: string) => {
    onSelectReplacement(name);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/85 p-3 sm:p-6 backdrop-blur-md flex items-center justify-center overflow-y-auto">
      <div className="w-full max-w-2xl bg-[#0d0d18] border border-white/15 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 my-auto max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest font-mono text-cyan-400">
                Exercise Substitution
              </span>
              <h3 className="text-xl font-bold text-white font-display">
                Swap: {currentExerciseName}
              </h3>
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

        {/* Search Bar */}
        <div className="space-y-3 shrink-0">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by exercise name or muscle (e.g. Dumbbell Bench, Triceps)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-white/10 bg-white/[0.04] text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-zinc-500 font-mono text-[10px] uppercase">Filter:</span>
            {["All", "Machine", "Bodyweight"].map((mod) => (
              <button
                key={mod}
                type="button"
                onClick={() => setSelectedModality(mod)}
                className={cn(
                  "px-3 py-1 rounded-lg border font-mono font-medium transition",
                  selectedModality === mod
                    ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-300"
                    : "border-white/5 bg-white/[0.02] text-zinc-400 hover:text-white",
                )}
              >
                {mod}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Alternatives Content */}
        <div className="flex-1 overflow-y-auto space-y-5 pr-1">
          {/* If Search Query Active: Show Search Results */}
          {searchQuery.trim().length > 0 ? (
            <div className="space-y-2">
              <div className="text-[11px] uppercase font-mono font-semibold text-zinc-400 px-1">
                Search Results ({filteredCatalog.length})
              </div>
              {filteredCatalog.length === 0 ? (
                <div className="p-8 text-center text-sm text-zinc-500 bg-white/[0.01] rounded-2xl border border-white/5">
                  No matching exercises found for &quot;{searchQuery}&quot;.
                </div>
              ) : (
                <div className="grid gap-2">
                  {filteredCatalog.slice(0, 15).map((item) => {
                    const detail = getExerciseDetail(item.name);
                    return (
                      <ExerciseSwapRow
                        key={item.name}
                        detail={detail}
                        onSelect={() => handleSelect(item.name)}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Direct Recommended Alternatives */}
              {directAlternatives.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[11px] uppercase font-mono font-semibold text-cyan-400 px-1">
                    <Sparkles className="w-3.5 h-3.5" /> Direct Biomechanical Equivalents
                  </div>
                  <div className="grid gap-2">
                    {directAlternatives.map((altName) => {
                      const detail = getExerciseDetail(altName);
                      return (
                        <ExerciseSwapRow
                          key={altName}
                          detail={detail}
                          isRecommended
                          onSelect={() => handleSelect(altName)}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Same Muscle Group Movement Options */}
              {relatedExercises.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] uppercase font-mono font-semibold text-zinc-400 px-1">
                    Same Muscle Group ({currentDetail.bodyPart})
                  </div>
                  <div className="grid gap-2">
                    {relatedExercises.map((relName) => {
                      const detail = getExerciseDetail(relName);
                      return (
                        <ExerciseSwapRow
                          key={relName}
                          detail={detail}
                          onSelect={() => handleSelect(relName)}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/10 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-semibold text-zinc-400 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function ExerciseSwapRow({
  detail,
  isRecommended,
  onSelect,
}: {
  detail: ExerciseDetail;
  isRecommended?: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        "p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 group select-none",
        isRecommended
          ? "border-cyan-500/30 bg-cyan-500/[0.04] hover:border-cyan-400 hover:bg-cyan-500/10"
          : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]",
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <Image
          src={detail.imageUrl}
          alt={detail.imageAlt}
          width={56}
          height={42}
          unoptimized
          className="h-10 w-14 rounded-xl border border-white/10 object-cover shrink-0"
        />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h5 className="font-display text-sm font-bold text-white group-hover:text-cyan-300 transition truncate">
              {detail.name}
            </h5>
            {isRecommended && (
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shrink-0">
                Recommended
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-400 font-mono truncate">
            {detail.bodyPart} · {detail.equipment} · {detail.exerciseType}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        className="shrink-0 px-3 py-1.5 rounded-lg bg-white/5 group-hover:bg-cyan-500 group-hover:text-black text-zinc-300 font-mono text-xs font-semibold transition"
      >
        Select
      </button>
    </div>
  );
}
