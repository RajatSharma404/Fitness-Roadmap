"use client";

import { useSyncExternalStore } from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Trophy, Award, Medal, ShieldCheck, Scale, Target, Sparkles } from "lucide-react";
import { AthleteStrengthProfile } from "@/lib/strengthStandards";
import { cn } from "@/lib/cn";

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

interface StrengthStandardsRadarProps {
  profile: AthleteStrengthProfile;
}

export function StrengthStandardsRadar({ profile }: StrengthStandardsRadarProps) {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  const radarData = Object.entries(profile.liftClassifications).map(
    ([liftKey, data]) => {
      const labels: Record<string, string> = {
        squat: "Squat",
        bench: "Bench Press",
        deadlift: "Deadlift",
        ohp: "Overhead Press",
        row: "Barbell Row",
      };

      return {
        lift: labels[liftKey] || liftKey,
        score: Math.min(100, Math.max(0, data.scorePercent)),
        actual: data.actual1RM,
        tier: data.tier,
      };
    },
  );

  return (
    <div className="space-y-6">
      {/* Metric Tiles Header */}
      <div className="grid gap-4 sm:grid-cols-4 font-mono">
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
          <span className="text-[10px] uppercase text-zinc-400 block flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-cyan-400" /> DOTS Score
          </span>
          <span className="text-2xl font-bold text-cyan-300">
            {profile.dotsScore}
          </span>
          <span className="text-[10px] text-zinc-500 block">International standard</span>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
          <span className="text-[10px] uppercase text-zinc-400 block flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-amber-400" /> SBD Total
          </span>
          <span className="text-2xl font-bold text-amber-300">
            {profile.sbdTotal} kg
          </span>
          <span className="text-[10px] text-zinc-500 block">Squat + Bench + Deadlift</span>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
          <span className="text-[10px] uppercase text-zinc-400 block flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-purple-400" /> Wilks Score
          </span>
          <span className="text-2xl font-bold text-purple-300">
            {profile.wilksScore}
          </span>
          <span className="text-[10px] text-zinc-500 block">Normalized by bodyweight</span>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
          <span className="text-[10px] uppercase text-zinc-400 block flex items-center gap-1.5">
            <Medal className="w-3.5 h-3.5 text-green-400" /> Athlete Tier
          </span>
          <span className="text-xl font-bold text-green-300">
            {profile.tier}
          </span>
          <span className="text-[10px] text-zinc-500 block">Top {100 - profile.percentile}% of lifters</span>
        </div>
      </div>

      {/* Radar Chart & Benchmark Table */}
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        {/* Radar Chart Card */}
        <div className="p-5 rounded-3xl border border-white/10 bg-white/[0.02] space-y-3 flex flex-col items-center justify-center">
          <div className="w-full flex items-center justify-between border-b border-white/5 pb-2">
            <span className="text-xs font-mono uppercase font-bold text-zinc-300 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-cyan-400" /> Strength Symmetry Radar
            </span>
            <span className="text-[10px] font-mono text-zinc-500">Scale: 0-100% Elite</span>
          </div>

          <div className="h-64 w-full">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#27272a" />
                  <PolarAngleAxis dataKey="lift" tick={{ fill: "#a1a1aa", fontSize: 11 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name="Your Strength"
                    dataKey="score"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    fill="#06b6d4"
                    fillOpacity={0.3}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-[#0b0b14] border border-white/20 rounded-xl p-2.5 text-xs font-mono shadow-2xl space-y-1">
                            <div className="text-white font-bold">{data.lift}</div>
                            <div className="text-cyan-400">Score: {data.score.toFixed(0)}% ({data.tier})</div>
                            <div className="text-zinc-400">Estimated 1RM: {data.actual} kg</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 w-full" />
            )}
          </div>
        </div>

        {/* Lift Standards Breakdown Table */}
        <div className="p-5 rounded-3xl border border-white/10 bg-white/[0.02] space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <h4 className="font-display text-base font-bold text-white">
              Powerlifting Tier Benchmarks ({profile.bodyweightKg}kg BW)
            </h4>
            <span className="text-[10px] font-mono text-cyan-400">IPF / USAPL Curves</span>
          </div>

          <div className="space-y-3 overflow-x-auto">
            {Object.entries(profile.liftClassifications).map(([key, item]) => {
              const labels: Record<string, string> = {
                squat: "Barbell Squat",
                bench: "Barbell Bench Press",
                deadlift: "Barbell Deadlift",
                ohp: "Overhead Press",
                row: "Barbell Row",
              };

              return (
                <div key={key} className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 font-mono">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white font-display text-sm">{labels[key]}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-bold">
                        {item.tier}
                      </span>
                    </div>
                    <span className="text-white font-bold">
                      {item.actual1RM} kg <span className="text-zinc-500 font-normal">({item.bodyweightRatio}x BW)</span>
                    </span>
                  </div>

                  {/* Standards Step Grid */}
                  <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] text-zinc-400">
                    <div className="p-1.5 rounded-lg bg-black/40 border border-white/5">
                      <span className="text-[9px] uppercase text-zinc-500 block">Novice</span>
                      <span className="font-semibold text-zinc-300">{item.standards.novice}kg</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-black/40 border border-white/5">
                      <span className="text-[9px] uppercase text-zinc-500 block">Interm.</span>
                      <span className="font-semibold text-zinc-300">{item.standards.intermediate}kg</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-black/40 border border-white/5">
                      <span className="text-[9px] uppercase text-zinc-500 block">Adv.</span>
                      <span className="font-semibold text-zinc-300">{item.standards.advanced}kg</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-black/40 border border-white/5">
                      <span className="text-[9px] uppercase text-zinc-500 block">Elite</span>
                      <span className="font-semibold text-amber-300">{item.standards.elite}kg</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
