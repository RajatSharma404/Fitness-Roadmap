"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  ChartColumnIncreasing,
  Dumbbell,
  Home,
  LayoutDashboard,
  Menu,
  NotebookPen,
  Settings,
  X,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { ProgressRing } from "./ProgressRing";

interface SidebarNavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: SidebarNavItem[] = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/roadmap", label: "Roadmap", icon: LayoutDashboard },
  { href: "/workouts", label: "Workouts", icon: Dumbbell },
  { href: "/checkins", label: "Check-ins", icon: NotebookPen },
  { href: "/library", label: "Library", icon: BookOpen },
  { href: "/nutrition", label: "Nutrition", icon: ChartColumnIncreasing },
];

interface SidebarProps {
  readiness?: number;
  todayLabel?: string;
}

export function Sidebar({
  readiness = 74,
  todayLabel = "Push Day",
}: Readonly<SidebarProps>) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navContent = (
    <>
      <div className="flex items-center justify-between gap-3 border-b border-[rgba(255,255,255,0.06)] px-5 py-4">
        <div>
          <p className="font-display text-lg font-bold tracking-tight text-[#eeeef2]">
            FitFlow
          </p>
          <p className="text-xs uppercase tracking-[0.2em] text-[#636380]">
            Performance Console
          </p>
        </div>
        <button
          type="button"
          className="rounded-md border border-[rgba(255,255,255,0.06)] p-2 text-[#eeeef2] md:hidden"
          onClick={() => setIsOpen(false)}
          aria-label="Close navigation"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm transition-all duration-150",
                active
                  ? "border-l-2 border-cyan-400 bg-cyan-400/5 text-cyan-300 font-medium"
                  : "text-[#636380] hover:bg-[rgba(255,255,255,0.03)] hover:text-[#eeeef2]",
              )}
            >
              <Icon className="mr-3 h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[rgba(255,255,255,0.06)] px-5 py-4 space-y-4">
        <div className="flex items-center gap-4">
          <ProgressRing value={readiness} size={56} strokeWidth={5} />
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#636380]">
              Readiness
            </p>
            <p className="font-mono text-2xl font-bold text-[#eeeef2]">
              {readiness}
            </p>
          </div>
        </div>
        <div className="rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-3 text-sm text-[#eeeef2]">
          <p className="text-xs uppercase tracking-[0.2em] text-[#636380]">
            Today
          </p>
          <p className="mt-1 font-semibold text-cyan-300">{todayLabel}</p>
        </div>
        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-md border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] px-3 py-2 text-sm text-[#eeeef2] transition hover:border-cyan-400/50 hover:bg-cyan-400/5"
        >
          <Settings className="h-4 w-4" />
          Settings
        </button>
      </div>
    </>
  );

  return (
    <>
      <button
        type="button"
        className="fixed left-4 top-4 z-50 inline-flex items-center justify-center rounded-md border border-[rgba(255,255,255,0.08)] bg-[rgba(13,13,22,0.9)] p-2 text-[#eeeef2] shadow-lg md:hidden"
        onClick={() => setIsOpen(true)}
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </button>

      <aside className="hidden h-screen w-55 shrink-0 border-r border-[rgba(255,255,255,0.06)] bg-[rgba(13,13,22,0.92)] backdrop-blur-xl md:flex md:flex-col">
        {navContent}
      </aside>

      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity md:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setIsOpen(false)}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-70 flex-col border-r border-[rgba(255,255,255,0.06)] bg-[rgba(13,13,22,0.98)] backdrop-blur-xl transition-transform duration-200 md:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {navContent}
      </aside>
    </>
  );
}
