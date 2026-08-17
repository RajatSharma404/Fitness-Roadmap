export type FoodDietCategory = "veg" | "non_veg" | "jain" | "vegan";
export type FoodCategory =
  | "grains_breads"
  | "legumes_dals"
  | "dairy_proteins"
  | "meat_eggs"
  | "supplements"
  | "nuts_seeds"
  | "fruits_veg"
  | "snacks";

export interface FoodItem {
  id: string;
  name: string;
  hindiName?: string;
  category: FoodCategory;
  diet: FoodDietCategory;
  servingUnit: string; // e.g. "1 medium roti (35g)", "1 bowl (150g)", "100g", "1 scoop (30g)"
  servingWeightGrams: number;
  calories: number; // per servingUnit
  proteinG: number;
  carbsG: number;
  fatsG: number;
  fiberG: number;
  isPopular?: boolean;
}

export interface LoggedFoodEntry {
  id: string;
  foodId: string;
  name: string;
  servings: number;
  servingUnit: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
  fiberG: number;
  mealSlot: "breakfast" | "lunch" | "snack" | "dinner";
  loggedAt: string;
}

export interface DailyFoodLog {
  date: string; // YYYY-MM-DD
  entries: LoggedFoodEntry[];
  waterMl?: number;
  notes?: string;
}

