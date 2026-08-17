"use client";

import { useState, useMemo } from "react";
import {
  Plus,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Flame,
  Beef,
  Wheat,
  CookingPot,
  Sparkles,
  Check,
  X,
  Apple,
} from "lucide-react";
import {
  INDIAN_FOOD_DATABASE,
  FoodItem,
  LoggedFoodEntry,
  DailyFoodLog,
  FoodDietCategory,
  FoodCategory,
  searchIndianFoods,
  calculateScaledMacros,
} from "@/lib/indianFoodDatabase";
import { MacroTargets } from "@/lib/bodyPlanner";
import { cn } from "@/lib/cn";

interface DailyFoodDiaryProps {
  currentDateStr: string;
  onDateChange: (newDateStr: string) => void;
  dailyLog: DailyFoodLog;
  targets: MacroTargets & { calories: number };
  onUpdateDailyLog: (updatedLog: DailyFoodLog) => void;
}

type MealSlotType = "breakfast" | "lunch" | "snack" | "dinner";

const MEAL_SLOTS: Array<{ id: MealSlotType; label: string; icon: string }> = [
  { id: "breakfast", label: "Breakfast", icon: "🍳" },
  { id: "lunch", label: "Lunch", icon: "🍛" },
  { id: "snack", label: "Snack / Pre-Workout", icon: "🥜" },
  { id: "dinner", label: "Dinner", icon: "🍲" },
];

