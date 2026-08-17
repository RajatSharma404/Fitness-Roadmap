"use client";

import { memo } from "react";
import { Flame, Play, CheckCircle2 } from "lucide-react";
import { WarmupSet, WeightUnit } from "@/lib/plateCalculator";
import { cn } from "@/lib/cn";

interface WarmupPyramidProps {
  warmupSets: WarmupSet[];
  currentWeight: number;
  unit: WeightUnit;
  onSelectWeight: (weight: number) => void;
}

export const WarmupPyramid = memo(function WarmupPyramid({
  warmupSets,
  currentWeight,
  unit,
  onSelectWeight,
}: WarmupPyramidProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0c0c14] p-6 space-y-4 shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-white">
              Warm-Up Ramp Protocol
            </h3>
            <p className="text-xs text-[#8e8ea6]">
              Progressive CNS potentiation ramp for your target working weight
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2.5">
        {warmupSets.map((set) => {
          const isCurrent = Math.abs(set.targetWeight - currentWeight) < 0.1;
          const isWorkingSet = set.percentage === 100;

          return (
            <div
              key={set.setNumber}
              onClick={() => onSelectWeight(set.targetWeight)}
              className={cn(
                "flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer group",
                isCurrent
                  ? "bg-cyan-500/10 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                  : isWorkingSet
                    ? "bg-amber-500/[0.04] border-amber-500/20 hover:border-amber-500/40"
                    : "bg-white/[0.02] border-white/5 hover:border-white/15",
              )}
            >
              {/* Set Info */}
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={cn(
                    "flex items-center justify-center w-7 h-7 rounded-lg text-xs font-mono font-bold shrink-0 border",
                    isCurrent
                      ? "bg-cyan-400 text-black border-cyan-400"
                      : isWorkingSet
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                        : "bg-white/5 text-zinc-400 border-white/10",
                  )}
                >
                  #{set.setNumber}
                </span>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-white">
                      {set.targetWeight} {unit}
                    </span>
                    <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-white/5 text-zinc-400 border border-white/5">
                      {set.percentage}%
                    </span>
                    <span className="text-xs font-semibold text-cyan-300 font-mono">
                      × {set.reps} {set.reps === 1 ? "rep" : "reps"}
                    </span>
                  </div>
                  <p className="text-xs text-[#8e8ea6] truncate mt-0.5">
                    {set.note}
                  </p>
                </div>
              </div>

              {/* Plate Loading Preview Pills */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="hidden sm:flex items-center gap-1">
                  {set.calculation.platesPerSide.length === 0 ? (
                    <span className="text-[11px] font-mono text-zinc-500">
                      Empty Bar
                    </span>
                  ) : (
                    set.calculation.platesPerSide.map((plate, pIdx) => (
                      <span
                        key={pIdx}
                        className="w-2.5 h-6 rounded-xs border border-black/50"
                        style={{ backgroundColor: plate.color }}
                        title={`${plate.weight} ${unit}`}
                      />
                    ))
                  )}
                </div>

                <button
                  type="button"
                  className={cn(
                    "inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition font-mono",
                    isCurrent
                      ? "bg-cyan-400 text-black font-bold"
                      : "bg-white/5 text-zinc-300 group-hover:bg-white/10 group-hover:text-white border border-white/5",
                  )}
                >
                  {isCurrent ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" /> Loaded
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" /> Load
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
