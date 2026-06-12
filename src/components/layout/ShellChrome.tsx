"use client";

import dynamic from "next/dynamic";
import { ReactNode, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Footer } from "./Footer";
import { AIChat } from "../shared/AIChat";
import {
  defaultPlannerSnapshot,
  readPlannerSnapshot,
  syncPlannerSnapshotFromServer,
} from "@/lib/plannerView";

const Sidebar = dynamic(() => import("./Sidebar").then((mod) => mod.Sidebar), {
  ssr: false,
  loading: () => (
    <aside className="hidden h-screen w-55 shrink-0 border-r border-[rgba(255,255,255,0.06)] bg-[rgba(13,13,22,0.92)] backdrop-blur-xl md:flex md:flex-col" />
  ),
});

const TopBar = dynamic(() => import("./TopBar").then((mod) => mod.TopBar), {
  ssr: false,
  loading: () => (
    <header className="flex min-h-22 flex-col gap-2 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(13,13,22,0.82)] px-6 py-4 backdrop-blur-xl md:px-8" />
  ),
});

interface ShellChromeProps {
  children: ReactNode;
}

export function ShellChrome({ children }: Readonly<ShellChromeProps>) {
  const { data: session } = useSession();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [snapshot, setSnapshot] = useState(defaultPlannerSnapshot);
  const [lifts, setLifts] = useState<Array<{ name: string; weight: number; reps: number }>>([]);

  useEffect(() => {
    const sync = () => setSnapshot(readPlannerSnapshot());
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
    window.addEventListener("open-ai-chat", handleOpenChat);
    return () => window.removeEventListener("open-ai-chat", handleOpenChat);
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

