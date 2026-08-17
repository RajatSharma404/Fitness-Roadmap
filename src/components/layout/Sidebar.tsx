"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import {
  Activity,
  BookOpen,
  ChartColumnIncreasing,
  Dumbbell,
  Home,
  LayoutDashboard,
  Menu,
  NotebookPen,
  Settings,
  X,
  Trophy,
  User,
  LogOut,
  LogIn,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { ProgressRing } from "./ProgressRing";

interface SidebarNavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  section: "core" | "plan" | "learn";
}

const navItems: SidebarNavItem[] = [
  { href: "/", label: "Dashboard", icon: Home, section: "core" },
  {
    href: "/roadmap",
    label: "Roadmap",
    icon: LayoutDashboard,
    section: "core",
  },
  {
    href: "/analytics",
    label: "Analytics",
    icon: Activity,
    section: "core",
  },
  {
    href: "/leaderboard",
    label: "Community & Squads",
    icon: Trophy,
    section: "core",
  },
  {
    href: "/generator",
    label: "Generator",
    icon: Menu,
    section: "plan",
  },
  { href: "/workouts", label: "Workouts", icon: Dumbbell, section: "plan" },
  {
    href: "/checkins",
    label: "Check-ins",
    icon: NotebookPen,
    section: "plan",
  },
  {
    href: "/library",
    label: "Library",
    icon: BookOpen,
    section: "plan",
  },
  {
    href: "/nutrition",
    label: "Nutrition",
    icon: ChartColumnIncreasing,
    section: "plan",
  },
  { href: "/tools", label: "Tools", icon: Settings, section: "learn" },
  { href: "/guides", label: "Guides", icon: BookOpen, section: "learn" },
];

const sectionTitles: Record<SidebarNavItem["section"], string> = {
  core: "Command",
  plan: "Execution",
  learn: "Knowledge",
};

interface SidebarProps {
  readiness?: number;
  todayLabel?: string;
}

export function Sidebar({
  readiness = 78,
  todayLabel = "Push Day (Hypertrophy)",
}: Readonly<SidebarProps>) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { data: session, status } = useSession();

  // Close mobile drawer on route change or ESC
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navContent = (
    <div className="flex h-full flex-col justify-between overflow-hidden">
      {/* Brand Header */}
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4 shrink-0 bg-black/20">
        <div className="flex items-center gap-3">
          <Image
            src="/logo-fitflow.svg"
            alt="FitFlow logo"
            width={40}
            height={40}
            className="h-10 w-10 rounded-2xl shadow-md border border-cyan-500/30"
            priority
          />
          <div>
            <p className="font-display text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
              FitFlow <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">PRO</span>
            </p>
            <p className="text-[10px] uppercase font-mono tracking-widest text-zinc-400">
              Performance Console
            </p>
          </div>
        </div>

        <button
          type="button"
          className="rounded-xl border border-white/10 bg-white/5 p-2 text-zinc-400 hover:text-white hover:bg-white/10 md:hidden transition"
          onClick={() => setIsOpen(false)}
          aria-label="Close navigation"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-4 scrollbar-thin">
        {(["core", "plan", "learn"] as const).map((section) => (
          <div key={section} className="space-y-1">
            <p className="px-3 text-[10px] uppercase font-mono font-bold tracking-widest text-zinc-500">
              {sectionTitles[section]}
            </p>
            {navItems
              .filter((item) => item.section === section)
              .map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center justify-between rounded-xl px-3.5 py-2 text-xs font-mono font-medium transition-all duration-150 group",
                      active
                        ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold shadow-sm"
                        : "text-zinc-400 hover:bg-white/[0.04] hover:text-white border border-transparent",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={cn(
                          "h-4 w-4 transition",
                          active
                            ? "text-cyan-400"
                            : "text-zinc-500 group-hover:text-zinc-300",
                        )}
                      />
                      <span>{item.label}</span>
                    </div>

                    {active && (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                    )}
                  </Link>
                );
              })}
          </div>
        ))}
      </nav>

      {/* Bottom Profile & Readiness Section */}
      <div className="border-t border-white/10 px-4 py-4 space-y-3 shrink-0 bg-black/40 font-mono">
        {/* Readiness Compact Tile */}
        <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
          <ProgressRing value={readiness} size={44} strokeWidth={4} />
          <div>
            <span className="text-[10px] uppercase text-zinc-500 block">Daily Readiness</span>
            <span className="text-sm font-bold text-white">
              {readiness}% · <span className="text-cyan-300">{readiness >= 75 ? "Optimal" : "Fatigued"}</span>
            </span>
          </div>
        </div>

        {/* User Profile / Auth Button */}
        {status === "authenticated" && session?.user ? (
          <div className="flex items-center gap-2 p-2 rounded-2xl border border-white/10 bg-white/[0.02]">
            <Link
              href={`/profile/${session.user.id}`}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 flex-1 min-w-0"
            >
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0 border border-white/10 text-xs font-bold text-cyan-300">
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || ""}
                    width={32}
                    height={32}
                    className="object-cover"
                  />
                ) : (
                  (session.user.name || "U")[0]
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">
                  {session.user.name || "Athlete"}
                </p>
                <p className="text-[10px] text-zinc-500 truncate">Account Active</p>
              </div>
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              type="button"
              className="p-1.5 hover:bg-red-500/10 rounded-xl text-zinc-500 hover:text-red-400 transition shrink-0"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs font-bold text-cyan-300 transition hover:bg-cyan-500/20"
          >
            <LogIn className="h-4 w-4" />
            Sign In / Guest Active
          </button>
        )}

        {/* Footer Legal Links */}
        <div className="flex items-center justify-center gap-3 text-[10px] text-zinc-500 pt-1">
          <Link href="/about" className="hover:text-zinc-300">About</Link>
          <span>·</span>
          <Link href="/terms" className="hover:text-zinc-300">Terms</Link>
          <span>·</span>
          <Link href="/privacy" className="hover:text-zinc-300">Privacy</Link>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Sleek Floating Mobile Menu Trigger Button */}
      <button
        type="button"
        className="fixed left-4 top-3.5 z-40 inline-flex items-center justify-center rounded-2xl border border-white/15 bg-[#0c0c16]/90 p-2.5 text-white shadow-2xl backdrop-blur-xl md:hidden hover:border-cyan-400/50 transition active:scale-95"
        onClick={() => setIsOpen(true)}
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5 text-cyan-300" />
      </button>

      {/* Desktop Sidebar */}
      <aside className="hidden h-screen w-60 shrink-0 border-r border-white/10 bg-[#0c0c16]/95 backdrop-blur-2xl md:flex md:flex-col shadow-xl">
        {navContent}
      </aside>

      {/* Mobile Backdrop Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/80 backdrop-blur-md transition-opacity duration-300 md:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setIsOpen(false)}
      />

      {/* Mobile Drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/15 bg-[#0a0a14] shadow-2xl transition-transform duration-300 ease-out md:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {navContent}
      </aside>
    </>
  );
}
