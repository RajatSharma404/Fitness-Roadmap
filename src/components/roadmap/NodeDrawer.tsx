'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Dumbbell, Target, TrendingUp, MessageSquare } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { cn } from '@/lib/cn';

interface NodeDrawerProps {
  node: {
    id: string;
    name: string;
    track: string;
    description?: string;
    muscles?: string[];
    unlockCriteria: Record<string, unknown>;
    status: string;
  } | null;
  liftHistory: Array<{ date: string; oneRM: number }>;
  isOpen: boolean;
  onClose: () => void;
  onLogPR: () => void;
  onAskAI: () => void;
}

export function NodeDrawer({
  node,
  liftHistory,
  isOpen,
  onClose,
  onLogPR,
  onAskAI,
}: NodeDrawerProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');

  if (!isOpen || !node) return null;

  const trackColors: Record<string, string> = {
    BEGINNER: 'text-emerald-400',
    INTERMEDIATE: 'text-blue-400',
    ADVANCED: 'text-violet-400',
    ELITE: 'text-amber-400',
  };

  const criteria = node.unlockCriteria as {
    lift?: string;
    metric?: string;
    value?: number;
    type?: string;
  };

  const liftName = criteria.lift || 'lift';

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
      />

      <motion.div
        initial={{ opacity: 0, x: 400 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 400 }}
        className="fixed right-0 top-0 bottom-0 w-full max-w-lg z-50"
      >
        <div className="h-full bg-zinc-900 border-l border-zinc-800 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-zinc-800">
            <div className="flex items-start justify-between">
              <div>
                <div
                  className={cn(
                    'text-sm font-medium uppercase tracking-wider mb-2',
                    trackColors[node.track]
                  )}
                >
                  {node.track.toLowerCase()}
                </div>
                <h2 className="text-2xl font-bold text-white">{node.name}</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-zinc-800">
            {(['overview', 'history'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'flex-1 py-3 text-sm font-medium transition-colors',
                  activeTab === tab
                    ? 'text-white border-b-2 border-violet-500'
                    : 'text-zinc-400 hover:text-white'
                )}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Description */}
                {node.description && (
                  <div>
                    <div className="flex items-center gap-2 text-zinc-400 mb-2">
                      <Dumbbell className="w-4 h-4" />
                      <span className="text-sm font-medium">Description</span>
                    </div>
                    <p className="text-zinc-300">{node.description}</p>
                  </div>
                )}

                {/* Muscles */}
                {node.muscles && node.muscles.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 text-zinc-400 mb-2">
                      <Target className="w-4 h-4" />
                      <span className="text-sm font-medium">Muscle Groups</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {node.muscles.map((muscle) => (
                        <span
                          key={muscle}
                          className="px-3 py-1 bg-violet-500/20 text-violet-300 rounded-full text-sm"
                        >
                          {muscle}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Unlock Criteria */}
                <div>
                  <div className="flex items-center gap-2 text-zinc-400 mb-2">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm font-medium">Unlock Criteria</span>
                  </div>
                  <div className="p-4 bg-zinc-800/50 rounded-lg">
                    {criteria.type === 'total' ? (
                      <div className="text-zinc-300">
                        Achieve {criteria.value} {criteria.unit} total across Squat, Bench, and Deadlift
                      </div>
                    ) : criteria.type === 'wilks' || criteria.type === 'dots' ? (
                      <div className="text-zinc-300">
                        Achieve a {criteria.metric?.replace('_', ' ')} of {criteria.value}
                      </div>
                    ) : (
                      <div className="text-zinc-300">
                        {criteria.metric === '1rm_bw_ratio'
                          ? `${criteria.lift}: ${criteria.value}x bodyweight`
                          : `${criteria.lift}: ${criteria.value}${criteria.unit || 'kg'}`}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div>
                {liftHistory.length > 0 ? (
                  <div className="space-y-4">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={liftHistory}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                          <XAxis
                            dataKey="date"
                            tickFormatter={(date) =>
                              new Date(date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })
                            }
                            stroke="#a1a1aa"
                          />
                          <YAxis stroke="#a1a1aa" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#18181b',
                              border: '1px solid #3f3f46',
                              borderRadius: '8px',
                            }}
                            labelStyle={{ color: '#ffffff' }}
                            itemStyle={{ color: '#7c3aed' }}
                          />
                          <Line
                            type="monotone"
                            dataKey="oneRM"
                            stroke="#7c3aed"
                            strokeWidth={2}
                            dot={{ fill: '#7c3aed', strokeWidth: 0 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="text-center text-zinc-400 text-sm">
                      {liftHistory.length} entries
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-zinc-500">
                    No history yet. Log your first PR to see progress!
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-zinc-800 space-y-3">
            <button
              onClick={onLogPR}
              className="w-full bg-violet-600 hover:bg-violet-500 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              Log PR
            </button>
            <button
              onClick={onAskAI}
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              Ask AI Coach
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
