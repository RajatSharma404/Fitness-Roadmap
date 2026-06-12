"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, SectionHeader } from "@/components/shared/UIPrimitives";
import {
  calculateBrzycki1RM,
  calculateEpley1RM,
  kgToLbs,
  lbsToKg,
} from "@/lib/formulas";

interface SavedLift {
  id: string;
  name: string;
  weight: number;
  reps: number;
  date: string;
}

export default function OneRepMaxToolPage() {
  const [weight, setWeight] = useState(100);
  const [reps, setReps] = useState(5);
  const [unit, setUnit] = useState<"kg" | "lbs">("kg");
  const [userLifts, setUserLifts] = useState<SavedLift[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetch("/api/lifts?limit=100")
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error();
        })
        .then((data: SavedLift[]) => {
          const latestLiftsMap: Record<string, SavedLift> = {};
          data.forEach((lift) => {
            const key = lift.name.toLowerCase();
            if (!latestLiftsMap[key]) {
              latestLiftsMap[key] = lift;
            }
          });
          setUserLifts(Object.values(latestLiftsMap));
        })
        .catch(() => {});
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const baseWeightKg = useMemo(
    () => (unit === "kg" ? weight : lbsToKg(weight)),
    [unit, weight],
  );

  const epley = useMemo(
    () => calculateEpley1RM(baseWeightKg, reps),
    [baseWeightKg, reps],
  );
  const brzycki = useMemo(
    () => calculateBrzycki1RM(baseWeightKg, reps),
    [baseWeightKg, reps],
  );
  const average = useMemo(() => (epley + brzycki) / 2, [epley, brzycki]);

  const display = (valueKg: number) =>
    unit === "kg"
      ? `${valueKg.toFixed(1)} kg`
      : `${kgToLbs(valueKg).toFixed(1)} lbs`;

  return (
    <div className="space-y-6 pb-8">
      <Card level="elevated">
        <SectionHeader
          kicker="Tool"
          title="One Rep Max Calculator"
          description="Estimate your 1RM from a working set using Epley and Brzycki formulas."
        />
      </Card>

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="space-y-4">
          <Card level="base" className="space-y-3">
            <label className="block text-sm text-[#636380]">
              Unit
              <select
                className="mt-1 w-full rounded-md border border-[rgba(255,255,255,0.06)] bg-bg-surface px-3 py-2 text-[#eeeef2]"
                value={unit}
                onChange={(event) => setUnit(event.target.value as "kg" | "lbs")}
              >
                <option value="kg">KG</option>
                <option value="lbs">LBS</option>
              </select>
            </label>
            <label className="block text-sm text-[#636380]">
              Weight lifted ({unit})
              <input
                className="mt-1 w-full rounded-md border border-[rgba(255,255,255,0.06)] bg-bg-surface px-3 py-2 text-[#eeeef2]"
                type="number"
                min={1}
                value={weight}
                onChange={(event) => setWeight(Number(event.target.value))}
              />
            </label>
            <label className="block text-sm text-[#636380]">
              Reps performed
              <input
                className="mt-1 w-full rounded-md border border-[rgba(255,255,255,0.06)] bg-bg-surface px-3 py-2 text-[#eeeef2]"
                type="number"
                min={1}
                max={20}
                value={reps}
                onChange={(event) => setReps(Number(event.target.value))}
              />
            </label>
            <p className="text-xs text-[#636380]">
              Tip: keep reps between 2 and 10 for more accurate estimates.
            </p>
          </Card>

          {userLifts.length > 0 && (
            <Card level="base" className="space-y-3">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-[#eeeef2]">
                Quick-fill from PRs
              </h4>
              <div className="grid gap-2">
                {userLifts.map((lift) => (
                  <button
                    key={lift.id}
                    type="button"
                    onClick={() => {
                      setWeight(lift.weight);
                      setReps(lift.reps);
                      setUnit("kg");
                    }}
                    className="flex items-center justify-between rounded-lg border border-[rgba(255,255,255,0.06)] bg-bg-surface p-2 text-left text-xs text-[#eeeef2] transition hover:border-cyan-400/40 hover:bg-cyan-400/5"
                  >
                    <span className="font-medium capitalize">{lift.name.replace("_", " ")}</span>
                    <span className="font-mono text-cyan-300">
                      {lift.weight}kg x {lift.reps}
                    </span>
                  </button>
                ))}
              </div>
            </Card>
          )}
        </div>

        <Card level="base" className="space-y-4">
          <SectionHeader title="Estimated 1RM" />
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border border-[rgba(255,255,255,0.06)] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[#636380]">
                Epley
              </p>
              <p className="mt-1 font-mono text-xl text-[#eeeef2]">
                {display(epley)}
              </p>
            </div>
            <div className="rounded-lg border border-[rgba(255,255,255,0.06)] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[#636380]">
                Brzycki
              </p>
              <p className="mt-1 font-mono text-xl text-[#eeeef2]">
                {display(brzycki)}
              </p>
            </div>
            <div className="rounded-lg border border-cyan-400/40 bg-cyan-400/5 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[#636380]">
                Average
              </p>
              <p className="mt-1 font-mono text-xl text-cyan-300">
                {display(average)}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
