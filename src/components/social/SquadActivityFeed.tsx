"use client";

import { Flame, Dumbbell, Zap, Sparkles, Trophy } from "lucide-react";
import { SquadActivityItem } from "@/lib/squadEngine";
import { cn } from "@/lib/cn";

interface SquadActivityFeedProps {
  activities: SquadActivityItem[];
  onToggleFistbump: (activityId: string) => void;
  currentUserId?: string;
}

export function SquadActivityFeed({
  activities,
  onToggleFistbump,
  currentUserId = "current-user",
}: SquadActivityFeedProps) {
  const getActivityIcon = (type: SquadActivityItem["type"]) => {
    switch (type) {
      case "PR_BROKEN":
        return <Flame className="w-4 h-4 text-amber-400" />;
      case "NODE_UNLOCKED":
        return <Zap className="w-4 h-4 text-cyan-400" />;
      case "LEVEL_UP":
        return <Trophy className="w-4 h-4 text-purple-400" />;
      default:
        return <Dumbbell className="w-4 h-4 text-green-400" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div>
          <span className="text-[10px] font-bold uppercase font-mono tracking-widest text-cyan-400">
            Real-Time Squad Stream
          </span>
          <h4 className="font-display text-lg font-bold text-white">
            Live Activity & Cheering Feed
          </h4>
        </div>
        <span className="text-xs font-mono text-zinc-500">Live Sync</span>
      </div>

      {/* Feed List */}
      <div className="space-y-3">
        {activities.map((item) => {
          const hasFistbumped = item.fistbumpedByUserIds.includes(currentUserId);

          return (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition space-y-2.5"
            >
              {/* Row Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    {getActivityIcon(item.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display text-sm font-bold text-white">
                        {item.userName}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">
                        · {item.timestamp}
                      </span>
                    </div>
                    <h5 className="font-display text-sm font-bold text-cyan-300 mt-0.5">
                      {item.title}
                    </h5>
                  </div>
                </div>

                {/* Fistbump Button */}
                <button
                  type="button"
                  onClick={() => onToggleFistbump(item.id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition select-none",
                    hasFistbumped
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md"
                      : "bg-white/[0.03] text-zinc-400 border-white/10 hover:text-white hover:border-white/20",
                  )}
                >
                  <span className="text-sm">👊</span>
                  <span>{item.fistbumpsCount}</span>
                </button>
              </div>

              {/* Description */}
              <p className="text-xs text-zinc-300 pl-10 leading-relaxed">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
