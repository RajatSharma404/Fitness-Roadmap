"use client";

import { useMemo, useState } from "react";
import { CircleDollarSign, CookingPot, Droplets, Scale } from "lucide-react";
import {
  ActionButton,
  Card,
  SectionHeader,
} from "@/components/shared/UIPrimitives";
import { calculateBodyPlan } from "@/lib/bodyPlanner";
import { defaultPlannerSnapshot } from "@/lib/plannerView";

type DietPreference = "veg" | "non_veg" | "jain" | "mixed";
type PlanPriority = "balanced" | "high_protein" | "budget";
type RegionPreset = "all" | "north" | "south" | "quick";

interface MealSlotView {
  slot: "Breakfast" | "Lunch" | "Snack" | "Dinner";
  items: string;
  portion: string;
}

interface GroceryLine {
  item: string;
  qty: string;
  bucket: "protein" | "carb" | "produce" | "dairy" | "other";
}

interface IndiaMealPlan {
  id: string;
  name: string;
  region: Exclude<RegionPreset, "all">;
  diets: DietPreference[];
  priorities: PlanPriority[];
  calories: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
  meals: MealSlotView[];
  groceries: GroceryLine[];
  hydration: string[];
}

const INDIA_MEAL_PLANS: IndiaMealPlan[] = [
  {
    id: "north-balanced-veg",
    name: "North Balanced Veg",
    region: "north",
    diets: ["veg", "mixed"],
    priorities: ["balanced", "budget"],
    calories: 2050,
    proteinG: 118,
    carbsG: 248,
    fatsG: 58,
    meals: [
      {
        slot: "Breakfast",
        items: "Moong chilla + curd",
        portion: "2 chilla + 1 cup dahi",
      },
      {
        slot: "Lunch",
        items: "Roti, dal, paneer bhurji, salad",
        portion: "2 rotis + 1 bowl dal + 120 g paneer",
      },
      {
        slot: "Snack",
        items: "Roasted chana + fruit",
        portion: "40 g chana + 1 banana/apple",
      },
      {
        slot: "Dinner",
        items: "Jeera rice, rajma, sauteed veg",
        portion: "1 cup rice + 1 bowl rajma",
      },
    ],
    groceries: [
      { item: "Paneer", qty: "700 g/week", bucket: "protein" },
      { item: "Moong dal", qty: "1 kg/week", bucket: "protein" },
      { item: "Rajma/chana mix", qty: "1 kg/week", bucket: "protein" },
      { item: "Atta", qty: "2 kg/week", bucket: "carb" },
      { item: "Rice", qty: "1.5 kg/week", bucket: "carb" },
      { item: "Curd", qty: "2.5 kg/week", bucket: "dairy" },
      { item: "Seasonal vegetables", qty: "4-5 kg/week", bucket: "produce" },
    ],
    hydration: [
      "Start day with 400-500 ml water.",
      "Add nimbu + salt in one glass around training.",
    ],
  },
  {
    id: "north-protein-nonveg",
    name: "North High Protein Non-Veg",
    region: "north",
    diets: ["non_veg", "mixed"],
    priorities: ["high_protein", "balanced"],
    calories: 2150,
    proteinG: 148,
    carbsG: 220,
    fatsG: 65,
    meals: [
      {
        slot: "Breakfast",
        items: "Masala omelette + toast",
        portion: "3 eggs + 2 bread slices",
      },
      {
        slot: "Lunch",
        items: "Chicken curry, roti, cucumber salad",
        portion: "160 g chicken + 2 rotis",
      },
      {
        slot: "Snack",
        items: "Buttermilk + peanuts",
        portion: "1 glass chaas + 25 g peanuts",
      },
      {
        slot: "Dinner",
        items: "Rice, dal, grilled fish/chicken",
        portion: "1 cup rice + 120 g fish/chicken",
      },
    ],
    groceries: [
      { item: "Chicken breast", qty: "1.4 kg/week", bucket: "protein" },
      { item: "Eggs", qty: "24/week", bucket: "protein" },
      { item: "Fish (optional)", qty: "600 g/week", bucket: "protein" },
      { item: "Curd/chaas", qty: "2 kg/week", bucket: "dairy" },
      { item: "Atta + rice", qty: "3 kg/week", bucket: "carb" },
      { item: "Onion-tomato-veg", qty: "4 kg/week", bucket: "produce" },
    ],
    hydration: [
      "Use 1 ORS-style homemade drink on intense days.",
      "Target 3-3.5 L daily including chaas/coconut water.",
    ],
  },
  {
    id: "south-balanced-veg",
    name: "South Balanced Veg",
    region: "south",
    diets: ["veg", "mixed"],
    priorities: ["balanced"],
    calories: 1980,
    proteinG: 110,
    carbsG: 252,
    fatsG: 52,
    meals: [
      {
        slot: "Breakfast",
        items: "Idli, sambar, chutney",
        portion: "3 idli + 1 bowl sambar",
      },
      {
        slot: "Lunch",
        items: "Rice, rasam, curd, beans poriyal",
        portion: "1.25 cup rice + 1 bowl curd",
      },
      {
        slot: "Snack",
        items: "Sundal + fruit",
        portion: "1 bowl sundal + 1 fruit",
      },
      {
        slot: "Dinner",
        items: "Ragi dosa + paneer/tofu filling",
        portion: "2 dosa + 100 g filling",
      },
    ],
    groceries: [
      { item: "Idli/dosa batter", qty: "3 kg/week", bucket: "carb" },
      { item: "Toor dal", qty: "1 kg/week", bucket: "protein" },
      { item: "Paneer or tofu", qty: "700 g/week", bucket: "protein" },
      { item: "Ragi flour", qty: "750 g/week", bucket: "carb" },
      { item: "Curd", qty: "2.5 kg/week", bucket: "dairy" },
      { item: "Veg + curry leaves", qty: "4 kg/week", bucket: "produce" },
    ],
    hydration: [
      "Use coconut water 2-3 times/week.",
      "Add a pinch of salt in afternoon water in summer.",
    ],
  },
  {
    id: "south-protein-nonveg",
    name: "South High Protein Non-Veg",
    region: "south",
    diets: ["non_veg", "mixed"],
    priorities: ["high_protein"],
    calories: 2220,
    proteinG: 152,
    carbsG: 234,
    fatsG: 68,
    meals: [
      {
        slot: "Breakfast",
        items: "Egg dosa roll + curd",
        portion: "2 egg dosa + 1/2 cup curd",
      },
      {
        slot: "Lunch",
        items: "Fish curry, rice, veg thoran",
        portion: "150 g fish + 1 cup rice",
      },
      {
        slot: "Snack",
        items: "Boiled eggs + buttermilk",
        portion: "2 eggs + 1 glass chaas",
      },
      {
        slot: "Dinner",
        items: "Chicken pepper fry + appam",
        portion: "160 g chicken + 2 appam",
      },
    ],
    groceries: [
      { item: "Chicken", qty: "1.2 kg/week", bucket: "protein" },
      { item: "Fish", qty: "1 kg/week", bucket: "protein" },
      { item: "Eggs", qty: "20/week", bucket: "protein" },
      { item: "Rice + appam batter", qty: "2.5 kg/week", bucket: "carb" },
      { item: "Curd/chaas", qty: "2 kg/week", bucket: "dairy" },
      { item: "Leafy + mixed veg", qty: "4 kg/week", bucket: "produce" },
    ],
    hydration: [
      "Keep 500 ml bottle during workout and finish fully.",
      "Include one salted lime water post-workout.",
    ],
  },
  {
    id: "quick-jain-budget",
    name: "Quick Jain Budget",
    region: "quick",
    diets: ["jain", "veg", "mixed"],
    priorities: ["budget", "balanced"],
    calories: 1880,
    proteinG: 98,
    carbsG: 240,
    fatsG: 48,
    meals: [
      {
        slot: "Breakfast",
        items: "Poha with peanuts",
        portion: "1.5 cups poha + 20 g peanuts",
      },
      {
        slot: "Lunch",
        items: "Roti, lauki chana dal, curd",
        portion: "2 rotis + 1 bowl dal + 1 cup curd",
      },
      {
        slot: "Snack",
        items: "Makhana roast + fruit",
        portion: "30 g makhana + 1 fruit",
      },
      {
        slot: "Dinner",
        items: "Khichdi + cucumber raita",
        portion: "1.5 cup khichdi + 1/2 cup raita",
      },
    ],
    groceries: [
      { item: "Poha + rice", qty: "2 kg/week", bucket: "carb" },
      { item: "Dal mix", qty: "1.5 kg/week", bucket: "protein" },
      { item: "Makhana + peanuts", qty: "500 g/week", bucket: "other" },
      { item: "Curd", qty: "2 kg/week", bucket: "dairy" },
      { item: "Seasonal fruits", qty: "3 kg/week", bucket: "produce" },
      { item: "Bottle gourd + veg", qty: "4 kg/week", bucket: "produce" },
    ],
    hydration: [
      "Carry 1 L bottle and refill twice daily.",
      "Use jeera-infused water for digestion support.",
    ],
  },
];

