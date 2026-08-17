import { describe, it, expect } from "vitest";
import {
  INDIAN_FOOD_DATABASE,
  searchIndianFoods,
  calculateScaledMacros,
} from "./indianFoodDatabase";

describe("indianFoodDatabase", () => {
  it("contains rich Indian staple foods with valid macro data", () => {
    expect(INDIAN_FOOD_DATABASE.length).toBeGreaterThan(20);

    const roti = INDIAN_FOOD_DATABASE.find((f) => f.id === "roti-plain");
    expect(roti).toBeDefined();
    expect(roti?.calories).toBeGreaterThan(80);
    expect(roti?.proteinG).toBeGreaterThan(2);

    const paneer = INDIAN_FOOD_DATABASE.find((f) => f.id === "paneer-raw");
    expect(paneer).toBeDefined();
    expect(paneer?.proteinG).toBeGreaterThan(15);
  });

  it("searches and filters foods by name and dietary preferences", () => {
    const paneerResults = searchIndianFoods("paneer", "veg");
    expect(paneerResults.length).toBeGreaterThan(0);
    expect(paneerResults.every((f) => f.diet === "veg" || f.diet === "vegan")).toBe(true);

    const nonVegResults = searchIndianFoods("chicken", "non_veg");
    expect(nonVegResults.length).toBeGreaterThan(0);
    expect(nonVegResults.some((f) => f.id === "chicken-breast-grilled")).toBe(true);
  });

  it("scales macros accurately for fractional or multiple servings", () => {
    const egg = INDIAN_FOOD_DATABASE.find((f) => f.id === "whole-boiled-egg")!;
    // 3 eggs
    const scaled3 = calculateScaledMacros(egg, 3);
    expect(scaled3.calories).toBe(egg.calories * 3);
    expect(scaled3.proteinG).toBe(Math.round(egg.proteinG * 3 * 10) / 10);

    // 0.5 serving of paneer (50g)
    const paneer = INDIAN_FOOD_DATABASE.find((f) => f.id === "paneer-raw")!;
    const scaledHalf = calculateScaledMacros(paneer, 0.5);
    expect(scaledHalf.calories).toBe(Math.round(paneer.calories * 0.5));
  });
});
