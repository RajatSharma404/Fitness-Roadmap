'use client';

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { getStrengthLevel } from '@/lib/formulas';

interface StrengthRadarProps {
  lifts: Record<string, number>;
  bodyweight?: number;
}

const liftLabels: Record<string, string> = {
  squat: 'Squat',
  bench: 'Bench',
  deadlift: 'Deadlift',
  ohp: 'Overhead Press',
  barbell_row: 'Row',
};

export function StrengthRadar({ lifts, bodyweight }: StrengthRadarProps) {
  // Calculate normalized levels for each lift
  const data = Object.entries(liftLabels).map(([lift, label]) => {
    const liftWeight = lifts[lift] || 0;
    const ratio = bodyweight ? liftWeight / bodyweight : 0;
    const level = getStrengthLevel(lift, ratio);

    return {
      lift: label,
      level: Math.min(100, level * 100),
      actual: liftWeight.toFixed(1),
    };
  });

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#3f3f46" />
          <PolarAngleAxis
            dataKey="lift"
            tick={{ fill: '#a1a1aa', fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={false}
            axisLine={false}
          />
          <Radar
            name="Your Level"
            dataKey="level"
            stroke="#7c3aed"
            strokeWidth={2}
            fill="#7c3aed"
            fillOpacity={0.3}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-2">
                    <div className="text-white font-medium">{data.lift}</div>
                    <div className="text-violet-400">Level: {data.level.toFixed(0)}%</div>
                    <div className="text-zinc-400 text-sm">{data.actual} kg/lbs</div>
                  </div>
                );
              }
              return null;
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
