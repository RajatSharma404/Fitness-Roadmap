import { describe, it, expect } from "vitest";
import {
  STARTER_SQUADS,
  createCustomSquad,
  toggleActivityFistbump,
} from "./squadEngine";

describe("squadEngine", () => {
  it("initializes with starter squads and members", () => {
    expect(STARTER_SQUADS.length).toBeGreaterThanOrEqual(3);
    const ironSquad = STARTER_SQUADS.find((s) => s.tag === "IRON");
    expect(ironSquad).toBeDefined();
    expect(ironSquad?.members.length).toBeGreaterThan(2);
    expect(ironSquad?.weeklyTonnageTargetKg).toBe(50000);
  });

  it("creates a custom squad with unique tag and invite code", () => {
    const squad = createCustomSquad("Bangalore Power", "BLR", "South Indian powerlifters", "Rajat");
    expect(squad.name).toBe("Bangalore Power");
    expect(squad.tag).toBe("BLR");
    expect(squad.inviteCode.startsWith("BLR")).toBe(true);
    expect(squad.members[0].name).toBe("Rajat");
    expect(squad.members[0].role).toBe("LEADER");
  });

  it("toggles fistbumps on activity items", () => {
    const starter = STARTER_SQUADS[0];
    const activity = starter.activities[0];
    const initialCount = activity.fistbumpsCount;

    // Toggle on
    toggleActivityFistbump(starter.id, activity.id, "tester-user");
    expect(activity.fistbumpsCount).toBe(initialCount + 1);

    // Toggle off
    toggleActivityFistbump(starter.id, activity.id, "tester-user");
    expect(activity.fistbumpsCount).toBe(initialCount);
  });
});
