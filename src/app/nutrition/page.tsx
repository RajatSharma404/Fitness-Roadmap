"use client";

import { useMemo, useState, useEffect } from "react";
import {
  CircleDollarSign,
  CookingPot,
  Droplets,
  Scale,
  Utensils,
  Flame,
  ShoppingCart,
  Calendar,
  Sparkles,
  Check,
  Plus,
  ArrowRight,
} from "lucide-react";
import {
  ActionButton,
  Card,
  SectionHeader,
  MetricTile,
} from "@/components/shared/UIPrimitives";
import { calculateBodyPlan } from "@/lib/bodyPlanner";
import {
  defaultPlannerSnapshot,
  readPlannerSnapshot,
  savePlannerSnapshot,
  syncPlannerSnapshotFromServer,
  PlannerSnapshot,
} from "@/lib/plannerView";
import { DailyFoodDiary } from "@/components/nutrition/DailyFoodDiary";
import { AdaptiveTDEECard } from "@/components/nutrition/AdaptiveTDEECard";
import { SmartGroceryList, GroceryItem } from "@/components/nutrition/SmartGroceryList";
import { DailyFoodLog, LoggedFoodEntry } from "@/lib/indianFoodDatabase";
import { calculateAdaptiveTDEE } from "@/lib/adaptiveTDEE";
import { cn } from "@/lib/cn";

