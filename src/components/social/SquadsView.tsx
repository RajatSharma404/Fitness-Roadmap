"use client";

import { useState } from "react";
import {
  Shield,
  Trophy,
  Users,
  Plus,
  Share2,
  Check,
  Flame,
  Crown,
  Dumbbell,
  Sparkles,
  Copy,
} from "lucide-react";
import { Squad, SquadMember, createCustomSquad } from "@/lib/squadEngine";
import { cn } from "@/lib/cn";

interface SquadsViewProps {
  squads: Squad[];
  activeSquadId: string;
  onSelectSquad: (squadId: string) => void;
  onSquadCreated: (newSquad: Squad) => void;
}

export function SquadsView({
  squads,
  activeSquadId,
  onSelectSquad,
  onSquadCreated,
}: SquadsViewProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);

  // Form state
  const [squadName, setSquadName] = useState("");
  const [squadTag, setSquadTag] = useState("");
  const [squadDesc, setSquadDesc] = useState("");

  const activeSquad =
    squads.find((s) => s.id === activeSquadId) || squads[0];

  const handleCopyInvite = () => {
    if (!activeSquad) return;
    navigator.clipboard.writeText(activeSquad.inviteCode);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2500);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!squadName.trim() || !squadTag.trim()) return;

    const created = createCustomSquad(squadName, squadTag, squadDesc, "You");
    onSquadCreated(created);
    setShowCreateModal(false);
    setSquadName("");
    setSquadTag("");
    setSquadDesc("");
  };

  const tonnagePercentage = activeSquad
    ? Math.min(
        100,
        Math.round(
          (activeSquad.currentWeeklyTonnageKg /
            activeSquad.weeklyTonnageTargetKg) *
            100,
        ),
      )
    : 0;

  return (
    <div className="space-y-6">
      {/* Squad Selector Carousel / Switcher */}
      <div className="flex items-center justify-between gap-3 overflow-x-auto pb-2">
        <div className="flex items-center gap-2">
          {squads.map((s) => {
            const isSelected = s.id === activeSquad?.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onSelectSquad(s.id)}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2 rounded-2xl border text-xs font-mono font-bold transition whitespace-nowrap",
                  isSelected
                    ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-md"
                    : "bg-white/[0.02] text-zinc-400 border-white/10 hover:text-white hover:border-white/20",
                )}
              >
                <span>{s.icon}</span>
                <span>[{s.tag}] {s.name}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs uppercase tracking-wider transition font-mono shrink-0 shadow-md"
        >
          <Plus className="w-3.5 h-3.5" /> Create Squad
        </button>
      </div>

      {activeSquad && (
        <div className="space-y-6">
          {/* Main Squad Hero Card */}
          <div className="p-6 rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/[0.03] to-purple-500/[0.03] space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-2xl shadow-inner">
                  {activeSquad.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                      [{activeSquad.tag}] Level {activeSquad.level}
                    </span>
                    <span className="text-xs text-zinc-500 font-mono">
                      {activeSquad.xp.toLocaleString()} XP
                    </span>
                  </div>
                  <h3 className="font-display text-2xl font-bold text-white mt-0.5">
                    {activeSquad.name}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 max-w-xl">
                    {activeSquad.description}
                  </p>
                </div>
              </div>

              {/* Invite Code Badge */}
              <div className="flex items-center gap-2">
                <div
                  onClick={handleCopyInvite}
                  className="px-3.5 py-2 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-cyan-500/40 cursor-pointer transition flex items-center gap-2 font-mono text-xs text-zinc-300"
                >
                  <span className="text-zinc-500 uppercase text-[10px]">Invite Code:</span>
                  <span className="font-bold text-cyan-300">{activeSquad.inviteCode}</span>
                  {copiedInvite ? (
                    <Check className="w-3.5 h-3.5 text-green-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-zinc-400" />
                  )}
                </div>
              </div>
            </div>

            {/* Weekly Tonnage Milestone Progress Gauge */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2.5 font-mono">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="flex items-center gap-1.5 text-amber-400 font-bold uppercase">
                  <Flame className="w-4 h-4" /> Weekly Squad Tonnage Milestone
                </span>
                <span className="text-zinc-300">
                  <strong className="text-white font-bold">
                    {activeSquad.currentWeeklyTonnageKg.toLocaleString()}
                  </strong>{" "}
                  / {activeSquad.weeklyTonnageTargetKg.toLocaleString()} kg ({tonnagePercentage}%)
                </span>
              </div>

              <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-green-400 rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                  style={{ width: `${tonnagePercentage}%` }}
                />
              </div>

              <div className="flex justify-between text-[10px] text-zinc-500">
                <span>0 kg (Reset Sunday midnight)</span>
                <span>Unlocks +15% XP Clan Boost</span>
              </div>
            </div>
          </div>

          {/* Member Roster & Contribution Leaderboard */}
          <div className="p-5 sm:p-6 rounded-3xl border border-white/10 bg-white/[0.02] space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase font-mono tracking-widest text-cyan-400">
                  Squad Roster
                </span>
                <h4 className="font-display text-lg font-bold text-white">
                  Member Tonnage Leaderboard
                </h4>
              </div>
              <span className="text-xs font-mono text-zinc-400">
                {activeSquad.members.length} Active Lifters
              </span>
            </div>

            <div className="space-y-2 font-mono">
              {activeSquad.members.map((member, idx) => {
                const isLeader = member.role === "LEADER";

                return (
                  <div
                    key={member.userId}
                    className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition flex flex-wrap items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 text-center text-xs font-bold text-zinc-500">
                        #{idx + 1}
                      </span>
                      <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-sm font-bold text-white">
                        {member.name.slice(0, 1)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-display text-sm font-bold text-white">
                            {member.name}
                          </h5>
                          <span
                            className={cn(
                              "text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase",
                              isLeader
                                ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                                : "bg-white/5 text-zinc-400 border-white/10",
                            )}
                          >
                            {member.role}
                          </span>
                        </div>
                        <span className="text-[10px] text-zinc-400 block font-mono">
                          Top: {member.bestLiftName} ({member.bestLiftWeight} kg)
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-bold text-cyan-300 block">
                        +{member.weeklyTonnageContributedKg.toLocaleString()} kg
                      </span>
                      <span className="text-[10px] text-zinc-500">
                        {member.workoutsCompletedThisWeek} workouts this week
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Create Squad Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-60 bg-black/85 p-4 backdrop-blur-md flex items-center justify-center">
          <div className="w-full max-w-md bg-[#0d0d18] border border-white/15 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h4 className="font-display text-lg font-bold text-white">
                Found a New Gym Squad
              </h4>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 font-mono">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Squad Name</label>
                <input
                  type="text"
                  placeholder="e.g. Iron Forge, Kerala Powerlifters..."
                  value={squadName}
                  onChange={(e) => setSquadName(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-white/10 bg-white/[0.04] text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Squad Tag (2-5 letters)</label>
                <input
                  type="text"
                  maxLength={5}
                  placeholder="e.g. FORGE, TITAN, APEX"
                  value={squadTag}
                  onChange={(e) => setSquadTag(e.target.value.toUpperCase())}
                  className="w-full h-10 px-3 rounded-xl border border-white/10 bg-white/[0.04] text-sm text-cyan-300 font-bold focus:outline-none focus:border-cyan-400 uppercase"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Squad Lore / Mission</label>
                <textarea
                  rows={2}
                  placeholder="What is your clan's training focus?"
                  value={squadDesc}
                  onChange={(e) => setSquadDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!squadName.trim() || !squadTag.trim()}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs uppercase tracking-wider transition"
                >
                  Found Squad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
