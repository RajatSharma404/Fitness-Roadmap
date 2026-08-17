"use client";

import { useState, useMemo } from "react";
import { X, Flame, Check, Dumbbell, ShieldCheck } from "lucide-react";
import { calculateWarmupLadder, WarmupSet } from "@/lib/warmupCalculator";
import { VisualBarbell } from "@/components/tools/VisualBarbell";
import { cn } from "@/lib/cn";

interface WarmupCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  exerciseName: string;
  initialWeight?: number;
  unit?: "kg" | "lbs";
  onApplyWarmupSets: (
    warmupSets: Array<{
      weight: number;
      reps: number;
      label: string;
      rpe: number;
    }>,
  ) => void;
}

export function WarmupCalculatorModal({
  isOpen,
  onClose,
  exerciseName,
  initialWeight = 60,
  unit = "kg",
  onApplyWarmupSets,
}: WarmupCalculatorModalProps) {
  const [targetWeight, setTargetWeight] = useState<number>(initialWeight > 0 ? initialWeight : 60);
  const [selectedSetIndex, setSelectedSetIndex] = useState<number>(0);

  const ladder = useMemo(() => {
    return calculateWarmupLadder({
      targetWeight,
      barWeight: unit === "lbs" ? 45 : 20,
      unit,
      exerciseName,
    });
  }, [targetWeight, unit, exerciseName]);

  const activeSet = ladder[selectedSetIndex] || ladder[0];

  if (!isOpen) return null;

  const handleApply = () => {
    const sets = ladder.map((s) => ({
      weight: s.weight,
      reps: s.reps,
      label: s.label,
      rpe: s.rpe,
    }));
    onApplyWarmupSets(sets);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/85 p-3 sm:p-6 backdrop-blur-md flex items-center justify-center overflow-y-auto">
      <div className="w-full max-w-2xl bg-[#0d0d18] border border-white/15 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 my-auto max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest font-mono text-amber-400">
                  Potentiation Engine
                </span>
              </div>
              <h3 className="text-xl font-bold text-white font-display">
                Warm-up Ladder: {exerciseName}
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

        {/* Target Working Set Input */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <label className="text-xs font-semibold uppercase font-mono text-zinc-300 block mb-1">
              Target Working Load ({unit})
            </label>
            <p className="text-xs text-zinc-500">
              Your primary heavy working set load today
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={20}
              max={500}
              step={2.5}
              value={targetWeight}
              onChange={(e) => setTargetWeight(Number(e.target.value) || 20)}
              className="h-11 w-28 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-3 font-mono text-lg font-bold text-center text-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
            <span className="font-mono text-sm text-zinc-400">{unit}</span>
          </div>
        </div>

        {/* Warmup Sets Steps Breakdown */}
        <div className="space-y-2">
          <div className="text-[11px] uppercase font-mono font-semibold text-zinc-400 px-1">
            Calculated Warmup Sequence ({ladder.length} Sets)
          </div>

          <div className="grid gap-2">
            {ladder.map((s, idx) => {
              const isSelected = selectedSetIndex === idx;
              return (
                <div
                  key={`${s.setNumber}-${s.weight}`}
                  onClick={() => setSelectedSetIndex(idx)}
                  className={cn(
                    "p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 select-none",
                    isSelected
                      ? "border-amber-500/60 bg-amber-500/10 shadow-lg"
                      : "border-white/10 bg-white/[0.02] hover:border-white/20",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold">
                      W{s.setNumber}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-white">
                          {s.weight} {unit} × {s.reps} {s.reps === 1 ? "rep" : "reps"}
                        </span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/10 text-zinc-300">
                          {s.percentage}% Load
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400">{s.label}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-mono text-zinc-400 block">
                      Rest {s.restSeconds}s
                    </span>
                    {s.plates && (
                      <span className="text-[10px] font-mono text-cyan-400">
                        {s.plates.platesPerSide.length > 0
                          ? `${s.plates.platesPerSide.map((p) => `${p.weight}k`).join("+")} /side`
                          : "Empty Bar"}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Interactive Barbell Preview for Active Selected Warmup */}
        {activeSet?.plates && (
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <Dumbbell className="w-3.5 h-3.5" /> Barbell Visualizer (Set W{activeSet.setNumber})
              </span>
              <span>Total: {activeSet.weight} {unit}</span>
            </div>

            <VisualBarbell
              platesPerSide={activeSet.plates.platesPerSide}
              barWeight={unit === "lbs" ? 45 : 20}
              totalWeight={activeSet.plates.actualLoadedWeight}
              unit={unit}
            />
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-semibold text-zinc-400 transition"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider transition shadow-[0_0_15px_rgba(245,158,11,0.3)]"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            Insert {ladder.length} Warmup Sets Into Session
          </button>
        </div>
      </div>
    </div>
  );
}
