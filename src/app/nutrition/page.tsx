"use client";

import { useMemo, useState } from "react";
import { Scale } from "lucide-react";
import {
  ActionButton,
  Card,
  SectionHeader,
} from "@/components/shared/UIPrimitives";
import { calculateBodyPlan } from "@/lib/bodyPlanner";
import {
  buildDailyMealTemplates,
  buildGroceryList,
  buildMealSwaps,
} from "@/lib/planEnhancements";
import { defaultPlannerSnapshot } from "@/lib/plannerView";

function MacroBar({
  label,
  value,
  target,
  color,
}: Readonly<{ label: string; value: number; target: number; color: string }>) {
  const percent = Math.min(100, Math.round((value / target) * 100));
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-[#636380]">{label}</span>
        <span className="font-mono text-[#eeeef2]">
          {value} / {target}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
        <div
          className="h-full rounded-full"
          style={{ width: `${percent}%`, background: color }}
        />
      </div>
    </div>
  );
}

export default function NutritionPage() {
  const [snapshot] = useState(defaultPlannerSnapshot);
  const plan = useMemo(
    () => calculateBodyPlan(snapshot.input),
    [snapshot.input],
  );
  const adjustedCalories = plan.targetCalories;
  const templates = useMemo(
    () =>
      buildDailyMealTemplates(
        adjustedCalories,
        plan.macros,
        snapshot.input.diet,
        plan.mealOptions,
      ),
    [adjustedCalories, plan.macros, snapshot.input.diet, plan.mealOptions],
  );
  const [selectedTemplate, setSelectedTemplate] = useState(
    templates[1] ?? templates[0],
  );
  const groceryList = useMemo(() => buildGroceryList(templates), [templates]);
  const mealSwaps = useMemo(
    () => buildMealSwaps(plan.mealOptions),
    [plan.mealOptions],
  );

  return (
    <div className="space-y-6 pb-8">
      <Card level="elevated">
        <SectionHeader
          kicker="Nutrition"
          title="Macro planning and meal templates"
          description="Choose a template, inspect the meal structure, and use the grocery list to shop faster."
        />
      </Card>

      <Card level="base" className="space-y-4">
        <SectionHeader kicker="Macro Summary" title="Daily intake overview" />
        <div className="space-y-4">
          <MacroBar
            label="Calories"
            value={Math.round(adjustedCalories)}
            target={Math.round(plan.maintenanceCalories)}
            color="linear-gradient(90deg, #ffb347, #ff7a59)"
          />
          <MacroBar
            label="Protein"
            value={Math.round(plan.macros.proteinG)}
            target={Math.round(plan.macros.proteinG)}
            color="linear-gradient(90deg, #a78bfa, #c084fc)"
          />
          <MacroBar
            label="Carbs"
            value={Math.round(plan.macros.carbsG)}
            target={Math.round(plan.macros.carbsG)}
            color="linear-gradient(90deg, #00d4ff, #60a5fa)"
          />
          <MacroBar
            label="Fat"
            value={Math.round(plan.macros.fatsG)}
            target={Math.round(plan.macros.fatsG)}
            color="linear-gradient(90deg, #60a5fa, #38bdf8)"
          />
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-3">
        {templates.map((template) => (
          <Card
            key={template.name}
            level={
              selectedTemplate?.name === template.name ? "highlight" : "base"
            }
            className="space-y-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="lab-kicker text-[#60a5fa]">Plan</p>
                <h3 className="font-display text-2xl font-bold text-[#eeeef2]">
                  {template.name}
                </h3>
                <p className="mt-1 font-mono text-3xl font-bold text-[#ffb347]">
                  {Math.round(template.calories)} kcal
                </p>
              </div>
              <Scale className="h-8 w-8 text-[#636380]" />
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-cyan-400/10 px-2 py-1 text-cyan-300">
                P {Math.round(template.proteinG)}g
              </span>
              <span className="rounded-full bg-blue-400/10 px-2 py-1 text-blue-300">
                C {Math.round(template.carbsG)}g
              </span>
              <span className="rounded-full bg-purple-400/10 px-2 py-1 text-purple-300">
                F {Math.round(template.fatsG)}g
              </span>
            </div>
            <div className="space-y-2">
              {template.meals.map((meal) => (
                <div
                  key={`${template.name}-${meal.slot}`}
                  className="rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-3 text-sm"
                >
                  <p className="font-semibold text-[#eeeef2]">{meal.slot}</p>
                  <p className="text-[#636380]">{meal.mealName}</p>
                </div>
              ))}
            </div>
            <ActionButton
              className="w-full"
              onClick={() => setSelectedTemplate(template)}
            >
              Select Plan
            </ActionButton>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card level="base" className="space-y-4">
          <SectionHeader kicker="Grocery List" title="What to buy" />
          <div className="space-y-2">
            {groceryList.map((item) => (
              <div
                key={item.item}
                className="flex items-center justify-between rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-3 text-sm"
              >
                <span className="text-[#eeeef2]">{item.item}</span>
                <span className="text-[#636380]">{item.qty}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card level="base" className="space-y-4">
          <SectionHeader kicker="Meal Swaps" title="Easy substitutions" />
          <div className="space-y-2">
            {mealSwaps.map((swap) => (
              <div
                key={`${swap.from}-${swap.to}`}
                className="rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-3 text-sm"
              >
                <p className="text-[#eeeef2]">
                  Swap {swap.from} → {swap.to}
                </p>
                <p className="text-[#636380]">
                  {swap.kcalDelta} kcal · {swap.proteinDelta}g protein
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
