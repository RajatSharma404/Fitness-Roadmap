"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Dumbbell,
  Sparkles,
  ShieldAlert,
  ChevronRight,
  BookOpen,
  Info,
} from "lucide-react";
import {
  FORM_ADVISOR_DATABASE,
  ExerciseFormGuide,
  MovementFault,
} from "@/lib/formAdvisor";
import { cn } from "@/lib/cn";

export function FormCheckAnalyzer() {
  const [selectedLiftKey, setSelectedLiftKey] = useState<string>("squat");
  const [selectedFaultId, setSelectedFaultId] = useState<string>("squat-knee-valgus");

  const guide = FORM_ADVISOR_DATABASE[selectedLiftKey] || FORM_ADVISOR_DATABASE.squat;
  const activeFault =
    guide.commonFaults.find((f) => f.id === selectedFaultId) ||
    guide.commonFaults[0];

  const getSeverityBadge = (severity: MovementFault["severity"]) => {
    switch (severity) {
      case "HIGH_INJURY_RISK":
        return "bg-red-500/15 text-red-400 border-red-500/30";
      case "MODERATE":
        return "bg-amber-500/15 text-amber-300 border-amber-500/30";
      default:
        return "bg-blue-500/15 text-blue-300 border-blue-500/30";
    }
  };

  return (
    <div className="p-5 sm:p-6 rounded-3xl border border-white/10 bg-white/[0.02] space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold font-mono uppercase tracking-widest text-cyan-400">
              Dr. McGill & Mark Rippetoe Principles
            </span>
            <h3 className="font-display text-xl font-bold text-white mt-0.5">
              AI Biomechanics & Form Check Advisor
            </h3>
          </div>
        </div>

        {/* Lift Selector Pills */}
        <div className="flex gap-2">
          {Object.entries(FORM_ADVISOR_DATABASE).map(([key, item]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setSelectedLiftKey(key);
                setSelectedFaultId(item.commonFaults[0]?.id || "");
              }}
              className={cn(
                "px-3.5 py-1.5 rounded-xl border text-xs font-mono font-bold transition uppercase",
                selectedLiftKey === key
                  ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-md"
                  : "bg-white/[0.02] text-zinc-400 border-white/10 hover:text-white",
              )}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Fault Selector & Diagnosis Pane */}
      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        {/* Left Column: Setup Checklist & Fault Selector */}
        <div className="space-y-4">
          {/* Setup Checklist Accordion */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2.5 font-mono text-xs">
            <span className="text-[11px] font-bold uppercase text-cyan-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" /> Platform Setup Checklist:
            </span>
            <ul className="space-y-1.5 text-zinc-300 text-[11px]">
              {guide.setupChecklist.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">{idx + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Fault Selector Buttons */}
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold uppercase text-zinc-400 block">
              Identify Movement Fault / Sticking Point:
            </span>

            <div className="space-y-2">
              {guide.commonFaults.map((fault) => {
                const isSelected = fault.id === selectedFaultId;

                return (
                  <div
                    key={fault.id}
                    onClick={() => setSelectedFaultId(fault.id)}
                    className={cn(
                      "p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 select-none",
                      isSelected
                        ? "bg-cyan-500/10 border-cyan-500/50 shadow-lg"
                        : "bg-white/[0.02] border-white/5 hover:border-white/15",
                    )}
                  >
                    <div>
                      <h5 className="font-display text-sm font-bold text-white">
                        {fault.name}
                      </h5>
                      <p className="text-[11px] text-zinc-400 font-mono mt-0.5 line-clamp-1">
                        {fault.symptomDescription}
                      </p>
                    </div>

                    <span
                      className={cn(
                        "text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border shrink-0",
                        getSeverityBadge(fault.severity),
                      )}
                    >
                      {fault.severity.replace("_", " ")}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: In-Depth Biomechanical Diagnostic Card */}
        {activeFault && (
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
            <div className="flex items-start justify-between gap-2 border-b border-white/5 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase font-mono tracking-widest text-cyan-400">
                  Technique Prescription
                </span>
                <h4 className="font-display text-xl font-bold text-white mt-0.5">
                  {activeFault.name}
                </h4>
              </div>
              <span
                className={cn(
                  "text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full border",
                  getSeverityBadge(activeFault.severity),
                )}
              >
                {activeFault.severity.replace("_", " ")}
              </span>
            </div>

            {/* Root Biomechanical Causes */}
            <div className="space-y-1.5">
              <span className="text-xs font-mono font-bold uppercase text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Root Causes:
              </span>
              <ul className="space-y-1 pl-4 list-disc text-xs text-zinc-300 font-mono">
                {activeFault.rootCauses.map((cause, idx) => (
                  <li key={idx}>{cause}</li>
                ))}
              </ul>
            </div>

            {/* Instant Verbal Cues */}
            <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 space-y-2">
              <span className="text-xs font-mono font-bold uppercase text-cyan-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Instant Verbal Cues (Think on the Platform):
              </span>
              <div className="space-y-1.5">
                {activeFault.instantVerbalCues.map((cue, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-black/40 text-xs font-mono text-white flex items-center gap-2">
                    <span className="text-cyan-400 font-bold">🗣️</span>
                    <span>&quot;{cue}&quot;</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Corrective Warm-up & Accessory Drills */}
            <div className="space-y-2 pt-1">
              <span className="text-xs font-mono font-bold uppercase text-zinc-300 flex items-center gap-1.5">
                <Dumbbell className="w-3.5 h-3.5 text-green-400" /> Corrective Drills & Exercises:
              </span>

              <div className="grid gap-2 sm:grid-cols-2">
                {activeFault.correctiveDrills.map((drill) => (
                  <div
                    key={drill.name}
                    className="p-3 rounded-xl bg-white/[0.02] border border-white/10 space-y-1"
                  >
                    <h6 className="font-display text-xs font-bold text-white">
                      {drill.name}
                    </h6>
                    <p className="text-[11px] text-zinc-400 leading-snug">
                      {drill.description}
                    </p>
                    <span className="text-[10px] font-mono text-cyan-300 font-bold block pt-0.5">
                      Protocol: {drill.recommendedSetsReps}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
