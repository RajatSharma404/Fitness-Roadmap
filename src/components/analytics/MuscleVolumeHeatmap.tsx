"use client";

import { useState } from "react";
import Image from "next/image";
import { Info, Sparkles, AlertTriangle, CheckCircle2, Flame, ShieldAlert } from "lucide-react";
import { MuscleVolumeProgress, VolumeStatus } from "@/lib/volumeLandmarks";
import { cn } from "@/lib/cn";

const frontMuscles = [
  { id: "chest", label: "chest", muscleKey: "chest", paths: ["36,25 64,25 62,35 38,35"] },
  { id: "abs", label: "abs", muscleKey: "abs", paths: ["42,36 58,36 56,50 44,50"] },
  { id: "shoulder_l_f", label: "shoulders", muscleKey: "shoulders", paths: ["28,22 36,22 34,30 26,30"] },
  { id: "shoulder_r_f", label: "shoulders", muscleKey: "shoulders", paths: ["64,22 72,22 74,30 66,30"] },
  { id: "biceps_l", label: "biceps", muscleKey: "biceps", paths: ["24,32 31,32 29,44 21,44"] },
  { id: "biceps_r", label: "biceps", muscleKey: "biceps", paths: ["69,32 76,32 79,44 71,44"] },
  { id: "quad_l", label: "quads", muscleKey: "quads", paths: ["36,55 48,55 44,75 32,75"] },
  { id: "quad_r", label: "quads", muscleKey: "quads", paths: ["52,55 64,55 68,75 56,75"] },
];

const backMuscles = [
  { id: "back", label: "back", muscleKey: "back", paths: ["35,22 65,22 58,45 42,45"] },
  { id: "shoulder_l_b", label: "shoulders", muscleKey: "shoulders", paths: ["26,22 34,22 32,30 24,30"] },
  { id: "shoulder_r_b", label: "shoulders", muscleKey: "shoulders", paths: ["66,22 74,22 76,30 68,30"] },
  { id: "triceps_l", label: "triceps", muscleKey: "triceps", paths: ["22,32 30,32 28,44 20,44"] },
  { id: "triceps_r", label: "triceps", muscleKey: "triceps", paths: ["70,32 78,32 80,44 72,44"] },
  { id: "glutes", label: "glutes", muscleKey: "glutes", paths: ["40,48 60,48 58,60 42,60"] },
  { id: "hamstring_l", label: "hamstrings", muscleKey: "hamstrings", paths: ["38,62 48,62 45,78 35,78"] },
  { id: "hamstring_r", label: "hamstrings", muscleKey: "hamstrings", paths: ["52,62 62,62 65,78 55,78"] },
  { id: "calves_l", label: "calves", muscleKey: "calves", paths: ["36,80 44,80 41,95 33,95"] },
  { id: "calves_r", label: "calves", paths: ["56,80 64,80 67,95 59,95"], muscleKey: "calves" },
];

interface MuscleVolumeHeatmapProps {
  volumeData: Record<string, MuscleVolumeProgress>;
}

