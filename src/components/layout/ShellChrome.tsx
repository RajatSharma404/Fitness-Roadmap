"use client";

import dynamic from "next/dynamic";
import { ReactNode } from "react";

const Sidebar = dynamic(() => import("./Sidebar").then((mod) => mod.Sidebar), {
  ssr: false,
  loading: () => (
    <aside className="hidden h-screen w-55 shrink-0 border-r border-[rgba(255,255,255,0.06)] bg-[rgba(13,13,22,0.92)] backdrop-blur-xl md:flex md:flex-col" />
  ),
});

const TopBar = dynamic(() => import("./TopBar").then((mod) => mod.TopBar), {
  ssr: false,
  loading: () => (
    <header className="flex min-h-[88px] flex-col gap-2 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(13,13,22,0.82)] px-6 py-4 backdrop-blur-xl md:px-8" />
  ),
});

interface ShellChromeProps {
  children: ReactNode;
}

export function ShellChrome({ children }: Readonly<ShellChromeProps>) {
  return (
    <div className="flex min-h-screen overflow-hidden bg-bg-void text-text-primary">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="min-w-0 flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
