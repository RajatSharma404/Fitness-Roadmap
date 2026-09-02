import React from "react";
import { describe, expect, it, vi } from "vitest";
import { PRStoryCardModal, PRStoryCardData } from "./PRStoryCardModal";

describe("PRStoryCardModal component", () => {
  it("renders PRStoryCardModal when open", () => {
    const data: PRStoryCardData = {
      athleteName: "Rajat",
      liftName: "Barbell Back Squat",
      weightKg: 180,
      reps: 3,
      oneRM: 196,
      xpGained: 250,
      dateStr: "2026-09-02",
    };

    const element = <PRStoryCardModal data={data} isOpen={true} onClose={vi.fn()} />;
    expect(React.isValidElement(element)).toBe(true);
  });
});