type NutritionTab = "diary" | "plans" | "tdee" | "grocery";
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
        items: "Egg curry + rice + tadka dal",
        portion: "2 eggs + 1 cup rice + 1/2 bowl dal",
      },
    ],
    groceries: [
      { item: "Eggs", qty: "2-3 dozen/week", bucket: "protein" },
      { item: "Chicken breast", qty: "1.2 kg/week", bucket: "protein" },
      { item: "Atta & Rice", qty: "3 kg/week", bucket: "carb" },
      { item: "Dahi / Chaas", qty: "2 L/week", bucket: "dairy" },
      { item: "Vegetables & salad", qty: "4 kg/week", bucket: "produce" },
    ],
    hydration: [
      "Keep 1 bottle (750 ml) during workout.",
      "Aim for light-straw urine color by 3 PM.",
    ],
  },
  {
    id: "south-balanced-veg",
    name: "South Balanced Veg",
    region: "south",
    diets: ["veg", "mixed"],
    priorities: ["balanced"],
    calories: 2000,
    proteinG: 112,
    carbsG: 260,
    fatsG: 52,
    meals: [
      {
        slot: "Breakfast",
        items: "Idli + sambar + boiled sprouts",
        portion: "3 idlis + 1.5 bowl sambar + 50 g sprouts",
      },
      {
        slot: "Lunch",
        items: "Rice, rasam, curd, soya chunks subzi",
        portion: "1.5 cup rice + 1 cup curd + 60 g soya (dry wt)",
      },
      {
        slot: "Snack",
        items: "Sundal (boiled chana) + tea/coffee",
        portion: "1 cup boiled chana",
      },
      {
        slot: "Dinner",
        items: "Dosa + paneer stuffing + chutney",
        portion: "2 dosas + 100 g paneer",
      },
    ],
    groceries: [
      { item: "Idli/dosa batter", qty: "2-3 packs/week", bucket: "carb" },
      { item: "Toor dal / Chana dal", qty: "1.2 kg/week", bucket: "protein" },
      { item: "Soya chunks", qty: "500 g/week", bucket: "protein" },
      { item: "Paneer", qty: "500 g/week", bucket: "protein" },
      { item: "Curd/Milk", qty: "2 L/week", bucket: "dairy" },
      { item: "Sambar vegetables", qty: "4 kg/week", bucket: "produce" },
    ],
    hydration: [
      "Drink 1 glass warm water after waking up.",
      "Add tender coconut water on high-sweat days.",
    ],
  },
  {
    id: "south-protein-nonveg",
    name: "South High Protein Non-Veg",
    region: "south",
    diets: ["non_veg", "mixed"],
    priorities: ["high_protein", "balanced"],
    calories: 2180,
    proteinG: 152,
    carbsG: 232,
    fatsG: 62,
    meals: [
      {
        slot: "Breakfast",
        items: "Egg dosa + coconut chutney + milk",
        portion: "2 egg dosas (3 eggs) + 1 glass milk",
      },
      {
        slot: "Lunch",
        items: "Fish curry / chicken, rice, poriyal",
        portion: "180 g fish/chicken + 1 cup rice",
      },
      {
        slot: "Snack",
        items: "Roasted peanuts / boiled egg",
        portion: "30 g peanuts or 2 boiled eggs",
      },
      {
        slot: "Dinner",
        items: "Idli/appam + chicken curry + salad",
        portion: "3 idlis + 150 g chicken curry",
      },
    ],
    groceries: [
      { item: "Fish/Chicken", qty: "2 kg/week", bucket: "protein" },
      { item: "Eggs", qty: "2 dozen/week", bucket: "protein" },
      { item: "Rice / Batter", qty: "2.5 kg/week", bucket: "carb" },
      { item: "Greens & Poriyal veg", qty: "4 kg/week", bucket: "produce" },
    ],
    hydration: [
      "Maintain 3-3.5 L water intake.",
      "Add electrolyte powder on heavy training days.",
    ],
  },
  {
    id: "quick-budget-student",
    name: "Quick Budget / Student Plan",
    region: "quick",
    diets: ["veg", "non_veg", "mixed"],
    priorities: ["budget", "high_protein"],
    calories: 1950,
    proteinG: 135,
    carbsG: 235,
    fatsG: 50,
    meals: [
      {
        slot: "Breakfast",
        items: "Oats with milk + boiled eggs / whey",
        portion: "50 g oats + 250 ml milk + 2 eggs",
      },
      {
        slot: "Lunch",
        items: "Roti / Rice + Soya bhurji + Dal",
        portion: "3 rotis + 50 g soya + 1 bowl dal",
      },
      {
        slot: "Snack",
        items: "Roasted chana + banana",
        portion: "50 g chana + 1 banana",
      },
      {
        slot: "Dinner",
        items: "Rice + Rajma / Egg curry + Curd",
        portion: "1 cup rice + 1 bowl rajma/2 eggs + 100 g curd",
      },
    ],
    groceries: [
      { item: "Soya chunks & Dal", qty: "1.5 kg/week", bucket: "protein" },
      { item: "Eggs / Tofu", qty: "2 dozen/week", bucket: "protein" },
      { item: "Oats & Atta", qty: "2.5 kg/week", bucket: "carb" },
      { item: "Roasted chana", qty: "500 g/week", bucket: "other" },
    ],
    hydration: [
      "Carry a 1-liter bottle to desk/classes.",
      "Finish 2 bottles before 4 PM.",
    ],
  },
  {
    id: "jain-friendly-high-protein",
    name: "Jain-Friendly High Protein",
    region: "north",
    diets: ["jain", "veg"],
    priorities: ["high_protein", "balanced"],
    calories: 2020,
    proteinG: 125,
    carbsG: 240,
    fatsG: 58,
    meals: [
      {
        slot: "Breakfast",
        items: "Moong chilla + paneer stuffing + milk",
        portion: "2 chilla + 80 g paneer + 1 glass milk",
      },
      {
        slot: "Lunch",
        items: "Roti, toor dal, paneer gravy (no onion/garlic), dahi",
        portion: "2 rotis + 1 bowl dal + 100 g paneer + 150 g curd",
      },
      {
        slot: "Snack",
        items: "Makhana roasted in ghee + almonds",
        portion: "30 g makhana + 12 almonds",
      },
      {
        slot: "Dinner",
        items: "Jeera rice, moong dal tadka, sauteed capsicum",
        portion: "1 cup rice + 1 bowl dal + fresh curd",
      },
    ],
    groceries: [
      { item: "Paneer", qty: "1 kg/week", bucket: "protein" },
      { item: "Moong & Toor dal", qty: "1.5 kg/week", bucket: "protein" },
      { item: "Makhana & Nuts", qty: "300 g/week", bucket: "other" },
      { item: "Curd & Milk", qty: "3 L/week", bucket: "dairy" },
      { item: "Atta & Rice", qty: "2.5 kg/week", bucket: "carb" },
    ],
    hydration: [
      "3 L filtered water daily.",
      "Herbal / fennel water after heavy meals.",
    ],
  },
];

