"use client";

import { motion } from "framer-motion";
import { TrendingUp, Target } from "lucide-react";
import { cn } from "@/lib/cn";

interface NextUnlockProps {
  node: {
    id: string;
    name: string;
    track: string;
    unlockCriteria: Record<string, unknown>;
  } | null;
  progress: number;
  delta: {
    lift: string;
    current: number;
    target: number;
    unit: string;
  } | null;
}

const trackColors: Record<string, string> = {
  BEGINNER: "text-emerald-400",
  INTERMEDIATE: "text-blue-400",
  ADVANCED: "text-violet-400",
  ELITE: "text-amber-400",
};

export function NextUnlock({ node, progress, delta }: NextUnlockProps) {
  if (!node) {
    return (
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
            <Target className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Next Unlock</h3>
          </div>
        </div>
        <div className="text-center py-8 text-zinc-400">
          Complete more nodes to see what&apos;s next!
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
          <Target className="w-5 h-5 text-violet-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Next Unlock</h3>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div
            className={cn(
              "text-sm font-medium mb-1",
              trackColors[node.track] || "text-zinc-400",
            )}
          >
            {node.track.toLowerCase()}
          </div>
          <div className="text-xl font-bold text-white">{node.name}</div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-zinc-400">Progress</span>
            <span className="text-white font-medium">
              {progress.toFixed(0)}%
            </span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, progress)}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full"
            />
          </div>
        </div>

        {/* Delta needed */}
        {delta && (
          <div className="p-4 bg-zinc-800/50 rounded-lg">
            <div className="flex items-center gap-2 text-zinc-400 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">Need to reach</span>
            </div>
            <div className="text-lg text-white">
              {delta.lift}: {delta.target.toFixed(1)} {delta.unit}
              <span className="text-zinc-500 text-sm ml-2">
                (currently {delta.current.toFixed(1)})
              </span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
