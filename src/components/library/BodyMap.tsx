"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/cn";

const frontMuscles = [
  { id: "chest", label: "chest", paths: ["36,25 64,25 62,35 38,35"] },
  { id: "abs", label: "abs", paths: ["42,36 58,36 56,50 44,50"] },
  { id: "obliques_l", label: "obliques", paths: ["36,36 41,36 43,48 35,48"] },
  { id: "obliques_r", label: "obliques", paths: ["59,36 64,36 65,48 57,48"] },
  { id: "shoulder_l_f", label: "shoulders", paths: ["28,22 36,22 34,30 26,30"] },
  { id: "shoulder_r_f", label: "shoulders", paths: ["64,22 72,22 74,30 66,30"] },
  { id: "biceps_l", label: "biceps", paths: ["24,32 31,32 29,44 21,44"] },
  { id: "biceps_r", label: "biceps", paths: ["69,32 76,32 79,44 71,44"] },
  { id: "forearm_l_f", label: "forearms", paths: ["18,46 27,46 24,58 14,58"] },
  { id: "forearm_r_f", label: "forearms", paths: ["73,46 82,46 86,58 76,58"] },
  { id: "quad_l", label: "quads", paths: ["36,55 48,55 44,75 32,75"] },
  { id: "quad_r", label: "quads", paths: ["52,55 64,55 68,75 56,75"] },
];

const backMuscles = [
  { id: "back", label: "back", paths: ["35,22 65,22 58,45 42,45"] },
  { id: "shoulder_l_b", label: "shoulders", paths: ["26,22 34,22 32,30 24,30"] },
  { id: "shoulder_r_b", label: "shoulders", paths: ["66,22 74,22 76,30 68,30"] },
  { id: "triceps_l", label: "triceps", paths: ["22,32 30,32 28,44 20,44"] },
  { id: "triceps_r", label: "triceps", paths: ["70,32 78,32 80,44 72,44"] },
  { id: "forearm_l_b", label: "forearms", paths: ["16,46 26,46 22,58 12,58"] },
  { id: "forearm_r_b", label: "forearms", paths: ["74,46 84,46 88,58 78,58"] },
  { id: "glutes", label: "glutes", paths: ["40,48 60,48 58,60 42,60"] },
  { id: "hamstring_l", label: "hamstrings", paths: ["38,62 48,62 45,78 35,78"] },
  { id: "hamstring_r", label: "hamstrings", paths: ["52,62 62,62 65,78 55,78"] },
  { id: "calves_l", label: "calves", paths: ["36,80 44,80 41,95 33,95"] },
  { id: "calves_r", label: "calves", paths: ["56,80 64,80 67,95 59,95"] },
];

interface BodyMapProps {
  selected: Set<string>;
  onToggle: (muscleGroup: string) => void;
}

export function BodyMap({ selected, onToggle }: BodyMapProps) {
  const [view, setView] = useState<"front" | "back">("front");
  const [hoveredMuscle, setHoveredMuscle] = useState<string | null>(null);

  const activeMuscles = view === "front" ? frontMuscles : backMuscles;
  const imageSrc = view === "front" ? "/images/body-front.png" : "/images/body-back.png";

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2 rounded-lg bg-[rgba(255,255,255,0.02)] p-1 border border-[rgba(255,255,255,0.06)]">
          <button
            onClick={() => setView("front")}
            className={cn(
              "rounded-md px-4 py-1.5 text-xs font-semibold uppercase tracking-widest transition",
              view === "front" ? "bg-cyan-500/20 text-cyan-300" : "text-[#636380] hover:text-[#eeeef2]"
            )}
          >
            Front
          </button>
          <button
            onClick={() => setView("back")}
            className={cn(
              "rounded-md px-4 py-1.5 text-xs font-semibold uppercase tracking-widest transition",
              view === "back" ? "bg-cyan-500/20 text-cyan-300" : "text-[#636380] hover:text-[#eeeef2]"
            )}
          >
            Back
          </button>
        </div>

        {selected.size > 0 && (
          <button 
            type="button"
            onClick={() => {
              Array.from(selected).forEach(m => onToggle(m));
            }}
            className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-red-400 transition hover:bg-red-500/20"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Interactive Image Container */}
      <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#18181b] shadow-inner group">
        
        <Image 
          src={imageSrc} 
          alt={`Muscular model ${view} view`} 
          fill 
          className="object-cover transition-all duration-500 group-hover:scale-105"
        />

        {/* SVG Overlay for Hitboxes */}
        <svg 
          viewBox="0 0 100 100" 
          preserveAspectRatio="none" 
          className="absolute inset-0 z-10 h-full w-full"
        >
          {activeMuscles.map((muscle) => {
            const isSelected = selected.has(muscle.label);
            const isHovered = hoveredMuscle === muscle.label;
            
            return muscle.paths.map((path, idx) => (
              <polygon
                key={`${muscle.id}-${idx}`}
                points={path}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle(muscle.label);
                }}
                onMouseEnter={() => setHoveredMuscle(muscle.label)}
                onMouseLeave={() => setHoveredMuscle(null)}
                className={cn(
                  "cursor-pointer transition-all duration-300 ease-out",
                  isSelected 
                    ? "fill-cyan-400/50 stroke-cyan-300 stroke-[0.5]" 
                    : isHovered 
                      ? "fill-white/20 stroke-white/50 stroke-[0.5]" 
                      : "fill-transparent stroke-transparent"
                )}
              />
            ));
          })}
        </svg>

        {/* Tooltip */}
        {hoveredMuscle && (
          <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-md border border-cyan-400/30 bg-black/80 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-cyan-300 shadow-xl backdrop-blur-md z-20 transition-all">
            {hoveredMuscle}
          </div>
        )}
      </div>
      
      {/* Context info */}
      <div className="text-center text-xs text-[#636380]">
        <p>Click on the muscles to filter exercises.</p>
        {selected.size > 0 && (
          <p className="mt-1"><span className="text-cyan-300 font-bold">{selected.size}</span> muscle groups selected</p>
        )}
      </div>
    </div>
  );
}
