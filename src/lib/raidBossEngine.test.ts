import { describe, it, expect } from "vitest";
import {
  ACTIVE_WEEKLY_RAID_BOSS,
  calculateUserRaidContribution,
} from "./raidBossEngine";

describe("raidBossEngine", () => {
  it("initializes active weekly raid boss", () => {
    expect(ACTIVE_WEEKLY_RAID_BOSS.maxHpKg).toBe(500000);
    expect(ACTIVE_WEEKLY_RAID_BOSS.currentHpKg).toBeLessThan(ACTIVE_WEEKLY_RAID_BOSS.maxHpKg);
    expect(ACTIVE_WEEKLY_RAID_BOSS.rewardTitle).toBe("Colossus Slayer");
  });

  it("calculates personal raid contribution and assigns vanguard archetype for heavy lifters", () => {
    const vanguard = calculateUserRaidContribution(18000, 3, 160);
    expect(vanguard.damageDealtKg).toBe(18000);
    expect(vanguard.roleArchetype).toBe("VANGUARD_TANK");
    expect(vanguard.percentageOfBossHp).toBeGreaterThan(3);
  });

  it("assigns damage dealer archetype for high volume lifters", () => {
    const dd = calculateUserRaidContribution(24000, 4, 100);
    expect(dd.roleArchetype).toBe("DAMAGE_DEALER");
    expect(dd.rankInRaid).toBeLessThanOrEqual(5);
  });
});
