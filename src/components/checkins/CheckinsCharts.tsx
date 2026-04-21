"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, SectionHeader } from "@/components/shared/UIPrimitives";
import { WeeklyCheckIn } from "@/lib/planEnhancements";

type RecoveryPoint = {
  date: string;
  score: number;
};

interface CheckinsChartsProps {
  lineData: WeeklyCheckIn[];
  recoveryData: RecoveryPoint[];
}

export default function CheckinsCharts({
  lineData,
  recoveryData,
}: CheckinsChartsProps) {
  return (
    <div className="space-y-6">
      <Card level="base" className="space-y-4">
        <SectionHeader kicker="Trend" title="Weight and recovery charts" />
        <div className="h-64 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-3">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData}>
              <CartesianGrid
                stroke="rgba(255,255,255,0.06)"
                strokeDasharray="3 3"
              />
              <XAxis dataKey="date" tick={{ fill: "#636380", fontSize: 12 }} />
              <YAxis tick={{ fill: "#636380", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: "#1a1a2e",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              />
              <Line
                type="monotone"
                dataKey="weightKg"
                stroke="#00d4ff"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card level="base" className="space-y-4">
        <SectionHeader kicker="Recovery" title="Sleep, energy, and stress" />
        <div className="h-64 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-3">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={recoveryData}>
              <CartesianGrid
                stroke="rgba(255,255,255,0.06)"
                strokeDasharray="3 3"
              />
              <XAxis dataKey="date" tick={{ fill: "#636380", fontSize: 12 }} />
              <YAxis tick={{ fill: "#636380", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: "#1a1a2e",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#00e676"
                fill="#00e676"
                fillOpacity={0.15}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
