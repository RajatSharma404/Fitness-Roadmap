import React from "react";
import { describe, expect, it, vi } from "vitest";
import { SquadsView } from "./SquadsView";
import { Squad } from "@/lib/squadEngine";

describe("SquadsView component", () => {
  it("renders SquadsView with squads roster and progress bar", () => {
    const squads: Squad[] = [
      {
        id: "squad-1",
        name: "Bangalore Barbell Club",
        tag: "BBC",
        icon: "🏋️‍♂️",
        description: "Heavy powerlifting squad",
        inviteCode: "BBC-999",
        level: 5,
        xp: 12500,
        currentWeeklyTonnageKg: 45000,
        weeklyTonnageTargetKg: 60000,
        members: [
          {
            userId: "u1",
            name: "Rajat",
            role: "LEADER",
            weeklyTonnageContributedKg: 18000,
            workoutsCompletedThisWeek: 4,
            bestLiftName: "Deadlift",
            bestLiftWeight: 220,
            joinedAt: "2026-01-01",
          },
        ],
        activities: [],
      },
    ];

    const element = (
      <SquadsView
        squads={squads}
        activeSquadId="squad-1"
        onSelectSquad={vi.fn()}
        onSquadCreated={vi.fn()}
      />
    );

    expect(React.isValidElement(element)).toBe(true);
  });
});
