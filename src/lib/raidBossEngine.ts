export interface RaidBoss {
  id: string;
  name: string;
  title: string;
  lore: string;
  avatarIcon: string;
  maxHpKg: number;
  currentHpKg: number;
  expiresInDays: number;
  weakness: string; // e.g. "Heavy Compound Barbell Tonnage"
  rewardTitle: string;
  rewardXp: number;
}

export interface UserRaidContribution {
  damageDealtKg: number;
  percentageOfBossHp: number;
  roleArchetype: "DAMAGE_DEALER" | "VANGUARD_TANK" | "BERSERKER" | "RECRUIT";
  rankInRaid: number;
}

export const ACTIVE_WEEKLY_RAID_BOSS: RaidBoss = {
  id: "boss-iron-colossus",
  name: "Gorgon the Iron Colossus",
  title: "Ancient Titan of Mechanical Tension",
  lore: "Forged in the depths of the iron forge. Only the combined progressive overload and tonnage of the entire community can shatter his impenetrable armor.",
  avatarIcon: "👹",
  maxHpKg: 500000,
  currentHpKg: 168400, // 331,600 kg damage already dealt by community
  expiresInDays: 3,
  weakness: "Barbell Squats & Deadlifts (+1.5x damage bonus)",
  rewardTitle: "Colossus Slayer",
  rewardXp: 1500,
};

/**
 * Computes the user's personal raid damage and role archetype based on logged workout sessions and PRs
 */
export function calculateUserRaidContribution(
  userTonnageKg: number,
  sessionCount: number,
  topLiftWeight: number = 0,
): UserRaidContribution {
  const damageDealtKg = Math.max(0, Math.round(userTonnageKg));
  const percentageOfBossHp =
    Math.round((damageDealtKg / ACTIVE_WEEKLY_RAID_BOSS.maxHpKg) * 1000) / 10;

  let roleArchetype: UserRaidContribution["roleArchetype"] = "RECRUIT";

  if (topLiftWeight >= 140) {
    roleArchetype = "VANGUARD_TANK";
  } else if (damageDealtKg >= 20000) {
    roleArchetype = "DAMAGE_DEALER";
  } else if (sessionCount >= 4) {
    roleArchetype = "BERSERKER";
  } else if (damageDealtKg >= 5000) {
    roleArchetype = "DAMAGE_DEALER";
  }

  // Estimated rank among participating lifters
  let rankInRaid = 14;
  if (damageDealtKg >= 30000) rankInRaid = 1;
  else if (damageDealtKg >= 20000) rankInRaid = 3;
  else if (damageDealtKg >= 10000) rankInRaid = 7;

  return {
    damageDealtKg,
    percentageOfBossHp,
    roleArchetype,
    rankInRaid,
  };
}
