"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import {
  User,
  Trophy,
  Target,
  Share2,
  Check,
  Star,
} from "lucide-react";
import { AchievementBadge } from "@/components/shared/AchievementBadge";
import { ActionButton, Card, SectionHeader } from "@/components/shared/UIPrimitives";

interface ProfileData {
  id: string;
  name: string | null;
  image: string | null;
  goal: string | null;
  bio: string | null;
  createdAt: string;
  bestLifts: Record<string, number>;
  nodesCompleted: number;
  achievements: Array<{
    id: string;
    type: string;
    label: string;
    earnedAt: string;
  }>;
}

export default function PublicProfilePage() {
  const params = useParams();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch(`/api/profile/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const copyShareLink = () => {
    const url = `${window.location.origin}/profile/${params.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-cyan-400 font-medium">Loading athlete profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-[#636380]">Athlete profile not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header Banner */}
      <Card
        level="elevated"
        className="flex flex-wrap items-center justify-between gap-4"
      >
        <div>
          <p className="lab-kicker text-[#60a5fa]">Public Athlete Showcase</p>
          <h2 className="font-display text-[28px] font-bold text-[#eeeef2]">
            {profile.name || "Anonymous Athlete"}
          </h2>
          <p className="mt-1 text-sm text-[#636380]">
            Goal: {profile.goal || "Strength"} · Joined{" "}
            {new Date(profile.createdAt).toLocaleDateString()}
          </p>
        </div>

        <ActionButton
          onClick={copyShareLink}
          variant="secondary"
          className="inline-flex items-center gap-2"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-green-300" /> Copied Profile Link!
            </>
          ) : (
            <>
              <Share2 className="h-4 w-4" /> Share Profile
            </>
          )}
        </ActionButton>
      </Card>

      {/* Main Profile Info */}
      <Card level="base" className="space-y-4">
        <div className="flex flex-wrap items-start gap-6">
          <div className="w-20 h-20 rounded-2xl bg-zinc-800 border border-[rgba(255,255,255,0.08)] flex items-center justify-center overflow-hidden shrink-0">
            {profile.image ? (
              <Image
                src={profile.image}
                alt={profile.name || ""}
                width={80}
                height={80}
                className="object-cover"
              />
            ) : (
              <User className="w-10 h-10 text-zinc-500" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h3 className="text-2xl font-bold text-[#eeeef2]">
                {profile.name || "Anonymous Athlete"}
              </h3>
              {profile.goal && (
                <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-300">
                  {profile.goal}
                </span>
              )}
            </div>

            {profile.bio ? (
              <p className="text-sm text-[#636380] mb-4 max-w-2xl">{profile.bio}</p>
            ) : null}

            <div className="flex flex-wrap items-center gap-6 text-sm text-[#636380]">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-cyan-300" />
                <span>{profile.nodesCompleted} roadmap milestones</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-300" />
                <span>
                  Member since {new Date(profile.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Best Lifts */}
      <Card level="base" className="space-y-4">
        <SectionHeader
          kicker="Strength Records"
          title="Best Recorded Lifts"
          description="Verified 1RM estimations and competition records."
        />

        {Object.keys(profile.bestLifts).length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(profile.bestLifts).map(([lift, weight]) => (
              <div
                key={lift}
                className="p-4 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]"
              >
                <div className="text-xs uppercase tracking-[0.2em] text-[#636380] mb-1">
                  {lift.replace("_", " ")}
                </div>
                <div className="text-2xl font-bold font-mono text-[#eeeef2]">
                  {weight.toFixed(1)} <span className="text-sm text-[#636380]">kg</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-sm text-[#636380]">
            No personal records logged yet.
          </div>
        )}
      </Card>

      {/* Achievements */}
      <Card level="base" className="space-y-4">
        <SectionHeader
          kicker="Badges & Milestones"
          title="Earned Achievements"
          description="Unlocked through training momentum, milestones, and personal records."
        />

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-6 pt-2">
          {profile.achievements.map((achievement) => (
            <AchievementBadge
              key={achievement.id}
              type={achievement.type}
              label={achievement.label}
              earnedAt={new Date(achievement.earnedAt)}
              size="md"
            />
          ))}

          {/* Show locked placeholder if fewer than 12 */}
          {Array.from({
            length: Math.max(0, 12 - profile.achievements.length),
          }).map((_, i) => (
            <div
              key={`locked-${i}`}
              className="flex flex-col items-center gap-2 opacity-30"
            >
              <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                <Star className="w-6 h-6 text-zinc-500" />
              </div>
              <div className="text-xs text-[#636380]">???</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
