"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Activity,
  Flame,
  Target,
  Trophy,
  TrendingUp,
  AlertTriangle,
  Layers,
  Sparkles,
  BarChart3,
  Calendar,
} from "lucide-react";
import {
  ActionButton,
  Card,
  MetricTile,
  SectionHeader,
} from "@/components/shared/UIPrimitives";
import { MuscleVolumeHeatmap } from "@/components/analytics/MuscleVolumeHeatmap";
import { PlateauDiagnosisCard } from "@/components/analytics/PlateauDiagnosisCard";
import { StrengthStandardsRadar } from "@/components/analytics/StrengthStandardsRadar";
import {
  calculateWeeklyMuscleVolume,
  MuscleVolumeProgress,
} from "@/lib/volumeLandmarks";
import {
  diagnoseAllCompoundLifts,
  LiftPlateauAnalysis,
  LiftLogEntry,
} from "@/lib/plateauDetector";
import {
  evaluateAthleteStrengthProfile,
  AthleteStrengthProfile,
} from "@/lib/strengthStandards";
import {
  readPlannerSnapshot,
  syncPlannerSnapshotFromServer,
} from "@/lib/plannerView";
import { cn } from "@/lib/cn";

type AnalyticsTab = "volume" | "plateaus" | "standards" | "recovery";

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>("volume");
  const [snapshot, setSnapshot] = useState(readPlannerSnapshot());
  const [liftsHistory, setLiftsHistory] = useState<LiftLogEntry[]>([]);
  const [sessions, setSessions] = useState<
    Array<{ completedExercises: string[]; completedAt: string }>
  >([]);
  const [loading, setLoading] = useState(true);

  // Load Lifts and Sessions
  useEffect(() => {
    async function loadData() {
      const currentSnap = readPlannerSnapshot();
      setSnapshot(currentSnap);

      try {
        const [liftsRes, sessionsRes] = await Promise.all([
          fetch("/api/lifts?limit=100"),
          fetch("/api/workout-sessions"),
        ]);

        if (liftsRes.ok) {
          const liftsData = await liftsRes.json();
          if (Array.isArray(liftsData)) {
            setLiftsHistory(liftsData);
          }
        } else {
          const guestPRs = JSON.parse(localStorage.getItem("guestPRs") || "[]");
          setLiftsHistory(guestPRs);
        }

        if (sessionsRes.ok) {
          const sessionsData = await sessionsRes.json();
          if (sessionsData.ok && Array.isArray(sessionsData.sessions)) {
            setSessions(sessionsData.sessions);
          }
        } else {
          const guestSessions = JSON.parse(
            localStorage.getItem("guestWorkoutSessions") || "[]",
          );
          setSessions(guestSessions);
        }
      } catch {
        const guestPRs = JSON.parse(localStorage.getItem("guestPRs") || "[]");
        const guestSessions = JSON.parse(
          localStorage.getItem("guestWorkoutSessions") || "[]",
        );
        setLiftsHistory(guestPRs);
        setSessions(guestSessions);
      } finally {
        setLoading(false);
      }
    }

    loadData();

    void syncPlannerSnapshotFromServer().then((serverSnap) => {
      setSnapshot(serverSnap);
    });
  }, []);

  // 1. Weekly Muscle Volume Progress
  const volumeData = useMemo<Record<string, MuscleVolumeProgress>>(() => {
    return calculateWeeklyMuscleVolume(sessions, 7);
  }, [sessions]);

  // 2. Plateau Diagnoses
  const plateauDiagnoses = useMemo<LiftPlateauAnalysis[]>(() => {
    return diagnoseAllCompoundLifts(liftsHistory);
  }, [liftsHistory]);

  // 3. Best lifts map for Strength Profile
  const bestLiftsMap = useMemo<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    liftsHistory.forEach((l) => {
      const key = l.name.toLowerCase().replace(/[\s\-_]/g, "");
      const oneRM = l.oneRM || l.weight * (1 + l.reps / 30);
      if (!map[key] || oneRM > map[key]) {
        map[key] = oneRM;
      }
    });
    return map;
  }, [liftsHistory]);

  // 4. Strength Standards Profile
  const strengthProfile = useMemo<AthleteStrengthProfile>(() => {
    return evaluateAthleteStrengthProfile(
      bestLiftsMap,
      snapshot.input.weightKg,
      snapshot.input.sex === "female",
    );
  }, [bestLiftsMap, snapshot.input.weightKg, snapshot.input.sex]);

  // Optimal volume muscles count
  const optimalMusclesCount = useMemo(() => {
    return Object.values(volumeData).filter((v) => v.status === "optimal").length;
  }, [volumeData]);

  const stalledCount = useMemo(() => {
    return plateauDiagnoses.filter((d) => d.status === "PLATEAU_DETECTED").length;
  }, [plateauDiagnoses]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <Card
        level="elevated"
        className="flex flex-wrap items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold font-mono tracking-widest uppercase text-cyan-400">
              Evidence-Based Analytics
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
            Progression Science & Volume Matrix
          </h1>
          <p className="mt-1 text-sm text-[#636380]">
            Renaissance Periodization (RP) volume landmarks, lift stall diagnoses, and DOTS strength classifications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/workouts"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs uppercase tracking-wider transition shadow-md"
          >
            Launch Live Workout
          </Link>
        </div>
      </Card>

      {/* Top High-Level Metrics Strip */}
      <div className="grid gap-4 sm:grid-cols-4 font-mono">
        <MetricTile
          label="Hypertrophy Sweet Spot"
          value={`${optimalMusclesCount} / 10`}
          note="Muscles in optimal MAV volume"
        />
        <MetricTile
          label="Plateau Risk"
          value={stalledCount > 0 ? `${stalledCount} Stalled` : "Zero Stalls"}
          note={stalledCount > 0 ? "Deload recommended" : "Linear overload active"}
        />
        <MetricTile
          label="Powerlifting DOTS"
          value={strengthProfile.dotsScore}
          note={`SBD Total: ${strengthProfile.sbdTotal} kg`}
        />
        <MetricTile
          label="Strength Classification"
          value={strengthProfile.tier}
          note={`Top ${100 - strengthProfile.percentile}% percentile`}
        />
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("volume")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition whitespace-nowrap",
            activeTab === "volume"
              ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm"
              : "text-zinc-400 hover:text-white border border-transparent",
          )}
        >
          <Activity className="w-4 h-4 text-cyan-400" />
          <span>Volume Landmarks & Heatmap</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("plateaus")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition whitespace-nowrap",
            activeTab === "plateaus"
              ? "bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-sm"
              : "text-zinc-400 hover:text-white border border-transparent",
          )}
        >
          <Flame className="w-4 h-4 text-amber-400" />
          <span>Plateau Detector & Deloads</span>
          {stalledCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500/30 text-amber-300 text-[9px] font-bold">
              {stalledCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("standards")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition whitespace-nowrap",
            activeTab === "standards"
              ? "bg-purple-500/15 text-purple-300 border border-purple-500/40 shadow-sm"
              : "text-zinc-400 hover:text-white border border-transparent",
          )}
        >
          <Trophy className="w-4 h-4 text-purple-400" />
          <span>Strength Standards & DOTS</span>
        </button>
      </div>

      {/* Tab 1: Muscle Volume Landmarks & Heatmap */}
      {activeTab === "volume" && (
        <div className="space-y-6">
          <Card level="base" className="space-y-3">
            <SectionHeader
              kicker="RP Hypertrophy Science"
              title="Weekly Direct & Indirect Sets vs MEV / MAV / MRV"
              description="Tracks working sets completed over the past 7 days. Muscles inside the MAV window trigger maximum muscle protein synthesis."
            />
            <MuscleVolumeHeatmap volumeData={volumeData} />
          </Card>
        </div>
      )}

      {/* Tab 2: Plateau Diagnosis & Deload Recommender */}
      {activeTab === "plateaus" && (
        <div className="space-y-6">
          <Card level="base" className="space-y-3">
            <SectionHeader
              kicker="Central Fatigue Engine"
              title="Lift Trajectory & Deload Protocols"
              description="Continuous overload tracking. Stalls across 3 consecutive sessions trigger automatic 1-week 70% load active deloads."
            />
            <PlateauDiagnosisCard diagnoses={plateauDiagnoses} />
          </Card>
        </div>
      )}

      {/* Tab 3: Strength Standards & DOTS Radar */}
      {activeTab === "standards" && (
        <div className="space-y-6">
          <Card level="base" className="space-y-3">
            <SectionHeader
              kicker="Powerlifting Benchmark Matrix"
              title="IPF / USAPL Athlete Standards"
              description="Calculates normalized DOTS coefficient and classifies your SBD strength across international competition percentiles."
            />
            <StrengthStandardsRadar profile={strengthProfile} />
          </Card>
        </div>
      )}
    </div>
  );
}