export const INDIAN_FOOD_DATABASE: FoodItem[] = [
  // --- Grains & Breads ---
  {
    id: "roti-plain",
    name: "Wheat Roti / Chapati (Plain)",
    hindiName: "रोटी / चपाती",
    category: "grains_breads",
    diet: "vegan",
    servingUnit: "1 medium roti (35g raw atta)",
    servingWeightGrams: 40,
    calories: 104,
    proteinG: 3.2,
    carbsG: 21.5,
    fatsG: 0.5,
    fiberG: 2.8,
    isPopular: true,
  },
  {
    id: "roti-ghee",
    name: "Wheat Roti with Ghee",
    hindiName: "घी वाली रोटी",
    category: "grains_breads",
    diet: "veg",
    servingUnit: "1 roti + 0.5 tsp ghee",
    servingWeightGrams: 45,
    calories: 125,
    proteinG: 3.2,
    carbsG: 21.5,
    fatsG: 3.0,
    fiberG: 2.8,
    isPopular: true,
  },
  {
    id: "white-rice",
    name: "Cooked White Rice",
    hindiName: "सफेद चावल",
    category: "grains_breads",
    diet: "vegan",
    servingUnit: "1 medium katori / bowl (150g)",
    servingWeightGrams: 150,
    calories: 195,
    proteinG: 4.1,
    carbsG: 43.0,
    fatsG: 0.5,
    fiberG: 0.8,
    isPopular: true,
  },
  {
    id: "brown-rice",
    name: "Cooked Brown Rice",
    hindiName: "ब्राउन राइस",
    category: "grains_breads",
    diet: "vegan",
    servingUnit: "1 bowl (150g)",
    servingWeightGrams: 150,
    calories: 168,
    proteinG: 3.8,
    carbsG: 35.5,
    fatsG: 1.4,
    fiberG: 2.7,
  },
  {
    id: "poha",
    name: "Poha (Flattened Rice with Veggies)",
    hindiName: "पोहा",
    category: "grains_breads",
    diet: "vegan",
    servingUnit: "1 bowl (180g)",
    servingWeightGrams: 180,
    calories: 220,
    proteinG: 4.5,
    carbsG: 38.0,
    fatsG: 5.5,
    fiberG: 3.2,
    isPopular: true,
  },
  {
    id: "idli",
    name: "Steamed Idli",
    hindiName: "इडली",
    category: "grains_breads",
    diet: "vegan",
    servingUnit: "2 pieces (100g)",
    servingWeightGrams: 100,
    calories: 140,
    proteinG: 4.0,
    carbsG: 28.0,
    fatsG: 0.8,
    fiberG: 1.5,
    isPopular: true,
  },
  {
    id: "plain-dosa",
    name: "Plain Dosa",
    hindiName: "सादा डोसा",
    category: "grains_breads",
    diet: "vegan",
    servingUnit: "1 medium dosa (90g)",
    servingWeightGrams: 90,
    calories: 165,
    proteinG: 3.8,
    carbsG: 26.5,
    fatsG: 4.8,
    fiberG: 1.2,
  },
  {
    id: "oats-cooked",
    name: "Rolled Oats (Cooked in Water)",
    hindiName: "ओट्स",
    category: "grains_breads",
    diet: "vegan",
    servingUnit: "1 cup / 50g dry (150g cooked)",
    servingWeightGrams: 150,
    calories: 190,
    proteinG: 6.5,
    carbsG: 34.0,
    fatsG: 3.2,
    fiberG: 5.0,
    isPopular: true,
  },

  // --- Legumes & Dals ---
  {
    id: "moong-dal",
    name: "Moong Dal (Yellow/Green Cooked)",
    hindiName: "मूंग दाल",
    category: "legumes_dals",
    diet: "vegan",
    servingUnit: "1 medium bowl (150g)",
    servingWeightGrams: 150,
    calories: 150,
    proteinG: 9.2,
    carbsG: 22.0,
    fatsG: 2.2,
    fiberG: 5.4,
    isPopular: true,
  },
  {
    id: "toor-dal",
    name: "Toor / Arhar Dal (Tadka)",
    hindiName: "अरहर / तूर दाल",
    category: "legumes_dals",
    diet: "vegan",
    servingUnit: "1 medium bowl (150g)",
    servingWeightGrams: 150,
    calories: 165,
    proteinG: 8.8,
    carbsG: 24.0,
    fatsG: 3.5,
    fiberG: 4.8,
    isPopular: true,
  },
  {
    id: "rajma-curry",
    name: "Rajma (Kidney Beans Masala)",
    hindiName: "राजमा",
    category: "legumes_dals",
    diet: "vegan",
    servingUnit: "1 bowl (180g)",
    servingWeightGrams: 180,
    calories: 210,
    proteinG: 11.5,
    carbsG: 32.0,
    fatsG: 4.0,
    fiberG: 7.2,
    isPopular: true,
  },
  {
    id: "chole-chana",
    name: "Chole / Chana Masala (Chickpeas)",
    hindiName: "छोले / चना",
    category: "legumes_dals",
    diet: "vegan",
    servingUnit: "1 bowl (180g)",
    servingWeightGrams: 180,
    calories: 235,
    proteinG: 12.0,
    carbsG: 34.5,
    fatsG: 5.2,
    fiberG: 8.0,
    isPopular: true,
  },
  {
    id: "sambar",
    name: "South Indian Sambar",
    hindiName: "सांभर",
    category: "legumes_dals",
    diet: "vegan",
    servingUnit: "1 large bowl (200g)",
    servingWeightGrams: 200,
    calories: 130,
    proteinG: 5.5,
    carbsG: 20.0,
    fatsG: 3.0,
    fiberG: 4.2,
  },

  // --- Dairy & Vegetarian Proteins ---
  {
    id: "paneer-raw",
    name: "Paneer (Fresh Cottage Cheese)",
    hindiName: "पनीर (कच्चा)",
    category: "dairy_proteins",
    diet: "veg",
    servingUnit: "100g",
    servingWeightGrams: 100,
    calories: 265,
    proteinG: 18.5,
    carbsG: 3.5,
    fatsG: 20.0,
    fiberG: 0,
    isPopular: true,
  },
  {
    id: "paneer-bhurji",
    name: "Paneer Bhurji (Cooked with Veggies)",
    hindiName: "पनीर भुर्जी",
    category: "dairy_proteins",
    diet: "veg",
    servingUnit: "1 bowl / 120g",
    servingWeightGrams: 120,
    calories: 240,
    proteinG: 16.0,
    carbsG: 5.0,
    fatsG: 17.5,
    fiberG: 1.2,
    isPopular: true,
  },
  {
    id: "soya-chunks",
    name: "Soya Chunks / Chura (Cooked)",
    hindiName: "सोया चंक्स",
    category: "dairy_proteins",
    diet: "vegan",
    servingUnit: "50g dry / 1 bowl cooked (150g)",
    servingWeightGrams: 150,
    calories: 175,
    proteinG: 26.0,
    carbsG: 16.5,
    fatsG: 0.5,
    fiberG: 6.5,
    isPopular: true,
  },
  {
    id: "tofu-firm",
    name: "Firm Tofu",
    hindiName: "टोफू",
    category: "dairy_proteins",
    diet: "vegan",
    servingUnit: "100g",
    servingWeightGrams: 100,
    calories: 110,
    proteinG: 12.5,
    carbsG: 2.2,
    fatsG: 6.0,
    fiberG: 1.5,
  },
  {
    id: "curd-dahi",
    name: "Curd / Dahi (Plain Home-Set)",
    hindiName: "दही",
    category: "dairy_proteins",
    diet: "veg",
    servingUnit: "1 cup / bowl (150g)",
    servingWeightGrams: 150,
    calories: 98,
    proteinG: 5.2,
    carbsG: 6.5,
    fatsG: 5.0,
    fiberG: 0,
    isPopular: true,
  },
  {
    id: "greek-yogurt",
    name: "Greek Yogurt (Plain Low-Fat)",
    hindiName: "ग्रीक योगर्ट",
    category: "dairy_proteins",
    diet: "veg",
    servingUnit: "1 cup (150g)",
    servingWeightGrams: 150,
    calories: 115,
    proteinG: 15.0,
    carbsG: 6.0,
    fatsG: 2.5,
    fiberG: 0,
    isPopular: true,
  },
  {
    id: "cow-milk-toned",
    name: "Toned Milk (Cow)",
    hindiName: "गाय का दूध (टोन्ड)",
    category: "dairy_proteins",
    diet: "veg",
    servingUnit: "1 glass (250ml)",
    servingWeightGrams: 250,
    calories: 145,
    proteinG: 7.8,
    carbsG: 11.5,
    fatsG: 7.5,
    fiberG: 0,
  },

  // --- Meat, Eggs & Poultry ---
  {
    id: "whole-boiled-egg",
    name: "Whole Boiled Egg (Large)",
    hindiName: "उबला अंडा",
    category: "meat_eggs",
    diet: "non_veg",
    servingUnit: "1 egg (50g)",
    servingWeightGrams: 50,
    calories: 74,
    proteinG: 6.3,
    carbsG: 0.4,
    fatsG: 5.0,
    fiberG: 0,
    isPopular: true,
  },
  {
    id: "egg-white",
    name: "Egg White (Boiled)",
    hindiName: "अंडे की सफेदी",
    category: "meat_eggs",
    diet: "non_veg",
    servingUnit: "1 egg white (33g)",
    servingWeightGrams: 33,
    calories: 17,
    proteinG: 3.6,
    carbsG: 0.2,
    fatsG: 0.1,
    fiberG: 0,
    isPopular: true,
  },
  {
    id: "egg-omelette-2egg",
    name: "2-Egg Omelette (with onions/chili)",
    hindiName: "ऑमलेट (2 अंडे)",
    category: "meat_eggs",
    diet: "non_veg",
    servingUnit: "1 omelette (120g)",
    servingWeightGrams: 120,
    calories: 195,
    proteinG: 13.0,
    carbsG: 2.5,
    fatsG: 14.5,
    fiberG: 0.5,
    isPopular: true,
  },
  {
    id: "chicken-breast-grilled",
    name: "Chicken Breast (Boneless Grilled/Boiled)",
    hindiName: "चिकन ब्रेस्ट",
    category: "meat_eggs",
    diet: "non_veg",
    servingUnit: "100g cooked",
    servingWeightGrams: 100,
    calories: 165,
    proteinG: 31.0,
    carbsG: 0,
    fatsG: 3.6,
    fiberG: 0,
    isPopular: true,
  },
  {
    id: "chicken-curry",
    name: "Home Style Chicken Curry",
    hindiName: "चिकन करी",
    category: "meat_eggs",
    diet: "non_veg",
    servingUnit: "1 bowl (180g / ~100g chicken)",
    servingWeightGrams: 180,
    calories: 260,
    proteinG: 24.5,
    carbsG: 4.5,
    fatsG: 15.0,
    fiberG: 1.0,
    isPopular: true,
  },
  {
    id: "fish-curry",
    name: "Fish Curry (Rohu / Katla / Basa)",
    hindiName: "मछली करी",
    category: "meat_eggs",
    diet: "non_veg",
    servingUnit: "1 bowl (180g)",
    servingWeightGrams: 180,
    calories: 210,
    proteinG: 22.0,
    carbsG: 3.5,
    fatsG: 11.5,
    fiberG: 0.8,
  },

  // --- Supplements & Fitness Staples ---
  {
    id: "whey-protein-isolate",
    name: "Whey Protein (1 Scoop)",
    hindiName: "व्हे प्रोटीन",
    category: "supplements",
    diet: "veg",
    servingUnit: "1 scoop (30g)",
    servingWeightGrams: 30,
    calories: 120,
    proteinG: 24.0,
    carbsG: 2.0,
    fatsG: 1.5,
    fiberG: 0,
    isPopular: true,
  },
  {
    id: "peanut-butter",
    name: "Peanut Butter (Natural Unsweetened)",
    hindiName: "पीनट बटर",
    category: "nuts_seeds",
    diet: "vegan",
    servingUnit: "1 tablespoon (16g)",
    servingWeightGrams: 16,
    calories: 95,
    proteinG: 4.0,
    carbsG: 3.0,
    fatsG: 8.0,
    fiberG: 1.2,
    isPopular: true,
  },
  {
    id: "roasted-chana",
    name: "Roasted Chana / Bhuna Chana",
    hindiName: "भुना चना",
    category: "snacks",
    diet: "vegan",
    servingUnit: "1 handful / 40g",
    servingWeightGrams: 40,
    calories: 150,
    proteinG: 7.5,
    carbsG: 23.0,
    fatsG: 2.5,
    fiberG: 5.5,
    isPopular: true,
  },
  {
    id: "almonds-badam",
    name: "Raw Almonds / Badam",
    hindiName: "बादाम",
    category: "nuts_seeds",
    diet: "vegan",
    servingUnit: "10-12 pieces (15g)",
    servingWeightGrams: 15,
    calories: 88,
    proteinG: 3.2,
    carbsG: 3.0,
    fatsG: 7.5,
    fiberG: 1.8,
  },

  // --- Fruits & Vegetables ---
  {
    id: "banana",
    name: "Banana (Medium)",
    hindiName: "केला",
    category: "fruits_veg",
    diet: "vegan",
    servingUnit: "1 medium banana (110g)",
    servingWeightGrams: 110,
    calories: 98,
    proteinG: 1.2,
    carbsG: 25.0,
    fatsG: 0.3,
    fiberG: 2.6,
    isPopular: true,
  },
  {
    id: "apple",
    name: "Apple (Medium)",
    hindiName: "सेब",
    category: "fruits_veg",
    diet: "vegan",
    servingUnit: "1 medium apple (140g)",
    servingWeightGrams: 140,
    calories: 72,
    proteinG: 0.4,
    carbsG: 19.0,
    fatsG: 0.2,
    fiberG: 3.4,
    isPopular: true,
  },
  {
    id: "mixed-green-salad",
    name: "Mixed Salad (Cucumber, Tomato, Onion)",
    hindiName: "सलाद",
    category: "fruits_veg",
    diet: "vegan",
    servingUnit: "1 plate (150g)",
    servingWeightGrams: 150,
    calories: 32,
    proteinG: 1.2,
    carbsG: 6.5,
    fatsG: 0.3,
    fiberG: 2.2,
    isPopular: true,
  },
];

