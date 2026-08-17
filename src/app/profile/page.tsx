"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { User, Save, ExternalLink, ShieldCheck } from "lucide-react";
import { ActionButton, Card, SectionHeader } from "@/components/shared/UIPrimitives";
import {
  readPlannerSnapshot,
  persistPlannerSnapshot,
  syncPlannerSnapshotFromServer,
} from "@/lib/plannerView";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [goal, setGoal] = useState<"STRENGTH" | "POWERLIFTING" | "BODYBUILDING" | "ATHLETIC">("STRENGTH");
  const [bodyweight, setBodyweight] = useState(70);
  const [unit, setUnit] = useState<"KG" | "LBS">("KG");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const current = readPlannerSnapshot();
    setName(session?.user?.name || "Athlete");
    setBodyweight(current.input.weightKg);

    void syncPlannerSnapshotFromServer().then((serverSnap) => {
      setBodyweight(serverSnap.input.weightKg);
    });

    if (status === "authenticated") {
      fetch("/api/profile")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) {
            if (data.name) setName(data.name);
            if (data.bio) setBio(data.bio);
            if (data.goal) setGoal(data.goal);
            if (data.bodyweight) setBodyweight(data.bodyweight);
            if (data.unit) setUnit(data.unit);
          }
        })
        .catch(() => {});
    }
  }, [session, status]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      // 1. Sync local planner state
      const snap = readPlannerSnapshot();
      await persistPlannerSnapshot({
        ...snap,
        input: {
          ...snap.input,
          weightKg: unit === "LBS" ? bodyweight / 2.20462 : bodyweight,
        },
      });

      // 2. Sync to DB if logged in
      if (status === "authenticated") {
        const res = await fetch("/api/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            bio,
            goal,
            bodyweight,
            unit,
          }),
        });

        if (res.ok) {
          setMessage("Profile updated successfully!");
        } else {
          setMessage("Saved locally. Could not update server profile.");
        }
      } else {
        setMessage("Profile updated locally.");
      }
    } catch {
      setMessage("An error occurred while saving profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <Card level="elevated" className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="lab-kicker text-[#60a5fa]">Account & Profile</p>
          <h2 className="font-display text-[28px] font-bold text-[#eeeef2]">
            Personal Athlete Profile
          </h2>
          <p className="mt-1 text-sm text-[#636380]">
            Manage your body metrics, training focus, and public showcase card.
          </p>
        </div>
        {status === "authenticated" && session?.user?.id ? (
          <Link
            href={`/profile/${session.user.id}`}
            className="lab-btn-primary inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium"
          >
            Public Showcase Card <ExternalLink className="h-4 w-4" />
          </Link>
        ) : null}
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card level="base" className="space-y-4">
          <SectionHeader
            kicker="Edit Metrics"
            title="Profile Settings"
            description="Updates are applied to your roadmap, nutrition targets, and leaderboard entries."
          />

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-[#636380]">
                Display Name
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-md border border-[rgba(255,255,255,0.06)] bg-bg-surface px-3 py-2 text-[#eeeef2] outline-none focus:border-cyan-400/50"
                  placeholder="Your Name"
                />
              </label>

              <label className="block text-sm text-[#636380]">
                Primary Goal
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value as typeof goal)}
                  className="mt-1 w-full rounded-md border border-[rgba(255,255,255,0.06)] bg-bg-surface px-3 py-2 text-[#eeeef2] outline-none focus:border-cyan-400/50"
                >
                  <option value="STRENGTH">Strength</option>
                  <option value="POWERLIFTING">Powerlifting</option>
                  <option value="BODYBUILDING">Bodybuilding</option>
                  <option value="ATHLETIC">Athletic Performance</option>
                </select>
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-[#636380]">
                Bodyweight
                <input
                  type="number"
                  min={30}
                  max={300}
                  step={0.1}
                  value={bodyweight}
                  onChange={(e) => setBodyweight(Number(e.target.value))}
                  className="mt-1 w-full rounded-md border border-[rgba(255,255,255,0.06)] bg-bg-surface px-3 py-2 text-[#eeeef2] outline-none focus:border-cyan-400/50"
                />
              </label>

              <label className="block text-sm text-[#636380]">
                Unit
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as typeof unit)}
                  className="mt-1 w-full rounded-md border border-[rgba(255,255,255,0.06)] bg-bg-surface px-3 py-2 text-[#eeeef2] outline-none focus:border-cyan-400/50"
                >
                  <option value="KG">Kilograms (KG)</option>
                  <option value="LBS">Pounds (LBS)</option>
                </select>
              </label>
            </div>

            <label className="block text-sm text-[#636380]">
              Short Bio / Motto
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                maxLength={500}
                className="mt-1 w-full rounded-md border border-[rgba(255,255,255,0.06)] bg-bg-surface px-3 py-2 text-[#eeeef2] outline-none focus:border-cyan-400/50"
                placeholder="Share your training ethos or targets..."
              />
            </label>

            <ActionButton type="submit" disabled={isSaving} className="inline-flex items-center gap-2">
              <Save className="h-4 w-4" />
              {isSaving ? "Saving..." : "Save Profile"}
            </ActionButton>

            {message ? <p className="text-sm text-cyan-300">{message}</p> : null}
          </form>
        </Card>

        <aside className="space-y-4">
          <Card level="base" className="space-y-3">
            <SectionHeader kicker="Status" title="Account Overview" />
            <div className="flex items-center gap-3 rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-3">
              <User className="h-5 w-5 text-cyan-300" />
              <div>
                <p className="text-sm font-semibold text-[#eeeef2]">
                  {status === "authenticated" ? session.user?.email : "Guest Mode"}
                </p>
                <p className="text-xs text-[#636380]">
                  {status === "authenticated" ? "Cloud Sync Active" : "Local Storage Mode"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2 text-xs text-[#636380]">
              <ShieldCheck className="mt-0.5 h-4 w-4 text-green-300 shrink-0" />
              <p>Your local roadmap state and workouts stay saved on this device even in guest mode.</p>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
