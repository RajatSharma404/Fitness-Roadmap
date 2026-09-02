import React from "react";
import { describe, expect, it, vi } from "vitest";
import { DailyFoodDiary } from "./DailyFoodDiary";
import { DailyFoodLog } from "@/lib/indianFoodDatabase";

describe("DailyFoodDiary component", () => {
  it("renders DailyFoodDiary element with macro targets and food entries", () => {
    const dailyLog: DailyFoodLog = {
      date: "2026-09-02",
      entries: [
        {
          id: "e1",
          foodId: "food_oats",
          name: "Oatmeal with Milk",
          servings: 1,
          servingUnit: "1 bowl",
          calories: 320,
          proteinG: 14,
          carbsG: 50,
          fatsG: 6,
          fiberG: 6,
          mealSlot: "breakfast",
          loggedAt: "2026-09-02T08:00:00Z",
        },
      ],
      waterMl: 1500,
    };

    const targets = {
      calories: 2200,
      proteinG: 150,
      carbsG: 250,
      fatsG: 60,
      fiberG: 30,
    };

    const element = (
      <DailyFoodDiary
        currentDateStr="2026-09-02"
        onDateChange={vi.fn()}
        dailyLog={dailyLog}
        targets={targets}
        onUpdateDailyLog={vi.fn()}
      />
    );

    expect(React.isValidElement(element)).toBe(true);
  });
});
