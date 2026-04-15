'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Users, TrendingUp, Award, Medal } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/cn';

interface LeaderboardEntry {
  id: string;
  name: string | null;
  image: string | null;
  goal: string | null;
  topLift: { name: string; weight: number } | null;
  nodesCompleted: number;
  wilksScore: number;
  total: number;
  rank: number;
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'table' | 'cards'>('table');

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/leaderboard');
      if (response.ok) {
        const data = await response.json();
        setEntries(data);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-zinc-400" />;
    if (rank === 3) return <Award className="w-6 h-6 text-amber-600" />;
    return <span className="text-zinc-500 font-mono">{rank}</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08080f] flex items-center justify-center">
        <div className="text-violet-400">Loading leaderboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08080f]">
      {/* Header */}
      <header className="glass border-b-0 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Leaderboard</h1>
                <p className="text-sm text-zinc-400">Ranked by Wilks Score</p>
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex rounded-lg overflow-hidden border border-zinc-700">
              <button
                onClick={() => setView('table')}
                className={cn(
                  'px-4 py-2 text-sm font-medium transition-colors',
                  view === 'table'
                    ? 'bg-violet-600 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                )}
              >
                Table
              </button>
              <button
                onClick={() => setView('cards')}
                className={cn(
                  'px-4 py-2 text-sm font-medium transition-colors',
                  view === 'cards'
                    ? 'bg-violet-600 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                )}
              >
                Cards
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {view === 'table' ? (
          <div className="glass rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400">Rank</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400">User</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400">Goal</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400">Top Lift</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400">Nodes</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-zinc-400">Wilks</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, index) => (
                  <motion.tr
                    key={entry.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      'border-b border-zinc-800 last:border-0 hover:bg-zinc-800/30 transition-colors',
                      entry.rank <= 3 && 'bg-violet-500/5'
                    )}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">{getRankIcon(entry.rank)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center overflow-hidden">
                          {entry.image ? (
                            <Image
                              src={entry.image}
                              alt={entry.name || ''}
                              width={40}
                              height={40}
                              className="object-cover"
                            />
                          ) : (
                            <Users className="w-5 h-5 text-zinc-500" />
                          )}
                        </div>
                        <span className="text-white font-medium">
                          {entry.name || 'Anonymous'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-zinc-400">
                        {entry.goal || 'Strength'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {entry.topLift ? (
                        <div className="text-zinc-300">
                          <span className="text-violet-400 font-medium">
                            {entry.topLift.weight.toFixed(0)}
                          </span>
                          <span className="text-zinc-500 ml-1">
                            {entry.topLift.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-zinc-600">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-zinc-300">{entry.nodesCompleted}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <TrendingUp className="w-4 h-4 text-cyan-400" />
                        <span className="text-lg font-bold text-white">
                          {entry.wilksScore.toFixed(1)}
                        </span>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {entries.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  'glass rounded-2xl p-6',
                  entry.rank <= 3 && 'border-violet-500/50'
                )}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-zinc-700 flex items-center justify-center overflow-hidden">
                      {entry.image ? (
                        <Image
                          src={entry.image}
                          alt={entry.name || ''}
                          width={48}
                          height={48}
                          className="object-cover"
                        />
                      ) : (
                        <Users className="w-6 h-6 text-zinc-500" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-white">
                        {entry.name || 'Anonymous'}
                      </div>
                      <div className="text-sm text-zinc-400">
                        {entry.goal || 'Strength'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getRankIcon(entry.rank)}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-400">Wilks Score</span>
                    <span className="text-xl font-bold text-cyan-400">
                      {entry.wilksScore.toFixed(1)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-400">Nodes Unlocked</span>
                    <span className="text-white font-medium">
                      {entry.nodesCompleted}
                    </span>
                  </div>

                  {entry.topLift && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-400">Top Lift</span>
                      <span className="text-violet-400 font-medium">
                        {entry.topLift.name}: {entry.topLift.weight.toFixed(0)}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
