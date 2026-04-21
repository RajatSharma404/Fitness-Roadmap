"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useParams } from "next/navigation";
import {
  User,
  Trophy,
  TrendingUp,
  Target,
  Share2,
  Link as LinkIcon,
  Award,
  Star,
} from "lucide-react";
import { AchievementBadge } from "@/components/shared/AchievementBadge";

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

export default function ProfilePage() {
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
    const url = `${window.location.origin}/api/og?userId=${params.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08080f] flex items-center justify-center">
        <div className="text-violet-400">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#08080f] flex items-center justify-center">
        <div className="text-zinc-400">Profile not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08080f]">
      {/* Header */}
      <header className="glass border-b-0 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Profile</h1>
            </div>
          </div>

          <button
            onClick={copyShareLink}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
          >
            {copied ? (
              <>
                <LinkIcon className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                Share
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-8 mb-8"
        >
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 rounded-2xl bg-zinc-700 flex items-center justify-center overflow-hidden">
              {profile.image ? (
                <Image
                  src={profile.image}
                  alt={profile.name || ""}
                  width={96}
                  height={96}
                  className="object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-zinc-500" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-white">
                  {profile.name || "Anonymous"}
                </h2>
                {profile.goal && (
                  <span className="px-3 py-1 bg-violet-500/20 text-violet-300 rounded-full text-sm">
                    {profile.goal}
                  </span>
                )}
              </div>

              {profile.bio && (
                <p className="text-zinc-400 mb-4">{profile.bio}</p>
              )}

              <div className="flex items-center gap-6 text-sm text-zinc-500">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  <span>{profile.nodesCompleted} nodes unlocked</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  <span>
                    Joined {new Date(profile.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Best Lifts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-6 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-white">Best Lifts</h3>
          </div>

          {Object.keys(profile.bestLifts).length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(profile.bestLifts).map(([lift, weight]) => (
                <div key={lift} className="p-4 bg-zinc-800/50 rounded-xl">
                  <div className="text-sm text-zinc-400 mb-1 capitalize">
                    {lift.replace("_", " ")}
                  </div>
                  <div className="text-xl font-bold text-white">
                    {weight.toFixed(1)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-zinc-500">
              No lifts logged yet
            </div>
          )}
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Award className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className="text-lg font-bold text-white">Achievements</h3>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-6">
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
                <div className="text-xs text-zinc-500">???</div>
              </div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