const SWAP_GUIDE = [
  {
    from: "Paneer (high fat)",
    to: "Soya Chunks / Low Fat Paneer / Tofu",
    benefit: "Saves ~12g fat per 100g while keeping protein high",
  },
  {
    from: "Deep-fried snacks",
    to: "Roasted Chana / Makhana",
    benefit: "High fiber, 3x fewer calories and steady energy",
  },
  {
    from: "Plain White Bread",
    to: "Whole Wheat Roti / Rolled Oats",
    benefit: "Slower glycemic release and better satiety",
  },
  {
    from: "Whole Eggs (when cutting fats)",
    to: "1 Whole Egg + 3 Egg Whites",
    benefit: "Cuts fat by 65% while keeping 18g clean protein",
  },
];

export default function NutritionPage() {
  const [activeTab, setActiveTab] = useState<NutritionTab>("diary");
  const [snapshot, setSnapshot] = useState<PlannerSnapshot>(readPlannerSnapshot());
  const [selectedPlanId, setSelectedPlanId] = useState<string>(INDIA_MEAL_PLANS[0].id);
  const [region, setRegion] = useState<RegionPreset>("all");
  const [diet, setDiet] = useState<DietPreference>("veg");
  const [priority, setPriority] = useState<PlanPriority>("balanced");
  const [currentDateStr, setCurrentDateStr] = useState<string>(
    new Date().toISOString().slice(0, 10),
  );
  const [logToast, setLogToast] = useState<string | null>(null);

  // Sync snapshot
  useEffect(() => {
    setSnapshot(readPlannerSnapshot());
    void syncPlannerSnapshotFromServer().then((serverSnap) => {
      setSnapshot(serverSnap);
    });
  }, []);

  const plan = useMemo(() => {
    return calculateBodyPlan(snapshot.input);
  }, [snapshot.input]);

  const selectedPlan = useMemo(() => {
    return (
      INDIA_MEAL_PLANS.find((item) => item.id === selectedPlanId) ||
      INDIA_MEAL_PLANS[0]
    );
  }, [selectedPlanId]);

  const visiblePlans = useMemo(() => {
    return INDIA_MEAL_PLANS.filter((item) => {
      const matchRegion = region === "all" || item.region === region;
      const matchDiet = item.diets.includes(diet);
      const matchPriority = item.priorities.includes(priority);
      return matchRegion && matchDiet && matchPriority;
    });
  }, [region, diet, priority]);

  // Current Date's Food Log
  const currentDailyLog = useMemo<DailyFoodLog>(() => {
    const existing = snapshot.foodLogs?.[currentDateStr];
    if (existing) return existing;
    return {
      date: currentDateStr,
      entries: [],
      waterMl: snapshot.waterLogs?.[currentDateStr] || 0,
    };
  }, [snapshot.foodLogs, snapshot.waterLogs, currentDateStr]);

  // Update Daily Food Log handler
  const handleUpdateDailyLog = (updatedLog: DailyFoodLog) => {
    const updatedFoodLogs = {
      ...(snapshot.foodLogs || {}),
      [currentDateStr]: updatedLog,
    };

    const updatedWaterLogs = {
      ...(snapshot.waterLogs || {}),
      [currentDateStr]: updatedLog.waterMl || 0,
    };

    const newSnapshot: PlannerSnapshot = {
      ...snapshot,
      foodLogs: updatedFoodLogs,
      waterLogs: updatedWaterLogs,
    };

    setSnapshot(newSnapshot);
    savePlannerSnapshot(newSnapshot);
  };

  // 1-Click Log Entire Meal Plan to Today's Diary
  const handleLogPlanToDiary = (template: IndiaMealPlan) => {
    const newEntries: LoggedFoodEntry[] = [];
    const now = new Date().toISOString();

    template.meals.forEach((m) => {
      const slot = m.slot.toLowerCase() as "breakfast" | "lunch" | "snack" | "dinner";
      newEntries.push({
        id: `plan-${template.id}-${slot}-${Date.now()}`,
        foodId: `plan-${template.id}`,
        name: `${m.items} (${m.portion})`,
        servings: 1,
        servingUnit: m.portion,
        calories: Math.round(template.calories / 4),
        proteinG: Math.round((template.proteinG / 4) * 10) / 10,
        carbsG: Math.round((template.carbsG / 4) * 10) / 10,
        fatsG: Math.round((template.fatsG / 4) * 10) / 10,
        fiberG: 4,
        mealSlot: slot,
        loggedAt: now,
      });
    });

    const updatedLog: DailyFoodLog = {
      ...currentDailyLog,
      entries: [...currentDailyLog.entries, ...newEntries],
    };

    handleUpdateDailyLog(updatedLog);
    setLogToast(`Logged ${template.name} into today's diary!`);
    setTimeout(() => setLogToast(null), 3500);
    setActiveTab("diary");
  };

  // Adaptive TDEE Engine computation
  const adaptiveTDEEResult = useMemo(() => {
    const weightHistory = (snapshot.checkins || []).map((c) => ({
      date: c.date,
      weightKg: c.weightKg,
    }));

    if (weightHistory.length === 0) {
      weightHistory.push({
        date: new Date().toISOString().slice(0, 10),
        weightKg: snapshot.input.weightKg,
      });
    }

    return calculateAdaptiveTDEE({
      weightHistory,
      foodLogs: snapshot.foodLogs || {},
      formulaTDEE: plan.targetCalories,
      goal: snapshot.input.goal,
    });
  }, [snapshot.checkins, snapshot.foodLogs, snapshot.input.weightKg, snapshot.input.goal, plan.targetCalories]);

  // Handle Apply Target from TDEE
  const handleApplyRecommendedTarget = (newCalories: number) => {
    setLogToast(`Applied ${newCalories} kcal target!`);
    setTimeout(() => setLogToast(null), 3000);
  };

  // Groceries for Smart Grocery List
  const consolidatedGroceries = useMemo<GroceryItem[]>(() => {
    return selectedPlan.groceries.map((g, idx) => ({
      id: `grocery-${selectedPlan.id}-${idx}`,
      name: g.item,
      qty: g.qty,
      bucket: g.bucket,
    }));
  }, [selectedPlan]);

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Alert */}
      {logToast && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-cyan-500 text-black font-bold font-mono text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4" /> {logToast}
        </div>
      )}

      {/* Header Banner */}
      <Card level="elevated" className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold font-mono tracking-widest uppercase text-cyan-400">
              Precision Fueling & Macro Tracking
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
            Daily Nutrition & Adaptive Metabolism
          </h1>
          <p className="mt-1 text-sm text-[#636380]">
            Track daily Indian staple macros, discover regional meal splits, calculate adaptive TDEE, and export grocery lists.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveTab("diary")}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs uppercase tracking-wider transition shadow-md font-mono flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Log Today's Meal
          </button>
        </div>
      </Card>

      {/* Target Metric Strip */}
      <div className="grid gap-4 sm:grid-cols-4 font-mono">
        <MetricTile
          label="Daily Calorie Target"
          value={`${plan.targetCalories} kcal`}
          note={`Deficit/Surplus: ${snapshot.input.goal.replace("_", " ")}`}
        />
        <MetricTile
          label="Protein Target"
          value={`${plan.macros.proteinG}g`}
          note={`${((plan.macros.proteinG * 4 * 100) / plan.targetCalories).toFixed(0)}% of total energy`}
        />
        <MetricTile
          label="Carbohydrates"
          value={`${plan.macros.carbsG}g`}
          note="Complex grains, roti & dals"
        />
        <MetricTile
          label="Healthy Fats"
          value={`${plan.macros.fatsG}g`}
          note="Hormonal & joint support"
        />
      </div>

      {/* Sub-Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("diary")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition whitespace-nowrap",
            activeTab === "diary"
              ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm"
              : "text-zinc-400 hover:text-white border border-transparent",
          )}
        >
          <Utensils className="w-4 h-4 text-cyan-400" />
          <span>Daily Food Diary</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("plans")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition whitespace-nowrap",
            activeTab === "plans"
              ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm"
              : "text-zinc-400 hover:text-white border border-transparent",
          )}
        >
          <CookingPot className="w-4 h-4 text-cyan-400" />
          <span>Regional Meal Plans</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("tdee")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition whitespace-nowrap",
            activeTab === "tdee"
              ? "bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-sm"
              : "text-zinc-400 hover:text-white border border-transparent",
          )}
        >
          <Flame className="w-4 h-4 text-amber-400" />
          <span>Metabolism & Adaptive TDEE</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("grocery")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition whitespace-nowrap",
            activeTab === "grocery"
              ? "bg-purple-500/15 text-purple-300 border border-purple-500/40 shadow-sm"
              : "text-zinc-400 hover:text-white border border-transparent",
          )}
        >
          <ShoppingCart className="w-4 h-4 text-purple-400" />
          <span>Smart Grocery List</span>
        </button>
      </div>

      {/* Tab 1: Daily Food Diary */}
      {activeTab === "diary" && (
        <DailyFoodDiary
          currentDateStr={currentDateStr}
          onDateChange={setCurrentDateStr}
          dailyLog={currentDailyLog}
          targets={{
            calories: plan.targetCalories,
            proteinG: plan.macros.proteinG,
            carbsG: plan.macros.carbsG,
            fatsG: plan.macros.fatsG,
            fiberG: plan.macros.fiberG,
          }}
          onUpdateDailyLog={handleUpdateDailyLog}
        />
      )}

      {/* Tab 2: Regional Meal Plans */}
      {activeTab === "plans" && (
        <div className="space-y-6">
          <Card level="base" className="space-y-4">
            <SectionHeader
              kicker="Filters"
              title="Tailor your Indian nutrition style"
              description="Switch region and diet to see plans built around your groceries and budget."
            />
            <div className="grid gap-3 sm:grid-cols-3">
              <Card
                level="base"
                className="flex items-center gap-2 border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]"
              >
                <CookingPot className="h-4 w-4 text-cyan-300" />
                <select
                  className="w-full bg-transparent text-sm text-[#eeeef2] outline-none font-mono"
                  value={region}
                  onChange={(event) => setRegion(event.target.value as RegionPreset)}
                >
                  <option value="all" className="bg-[#0b0b14]">All regions</option>
                  <option value="north" className="bg-[#0b0b14]">North style</option>
                  <option value="south" className="bg-[#0b0b14]">South style</option>
                  <option value="quick" className="bg-[#0b0b14]">Quick prep / Budget</option>
                </select>
              </Card>
              <Card
                level="base"
                className="flex items-center gap-2 border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]"
              >
                <Scale className="h-4 w-4 text-cyan-300" />
                <select
                  className="w-full bg-transparent text-sm text-[#eeeef2] outline-none font-mono"
                  value={diet}
                  onChange={(event) => setDiet(event.target.value as DietPreference)}
                >
                  <option value="veg" className="bg-[#0b0b14]">Vegetarian</option>
                  <option value="non_veg" className="bg-[#0b0b14]">Non-vegetarian</option>
                  <option value="jain" className="bg-[#0b0b14]">Jain-friendly</option>
                  <option value="mixed" className="bg-[#0b0b14]">Mixed</option>
                </select>
              </Card>
              <Card
                level="base"
                className="flex items-center gap-2 border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]"
              >
                <CircleDollarSign className="h-4 w-4 text-cyan-300" />
                <select
                  className="w-full bg-transparent text-sm text-[#eeeef2] outline-none font-mono"
                  value={priority}
                  onChange={(event) => setPriority(event.target.value as PlanPriority)}
                >
                  <option value="balanced" className="bg-[#0b0b14]">Balanced</option>
                  <option value="high_protein" className="bg-[#0b0b14]">High protein</option>
                  <option value="budget" className="bg-[#0b0b14]">Budget</option>
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
                      <h3 className="font-display text-xl font-bold text-[#eeeef2]">
                        {template.name}
                      </h3>
                      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[#636380] font-mono">
                        {template.region} style
                      </p>
                    </div>
                    <p className="font-mono text-2xl font-bold text-[#ffb347]">
                      {template.calories}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs font-mono">
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

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedPlanId(template.id)}
                      className={cn(
                        "py-2 px-3 rounded-xl text-xs font-mono font-semibold transition border text-center",
                        selectedPlan.id === template.id
                          ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                          : "bg-white/[0.02] text-zinc-400 border-white/10 hover:text-white",
                      )}
                    >
                      {selectedPlan.id === template.id ? "Active Plan" : "Select Plan"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleLogPlanToDiary(template)}
                      className="py-2 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs uppercase tracking-wider transition font-mono flex items-center justify-center gap-1 shadow-md"
                    >
                      Log to Diary
                    </button>
                  </div>
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
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <SectionHeader kicker="Today Plate" title={selectedPlan.name} />
                <button
                  type="button"
                  onClick={() => handleLogPlanToDiary(selectedPlan)}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold transition flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Log to Today's Diary
                </button>
              </div>
              <div className="space-y-2">
                {selectedPlan.meals.map((meal) => (
                  <div
                    key={`${selectedPlan.id}-${meal.slot}`}
                    className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-3.5 text-sm space-y-1"
                  >
                    <p className="font-semibold text-[#eeeef2] font-display">{meal.slot}</p>
                    <p className="text-[#636380] text-xs">{meal.items}</p>
                    <p className="text-xs text-cyan-300 font-mono">{meal.portion}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card level="base" className="space-y-4">
              <SectionHeader kicker="Easy Swaps" title="Daily Indian alternatives" />
              <div className="space-y-2">
                {SWAP_GUIDE.map((swap) => (
                  <div
                    key={`${swap.from}-${swap.to}`}
                    className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-3.5 text-xs space-y-1"
                  >
                    <p className="text-[#eeeef2] font-bold">
                      Swap {swap.from} -&gt; <span className="text-cyan-300">{swap.to}</span>
                    </p>
                    <p className="text-[#636380]">{swap.benefit}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 3: Adaptive TDEE */}
      {activeTab === "tdee" && (
        <div className="space-y-6">
          <AdaptiveTDEECard
            result={adaptiveTDEEResult}
            onApplyRecommendedTarget={handleApplyRecommendedTarget}
          />
        </div>
      )}

      {/* Tab 4: Smart Grocery List */}
      {activeTab === "grocery" && (
        <div className="space-y-6">
          <SmartGroceryList
            groceries={consolidatedGroceries}
            planTitle={selectedPlan.name}
          />
        </div>
      )}
    </div>
  );
}
