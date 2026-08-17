"use client";

import { Flame, Sparkles, Scale, TrendingDown, TrendingUp, CheckCircle2, Info } from "lucide-react";
import { AdaptiveTDEEResult } from "@/lib/adaptiveTDEE";
import { cn } from "@/lib/cn";

interface AdaptiveTDEECardProps {
  result: AdaptiveTDEEResult;
  onApplyRecommendedTarget: (newCalories: number) => void;
}

export function AdaptiveTDEECard({
  result,
  onApplyRecommendedTarget,
}: AdaptiveTDEECardProps) {
  const isFastMetabolism = result.metabolicDelta > 50;
  const isSlowMetabolism = result.metabolicDelta < -50;

  return (
    <div className="p-5 sm:p-6 rounded-3xl border border-white/10 bg-white/[0.02] space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold font-mono uppercase tracking-widest text-amber-400">
                Energy Balance Engine
              </span>
              <span
                className={cn(
                  "text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border",
                  result.status === "ACCURATE"
                    ? "bg-green-500/10 text-green-300 border-green-500/30"
                    : result.status === "RELIABLE"
                      ? "bg-cyan-500/10 text-cyan-300 border-cyan-500/30"
                      : "bg-white/5 text-zinc-400 border-white/10",
                )}
              >
                {result.status} ({result.confidenceScore}% Confidence)
              </span>
            </div>
            <h3 className="font-display text-xl font-bold text-white mt-0.5">
              Adaptive Metabolic Expenditure (TDEE)
            </h3>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onApplyRecommendedTarget(result.recommendedCalorieTarget)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider transition shadow-md"
        >
          <CheckCircle2 className="w-4 h-4" />
          Apply {result.recommendedCalorieTarget} kcal Target
        </button>
      </div>

      {/* Main Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-3 font-mono">
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
          <span className="text-[10px] uppercase text-zinc-400 block">Measured Daily TDEE</span>
          <span className="text-2xl font-bold text-amber-300">
            {result.measuredTDEE.toLocaleString()} <span className="text-xs text-zinc-500">kcal</span>
          </span>
          <span className="text-[10px] text-zinc-500 block">
            Formula baseline: {result.formulaTDEE} kcal
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
          <span className="text-[10px] uppercase text-zinc-400 block">Metabolic Delta</span>
          <span
            className={cn(
              "text-2xl font-bold flex items-center gap-1",
              isFastMetabolism ? "text-green-400" : isSlowMetabolism ? "text-amber-400" : "text-white",
            )}
          >
            {result.metabolicDelta > 0 ? `+${result.metabolicDelta}` : result.metabolicDelta} kcal
          </span>
          <span className="text-[10px] text-zinc-500 block">
            {isFastMetabolism
              ? "Elevated burn rate"
              : isSlowMetabolism
                ? "Adaptive thermogenesis"
                : "Matches formula"}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
          <span className="text-[10px] uppercase text-zinc-400 block">Weight Trend</span>
          <span
            className={cn(
              "text-2xl font-bold flex items-center gap-1",
              result.weightChangeKgPerWeek < 0 ? "text-green-400" : "text-cyan-400",
            )}
          >
            {result.weightChangeKgPerWeek > 0
              ? `+${result.weightChangeKgPerWeek}`
              : result.weightChangeKgPerWeek}{" "}
            <span className="text-xs text-zinc-500">kg/wk</span>
          </span>
          <span className="text-[10px] text-zinc-500 block">
            Avg intake: {result.averageDailyIntake} kcal
          </span>
        </div>
      </div>

      {/* Coaching Scientific Explanation */}
      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 text-xs text-zinc-300">
        <span className="font-mono text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Metabolic Analysis:
        </span>
        <p className="leading-relaxed">{result.rationale}</p>
      </div>
    </div>
  );
}