/**
 * Searches the food database by query and optional dietary category
 */
export function searchIndianFoods(
  query: string,
  dietFilter: FoodDietCategory | "all" = "all",
  categoryFilter: FoodCategory | "all" = "all",
): FoodItem[] {
  const normQuery = query.toLowerCase().trim();

  return INDIAN_FOOD_DATABASE.filter((item) => {
    const matchesDiet =
      dietFilter === "all" ||
      item.diet === dietFilter ||
      (dietFilter === "veg" && (item.diet === "veg" || item.diet === "vegan" || item.diet === "jain")) ||
      (dietFilter === "jain" && item.diet === "jain");

    const matchesCategory =
      categoryFilter === "all" || item.category === categoryFilter;

    if (!normQuery) {
      return matchesDiet && matchesCategory;
    }

    const matchesName =
      item.name.toLowerCase().includes(normQuery) ||
      (item.hindiName && item.hindiName.toLowerCase().includes(normQuery));

    return matchesDiet && matchesCategory && matchesName;
  });
}

/**
 * Calculates scaled macros for a given food item and servings multiplier
 */
export function calculateScaledMacros(
  food: FoodItem,
  servings: number,
): {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
  fiberG: number;
} {
  const s = Math.max(0.1, servings);
  return {
    calories: Math.round(food.calories * s),
    proteinG: Math.round(food.proteinG * s * 10) / 10,
    carbsG: Math.round(food.carbsG * s * 10) / 10,
    fatsG: Math.round(food.fatsG * s * 10) / 10,
    fiberG: Math.round(food.fiberG * s * 10) / 10,
  };
}
