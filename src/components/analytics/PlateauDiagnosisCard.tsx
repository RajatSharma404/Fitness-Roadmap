"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Flame,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Dumbbell,
  Sparkles,
} from "lucide-react";
import { LiftPlateauAnalysis } from "@/lib/plateauDetector";
import { cn } from "@/lib/cn";

interface PlateauDiagnosisCardProps {
  diagnoses: LiftPlateauAnalysis[];
  onAskAICoach?: (prompt: string) => void;
}

export function PlateauDiagnosisCard({
  diagnoses,
  onAskAICoach,
}: PlateauDiagnosisCardProps) {
  const [expandedLift, setExpandedLift] = useState<string | null>(() => {
    const stalled = diagnoses.find((d) => d.status === "PLATEAU_DETECTED");
    return stalled ? stalled.liftName : diagnoses[0]?.liftName || null;
  });

  const plateauCount = diagnoses.filter((d) => d.status === "PLATEAU_DETECTED").length;
  const slowingCount = diagnoses.filter((d) => d.status === "SLOWING").length;

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-2xl flex items-center justify-center border",
              plateauCount > 0
                ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                : "bg-green-500/15 text-green-400 border-green-500/30",
            )}
          >
            {plateauCount > 0 ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <CheckCircle2 className="w-5 h-5" />
            )}
          </div>
          <div>
            <h4 className="font-display text-base font-bold text-white">
              {plateauCount > 0
                ? `${plateauCount} Lift Plateau Detected`
                : "All Primary Compound Lifts Progressing"}
            </h4>
            <p className="text-xs text-zinc-400 font-mono">
              {plateauCount > 0
                ? `${plateauCount} lift has stalled for 3+ sessions. Deload protocols ready.`
                : "Continuous progressive overload detected across recent gym sessions."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-green-500/10 text-green-300 border border-green-500/30">
            {diagnoses.filter((d) => d.status === "PROGRESSING").length} Progressing
          </span>
          {slowingCount > 0 && (
            <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/30">
              {slowingCount} Slowing
            </span>
          )}
          {plateauCount > 0 && (
            <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/40 font-bold">
              {plateauCount} Stalled
            </span>
          )}
        </div>
      </div>

      {/* Lift Diagnosis List */}
      <div className="space-y-3">
        {diagnoses.map((diag) => {
          const isExpanded = expandedLift === diag.liftName;
          const isStalled = diag.status === "PLATEAU_DETECTED";
          const isSlowing = diag.status === "SLOWING";

          return (
            <div
              key={diag.liftName}
              className={cn(
                "rounded-2xl border transition-all overflow-hidden",
                isStalled
                  ? "border-amber-500/40 bg-amber-500/[0.02]"
                  : isExpanded
                    ? "border-cyan-500/40 bg-white/[0.03]"
                    : "border-white/10 bg-white/[0.01] hover:border-white/20",
              )}
            >
              {/* Row Header */}
              <div
                onClick={() => setExpandedLift(isExpanded ? null : diag.liftName)}
                className="p-4 flex items-center justify-between gap-3 cursor-pointer select-none"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-zinc-300">
                    <Dumbbell className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="font-display text-base font-bold text-white">
                        {diag.liftName}
                      </h5>
                      <span
                        className={cn(
                          "text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border",
                          isStalled
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                            : isSlowing
                              ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
                              : "bg-green-500/20 text-green-300 border-green-500/40",
                        )}
                      >
                        {diag.status.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 font-mono">
                      Current 1RM: <strong>{diag.current1RM} kg</strong> · Peak: {diag.peak1RM} kg · {diag.recentSessionsCount} sessions analyzed
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right font-mono hidden sm:block">
                    <span className="text-[10px] uppercase text-zinc-500 block">Trajectory</span>
                    <span
                      className={cn(
                        "text-sm font-bold flex items-center gap-1 justify-end",
                        diag.trendPercentage >= 0 ? "text-green-400" : "text-amber-400",
                      )}
                    >
                      {diag.trendPercentage >= 0 ? (
                        <TrendingUp className="w-3.5 h-3.5" />
                      ) : (
                        <TrendingDown className="w-3.5 h-3.5" />
                      )}
                      {diag.trendPercentage > 0 ? `+${diag.trendPercentage}%` : `${diag.trendPercentage}%`}
                    </span>
                  </div>

                  <div className="p-1 text-zinc-400">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>
              </div>

              {/* Expanded Diagnostic Detail & Deload Protocol */}
              {isExpanded && (
                <div className="p-4 pt-0 border-t border-white/5 space-y-4">
                  {diag.deloadPrescription ? (
                    <div className="space-y-4 pt-3">
                      {/* Deload Protocol Card */}
                      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
                        <div className="flex items-center gap-2 text-amber-300 font-mono text-xs font-bold uppercase tracking-wider">
                          <Flame className="w-4 h-4" /> 1-Week Active Deload Prescription
                        </div>
                        <p className="text-xs text-zinc-300">
                          {diag.deloadPrescription.focusRationale}
                        </p>

                        <div className="grid gap-2 sm:grid-cols-3 font-mono pt-1">
                          <div className="p-2.5 rounded-xl bg-black/40 border border-white/10">
                            <span className="text-[10px] uppercase text-zinc-400 block">Working Weight</span>
                            <span className="text-base font-bold text-amber-300">
                              {diag.deloadPrescription.recommendedWeightKg} kg (70% load)
                            </span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-black/40 border border-white/10">
                            <span className="text-[10px] uppercase text-zinc-400 block">Sets & Reps</span>
                            <span className="text-base font-bold text-white">
                              {diag.deloadPrescription.recommendedSets} sets × {diag.deloadPrescription.recommendedReps}
                            </span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-black/40 border border-white/10">
                            <span className="text-[10px] uppercase text-zinc-400 block">Target Intensity</span>
                            <span className="text-base font-bold text-cyan-300">
                              {diag.deloadPrescription.targetRpe}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Weak-Point Variation Suggestions */}
                      {diag.deloadPrescription.weakPointVariations.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-cyan-400 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" /> Weak-Point Technical Variations:
                          </span>
                          <div className="grid gap-2 sm:grid-cols-2">
                            {diag.deloadPrescription.weakPointVariations.map((v) => (
                              <div
                                key={v.name}
                                className="p-3 rounded-xl border border-white/10 bg-white/[0.02] space-y-1"
                              >
                                <h6 className="font-display text-xs font-bold text-white">
                                  {v.name}
                                </h6>
                                <span className="text-[10px] font-mono text-cyan-300 block">
                                  Focus: {v.targetWeakness}
                                </span>
                                <p className="text-[11px] text-zinc-400">{v.reason}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="pt-3 text-xs text-zinc-400 space-y-2">
                      <p>
                        Progress is moving well on {diag.liftName}. Continue adding 1-2.5 kg or 1 extra rep each week.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
