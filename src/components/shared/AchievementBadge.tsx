'use client';

import { motion } from 'framer-motion';
import { Trophy, Star, Zap, Medal, Award } from 'lucide-react';
import { cn } from '@/lib/cn';

interface AchievementBadgeProps {
  type: string;
  label: string;
  earnedAt?: Date;
  size?: 'sm' | 'md' | 'lg';
}

const iconMap: Record<string, typeof Trophy> = {
  first_lift: Zap,
  first_node: Star,
  first_pr: Trophy,
  ten_prs: Award,
  fifty_prs: Medal,
  hundred_prs: Trophy,
  wilks_300: Star,
  wilks_350: Award,
  total_1000: Trophy,
  three_nodes: Star,
  ten_nodes: Award,
  twenty_five_nodes: Medal,
  fifty_nodes: Trophy,
};

const colorMap: Record<string, string> = {
  first_lift: 'text-cyan-400',
  first_node: 'text-violet-400',
  first_pr: 'text-yellow-400',
  ten_prs: 'text-green-400',
  fifty_prs: 'text-blue-400',
  hundred_prs: 'text-purple-400',
  wilks_300: 'text-orange-400',
  wilks_350: 'text-red-400',
  total_1000: 'text-amber-400',
  three_nodes: 'text-emerald-400',
  ten_nodes: 'text-sky-400',
  twenty_five_nodes: 'text-indigo-400',
  fifty_nodes: 'text-rose-400',
};

export function AchievementBadge({ type, label, earnedAt, size = 'md' }: AchievementBadgeProps) {
  const Icon = iconMap[type] || Trophy;
  const colorClass = colorMap[type] || 'text-zinc-400';

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={cn(
        'relative flex flex-col items-center gap-2',
        earnedAt ? 'opacity-100' : 'opacity-40'
      )}
    >
      <div
        className={cn(
          'rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center',
          sizeClasses[size]
        )}
      >
        <Icon className={cn(iconSizes[size], colorClass)} />
        {earnedAt && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center"
          >
            <span className="text-[10px] text-white">✓</span>
          </motion.div>
        )}
      </div>
      <div className="text-center">
        <div className={cn('font-medium text-white', size === 'sm' ? 'text-xs' : 'text-sm')}>
          {label}
        </div>
        {earnedAt && size !== 'sm' && (
          <div className="text-xs text-zinc-500">
            {new Date(earnedAt).toLocaleDateString()}
          </div>
        )}
      </div>
    </motion.div>
  );
}
