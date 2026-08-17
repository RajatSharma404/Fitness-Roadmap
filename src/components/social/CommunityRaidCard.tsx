"use client";

import { Shield, Flame, Trophy, Clock, Sparkles, Swords, Award } from "lucide-react";
import { RaidBoss, UserRaidContribution } from "@/lib/raidBossEngine";
import { cn } from "@/lib/cn";

interface CommunityRaidCardProps {
  boss: RaidBoss;
  userContribution: UserRaidContribution;
}

export function CommunityRaidCard({
  boss,
  userContribution,
}: CommunityRaidCardProps) {
  const hpPercent = Math.max(
    0,
    Math.round((boss.currentHpKg / boss.maxHpKg) * 100),
  );
  const damageDealtCommunity = boss.maxHpKg - boss.currentHpKg;

  const getRoleBadge = (role: UserRaidContribution["roleArchetype"]) => {
    switch (role) {
      case "VANGUARD_TANK":
        return { label: "🛡️ Vanguard Tank", color: "text-amber-300 border-amber-500/30 bg-amber-500/10" };
      case "DAMAGE_DEALER":
        return { label: "🗡️ Damage Dealer", color: "text-cyan-300 border-cyan-500/30 bg-cyan-500/10" };
      case "BERSERKER":
        return { label: "⚡ Berserker", color: "text-purple-300 border-purple-500/30 bg-purple-500/10" };
      default:
        return { label: "⚔️ Raid Recruit", color: "text-zinc-300 border-white/10 bg-white/5" };
    }
  };

  const roleInfo = getRoleBadge(userContribution.roleArchetype);

  return (
    <div className="p-6 rounded-3xl border border-white/10 bg-gradient-to-b from-red-500/[0.04] via-[#0d0d18] to-black space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-3xl shadow-inner animate-pulse">
            {boss.avatarIcon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold font-mono uppercase tracking-widest text-red-400">
                Cooperative Community Raid
              </span>
              <span className="flex items-center gap-1 text-[10px] font-mono text-zinc-400">
                <Clock className="w-3 h-3 text-zinc-500" /> Resets in {boss.expiresInDays} days
              </span>
            </div>
            <h3 className="font-display text-2xl font-bold text-white mt-0.5">
              {boss.name}
            </h3>
            <p className="text-xs text-red-300/80 font-mono">
              {boss.title}
            </p>
          </div>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center gap-1.5 font-mono text-xs text-purple-300">
          <Award className="w-4 h-4 text-purple-400" />
          <span>Reward: {boss.rewardTitle} (+{boss.rewardXp} XP)</span>
        </div>
      </div>

      {/* Lore Description */}
      <p className="text-xs text-zinc-300 leading-relaxed max-w-2xl">
        {boss.lore}
      </p>

      {/* Boss Health Bar */}
      <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-3 font-mono">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="flex items-center gap-1.5 text-red-400 font-bold uppercase tracking-wider">
            <Swords className="w-4 h-4" /> Boss HP: {boss.currentHpKg.toLocaleString()} / {boss.maxHpKg.toLocaleString()} kg
          </span>
          <span className="text-zinc-400">
            Community Damage: <strong className="text-white font-bold">{damageDealtCommunity.toLocaleString()} kg</strong> ({100 - hpPercent}% destroyed)
          </span>
        </div>

        <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 relative">
          <div
            className="h-full bg-gradient-to-r from-red-600 via-amber-500 to-green-500 rounded-full transition-all duration-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]"
            style={{ width: `${hpPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-zinc-400">
          <span className="text-cyan-300 font-semibold">Weakness: {boss.weakness}</span>
          <span>Target: 0 HP to Claim Loot</span>
        </div>
      </div>

      {/* User Contribution Tile */}
      <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <span className="text-xs font-mono font-bold uppercase text-zinc-300 flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-cyan-400" /> Your Personal Raid Contribution
          </span>
          <span className={cn("text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full border", roleInfo.color)}>
            {roleInfo.label}
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 font-mono">
          <div className="p-3 rounded-xl bg-black/40 border border-white/5">
            <span className="text-[10px] uppercase text-zinc-500 block">Damage Dealt</span>
            <span className="text-lg font-bold text-cyan-300">
              +{userContribution.damageDealtKg.toLocaleString()} kg
            </span>
          </div>

          <div className="p-3 rounded-xl bg-black/40 border border-white/5">
            <span className="text-[10px] uppercase text-zinc-500 block">% of Boss HP</span>
            <span className="text-lg font-bold text-amber-300">
              {userContribution.percentageOfBossHp}%
            </span>
          </div>

          <div className="p-3 rounded-xl bg-black/40 border border-white/5">
            <span className="text-[10px] uppercase text-zinc-500 block">Raid Rank</span>
            <span className="text-lg font-bold text-green-300">
              Top #{userContribution.rankInRaid} Contributor
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
