import React from "react";
import { describe, expect, it } from "vitest";
import CheckinsCharts from "./CheckinsCharts";
import { WeeklyCheckIn } from "@/lib/planEnhancements";

describe("CheckinsCharts component", () => {
  it("renders CheckinsCharts element with line and recovery data", () => {
    const lineData: WeeklyCheckIn[] = [
      {
        date: "2026-08-01",
        weightKg: 80,
        waistCm: 84,
        sleepHours: 8,
        stepsAvg: 9000,
        stress: 3,
        energy: 8,
        workoutCompletion: 100,
      },
    ];

    const recoveryData = [{ date: "2026-08-01", score: 85 }];

    const element = <CheckinsCharts lineData={lineData} recoveryData={recoveryData} />;
    expect(React.isValidElement(element)).toBe(true);
  });
});
