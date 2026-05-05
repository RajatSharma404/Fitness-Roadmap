"use client";

import { useMemo, useState } from "react";
import { Card, SectionHeader } from "@/components/shared/UIPrimitives";
import {
  calculateBrzycki1RM,
  calculateEpley1RM,
  kgToLbs,
  lbsToKg,
} from "@/lib/formulas";

export default function OneRepMaxToolPage() {
  const [weight, setWeight] = useState(100);
  const [reps, setReps] = useState(5);
  const [unit, setUnit] = useState<"kg" | "lbs">("kg");

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