export function MuscleVolumeHeatmap({ volumeData }: MuscleVolumeHeatmapProps) {
  const [view, setView] = useState<"front" | "back">("front");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [selectedMuscle, setSelectedMuscle] = useState<string>("chest");

  const activeMuscles = view === "front" ? frontMuscles : backMuscles;
  const imageSrc = `/images/body-${gender}-${view}.png`;

  const activeProgress = volumeData[selectedMuscle] || volumeData.chest;

  const getStatusColor = (status: VolumeStatus) => {
    switch (status) {
      case "optimal":
        return {
          bg: "rgba(34, 197, 94, 0.45)",
          border: "rgba(34, 197, 94, 0.8)",
          text: "text-green-400",
          label: "Optimal Growth (MAV)",
        };
      case "maintenance":
        return {
          bg: "rgba(59, 130, 246, 0.35)",
          border: "rgba(59, 130, 246, 0.7)",
          text: "text-blue-400",
          label: "Maintenance (MEV)",
        };
      case "overreaching":
        return {
          bg: "rgba(245, 158, 11, 0.45)",
          border: "rgba(245, 158, 11, 0.8)",
          text: "text-amber-400",
          label: "Overreaching (Near MRV)",
        };
      case "overtraining":
        return {
          bg: "rgba(239, 68, 68, 0.55)",
          border: "rgba(239, 68, 68, 0.9)",
          text: "text-red-400",
          label: "Overtraining (> MRV)",
        };
      default:
        return {
          bg: "rgba(100, 116, 139, 0.25)",
          border: "rgba(100, 116, 139, 0.5)",
          text: "text-zinc-400",
          label: "Under-stimulated (< MEV)",
        };
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      {/* 2D Body Map View Container */}
      <div className="space-y-4">
        {/* Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex rounded-xl bg-white/[0.03] p-1 border border-white/10">
              <button
                type="button"
                onClick={() => setView("front")}
                className={cn(
                  "rounded-lg px-3 py-1 text-xs font-mono font-semibold uppercase transition",
                  view === "front" ? "bg-cyan-500/20 text-cyan-300" : "text-zinc-400 hover:text-white",
                )}
              >
                Front View
              </button>
              <button
                type="button"
                onClick={() => setView("back")}
                className={cn(
                  "rounded-lg px-3 py-1 text-xs font-mono font-semibold uppercase transition",
                  view === "back" ? "bg-cyan-500/20 text-cyan-300" : "text-zinc-400 hover:text-white",
                )}
              >
                Back View
              </button>
            </div>

            <div className="flex rounded-xl bg-white/[0.03] p-1 border border-white/10">
              <button
                type="button"
                onClick={() => setGender("male")}
                className={cn(
                  "rounded-lg px-3 py-1 text-xs font-mono font-semibold uppercase transition",
                  gender === "male" ? "bg-cyan-500/20 text-cyan-300" : "text-zinc-400 hover:text-white",
                )}
              >
                Male
              </button>
              <button
                type="button"
                onClick={() => setGender("female")}
                className={cn(
                  "rounded-lg px-3 py-1 text-xs font-mono font-semibold uppercase transition",
                  gender === "female" ? "bg-cyan-500/20 text-cyan-300" : "text-zinc-400 hover:text-white",
                )}
              >
                Female
              </button>
            </div>
          </div>

          {/* Volume Status Legend */}
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
            <span className="flex items-center gap-1 text-zinc-400">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500/50" /> &lt;MEV
            </span>
            <span className="flex items-center gap-1 text-blue-400">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> MEV
            </span>
            <span className="flex items-center gap-1 text-green-400">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500" /> MAV (Optimal)
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> MRV
            </span>
          </div>
        </div>

        {/* Visual Heatmap Frame */}
        <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#0d0d18] shadow-2xl">
          <Image
            src={imageSrc}
            alt={`Muscle model ${view}`}
            fill
            className="object-cover opacity-80"
          />

          {/* SVG Heatmap Overlays */}
          <svg className="absolute inset-0 h-full w-full pointer-events-auto" viewBox="0 0 100 100">
            {activeMuscles.map((muscle) => {
              const data = volumeData[muscle.muscleKey];
              const status = data ? data.status : "understimulated";
              const colors = getStatusColor(status);
              const isSelected = selectedMuscle === muscle.muscleKey;

              return (
                <g key={muscle.id} className="cursor-pointer" onClick={() => setSelectedMuscle(muscle.muscleKey)}>
                  {muscle.paths.map((points, pIdx) => (
                    <polygon
                      key={`${muscle.id}-${pIdx}`}
                      points={points}
                      fill={colors.bg}
                      stroke={isSelected ? "#22d3ee" : colors.border}
                      strokeWidth={isSelected ? 1.5 : 0.8}
                      className="transition-all hover:opacity-90 hover:stroke-cyan-300"
                    />
                  ))}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Muscle Detail Inspector Card */}
      {activeProgress && (
        <div className="space-y-4">
          <div className="p-5 rounded-3xl border border-white/10 bg-white/[0.02] space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase font-mono tracking-widest text-cyan-400">
                  Muscle Diagnostic
                </span>
                <h3 className="text-2xl font-bold font-display text-white mt-0.5">
                  {activeProgress.label}
                </h3>
              </div>
              <span
                className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider border",
                  getStatusColor(activeProgress.status).text,
                  activeProgress.status === "optimal"
                    ? "bg-green-500/10 border-green-500/40"
                    : activeProgress.status === "overreaching"
                      ? "bg-amber-500/10 border-amber-500/40"
                      : "bg-white/5 border-white/10",
                )}
              >
                {activeProgress.status}
              </span>
            </div>

            {/* Weekly Volume Stat */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between font-mono">
              <div>
                <span className="text-[10px] uppercase text-zinc-400 block">Weekly Sets</span>
                <span className="text-xl font-bold text-white">
                  {activeProgress.totalEffectiveSets} <span className="text-xs text-zinc-500">sets/7d</span>
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase text-zinc-400 block">Direct / Indirect</span>
                <span className="text-sm font-semibold text-zinc-300">
                  {activeProgress.directSets}d / {activeProgress.indirectSets}i
                </span>
              </div>
            </div>

            {/* Landmark Progress Gauge */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                <span>MEV: {activeProgress.landmarks.mev}</span>
                <span className="text-green-400 font-bold">
                  MAV: {activeProgress.landmarks.mavMin}-{activeProgress.landmarks.mavMax}
                </span>
                <span>MRV: {activeProgress.landmarks.mrv}</span>
              </div>

              {/* Progress Bar with Landmarks */}
              <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden relative border border-white/10">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    activeProgress.status === "optimal"
                      ? "bg-green-400 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                      : activeProgress.status === "overreaching"
                        ? "bg-amber-400"
                        : activeProgress.status === "overtraining"
                          ? "bg-red-400"
                          : "bg-cyan-400",
                  )}
                  style={{
                    width: `${Math.min(100, (activeProgress.totalEffectiveSets / activeProgress.landmarks.mrv) * 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* Coaching Prescription */}
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5 text-xs text-zinc-300">
              <span className="font-mono text-[10px] uppercase font-bold text-cyan-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400" /> Hypertrophy Recommendation:
              </span>
              <p>
                {activeProgress.status === "optimal"
                  ? `You are in the sweet spot for ${activeProgress.label} hypertrophy (${activeProgress.totalEffectiveSets} sets). Maintain this volume.`
                  : activeProgress.status === "understimulated"
                    ? `Add ${Math.max(1, activeProgress.landmarks.mavMin - activeProgress.totalEffectiveSets)} more working sets this week to hit optimal adaptive hypertrophy (MAV).`
                    : activeProgress.status === "maintenance"
                      ? `Volume is sufficient for maintenance, but add 2-4 more sets to accelerate new muscle protein synthesis.`
                      : `Fatigue accumulation is high on ${activeProgress.label}. Allow at least ${activeProgress.landmarks.recoveryTimeHours}h recovery before training this muscle group again.`}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
