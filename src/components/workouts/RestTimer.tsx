"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Volume2,
  VolumeX,
  FastForward,
  Play,
  Pause,
  RotateCcw,
} from "lucide-react";
import { playCountdownBeep } from "@/lib/audioTimer";
import { cn } from "@/lib/cn";

interface RestTimerProps {
  initialSeconds?: number;
  isActive: boolean;
  onFinish?: () => void;
  exerciseName?: string;
  nextSetNumber?: number;
}

function RestTimerCountdown({
  initialSeconds = 90,
  onFinish,
  exerciseName,
  nextSetNumber,
}: {
  initialSeconds?: number;
  onFinish?: () => void;
  exerciseName?: string;
  nextSetNumber?: number;
}) {
  const [totalSeconds, setTotalSeconds] = useState(initialSeconds);
  const [remainingSeconds, setRemainingSeconds] = useState(initialSeconds);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const lastBeepSecond = useRef<number | null>(null);

  // Main countdown timer interval
  useEffect(() => {
    if (isPaused || remainingSeconds <= 0) {
      if (remainingSeconds === 0) {
        if (!isMuted) {
          playCountdownBeep(true);
        }
        onFinish?.();
      }
      return;
    }

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        const next = prev - 1;

        // Play 3, 2, 1 prep beeps
        if (!isMuted && next >= 1 && next <= 3 && lastBeepSecond.current !== next) {
          lastBeepSecond.current = next;
          playCountdownBeep(false);
        }

        return Math.max(0, next);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, remainingSeconds, isMuted, onFinish]);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const progressPct = totalSeconds > 0 ? (remainingSeconds / totalSeconds) * 100 : 0;
  const circumference = 2 * Math.PI * 44; // r = 44
  const strokeDashoffset = circumference - (progressPct / 100) * circumference;

  const adjustTime = (delta: number) => {
    setRemainingSeconds((prev) => Math.max(1, prev + delta));
    setTotalSeconds((prev) => Math.max(1, prev + Math.max(0, delta)));
  };

  return (
    <AnimatePresence>
      {isMinimized ? (
        /* Floating Mini Banner */
        <motion.div
          key="minimized-timer"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          onClick={() => setIsMinimized(false)}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#12121e]/95 border border-cyan-400/40 rounded-full px-5 py-2.5 shadow-[0_0_25px_rgba(6,182,212,0.3)] backdrop-blur-xl flex items-center gap-3 cursor-pointer hover:border-cyan-300 transition"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-mono text-sm font-bold text-white">
            Rest: {formattedTime}
          </span>
          <span className="text-[11px] text-cyan-300 font-mono">
            {exerciseName ? `(${exerciseName})` : ""} Expand ↗
          </span>
        </motion.div>
      ) : (
        /* Full Rest Overlay Card */
        <motion.div
          key="full-timer"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4"
        >
          <div className="bg-gradient-to-b from-[#141422]/98 to-[#090910]/98 border border-cyan-500/40 rounded-3xl p-5 shadow-[0_0_35px_rgba(6,182,212,0.35)] backdrop-blur-2xl text-center space-y-4">
            {/* Top Bar with Mute & Minimize */}
            <div className="flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => setIsMuted((prev) => !prev)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition"
                title={isMuted ? "Unmute countdown chimes" : "Mute countdown chimes"}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-300" />}
              </button>

              <div className="flex flex-col items-center">
                <span className="text-[10px] font-bold font-mono tracking-[0.2em] uppercase text-cyan-400">
                  Rest Interval
                </span>
                {exerciseName && (
                  <span className="text-xs font-bold text-white truncate max-w-[160px]">
                    Next: {exerciseName} {nextSetNumber ? `(Set ${nextSetNumber})` : ""}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsMinimized(true)}
                className="p-1.5 px-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white text-xs font-mono transition"
              >
                Minimize ↘
              </button>
            </div>

            {/* Circular Countdown Gauge */}
            <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth="6"
                />
                {/* Glowing Progress Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  fill="none"
                  stroke={remainingSeconds <= 5 ? "#ef4444" : "#00d4ff"}
                  strokeWidth="6"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>

              {/* Time Numbers */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className={cn(
                    "font-mono text-3xl font-extrabold tracking-tight transition-colors",
                    remainingSeconds <= 5 ? "text-red-400 animate-pulse" : "text-white",
                  )}
                >
                  {formattedTime}
                </span>
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mt-0.5">
                  {isPaused ? "Paused" : "Remaining"}
                </span>
              </div>
            </div>

            {/* Time Adjustment Controls */}
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => adjustTime(-15)}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-mono font-bold border border-white/5 transition"
              >
                -15s
              </button>
              <button
                type="button"
                onClick={() => setIsPaused((prev) => !prev)}
                className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold transition shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              >
                {isPaused ? <Play className="w-4 h-4 fill-black" /> : <Pause className="w-4 h-4 fill-black" />}
              </button>
              <button
                type="button"
                onClick={() => adjustTime(15)}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-mono font-bold border border-white/5 transition"
              >
                +15s
              </button>
              <button
                type="button"
                onClick={() => adjustTime(30)}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-mono font-bold border border-white/5 transition"
              >
                +30s
              </button>
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setRemainingSeconds(totalSeconds)}
                className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-white font-mono transition"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>

              <button
                type="button"
                onClick={() => {
                  setRemainingSeconds(0);
                  onFinish?.();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-green-500/20 text-green-300 hover:bg-green-500/30 border border-green-500/40 text-xs font-bold font-mono transition"
              >
                <FastForward className="w-3.5 h-3.5" /> Skip Rest
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function RestTimer({
  initialSeconds = 90,
  isActive,
  onFinish,
  exerciseName,
  nextSetNumber,
}: RestTimerProps) {
  if (!isActive) return null;

  return (
    <RestTimerCountdown
      key={`${exerciseName || "rest"}-${nextSetNumber || 0}`}
      initialSeconds={initialSeconds}
      onFinish={onFinish}
      exerciseName={exerciseName}
      nextSetNumber={nextSetNumber}
    />
  );
}
