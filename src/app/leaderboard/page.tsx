"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Trophy,
  Users,
  TrendingUp,
  Award,
  Medal,
  Shield,
  Flame,
  Zap,
  Sparkles,
  Share2,
  Swords,
  Activity,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/cn";
import { Card, SectionHeader, MetricTile } from "@/components/shared/UIPrimitives";
import { SquadsView } from "@/components/social/SquadsView";
import { SquadActivityFeed } from "@/components/social/SquadActivityFeed";
import { CommunityRaidCard } from "@/components/social/CommunityRaidCard";
import { PRStoryCardModal, PRStoryCardData } from "@/components/social/PRStoryCardModal";
import {
  Squad,
  getSavedSquads,
  toggleActivityFistbump,
} from "@/lib/squadEngine";
import {
  ACTIVE_WEEKLY_RAID_BOSS,
  calculateUserRaidContribution,
} from "@/lib/raidBossEngine";
import { readPlannerSnapshot } from "@/lib/plannerView";

type CommunityTab = "squads" | "feed" | "raid" | "rankings";

interface LeaderboardEntry {
  id: string;
  name: string | null;
  image: string | null;
  goal: string | null;
  topLift: { name: string; weight: number } | null;
  nodesCompleted: number;
  wilksScore: number;
  total: number;
  rank: number;
}

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<CommunityTab>("squads");
  const [squads, setSquads] = useState<Squad[]>([]);
  const [activeSquadId, setActiveSquadId] = useState<string>("");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"table" | "cards">("table");

  // PR Story Card Modal state
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [storyCardData, setStoryCardData] = useState<PRStoryCardData>({
    athleteName: "Athlete",
    liftName: "Barbell Deadlift",
    weightKg: 180,
    reps: 1,
    oneRM: 180,
    xpGained: 500,
    dateStr: new Date().toISOString().slice(0, 10),
  });

  // Load squads & leaderboard
  useEffect(() => {
    const saved = getSavedSquads();
    setSquads(saved);
    if (saved.length > 0) {
      setActiveSquadId(saved[0].id);
    }
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch("/api/leaderboard");
      if (response.ok) {
        const data = await response.json();
        setEntries(data);
      }
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFistbump = (activityId: string) => {
    const updated = toggleActivityFistbump(activeSquadId, activityId);
    setSquads(updated);
  };

  const handleSquadCreated = (newSquad: Squad) => {
    const updated = [newSquad, ...squads];
    setSquads(updated);
    setActiveSquadId(newSquad.id);
  };

  const activeSquad = useMemo(() => {
    return squads.find((s) => s.id === activeSquadId) || squads[0];
  }, [squads, activeSquadId]);

  // Raid Boss calculation
  const raidContribution = useMemo(() => {
    const snap = readPlannerSnapshot();
    const guestSessions =
      typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("guestWorkoutSessions") || "[]")
        : [];

    const estimatedTonnage = guestSessions.length * 4500 + 12000;
    return calculateUserRaidContribution(estimatedTonnage, guestSessions.length + 3, 145);
  }, []);

  const openPRCardForUser = (entry?: LeaderboardEntry) => {
    setStoryCardData({
      athleteName: entry?.name || "Athlete",
      liftName: entry?.topLift?.name || "Barbell Deadlift",
      weightKg: entry?.topLift?.weight || 180,
      reps: 1,
      oneRM: entry?.topLift?.weight || 180,
      xpGained: (entry?.nodesCompleted || 4) * 150,
      dateStr: new Date().toISOString().slice(0, 10),
    });
    setIsStoryModalOpen(true);
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-zinc-400" />;
    if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />;
    return <span className="text-[#636380] font-mono text-sm">{rank}</span>;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* PR Story Card Modal */}
      <PRStoryCardModal
        data={storyCardData}
        isOpen={isStoryModalOpen}
        onClose={() => setIsStoryModalOpen(false)}
      />

      {/* Header Banner */}
      <Card level="elevated" className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold font-mono tracking-widest uppercase text-cyan-400">
              Multiplayer RPG & Social Guilds
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
            Gym Squads, Community Raids & Leaderboard
          </h1>
          <p className="mt-1 text-sm text-[#636380]">
            Join private gym clans, defeat weekly cooperative community bosses, and share verified PR story cards.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => openPRCardForUser()}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs uppercase tracking-wider transition shadow-md font-mono flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" /> Share PR Story Card
          </button>
        </div>
      </Card>

      {/* Top Metric Strip */}
      <div className="grid gap-4 sm:grid-cols-4 font-mono">
        <MetricTile
          label="Active Clan"
          value={activeSquad ? `[${activeSquad.tag}] ${activeSquad.name}` : "Iron Brotherhood"}
          note={`${activeSquad?.members.length || 4} lifters in squad`}
        />
        <MetricTile
          label="Weekly Squad Tonnage"
          value={`${((activeSquad?.currentWeeklyTonnageKg || 38400) / 1000).toFixed(1)}k kg`}
          note={`Goal: ${((activeSquad?.weeklyTonnageTargetKg || 50000) / 1000).toFixed(0)}k kg`}
        />
        <MetricTile
          label="Community Raid HP"
          value={`${((ACTIVE_WEEKLY_RAID_BOSS.currentHpKg) / 1000).toFixed(0)}k HP`}
          note={`${ACTIVE_WEEKLY_RAID_BOSS.expiresInDays} days left to defeat Gorgon`}
        />
        <MetricTile
          label="Your Raid Archetype"
          value={raidContribution.roleArchetype.replace("_", " ")}
          note={`Top #${raidContribution.rankInRaid} contributor`}
        />
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("squads")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition whitespace-nowrap",
            activeTab === "squads"
              ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm"
              : "text-zinc-400 hover:text-white border border-transparent",
          )}
        >
          <Shield className="w-4 h-4 text-cyan-400" />
          <span>Gym Squads & Clans</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("feed")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition whitespace-nowrap",
            activeTab === "feed"
              ? "bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-sm"
              : "text-zinc-400 hover:text-white border border-transparent",
          )}
        >
          <Activity className="w-4 h-4 text-amber-400" />
          <span>Live Activity Feed</span>
          <span className="px-1.5 py-0.2 rounded-full bg-amber-500/30 text-amber-300 text-[9px] font-bold">
            {activeSquad?.activities.length || 3}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("raid")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition whitespace-nowrap",
            activeTab === "raid"
              ? "bg-red-500/15 text-red-300 border border-red-500/40 shadow-sm"
              : "text-zinc-400 hover:text-white border border-transparent",
          )}
        >
          <Swords className="w-4 h-4 text-red-400" />
          <span>Community Raid Boss</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("rankings")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition whitespace-nowrap",
            activeTab === "rankings"
              ? "bg-purple-500/15 text-purple-300 border border-purple-500/40 shadow-sm"
              : "text-zinc-400 hover:text-white border border-transparent",
          )}
        >
          <Trophy className="w-4 h-4 text-purple-400" />
          <span>Global Leaderboard</span>
        </button>
      </div>

      {/* Tab 1: Gym Squads & Clans */}
      {activeTab === "squads" && (
        <SquadsView
          squads={squads}
          activeSquadId={activeSquadId}
          onSelectSquad={setActiveSquadId}
          onSquadCreated={handleSquadCreated}
        />
      )}

      {/* Tab 2: Live Activity Feed */}
      {activeTab === "feed" && activeSquad && (
        <SquadActivityFeed
          activities={activeSquad.activities}
          onToggleFistbump={handleToggleFistbump}
        />
      )}

      {/* Tab 3: Cooperative Raid Boss */}
      {activeTab === "raid" && (
        <CommunityRaidCard
          boss={ACTIVE_WEEKLY_RAID_BOSS}
          userContribution={raidContribution}
        />
      )}

      {/* Tab 4: Global Athlete Rankings */}
      {activeTab === "rankings" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <SectionHeader
              kicker="IPF Normalized"
              title="Individual Athlete Rankings"
              description="Athletes ranked by normalized Wilks score across Squat, Bench Press, and Deadlift."
            />

            {/* View Toggle */}
            <div className="inline-flex rounded-full border border-white/10 bg-white/[0.02] p-1 font-mono text-xs">
              <button
                type="button"
                onClick={() => setView("table")}
                className={cn(
                  "rounded-full px-3.5 py-1 transition",
                  view === "table" ? "bg-cyan-400/20 text-cyan-300" : "text-zinc-400 hover:text-white",
                )}
              >
                Table
              </button>
              <button
                type="button"
                onClick={() => setView("cards")}
                className={cn(
                  "rounded-full px-3.5 py-1 transition",
                  view === "cards" ? "bg-cyan-400/20 text-cyan-300" : "text-zinc-400 hover:text-white",
                )}
              >
                Cards
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex h-64 items-center justify-center text-cyan-400 font-mono text-xs">
              Loading athlete rankings...
            </div>
          ) : entries.length === 0 ? (
            <Card level="base" className="text-center py-12">
              <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-3 opacity-60" />
              <h3 className="font-display text-xl font-bold text-[#eeeef2]">
                No athletes on the board yet
              </h3>
              <p className="mt-1 text-sm text-[#636380] max-w-md mx-auto">
                Log your first Squat, Bench, and Deadlift PRs to claim the #1 rank on the community leaderboard!
              </p>
              <div className="mt-4">
                <Link
                  href="/workouts"
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs uppercase tracking-wider transition font-mono"
                >
                  Start Workout & Log PR
                </Link>
              </div>
            </Card>
          ) : view === "table" ? (
            <Card level="base" className="overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.02]">
                      <th className="px-6 py-4 text-xs uppercase tracking-[0.2em] text-[#636380] font-mono">Rank</th>
                      <th className="px-6 py-4 text-xs uppercase tracking-[0.2em] text-[#636380] font-mono">Athlete</th>
                      <th className="px-6 py-4 text-xs uppercase tracking-[0.2em] text-[#636380] font-mono">Top Lift</th>
                      <th className="px-6 py-4 text-xs uppercase tracking-[0.2em] text-[#636380] font-mono">Milestones</th>
                      <th className="px-6 py-4 text-right text-xs uppercase tracking-[0.2em] text-[#636380] font-mono">Wilks</th>
                      <th className="px-6 py-4 text-right text-xs uppercase tracking-[0.2em] text-[#636380] font-mono">Card</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono text-sm">
                    {entries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-white/[0.02] transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {getRankIcon(entry.rank)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {entry.image ? (
                              <Image
                                src={entry.image}
                                alt={entry.name || "Athlete"}
                                width={32}
                                height={32}
                                className="rounded-full"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-xs">
                                {(entry.name || "A")[0]}
                              </div>
                            )}
                            <span className="font-bold text-white font-display text-base">
                              {entry.name || "Anonymous Lifter"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-zinc-300">
                          {entry.topLift ? (
                            <span>{entry.topLift.name} ({entry.topLift.weight} kg)</span>
                          ) : (
                            <span className="text-zinc-600">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-cyan-300">
                          {entry.nodesCompleted} nodes
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-amber-300">
                          {entry.wilksScore}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => openPRCardForUser(entry)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-zinc-400 hover:text-cyan-300 transition"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {entries.map((entry) => (
                <Card key={entry.id} level="base" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getRankIcon(entry.rank)}
                      <span className="text-xs font-mono text-zinc-500">Rank #{entry.rank}</span>
                    </div>
                    <span className="font-mono text-lg font-bold text-amber-300">
                      {entry.wilksScore} Wilks
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {entry.image ? (
                      <Image
                        src={entry.image}
                        alt={entry.name || "Athlete"}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-sm">
                        {(entry.name || "A")[0]}
                      </div>
                    )}
                    <div>
                      <h4 className="font-display font-bold text-white text-base">
                        {entry.name || "Anonymous Lifter"}
                      </h4>
                      <p className="text-xs font-mono text-zinc-400">
                        {entry.nodesCompleted} Skill Nodes Completed
                      </p>
                    </div>
                  </div>

                  {entry.topLift && (
                    <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-xs font-mono flex justify-between">
                      <span className="text-zinc-400">Top Lift:</span>
                      <span className="font-bold text-cyan-300">
                        {entry.topLift.name} ({entry.topLift.weight} kg)
                      </span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => openPRCardForUser(entry)}
                    className="w-full py-2 rounded-xl bg-white/5 hover:bg-cyan-500/20 text-zinc-300 hover:text-cyan-300 border border-white/10 text-xs font-mono font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <Share2 className="w-3.5 h-3.5" /> Share PR Card
                  </button>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
