"use client";

import { useMemo, useState } from "react";
import { Card, SectionHeader } from "@/components/shared/UIPrimitives";
import { calculateBodyPlan, PlannerInput } from "@/lib/bodyPlanner";

const defaultInput: PlannerInput = {
  age: 28,
  sex: "male",
  heightCm: 170,
  weightKg: 80,
  goal: "fat_loss",
  activity: "moderate",
  workoutDays: 5,
  diet: "mixed",
};

export default function CalorieToolPage() {
  const [input, setInput] = useState<PlannerInput>(defaultInput);

  const result = useMemo(() => calculateBodyPlan(input), [input]);

  return (
    <div className="space-y-6 pb-8">
      <Card level="elevated">
        <SectionHeader
          kicker="Tool"
          title="Calorie Calculator"
          description="Adjust your profile and get maintenance plus target calorie guidance."
        />
      </Card>

      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <Card level="base" className="space-y-3">
          <label className="block text-sm text-[#636380]">
            Age
            <input
              className="mt-1 w-full rounded-md border border-[rgba(255,255,255,0.06)] bg-bg-surface px-3 py-2 text-[#eeeef2]"
              type="number"
              min={13}
              max={100}
              value={input.age}
              onChange={(event) =>
                setInput((prev) => ({
                  ...prev,
                  age: Number(event.target.value),
                }))
              }
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm text-[#636380]">
              Height (cm)
              <input
                className="mt-1 w-full rounded-md border border-[rgba(255,255,255,0.06)] bg-bg-surface px-3 py-2 text-[#eeeef2]"
                type="number"
                min={120}
                max={220}
                value={input.heightCm}
                onChange={(event) =>
                  setInput((prev) => ({
                    ...prev,
                    heightCm: Number(event.target.value),
                  }))
                }
              />
            </label>
            <label className="block text-sm text-[#636380]">
              Weight (kg)
              <input
                className="mt-1 w-full rounded-md border border-[rgba(255,255,255,0.06)] bg-bg-surface px-3 py-2 text-[#eeeef2]"
                type="number"
                min={35}
                max={220}
                value={input.weightKg}
                onChange={(event) =>
                  setInput((prev) => ({
                    ...prev,
                    weightKg: Number(event.target.value),
                  }))
                }
              />
            </label>
          </div>
          <label className="block text-sm text-[#636380]">
            Sex
            <select
              className="mt-1 w-full rounded-md border border-[rgba(255,255,255,0.06)] bg-bg-surface px-3 py-2 text-[#eeeef2]"
              value={input.sex}
              onChange={(event) =>
                setInput((prev) => ({
                  ...prev,
                  sex: event.target.value as PlannerInput["sex"],
                }))
              }
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </label>
          <label className="block text-sm text-[#636380]">
            Goal
            <select
              className="mt-1 w-full rounded-md border border-[rgba(255,255,255,0.06)] bg-bg-surface px-3 py-2 text-[#eeeef2]"
              value={input.goal}
              onChange={(event) =>
                setInput((prev) => ({
                  ...prev,
                  goal: event.target.value as PlannerInput["goal"],
                }))
              }
            >
              <option value="fat_loss">Fat loss</option>
              <option value="weight_loss">Weight loss</option>
              <option value="muscle_gain">Muscle gain</option>
              <option value="recomposition">Recomposition</option>
            </select>
          </label>
          <label className="block text-sm text-[#636380]">
            Activity level
            <select
              className="mt-1 w-full rounded-md border border-[rgba(255,255,255,0.06)] bg-bg-surface px-3 py-2 text-[#eeeef2]"
              value={input.activity}
              onChange={(event) =>
                setInput((prev) => ({
                  ...prev,
                  activity: event.target.value as PlannerInput["activity"],
                }))
              }
            >
              <option value="sedentary">Sedentary</option>
              <option value="light">Light</option>
              <option value="moderate">Moderate</option>
              <option value="active">Active</option>
              <option value="very_active">Very active</option>
            </select>
          </label>
        </Card>

        <Card level="base" className="space-y-4">
          <SectionHeader
            title="Results"
            description="This uses the same logic as your planner output."
          />
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-[rgba(255,255,255,0.06)] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[#636380]">
                BMI
              </p>
              <p className="mt-1 font-mono text-2xl text-[#eeeef2]">
                {result.bmi.toFixed(1)}
              </p>
              <p className="text-xs text-[#60a5fa]">{result.bmiCategory}</p>
            </div>
            <div className="rounded-lg border border-[rgba(255,255,255,0.06)] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[#636380]">
                BMR
              </p>
              <p className="mt-1 font-mono text-2xl text-[#eeeef2]">
                {Math.round(result.bmr)}
              </p>
              <p className="text-xs text-[#60a5fa]">kcal/day</p>
            </div>
            <div className="rounded-lg border border-[rgba(255,255,255,0.06)] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[#636380]">
                Maintenance
              </p>
              <p className="mt-1 font-mono text-2xl text-[#eeeef2]">
                {Math.round(result.maintenanceCalories)}
              </p>
              <p className="text-xs text-[#60a5fa]">kcal/day</p>
            </div>
            <div className="rounded-lg border border-cyan-400/40 bg-cyan-400/5 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[#636380]">
                Target
              </p>
              <p className="mt-1 font-mono text-2xl text-cyan-300">
                {Math.round(result.targetCalories)}
              </p>
              <p className="text-xs text-cyan-300">kcal/day</p>
            </div>
          </div>
          <p className="text-sm text-[#636380]">
            {result.calorieAdjustmentNote}
          </p>
        </Card>
      </div>
    </div>
  );
}
