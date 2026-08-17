import { useSyncExternalStore } from 'react';
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

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

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

function getLiftValue(lifts: Record<string, number>, key: string): number {
  if (lifts[key] !== undefined) return lifts[key];
  const target = key.toLowerCase().replace(/[\s\-_]/g, "");
  for (const [name, val] of Object.entries(lifts)) {
    const norm = name.toLowerCase().replace(/[\s\-_]/g, "");
    if (norm === target || norm.includes(target) || target.includes(norm)) {
      return val;
    }
  }
  return 0;
}

export function StrengthRadar({ lifts, bodyweight }: StrengthRadarProps) {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  // Calculate normalized levels for each lift
  const data = Object.entries(liftLabels).map(([lift, label]) => {
    const liftWeight = getLiftValue(lifts, lift);
    const ratio = bodyweight ? liftWeight / bodyweight : 0;
    const level = getStrengthLevel(lift, ratio);

    return {
      lift: label,
      level: Math.min(100, level * 100),
      actual: liftWeight.toFixed(1),
    };
  });

  if (!mounted) {
    return <div className="w-full h-full min-h-[220px]" />;
  }

  return (
    <div className="w-full h-full min-h-[220px]">
      <ResponsiveContainer width="100%" height="100%" minHeight={220} minWidth={0}>
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
