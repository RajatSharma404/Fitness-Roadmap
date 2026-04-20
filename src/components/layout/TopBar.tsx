"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const titles: Record<string, { title: string; subtitle: string }> = {
  "/": { title: "Dashboard", subtitle: "Mission-first execution" },
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
    subtitle: "Macro planning and meal templates",
  },
};

export function TopBar() {
  const pathname = usePathname();
  const meta = titles[pathname] ?? titles["/"];

  return (
    <header className="flex flex-col gap-2 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(13,13,22,0.82)] px-6 py-4 backdrop-blur-xl md:px-8">
      <p className="text-xs uppercase tracking-[0.22em] text-[#636380]">
        FitFlow Planner
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
