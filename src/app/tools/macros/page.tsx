"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, SectionHeader } from "@/components/shared/UIPrimitives";
import { calculateBodyPlan, GoalType, PlannerInput } from "@/lib/bodyPlanner";
import { readPlannerSnapshot, syncPlannerSnapshotFromServer } from "@/lib/plannerView";

type Preset = "balanced" | "high_protein" | "low_carb";

function splitMacros(calories: number, preset: Preset) {
  const map = {
    balanced: { carbs: 0.4, protein: 0.3, fat: 0.3 },
    high_protein: { carbs: 0.3, protein: 0.4, fat: 0.3 },
    low_carb: { carbs: 0.2, protein: 0.4, fat: 0.4 },
  } as const;
  const target = map[preset];
  return {
    carbsG: Math.round((calories * target.carbs) / 4),
    proteinG: Math.round((calories * target.protein) / 4),
    fatsG: Math.round((calories * target.fat) / 9),
  };
}

export default function MacroToolPage() {
  const [calories, setCalories] = useState(2000);
  const [goal, setGoal] = useState<GoalType>("fat_loss");
  const [preset, setPreset] = useState<Preset>("balanced");
  const [plannerInput, setPlannerInput] = useState<PlannerInput | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const snap = readPlannerSnapshot();
      setPlannerInput(snap.input);
      setGoal(snap.input.goal);
      const initialCalories = calculateBodyPlan(snap.input).targetCalories;
      setCalories(Math.round(initialCalories));
    }, 0);

    void syncPlannerSnapshotFromServer().then((serverSnap) => {
      setPlannerInput(serverSnap.input);
      setGoal(serverSnap.input.goal);
      const serverCalories = calculateBodyPlan(serverSnap.input).targetCalories;
      setCalories(Math.round(serverCalories));
    });

    return () => clearTimeout(timer);
  }, []);

  const plannerTarget = useMemo(() => {
    const activeInput = plannerInput || {
      age: 28,
      sex: "male" as const,
      heightCm: 170,
      weightKg: 80,
      goal,
      activity: "moderate" as const,
      workoutDays: 5,
      diet: "mixed" as const,
    };
    return calculateBodyPlan({
      ...activeInput,
      goal,
    }).macros;
  }, [plannerInput, goal]);

  const manual = useMemo(
    () => splitMacros(calories, preset),
    [calories, preset],
  );

  return (
    <div className="space-y-6 pb-8">
      <Card level="elevated">
        <SectionHeader
          kicker="Tool"
          title="Macro Calculator"
          description="Use planner-derived targets or custom macro split presets."
        />
      </Card>

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <Card level="base" className="space-y-3">
          <label className="block text-sm text-[#636380]">
            Daily calories
            <input
              className="mt-1 w-full rounded-md border border-[rgba(255,255,255,0.06)] bg-bg-surface px-3 py-2 text-[#eeeef2]"
              type="number"
              min={1200}
              max={5000}
              value={calories}
              onChange={(event) => setCalories(Number(event.target.value))}
            />
          </label>
          <label className="block text-sm text-[#636380]">
            Goal
            <select
              className="mt-1 w-full rounded-md border border-[rgba(255,255,255,0.06)] bg-bg-surface px-3 py-2 text-[#eeeef2]"
              value={goal}
              onChange={(event) => setGoal(event.target.value as GoalType)}
            >
              <option value="fat_loss">Fat loss</option>
              <option value="weight_loss">Weight loss</option>
              <option value="muscle_gain">Muscle gain</option>
              <option value="recomposition">Recomposition</option>
            </select>
          </label>
          <label className="block text-sm text-[#636380]">
            Macro preset
            <select
              className="mt-1 w-full rounded-md border border-[rgba(255,255,255,0.06)] bg-bg-surface px-3 py-2 text-[#eeeef2]"
              value={preset}
              onChange={(event) => setPreset(event.target.value as Preset)}
            >
              <option value="balanced">Balanced (40/30/30)</option>
              <option value="high_protein">High Protein (30/40/30)</option>
              <option value="low_carb">Low Carb (20/40/40)</option>
            </select>
          </label>
        </Card>

        <div className="space-y-4">
          <Card level="base" className="space-y-3">
            <SectionHeader title="Manual split output" />
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-lg border border-[rgba(255,255,255,0.06)] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[#636380]">
                  Protein
                </p>
                <p className="mt-1 font-mono text-2xl text-[#eeeef2]">
                  {manual.proteinG}g
                </p>
              </div>
              <div className="rounded-lg border border-[rgba(255,255,255,0.06)] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[#636380]">
                  Carbs
                </p>
                <p className="mt-1 font-mono text-2xl text-[#eeeef2]">
                  {manual.carbsG}g
                </p>
              </div>
              <div className="rounded-lg border border-[rgba(255,255,255,0.06)] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[#636380]">
                  Fats
                </p>
                <p className="mt-1 font-mono text-2xl text-[#eeeef2]">
                  {manual.fatsG}g
                </p>
              </div>
            </div>
          </Card>

          <Card level="base" className="space-y-3">
            <SectionHeader title="Planner baseline for selected goal" />
            <div className="grid gap-3 md:grid-cols-4">
              <div className="rounded-lg border border-[rgba(255,255,255,0.06)] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[#636380]">
                  Protein
                </p>
                <p className="mt-1 font-mono text-xl text-cyan-300">
                  {plannerTarget.proteinG}g
                </p>
              </div>
              <div className="rounded-lg border border-[rgba(255,255,255,0.06)] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[#636380]">
                  Carbs
                </p>
                <p className="mt-1 font-mono text-xl text-cyan-300">
                  {plannerTarget.carbsG}g
                </p>
              </div>
              <div className="rounded-lg border border-[rgba(255,255,255,0.06)] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[#636380]">
                  Fats
                </p>
                <p className="mt-1 font-mono text-xl text-cyan-300">
                  {plannerTarget.fatsG}g
                </p>
              </div>
              <div className="rounded-lg border border-[rgba(255,255,255,0.06)] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[#636380]">
                  Fiber
                </p>
                <p className="mt-1 font-mono text-xl text-cyan-300">
                  {plannerTarget.fiberG}g
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
