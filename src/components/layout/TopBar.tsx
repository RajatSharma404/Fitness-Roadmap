"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const titles: Record<string, { title: string; subtitle: string }> = {
  "/": { title: "Dashboard", subtitle: "Mission-first execution" },
  "/dashboard": { title: "Dashboard", subtitle: "Mission-first execution" },
  "/analytics": {
    title: "Analytics & Progression Science",
    subtitle: "RP volume landmarks, lift plateaus, and DOTS standards",
  },
  "/leaderboard": {
    title: "Community & Gym Squads",
    subtitle: "Private clans, cooperative boss raids, and global leaderboards",
  },
  "/generator": {
    title: "Generator",
    subtitle: "Build a personalized workout plan step-by-step",
  },
  "/roadmap": {
    title: "Roadmap",
    subtitle: "Adaptive body transformation planner",
  },
  "/workouts": { title: "Workouts", subtitle: "Training plan and day view" },
  "/checkins": {
    title: "Check-ins",
    subtitle: "Recovery and progress tracking",
  },
  "/library": {
    title: "Library",
    subtitle: "Exercise cards and movement details",
  },
  "/nutrition": {
    title: "Nutrition",
    subtitle: "Daily food diary and macro templates",
  },
  "/tools": {
    title: "Tools",
    subtitle: "Free calorie, macro, and strength calculators",
  },
  "/guides": {
    title: "Guides",
    subtitle: "Training, form, recovery, and nutrition explainers",
  },
  "/about": {
    title: "About",
    subtitle: "What FitFlow is and how it helps",
  },
  "/terms": {
    title: "Terms",
    subtitle: "Usage terms and platform rules",
  },
  "/privacy": {
    title: "Privacy",
    subtitle: "How your data is handled",
  },
};

export function TopBar() {
  const pathname = usePathname();
  const meta = titles[pathname] ?? titles["/"];

  return (
    <header className="flex flex-col gap-1.5 border-b border-white/10 bg-[#0c0c16]/85 pl-16 pr-6 py-4 backdrop-blur-xl md:px-8">
      <p className="text-[10px] uppercase font-mono tracking-[0.22em] text-cyan-400">
        FitFlow Performance Console
      </p>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1
            className={cn(
              "font-display text-[28px] font-bold leading-tight text-[#eeeef2]",
            )}
          >
            {meta.title}
          </h1>
          <p className="mt-1 text-sm text-[#636380]">{meta.subtitle}</p>
        </div>
        <p className="font-mono text-xs text-[#60a5fa]">{pathname}</p>
      </div>
    </header>
  );
}
