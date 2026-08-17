"use client";

import { useState, useRef } from "react";
import {
  X,
  Share2,
  Download,
  Flame,
  Sparkles,
  Trophy,
  Check,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/cn";

export interface PRStoryCardData {
  athleteName: string;
  liftName: string;
  weightKg: number;
  reps: number;
  oneRM: number;
  xpGained: number;
  dateStr?: string;
  dotsScore?: number;
}

interface PRStoryCardModalProps {
  data: PRStoryCardData;
  isOpen: boolean;
  onClose: () => void;
}

type CardTheme = "cyberpunk" | "solar" | "emerald" | "onyx";

export function PRStoryCardModal({
  data,
  isOpen,
  onClose,
}: PRStoryCardModalProps) {
  const [theme, setTheme] = useState<CardTheme>("cyberpunk");
  const [copiedLink, setCopiedLink] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const getThemeStyles = (t: CardTheme) => {
    switch (t) {
      case "solar":
        return {
          gradient: "from-amber-600 via-red-600 to-black",
          accentText: "text-amber-300",
          badgeBorder: "border-amber-400/40 bg-amber-500/20 text-amber-300",
          glow: "shadow-[0_0_40px_rgba(245,158,11,0.3)]",
        };
      case "emerald":
        return {
          gradient: "from-emerald-600 via-teal-900 to-black",
          accentText: "text-emerald-300",
          badgeBorder: "border-emerald-400/40 bg-emerald-500/20 text-emerald-300",
          glow: "shadow-[0_0_40px_rgba(16,185,129,0.3)]",
        };
      case "onyx":
        return {
          gradient: "from-zinc-800 via-zinc-950 to-black",
          accentText: "text-white",
          badgeBorder: "border-white/20 bg-white/10 text-white",
          glow: "shadow-[0_0_40px_rgba(255,255,255,0.1)]",
        };
      default:
        return {
          gradient: "from-cyan-600 via-indigo-950 to-black",
          accentText: "text-cyan-300",
          badgeBorder: "border-cyan-400/40 bg-cyan-500/20 text-cyan-300",
          glow: "shadow-[0_0_40px_rgba(6,182,212,0.3)]",
        };
    }
  };

  const currentTheme = getThemeStyles(theme);

  const handleShareWhatsApp = () => {
    const text = `🔥 *NEW PR CRUSHED on FitFlow!* 🔥\n\n🏋️‍♂️ *${data.liftName}:* ${data.weightKg} kg × ${data.reps} reps\n📈 *Estimated 1RM:* ${data.oneRM} kg\n⚡ *XP Gained:* +${data.xpGained} XP\n\nTrack your strength journey on FitFlow 💪`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/90 p-4 backdrop-blur-md flex items-center justify-center overflow-y-auto">
      <div className="w-full max-w-lg bg-[#0c0c16] border border-white/15 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-6 my-auto max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <span className="text-[10px] font-bold uppercase font-mono tracking-widest text-cyan-400">
              Shareable Story Card
            </span>
            <h4 className="font-display text-lg font-bold text-white">
              Instagram & WhatsApp PR Card
            </h4>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Theme Picker */}
        <div className="flex items-center justify-between gap-2 font-mono text-xs">
          <span className="text-zinc-400 text-[11px]">Card Theme:</span>
          <div className="flex gap-1.5">
            {(["cyberpunk", "solar", "emerald", "onyx"] as CardTheme[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTheme(t)}
                className={cn(
                  "px-3 py-1 rounded-xl border text-[10px] uppercase font-bold transition",
                  theme === t
                    ? "border-cyan-400 bg-cyan-500/20 text-cyan-300"
                    : "border-white/10 bg-white/[0.02] text-zinc-400 hover:text-white",
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* The 9:16 Canvas Story Card Preview */}
        <div className="flex justify-center">
          <div
            ref={cardRef}
            className={cn(
              "w-full max-w-[320px] aspect-[9/14] rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden border border-white/20 transition-all duration-300",
              `bg-gradient-to-b ${currentTheme.gradient}`,
              currentTheme.glow,
            )}
          >
            {/* Top Watermark & Athlete Tag */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-display font-black tracking-widest uppercase text-white/90">
                FITFLOW
              </span>
              <span className={cn("text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border", currentTheme.badgeBorder)}>
                PR UNLOCKED
              </span>
            </div>

            {/* Middle Main Lift Callout */}
            <div className="my-auto text-center space-y-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-white/70 block">
                {data.athleteName || "ATHLETE"}
              </span>

              <h3 className="font-display text-2xl font-black text-white leading-tight uppercase">
                {data.liftName}
              </h3>

              <div className="py-2">
                <span className={cn("font-display text-5xl font-black tracking-tight block", currentTheme.accentText)}>
                  {data.weightKg} <span className="text-2xl font-mono text-white/80">KG</span>
                </span>
                <span className="text-xs font-mono text-white/70 block mt-1">
                  {data.reps} {data.reps === 1 ? "Rep (1RM)" : "Reps"} · Est 1RM: {data.oneRM} kg
                </span>
              </div>
            </div>

            {/* Bottom Footer Stats */}
            <div className="pt-4 border-t border-white/15 flex items-center justify-between font-mono text-xs">
              <div className="flex items-center gap-1 text-cyan-300 font-bold">
                <Zap className="w-3.5 h-3.5" /> +{data.xpGained} XP
              </div>
              <span className="text-[10px] text-white/60">
                {data.dateStr || new Date().toISOString().slice(0, 10)}
              </span>
            </div>
          </div>
        </div>

        {/* Share Action Buttons */}
        <div className="grid grid-cols-2 gap-3 font-mono pt-2">
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="py-2.5 px-4 rounded-xl bg-green-500 hover:bg-green-400 text-black font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-1.5 shadow-md"
          >
            <Share2 className="w-4 h-4" /> Share WhatsApp
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-1.5 border border-white/10"
          >
            {copiedLink ? <Check className="w-4 h-4 text-green-400" /> : <Sparkles className="w-4 h-4" />}
            {copiedLink ? "Copied!" : "Copy PR Story"}
          </button>
        </div>
      </div>
    </div>
  );
}