export function DailyFoodDiary({
  currentDateStr,
  onDateChange,
  dailyLog,
  targets,
  onUpdateDailyLog,
}: DailyFoodDiaryProps) {
  const [activeMealSlot, setActiveMealSlot] = useState<MealSlotType | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dietFilter, setDietFilter] = useState<FoodDietCategory | "all">("all");
  const [customFoodMode, setCustomFoodMode] = useState(false);

  // Selected food item in picker
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [servingsCount, setServingsCount] = useState<number>(1);

  // Custom food form state
  const [customName, setCustomName] = useState("");
  const [customKcal, setCustomKcal] = useState<number>(150);
  const [customProtein, setCustomProtein] = useState<number>(10);
  const [customCarbs, setCustomCarbs] = useState<number>(15);
  const [customFats, setCustomFats] = useState<number>(5);

  // Filtered food catalog
  const filteredFoods = useMemo(() => {
    return searchIndianFoods(searchQuery, dietFilter);
  }, [searchQuery, dietFilter]);

  // Compute daily consumed macros
  const consumed = useMemo(() => {
    let kcal = 0;
    let protein = 0;
    let carbs = 0;
    let fats = 0;
    let fiber = 0;

    dailyLog.entries.forEach((e) => {
      kcal += e.calories;
      protein += e.proteinG;
      carbs += e.carbsG;
      fats += e.fatsG;
      fiber += e.fiberG;
    });

    return {
      calories: Math.round(kcal),
      proteinG: Math.round(protein * 10) / 10,
      carbsG: Math.round(carbs * 10) / 10,
      fatsG: Math.round(fats * 10) / 10,
      fiberG: Math.round(fiber * 10) / 10,
    };
  }, [dailyLog.entries]);

  const caloriesRemaining = Math.max(0, targets.calories - consumed.calories);

  // Date shifting
  const handleShiftDate = (daysDelta: number) => {
    const current = new Date(currentDateStr);
    current.setDate(current.getDate() + daysDelta);
    onDateChange(current.toISOString().slice(0, 10));
  };

  // Add Item to Meal Slot
  const handleAddFoodEntry = () => {
    if (!activeMealSlot) return;

    if (customFoodMode) {
      if (!customName.trim()) return;
      const newEntry: LoggedFoodEntry = {
        id: `custom-food-${Date.now()}`,
        foodId: "custom",
        name: customName,
        servings: 1,
        servingUnit: "1 serving",
        calories: customKcal,
        proteinG: customProtein,
        carbsG: customCarbs,
        fatsG: customFats,
        fiberG: 0,
        mealSlot: activeMealSlot,
        loggedAt: new Date().toISOString(),
      };

      onUpdateDailyLog({
        ...dailyLog,
        entries: [...dailyLog.entries, newEntry],
      });

      // Reset
      setCustomFoodMode(false);
      setCustomName("");
      setActiveMealSlot(null);
      return;
    }

    if (!selectedFood) return;

    const scaled = calculateScaledMacros(selectedFood, servingsCount);
    const newEntry: LoggedFoodEntry = {
      id: `${selectedFood.id}-${Date.now()}`,
      foodId: selectedFood.id,
      name: selectedFood.name,
      servings: servingsCount,
      servingUnit: selectedFood.servingUnit,
      calories: scaled.calories,
      proteinG: scaled.proteinG,
      carbsG: scaled.carbsG,
      fatsG: scaled.fatsG,
      fiberG: scaled.fiberG,
      mealSlot: activeMealSlot,
      loggedAt: new Date().toISOString(),
    };

    onUpdateDailyLog({
      ...dailyLog,
      entries: [...dailyLog.entries, newEntry],
    });

    setSelectedFood(null);
    setServingsCount(1);
    setActiveMealSlot(null);
  };

  const handleRemoveEntry = (entryId: string) => {
    onUpdateDailyLog({
      ...dailyLog,
      entries: dailyLog.entries.filter((e) => e.id !== entryId),
    });
  };

  // Water tracking helpers
  const currentWaterMl = dailyLog.waterMl || 0;
  const targetWaterMl = 3500;

  const handleAddWater = (ml: number) => {
    onUpdateDailyLog({
      ...dailyLog,
      waterMl: Math.max(0, currentWaterMl + ml),
    });
  };

  const dateLabel = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    if (currentDateStr === todayStr) return "Today";
    if (currentDateStr === yesterdayStr) return "Yesterday";
    return new Date(currentDateStr).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }, [currentDateStr]);

  return (
    <div className="space-y-6">
      {/* Date Header Navigator */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/10">
        <button
          type="button"
          onClick={() => handleShiftDate(-1)}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="text-center">
          <span className="text-[10px] font-bold uppercase font-mono tracking-widest text-cyan-400 block">
            Daily Food Diary
          </span>
          <h3 className="text-lg sm:text-xl font-bold font-display text-white">
            {dateLabel} · <span className="font-mono text-zinc-400 text-sm">{currentDateStr}</span>
          </h3>
        </div>

        <button
          type="button"
          onClick={() => handleShiftDate(1)}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Macro Gauge Cards */}
      <div className="grid gap-4 sm:grid-cols-4 font-mono">
        {/* Calories Card */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="flex items-center gap-1.5 text-amber-400 font-bold uppercase">
              <Flame className="w-4 h-4" /> Calories
            </span>
            <span>{caloriesRemaining} left</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-white">{consumed.calories}</span>
            <span className="text-xs text-zinc-500">/ {targets.calories} kcal</span>
          </div>
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                consumed.calories > targets.calories ? "bg-amber-400" : "bg-cyan-400",
              )}
              style={{
                width: `${Math.min(100, (consumed.calories / targets.calories) * 100)}%`,
              }}
            />
          </div>
        </div>

        {/* Protein Card */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="flex items-center gap-1.5 text-cyan-400 font-bold uppercase">
              <Beef className="w-4 h-4" /> Protein
            </span>
            <span>{Math.round((consumed.proteinG / targets.proteinG) * 100)}%</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-cyan-300">{consumed.proteinG}g</span>
            <span className="text-xs text-zinc-500">/ {targets.proteinG}g</span>
          </div>
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-400 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, (consumed.proteinG / targets.proteinG) * 100)}%`,
              }}
            />
          </div>
        </div>

        {/* Carbs Card */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="flex items-center gap-1.5 text-purple-400 font-bold uppercase">
              <Wheat className="w-4 h-4" /> Carbs
            </span>
            <span>{Math.round((consumed.carbsG / targets.carbsG) * 100)}%</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-purple-300">{consumed.carbsG}g</span>
            <span className="text-xs text-zinc-500">/ {targets.carbsG}g</span>
          </div>
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-400 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, (consumed.carbsG / targets.carbsG) * 100)}%`,
              }}
            />
          </div>
        </div>

        {/* Fats Card */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="flex items-center gap-1.5 text-green-400 font-bold uppercase">
              <CookingPot className="w-4 h-4" /> Fats
            </span>
            <span>{Math.round((consumed.fatsG / targets.fatsG) * 100)}%</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-green-300">{consumed.fatsG}g</span>
            <span className="text-xs text-zinc-500">/ {targets.fatsG}g</span>
          </div>
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-400 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, (consumed.fatsG / targets.fatsG) * 100)}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Hydration Quick-Tracker Bar */}
      <div className="p-4 rounded-2xl bg-cyan-500/[0.03] border border-cyan-500/20 flex flex-wrap items-center justify-between gap-4 font-mono">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-cyan-400 block">Hydration</span>
            <span className="text-sm font-bold text-white">
              {currentWaterMl} ml <span className="text-xs text-zinc-500">/ {targetWaterMl} ml</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleAddWater(250)}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-cyan-300 border border-white/10 hover:border-cyan-500/30 text-xs font-semibold transition"
          >
            +250ml (Glass)
          </button>
          <button
            type="button"
            onClick={() => handleAddWater(500)}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-cyan-300 border border-white/10 hover:border-cyan-500/30 text-xs font-semibold transition"
          >
            +500ml (Bottle)
          </button>
          <button
            type="button"
            onClick={() => handleAddWater(1000)}
            className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition"
          >
            +1.0 L (Shaker)
          </button>
        </div>
      </div>

      {/* 4 Meal Slots Feed */}
      <div className="space-y-4">
        {MEAL_SLOTS.map((slot) => {
          const slotEntries = dailyLog.entries.filter((e) => e.mealSlot === slot.id);
          const slotCalories = slotEntries.reduce((sum, e) => sum + e.calories, 0);
          const slotProtein = Math.round(slotEntries.reduce((sum, e) => sum + e.proteinG, 0) * 10) / 10;

          return (
            <div
              key={slot.id}
              className="p-4 sm:p-5 rounded-3xl border border-white/10 bg-white/[0.02] space-y-3"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{slot.icon}</span>
                  <div>
                    <h4 className="font-display text-base font-bold text-white">{slot.label}</h4>
                    <span className="text-xs text-zinc-400 font-mono">
                      {slotCalories} kcal · {slotProtein}g protein ({slotEntries.length} items)
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setActiveMealSlot(slot.id);
                    setSelectedFood(null);
                    setCustomFoodMode(false);
                    setSearchQuery("");
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-semibold transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Food
                </button>
              </div>

              {/* Meal Entries Table */}
              {slotEntries.length === 0 ? (
                <div className="py-4 text-center text-xs text-zinc-500 font-mono">
                  No foods logged for {slot.label.toLowerCase()} yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {slotEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-3 group transition hover:border-white/15"
                    >
                      <div className="min-w-0">
                        <h5 className="font-display text-sm font-bold text-white truncate">
                          {entry.name}
                        </h5>
                        <p className="text-xs text-zinc-400 font-mono">
                          {entry.servings} × {entry.servingUnit}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 shrink-0 font-mono">
                        <div className="text-right">
                          <span className="text-sm font-bold text-white block">
                            {entry.calories} kcal
                          </span>
                          <span className="text-[10px] text-cyan-300">
                            P: {entry.proteinG}g · C: {entry.carbsG}g · F: {entry.fatsG}g
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveEntry(entry.id)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Food Search & Log Modal */}
      {activeMealSlot && (
        <div className="fixed inset-0 z-60 bg-black/85 p-3 sm:p-6 backdrop-blur-md flex items-center justify-center overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#0d0d18] border border-white/15 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 my-auto max-h-[95vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3 shrink-0">
              <div>
                <span className="text-[10px] font-bold uppercase font-mono tracking-widest text-cyan-400">
                  Nutritional Database
                </span>
                <h4 className="font-display text-xl font-bold text-white capitalize">
                  Log Food for {activeMealSlot}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setActiveMealSlot(null)}
                className="p-2 text-zinc-400 hover:text-white rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="flex gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setCustomFoodMode(false)}
                className={cn(
                  "px-4 py-1.5 rounded-xl border text-xs font-mono font-semibold transition",
                  !customFoodMode
                    ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                    : "bg-white/[0.02] text-zinc-400 border-white/10",
                )}
              >
                Indian Food Catalog
              </button>
              <button
                type="button"
                onClick={() => setCustomFoodMode(true)}
                className={cn(
                  "px-4 py-1.5 rounded-xl border text-xs font-mono font-semibold transition",
                  customFoodMode
                    ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                    : "bg-white/[0.02] text-zinc-400 border-white/10",
                )}
              >
                Custom Quick Entry
              </button>
            </div>

            {customFoodMode ? (
              /* Custom Food Form */
              <div className="space-y-4 py-2">
                <div>
                  <label className="text-xs font-mono text-zinc-400 block mb-1">
                    Food Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Samosa, Paneer Roll, Protein Bar..."
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-white/10 bg-white/[0.04] text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-1 uppercase">Calories</label>
                    <input
                      type="number"
                      value={customKcal}
                      onChange={(e) => setCustomKcal(Number(e.target.value) || 0)}
                      className="w-full h-10 px-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-sm text-white text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-1 uppercase">Protein (g)</label>
                    <input
                      type="number"
                      value={customProtein}
                      onChange={(e) => setCustomProtein(Number(e.target.value) || 0)}
                      className="w-full h-10 px-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-sm text-cyan-300 text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-1 uppercase">Carbs (g)</label>
                    <input
                      type="number"
                      value={customCarbs}
                      onChange={(e) => setCustomCarbs(Number(e.target.value) || 0)}
                      className="w-full h-10 px-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-sm text-purple-300 text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-1 uppercase">Fats (g)</label>
                    <input
                      type="number"
                      value={customFats}
                      onChange={(e) => setCustomFats(Number(e.target.value) || 0)}
                      className="w-full h-10 px-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-sm text-green-300 text-center"
                    />
                  </div>
                </div>

                <div className="pt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={handleAddFoodEntry}
                    disabled={!customName.trim()}
                    className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs uppercase tracking-wider transition shadow-md"
                  >
                    Add Custom Food
                  </button>
                </div>
              </div>
            ) : (
              /* Database Browser */
              <>
                <div className="space-y-2 shrink-0">
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="Search Roti, Paneer, Dal, Eggs, Chicken, Dahi, Rice..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-11 pl-10 pr-4 rounded-xl border border-white/10 bg-white/[0.04] text-sm text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                    {(["all", "veg", "vegan", "non_veg"] as const).map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDietFilter(d)}
                        className={cn(
                          "px-3 py-1 rounded-lg border font-mono transition uppercase text-[10px]",
                          dietFilter === d
                            ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-300"
                            : "border-white/5 bg-white/[0.02] text-zinc-400 hover:text-white",
                        )}
                      >
                        {d.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Food List */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                  {filteredFoods.map((item) => {
                    const isSelected = selectedFood?.id === item.id;
                    const scaled = isSelected
                      ? calculateScaledMacros(item, servingsCount)
                      : item;

                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          setSelectedFood(item);
                          setServingsCount(1);
                        }}
                        className={cn(
                          "p-3 rounded-2xl border transition cursor-pointer select-none",
                          isSelected
                            ? "border-cyan-500 bg-cyan-500/10 shadow-lg"
                            : "border-white/5 bg-white/[0.02] hover:border-white/15",
                        )}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="font-display text-sm font-bold text-white">
                                {item.name}
                              </h5>
                              {item.hindiName && (
                                <span className="text-xs text-zinc-400 font-sans">
                                  ({item.hindiName})
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-zinc-400 font-mono">
                              Serving: {item.servingUnit}
                            </p>
                          </div>

                          <div className="text-right font-mono">
                            <span className="text-sm font-bold text-white block">
                              {scaled.calories} kcal
                            </span>
                            <span className="text-[10px] text-cyan-300">
                              {scaled.proteinG}g P · {scaled.carbsG}g C · {scaled.fatsG}g F
                            </span>
                          </div>
                        </div>

                        {/* Servings Adjuster if Selected */}
                        {isSelected && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="mt-3 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-2 font-mono text-xs">
                              <span className="text-zinc-300">Servings:</span>
                              <div className="flex items-center border border-white/20 rounded-lg overflow-hidden bg-black/40">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setServingsCount((prev) => Math.max(0.5, prev - 0.5))
                                  }
                                  className="px-2.5 py-1 text-zinc-400 hover:text-white"
                                >
                                  -
                                </button>
                                <span className="px-3 py-1 font-bold text-cyan-300">
                                  {servingsCount}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setServingsCount((prev) => prev + 0.5)}
                                  className="px-2.5 py-1 text-zinc-400 hover:text-white"
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={handleAddFoodEntry}
                              className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs uppercase tracking-wider transition"
                            >
                              Log {servingsCount} Serving
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
