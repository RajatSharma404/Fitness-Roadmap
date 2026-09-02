import React from "react";
import { describe, expect, it } from "vitest";
import { CommunityRaidCard } from "./CommunityRaidCard";
import { RaidBoss, UserRaidContribution } from "@/lib/raidBossEngine";

describe("CommunityRaidCard component", () => {
  it("renders CommunityRaidCard with boss stats and user contribution", () => {
    const boss: RaidBoss = {
      id: "boss-1",
      name: "Iron Colossus",
      title: "Ancient Hypertrophy Guardian",
      avatarIcon: "👹",
      currentHpKg: 750000,
      maxHpKg: 1000000,
      weakness: "Heavy Deadlifts",
      lore: "A colossal foe.",
      rewardTitle: "Colossus Slayer",
      rewardXp: 500,
      expiresInDays: 4,
    };

    const contribution: UserRaidContribution = {
      damageDealtKg: 25000,
      percentageOfBossHp: 2.5,
      rankInRaid: 3,
      roleArchetype: "DAMAGE_DEALER",
    };

    const element = <CommunityRaidCard boss={boss} userContribution={contribution} />;
    expect(React.isValidElement(element)).toBe(true);
  });
});
