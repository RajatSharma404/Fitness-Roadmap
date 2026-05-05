"use client";

import { cn } from "@/lib/cn";

const muscleGroups = [
  "chest",
  "back",
  "shoulders",
  "biceps",
  "triceps",
  "forearms",
  "abs",
  "obliques",
  "quads",
  "hamstrings",
  "glutes",
  "calves",
] as const;

interface BodyMapProps {
  selected: Set<string>;
  onToggle: (muscleGroup: string) => void;
}

export function BodyMap({ selected, onToggle }: BodyMapProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2 md:grid-cols-4">
        {muscleGroups.map((muscle) => (
          <button
            key={muscle}
            type="button"
            onClick={() => onToggle(muscle)}
            className={cn(
              "rounded-lg border px-3 py-2 text-xs font-medium uppercase tracking-widest transition",
              selected.has(muscle)
                ? "border-cyan-400 bg-cyan-400/10 text-cyan-300"
                : "border-[rgba(255,255,255,0.06)] text-[#636380] hover:border-cyan-400/40 hover:bg-[rgba(255,255,255,0.03)]",
            )}
          >
            {muscle}
          </button>
        ))}
      </div>
      <div className="text-xs text-[#636380]">
        {selected.size > 0 ? (
          <p>
            Filtering by: <span className="text-cyan-300">{selected.size}</span>{" "}
            muscle group{selected.size !== 1 ? "s" : ""}
          </p>
        ) : (
          <p>Tap a muscle to filter exercises</p>
        )}
      </div>
    </div>
  );
}
