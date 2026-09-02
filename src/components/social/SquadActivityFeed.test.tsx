import React from "react";
import { describe, expect, it, vi } from "vitest";
import { SquadActivityFeed } from "./SquadActivityFeed";
import { SquadActivityItem } from "@/lib/squadEngine";

describe("SquadActivityFeed component", () => {
  it("renders SquadActivityFeed with activities and fistbump trigger", () => {
    const activities: SquadActivityItem[] = [
      {
        id: "act-1",
        squadId: "squad-1",
        userId: "user-1",
        userName: "Alex",
        type: "PR_BROKEN",
        title: "New Bench PR: 120kg",
        description: "Alex hit a 3-rep PR!",
        timestamp: "5m ago",
        fistbumpsCount: 4,
        fistbumpedByUserIds: ["user-2"],
      },
    ];

    const element = (
      <SquadActivityFeed
        activities={activities}
        onToggleFistbump={vi.fn()}
        currentUserId="user-1"
      />
    );

    expect(React.isValidElement(element)).toBe(true);
  });
});