const SWAP_GUIDE = [
  {
    from: "Evening samosa",
    to: "Roasted chana + chaas",
    benefit: "-180 kcal, +8 g protein",
  },
  {
    from: "Sugary cold drink",
    to: "Nimbu water + black salt",
    benefit: "-120 kcal, better hydration",
  },
  {
    from: "Cream biscuit snack",
    to: "Fruit + peanuts",
    benefit: "-90 kcal, more fiber",
  },
  {
    from: "Late-night maggi",
    to: "Egg bhurji / paneer bhurji",
    benefit: "+18-24 g protein",
  },
];

function MacroBar({
  label,
  value,
  target,
  color,
}: Readonly<{ label: string; value: number; target: number; color: string }>) {
  const safeTarget = Math.max(1, target);
  const percent = Math.min(100, Math.round((value / safeTarget) * 100));
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
  const [region, setRegion] = useState<RegionPreset>("all");
  const [priority, setPriority] = useState<PlanPriority>("balanced");
  const [diet, setDiet] = useState<DietPreference>(() => {
    if (snapshot.input.diet === "veg") return "veg";
    if (snapshot.input.diet === "non_veg") return "non_veg";
    return "mixed";
  });
  const [selectedPlanId, setSelectedPlanId] = useState(
    INDIA_MEAL_PLANS[0]?.id ?? "",
  );

  const plan = useMemo(
    () => calculateBodyPlan(snapshot.input),
    [snapshot.input],
  );
  const calorieTarget = Math.round(plan.targetCalories);

  const visiblePlans = useMemo(
    () =>
      INDIA_MEAL_PLANS.filter((template) => {
        const regionMatch = region === "all" || template.region === region;
        return (
          regionMatch &&
          template.priorities.includes(priority) &&
          template.diets.includes(diet)
        );
      }),
    [region, priority, diet],
  );

  const selectedPlan =
    visiblePlans.find((template) => template.id === selectedPlanId) ??
    visiblePlans[0] ??
    INDIA_MEAL_PLANS[0];

  const groupedGroceries = useMemo(() => {
    const order: GroceryLine["bucket"][] = [
      "protein",
      "carb",
      "produce",
      "dairy",
      "other",
    ];
    return order
      .map((bucket) => ({
        bucket,
        items: selectedPlan.groceries.filter((line) => line.bucket === bucket),
      }))
      .filter((group) => group.items.length > 0);
  }, [selectedPlan]);

  const nutritionGap = {
    calories: calorieTarget - selectedPlan.calories,
    protein: Math.round(plan.macros.proteinG) - selectedPlan.proteinG,
  };

  return (
    <div className="space-y-6 pb-8">
      <Card level="elevated">
        <SectionHeader
          kicker="Nutrition"
          title="India-first meal execution"
          description="Pick your region, diet preference, and priority. Get practical Indian meals, portions, swaps, and shopping guidance."
        />
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card level="base" className="space-y-2">
          <p className="lab-kicker text-[#60a5fa]">Target</p>
          <p className="font-mono text-3xl font-bold text-[#ffb347]">
            {calorieTarget}
          </p>
          <p className="text-xs text-[#636380]">kcal/day from your planner</p>
        </Card>
        <Card level="base" className="space-y-2">
          <p className="lab-kicker text-[#60a5fa]">Protein Goal</p>
          <p className="font-mono text-3xl font-bold text-cyan-300">
            {Math.round(plan.macros.proteinG)}g
          </p>
          <p className="text-xs text-[#636380]">daily target</p>
        </Card>
        <Card level="base" className="space-y-2">
          <p className="lab-kicker text-[#60a5fa]">Selected Plan</p>
          <p className="font-mono text-3xl font-bold text-[#eeeef2]">
            {selectedPlan.calories}
          </p>
          <p className="text-xs text-[#636380]">kcal/day estimate</p>
        </Card>
        <Card level="base" className="space-y-2">
          <p className="lab-kicker text-[#60a5fa]">Hydration</p>
          <p className="font-mono text-3xl font-bold text-green-300">
            {plan.waterLiters.toFixed(1)}L
          </p>
          <p className="text-xs text-[#636380]">minimum daily water</p>
        </Card>
      </div>

      <Card level="base" className="space-y-4">
        <SectionHeader kicker="Macro Summary" title="Target vs selected plan" />
        <div className="space-y-4">
          <MacroBar
            label="Calories"
            value={selectedPlan.calories}
            target={calorieTarget}
            color="linear-gradient(90deg, #ffb347, #ff7a59)"
          />
          <MacroBar
            label="Protein"
            value={selectedPlan.proteinG}
            target={Math.round(plan.macros.proteinG)}
            color="linear-gradient(90deg, #a78bfa, #c084fc)"
          />
          <MacroBar
            label="Carbs"
            value={selectedPlan.carbsG}
            target={Math.round(plan.macros.carbsG)}
            color="linear-gradient(90deg, #00d4ff, #60a5fa)"
          />
          <MacroBar
            label="Fat"
            value={selectedPlan.fatsG}
            target={Math.round(plan.macros.fatsG)}
            color="linear-gradient(90deg, #60a5fa, #38bdf8)"
          />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-3 text-sm text-[#636380]">
            {nutritionGap.calories === 0
              ? "Calories are aligned with your target."
              : `Plan is ${Math.abs(nutritionGap.calories)} kcal ${nutritionGap.calories > 0 ? "below" : "above"} target.`}
          </div>
          <div className="rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-3 text-sm text-[#636380]">
            {nutritionGap.protein <= 0
              ? "Protein target is covered in this plan."
              : `${nutritionGap.protein} g protein still needed. Add paneer/eggs/chicken.`}
          </div>
        </div>
      </Card>

      <Card level="base" className="space-y-4">
        <SectionHeader
          kicker="Filters"
          title="Build your practical plan"
          description="Tune by region, diet style, and priority."
        />
        <div className="grid gap-3 md:grid-cols-3">
          <Card
            level="base"
            className="flex items-center gap-2 border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]"
          >
            <CookingPot className="h-4 w-4 text-cyan-300" />
            <select
              className="w-full bg-transparent text-sm text-[#eeeef2] outline-none"
              value={region}
              onChange={(event) =>
                setRegion(event.target.value as RegionPreset)
              }
            >
              <option value="all">All regions</option>
              <option value="north">North style</option>
              <option value="south">South style</option>
              <option value="quick">Quick prep</option>
            </select>
          </Card>
          <Card
            level="base"
            className="flex items-center gap-2 border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]"
          >
            <Scale className="h-4 w-4 text-cyan-300" />
            <select
              className="w-full bg-transparent text-sm text-[#eeeef2] outline-none"
              value={diet}
              onChange={(event) =>
                setDiet(event.target.value as DietPreference)
              }
            >
              <option value="veg">Vegetarian</option>
              <option value="non_veg">Non-vegetarian</option>
              <option value="jain">Jain-friendly</option>
              <option value="mixed">Mixed</option>
            </select>
          </Card>
          <Card
            level="base"
            className="flex items-center gap-2 border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]"
          >
            <CircleDollarSign className="h-4 w-4 text-cyan-300" />
            <select
              className="w-full bg-transparent text-sm text-[#eeeef2] outline-none"
              value={priority}
              onChange={(event) =>
                setPriority(event.target.value as PlanPriority)
              }
            >
              <option value="balanced">Balanced</option>
              <option value="high_protein">High protein</option>
              <option value="budget">Budget</option>
            </select>
          </Card>
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-3">
        {visiblePlans.length > 0 ? (
          visiblePlans.map((template) => (
            <Card
              key={template.id}
              level={selectedPlan.id === template.id ? "highlight" : "base"}
              className="space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="lab-kicker text-[#60a5fa]">Plan</p>
                  <h3 className="font-display text-2xl font-bold text-[#eeeef2]">
                    {template.name}
                  </h3>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[#636380]">
                    {template.region} style
                  </p>
                </div>
                <p className="font-mono text-2xl font-bold text-[#ffb347]">
                  {template.calories}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-cyan-400/10 px-2 py-1 text-cyan-300">
                  P {template.proteinG}g
                </span>
                <span className="rounded-full bg-blue-400/10 px-2 py-1 text-blue-300">
                  C {template.carbsG}g
                </span>
                <span className="rounded-full bg-purple-400/10 px-2 py-1 text-purple-300">
                  F {template.fatsG}g
                </span>
              </div>
              <ActionButton
                className="w-full"
                onClick={() => setSelectedPlanId(template.id)}
              >
                {selectedPlan.id === template.id ? "Selected" : "Use this plan"}
              </ActionButton>
            </Card>
          ))
        ) : (
          <Card level="base" className="xl:col-span-3">
            <p className="text-sm text-[#636380]">
              No plan matches this combination yet. Try changing one filter.
            </p>
          </Card>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card level="base" className="space-y-4">
          <SectionHeader kicker="Today Plate" title={selectedPlan.name} />
          <div className="space-y-2">
            {selectedPlan.meals.map((meal) => (
              <div
                key={`${selectedPlan.id}-${meal.slot}`}
                className="rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-3 text-sm"
              >
                <p className="font-semibold text-[#eeeef2]">{meal.slot}</p>
                <p className="text-[#636380]">{meal.items}</p>
                <p className="mt-1 text-xs text-cyan-300">{meal.portion}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card level="base" className="space-y-4">
          <SectionHeader kicker="Shopping" title="Weekly grocery guide" />
          <div className="space-y-3">
            {groupedGroceries.map((group) => (
              <div key={group.bucket} className="space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-[#636380]">
                  {group.bucket}
                </p>
                {group.items.map((item) => (
                  <div
                    key={`${group.bucket}-${item.item}`}
                    className="flex items-center justify-between rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-3 text-sm"
                  >
                    <span className="text-[#eeeef2]">{item.item}</span>
                    <span className="text-[#636380]">{item.qty}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card level="base" className="space-y-4">
          <SectionHeader
            kicker="Easy Swaps"
            title="Daily Indian alternatives"
          />
          <div className="space-y-2">
            {SWAP_GUIDE.map((swap) => (
              <div
                key={`${swap.from}-${swap.to}`}
                className="rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-3 text-sm"
              >
                <p className="text-[#eeeef2]">
                  Swap {swap.from} -&gt; {swap.to}
                </p>
                <p className="text-[#636380]">{swap.benefit}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card level="base" className="space-y-4">
          <SectionHeader
            kicker="Hydration & Recovery"
            title="Simple daily checklist"
          />
          <div className="space-y-2">
            {selectedPlan.hydration.map((line) => (
              <div
                key={line}
                className="flex items-start gap-3 rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-3 text-sm"
              >
                <Droplets className="mt-0.5 h-4 w-4 text-cyan-300" />
                <p className="text-[#636380]">{line}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card level="base" className="space-y-4">
          <SectionHeader
            kicker="Action"
            title="How to execute this smoothly"
            description="Batch-cook proteins and dal twice a week, then rotate carbs and vegetables daily."
          />
          <div className="rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-3 text-sm text-[#636380]">
            Keep breakfast and snack fixed for 5 days, and vary lunch/dinner
            spices so adherence stays high without changing macros too much.
          </div>
        </Card>

        <Card level="base" className="space-y-4">
          <SectionHeader
            kicker="Reminder"
            title="You can stay fully Indian and still hit targets"
            description="The plan is built for home cooking, local groceries, and realistic weekday time."
          />
          <div className="rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-3 text-sm text-[#636380]">
            Consistency matters more than perfection. Hit protein, hydration,
            and calorie range most days, then adjust with check-ins.
          </div>
        </Card>
      </div>
    </div>
  );
}
