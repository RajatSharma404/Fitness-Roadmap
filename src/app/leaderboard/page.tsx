"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trophy, Users, TrendingUp, Award, Medal } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/cn";
import { Card } from "@/components/shared/UIPrimitives";

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
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"table" | "cards">("table");

  useEffect(() => {
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

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-zinc-400" />;
    if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />;
    return <span className="text-[#636380] font-mono text-sm">{rank}</span>;
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-cyan-400 font-medium">Loading athlete rankings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header Banner */}
      <Card
        level="elevated"
        className="flex flex-wrap items-center justify-between gap-4"
      >
        <div>
          <p className="lab-kicker text-[#60a5fa]">Community</p>
          <h2 className="font-display text-[28px] font-bold text-[#eeeef2]">
            Strength Leaderboard
          </h2>
          <p className="mt-1 text-sm text-[#636380]">
            Athletes ranked by normalized Wilks score across Squat, Bench Press, and Deadlift.
          </p>
        </div>

        {/* View Toggle */}
        <div className="inline-flex rounded-full border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-1">
          <button
            type="button"
            onClick={() => setView("table")}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition",
              view === "table"
                ? "bg-cyan-400/10 text-cyan-300"
                : "text-[#636380] hover:text-[#eeeef2]",
            )}
          >
            Table
          </button>
          <button
            type="button"
            onClick={() => setView("cards")}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition",
              view === "cards"
                ? "bg-cyan-400/10 text-cyan-300"
                : "text-[#636380] hover:text-[#eeeef2]",
            )}
          >
            Cards
          </button>
        </div>
      </Card>

      {/* Main Content */}
      {entries.length === 0 ? (
        <Card level="base" className="text-center py-12">
          <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-3 opacity-60" />
          <h3 className="font-display text-xl font-bold text-[#eeeef2]">No athletes on the board yet</h3>
          <p className="mt-1 text-sm text-[#636380] max-w-md mx-auto">
            Log your first Squat, Bench, and Deadlift PRs to claim the #1 rank on the community leaderboard!
          </p>
          <div className="mt-4">
            <Link
              href="/roadmap"
              className="lab-btn-primary inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium"
            >
              Go to Roadmap
            </Link>
          </div>
        </Card>
      ) : view === "table" ? (
        <Card level="base" className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]">
                  <th className="px-6 py-4 text-xs uppercase tracking-[0.2em] text-[#636380]">Rank</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-[0.2em] text-[#636380]">Athlete</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-[0.2em] text-[#636380]">Goal</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-[0.2em] text-[#636380]">Top Lift</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-[0.2em] text-[#636380]">Milestones</th>
                  <th className="px-6 py-4 text-right text-xs uppercase tracking-[0.2em] text-[#636380]">Wilks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(255,255,255,0.04)]">
                {entries.map((entry) => (
                  <tr
                    key={entry.id}
                    className={cn(
                      "transition-colors hover:bg-[rgba(255,255,255,0.02)]",
                      entry.rank <= 3 && "bg-cyan-400/[0.02]",
                    )}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">{getRankIcon(entry.rank)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/profile/${entry.id}`}
                        className="flex items-center gap-3 group"
                      >
                        <div className="w-9 h-9 rounded-full bg-zinc-800 border border-[rgba(255,255,255,0.08)] flex items-center justify-center overflow-hidden shrink-0">
                          {entry.image ? (
                            <Image
                              src={entry.image}
                              alt={entry.name || ""}
                              width={36}
                              height={36}
                              className="object-cover"
                            />
                          ) : (
                            <Users className="w-4 h-4 text-zinc-500" />
                          )}
                        </div>
                        <span className="text-[#eeeef2] font-semibold group-hover:text-cyan-300 transition">
                          {entry.name || "Anonymous Athlete"}
                        </span>
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs uppercase tracking-wider text-[#636380]">
                        {entry.goal || "Strength"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {entry.topLift ? (
                        <div className="text-sm">
                          <span className="font-mono font-bold text-cyan-300">
                            {entry.topLift.weight.toFixed(0)}kg
                          </span>
                          <span className="text-xs text-[#636380] ml-1.5 capitalize">
                            {entry.topLift.name.replace("_", " ")}
                          </span>
                        </div>
                      ) : (
                        <span className="text-zinc-600">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-[#eeeef2]">{entry.nodesCompleted}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <TrendingUp className="w-4 h-4 text-cyan-400" />
                        <span className="font-mono text-lg font-bold text-[#eeeef2]">
                          {entry.wilksScore.toFixed(1)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {entries.map((entry) => (
            <Card
              key={entry.id}
              level={entry.rank <= 3 ? "highlight" : "base"}
              className="space-y-4"
            >
              <div className="flex items-start justify-between">
                <Link
                  href={`/profile/${entry.id}`}
                  className="flex items-center gap-3 group"
                >
                  <div className="w-11 h-11 rounded-xl bg-zinc-800 border border-[rgba(255,255,255,0.08)] flex items-center justify-center overflow-hidden shrink-0">
                    {entry.image ? (
                      <Image
                        src={entry.image}
                        alt={entry.name || ""}
                        width={44}
                        height={44}
                        className="object-cover"
                      />
                    ) : (
                      <Users className="w-5 h-5 text-zinc-500" />
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-[#eeeef2] group-hover:text-cyan-300 transition">
                      {entry.name || "Anonymous Athlete"}
                    </div>
                    <div className="text-xs uppercase tracking-wider text-[#636380]">
                      {entry.goal || "Strength"}
                    </div>
                  </div>
                </Link>
                <div className="flex items-center gap-2">
                  {getRankIcon(entry.rank)}
                </div>
              </div>

              <div className="space-y-2 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[#636380]">Wilks Score</span>
                  <span className="font-mono text-lg font-bold text-cyan-300">
                    {entry.wilksScore.toFixed(1)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#636380]">Milestones Unlocked</span>
                  <span className="font-mono font-semibold text-[#eeeef2]">
                    {entry.nodesCompleted}
                  </span>
                </div>

                {entry.topLift && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#636380]">Top Lift</span>
                    <span className="font-mono text-xs text-[#eeeef2]">
                      {entry.topLift.name}: {entry.topLift.weight.toFixed(0)}kg
                    </span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
