"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Sparkles, X } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { Footer } from "@/components/layout/Footer";
import { AIChat } from "@/components/shared/AIChat";
import {
  defaultPlannerSnapshot,
  readPlannerSnapshot,
  syncPlannerSnapshotFromServer,
} from "@/lib/plannerView";

interface LiftItem {
  id: string;
  name: string;
  weight: number;
  reps: number;
  date: string;
}

interface MilestoneToast {
  title: string;
  xp: number;
  reason: string;
}

export function ShellChrome({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [snapshot, setSnapshot] = useState(defaultPlannerSnapshot);
  const [lifts, setLifts] = useState<LiftItem[]>([]);
  const [milestoneToast, setMilestoneToast] = useState<MilestoneToast | null>(null);

  useEffect(() => {
    const sync = () => {
      setSnapshot(readPlannerSnapshot());
    };

    sync();
    void syncPlannerSnapshotFromServer().then((serverSnapshot) => {
      setSnapshot(serverSnapshot);
    });
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  useEffect(() => {
    if (session) {
      fetch("/api/lifts")
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => setLifts(data))
        .catch((err) => console.error("Failed to fetch lifts for AI context:", err));
    }
  }, [session]);

  useEffect(() => {
    const handleOpenChat = () => {
      setIsChatOpen(true);
    };
    const handleMilestoneUnlocked = (e: Event) => {
      const customEvent = e as CustomEvent<MilestoneToast>;
      if (customEvent.detail) {
        setMilestoneToast(customEvent.detail);
        setTimeout(() => {
          setMilestoneToast((current) =>
            current?.title === customEvent.detail.title ? null : current,
          );
        }, 6000);
      }
    };

    window.addEventListener("open-ai-chat", handleOpenChat);
    window.addEventListener("roadmap-milestone-unlocked", handleMilestoneUnlocked);
    return () => {
      window.removeEventListener("open-ai-chat", handleOpenChat);
      window.removeEventListener("roadmap-milestone-unlocked", handleMilestoneUnlocked);
    };
  }, []);

  const unlockedNodesCount = Object.values(snapshot.progress).filter(Boolean).length;
  const chatContext = {
    goal: snapshot.input.goal,
    bodyweight: snapshot.input.weightKg,
    unlockedNodes: unlockedNodesCount,
    PRs: lifts.map((l) => ({ name: l.name, weight: l.weight, reps: l.reps })),
  };

  return (
    <div className="flex min-h-screen flex-col overflow-hidden bg-bg-void text-text-primary">
      {/* Milestone Unlock Floating Banner */}
      <AnimatePresence>
        {milestoneToast && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 max-w-sm"
          >
            <div className="bg-gradient-to-r from-[#121b14] to-[#0c1824] border border-green-500/40 rounded-2xl p-4 shadow-[0_0_30px_rgba(34,197,94,0.3)] backdrop-blur-xl flex items-start gap-3">
              <div className="p-2 rounded-xl bg-green-500/20 text-green-300 border border-green-500/30 shrink-0">
                <Trophy className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider font-bold text-green-400 font-mono">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Milestone Unlocked!</span>
                </div>
                <h4 className="font-display text-sm font-bold text-white truncate mt-0.5">
                  {milestoneToast.title}
                </h4>
                <p className="text-[11px] text-zinc-300 mt-1 leading-snug">
                  {milestoneToast.reason}
                </p>
                <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-mono font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-md">
                  +{milestoneToast.xp} XP Bounty Awarded
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMilestoneToast(null)}
                className="text-zinc-500 hover:text-white transition p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex min-h-screen overflow-hidden">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <TopBar />
          <main className="min-w-0 flex-1 overflow-y-auto p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
      <Footer />
      <AIChat
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen((prev) => !prev)}
        context={chatContext}
      />
    </div>
  );
}
