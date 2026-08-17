export interface SquadMember {
  userId: string;
  name: string;
  avatar?: string;
  role: "LEADER" | "OFFICER" | "VANGUARD" | "MEMBER";
  weeklyTonnageContributedKg: number;
  workoutsCompletedThisWeek: number;
  bestLiftName: string;
  bestLiftWeight: number;
  joinedAt: string;
}

export interface SquadActivityItem {
  id: string;
  squadId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  type: "WORKOUT_COMPLETED" | "PR_BROKEN" | "NODE_UNLOCKED" | "LEVEL_UP";
  title: string;
  description: string;
  timestamp: string;
  fistbumpsCount: number;
  fistbumpedByUserIds: string[];
}

export interface Squad {
  id: string;
  name: string;
  tag: string; // e.g. [IRON], [APEX]
  description: string;
  icon: string;
  inviteCode: string;
  level: number;
  xp: number;
  weeklyTonnageTargetKg: number;
  currentWeeklyTonnageKg: number;
  members: SquadMember[];
  activities: SquadActivityItem[];
  isCustom?: boolean;
}

export const STARTER_SQUADS: Squad[] = [
  {
    id: "squad-iron-brotherhood",
    name: "Iron Brotherhood",
    tag: "IRON",
    description: "Dedicated to heavy compound barbell lifting, progressive overload, and relentless consistency.",
    icon: "⚔️",
    inviteCode: "IRON01",
    level: 7,
    xp: 14200,
    weeklyTonnageTargetKg: 50000,
    currentWeeklyTonnageKg: 38400,
    members: [
      {
        userId: "user-rajat",
        name: "Rajat S.",
        role: "LEADER",
        weeklyTonnageContributedKg: 12500,
        workoutsCompletedThisWeek: 4,
        bestLiftName: "Barbell Deadlift",
        bestLiftWeight: 180,
        joinedAt: "2026-01-01",
      },
      {
        userId: "user-vikram",
        name: "Vikram R.",
        role: "OFFICER",
        weeklyTonnageContributedKg: 10200,
        workoutsCompletedThisWeek: 4,
        bestLiftName: "Barbell Squat",
        bestLiftWeight: 150,
        joinedAt: "2026-01-10",
      },
      {
        userId: "user-arjun",
        name: "Arjun K.",
        role: "VANGUARD",
        weeklyTonnageContributedKg: 9100,
        workoutsCompletedThisWeek: 3,
        bestLiftName: "Bench Press",
        bestLiftWeight: 120,
        joinedAt: "2026-01-15",
      },
      {
        userId: "user-sneha",
        name: "Sneha M.",
        role: "MEMBER",
        weeklyTonnageContributedKg: 6600,
        workoutsCompletedThisWeek: 3,
        bestLiftName: "Barbell Squat",
        bestLiftWeight: 95,
        joinedAt: "2026-02-01",
      },
    ],
    activities: [
      {
        id: "act-1",
        squadId: "squad-iron-brotherhood",
        userId: "user-rajat",
        userName: "Rajat S.",
        type: "PR_BROKEN",
        title: "New Deadlift PR: 180 kg! 🔥",
        description: "Crushed a 180 kg top single at RPE 8.5. Leveling up to Advanced powerlifter.",
        timestamp: "2 hours ago",
        fistbumpsCount: 8,
        fistbumpedByUserIds: ["user-vikram", "user-arjun"],
      },
      {
        id: "act-2",
        squadId: "squad-iron-brotherhood",
        userId: "user-vikram",
        userName: "Vikram R.",
        type: "WORKOUT_COMPLETED",
        title: "Completed Upper Power (Session #18)",
        description: "Moved 6,400 kg total volume in 52 mins. High barbell row focus.",
        timestamp: "5 hours ago",
        fistbumpsCount: 4,
        fistbumpedByUserIds: ["user-rajat"],
      },
      {
        id: "act-3",
        squadId: "squad-iron-brotherhood",
        userId: "user-sneha",
        userName: "Sneha M.",
        type: "NODE_UNLOCKED",
        title: "Unlocked '1x Bodyweight Squat' Node",
        description: "Claimed 350 XP on the Foundation Skill Tree.",
        timestamp: "1 day ago",
        fistbumpsCount: 6,
        fistbumpedByUserIds: ["user-rajat", "user-arjun"],
      },
    ],
  },
  {
    id: "squad-apex-guild",
    name: "Apex Powerlifting Guild",
    tag: "APEX",
    description: "Competitive strength athletes aiming for IPF national qualifying totals and 400+ DOTS.",
    icon: "👑",
    inviteCode: "APEX99",
    level: 12,
    xp: 28500,
    weeklyTonnageTargetKg: 75000,
    currentWeeklyTonnageKg: 61200,
    members: [
      {
        userId: "user-karan",
        name: "Karan B.",
        role: "LEADER",
        weeklyTonnageContributedKg: 18500,
        workoutsCompletedThisWeek: 5,
        bestLiftName: "Barbell Deadlift",
        bestLiftWeight: 240,
        joinedAt: "2025-11-01",
      },
      {
        userId: "user-priya",
        name: "Priya D.",
        role: "OFFICER",
        weeklyTonnageContributedKg: 14200,
        workoutsCompletedThisWeek: 4,
        bestLiftName: "Barbell Squat",
        bestLiftWeight: 140,
        joinedAt: "2025-11-15",
      },
    ],
    activities: [
      {
        id: "act-apex-1",
        squadId: "squad-apex-guild",
        userId: "user-karan",
        userName: "Karan B.",
        type: "PR_BROKEN",
        title: "Hit 240 kg Deadlift Single (420 DOTS)",
        description: "Official club record milestone reached.",
        timestamp: "3 hours ago",
        fistbumpsCount: 12,
        fistbumpedByUserIds: [],
      },
    ],
  },
  {
    id: "squad-calisthenics-titans",
    name: "Calisthenics Titans",
    tag: "TITAN",
    description: "Mastering bodyweight mechanics: Muscle-ups, Handstand Pushups, Front Levers & Weighted Dips.",
    icon: "⚡",
    inviteCode: "TITAN7",
    level: 5,
    xp: 9800,
    weeklyTonnageTargetKg: 40000,
    currentWeeklyTonnageKg: 31500,
    members: [
      {
        userId: "user-rohan",
        name: "Rohan V.",
        role: "LEADER",
        weeklyTonnageContributedKg: 9500,
        workoutsCompletedThisWeek: 4,
        bestLiftName: "Weighted Pull-Up (+40kg)",
        bestLiftWeight: 115,
        joinedAt: "2026-01-20",
      },
    ],
    activities: [
      {
        id: "act-titan-1",
        squadId: "squad-calisthenics-titans",
        userId: "user-rohan",
        userName: "Rohan V.",
        type: "NODE_UNLOCKED",
        title: "Unlocked 'Strict Muscle-Up Master'",
        description: "5 unbroken strict bar muscle-ups recorded.",
        timestamp: "8 hours ago",
        fistbumpsCount: 9,
        fistbumpedByUserIds: [],
      },
    ],
  },
];

/**
 * Reads squads from local storage with fallback to starter squads
 */
export function getSavedSquads(): Squad[] {
  if (typeof window === "undefined") return STARTER_SQUADS;
  try {
    const saved = localStorage.getItem("fitflow_squads");
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  return STARTER_SQUADS;
}

/**
 * Saves squads into local storage
 */
export function saveSquadsToStorage(squads: Squad[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("fitflow_squads", JSON.stringify(squads));
}

/**
 * Creates a new custom gym squad
 */
export function createCustomSquad(
  name: string,
  tag: string,
  description: string,
  creatorName: string = "Athlete",
): Squad {
  const cleanTag = tag.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 5) || "SQUAD";
  const inviteCode = `${cleanTag}${Math.floor(10 + Math.random() * 90)}`;

  const newSquad: Squad = {
    id: `squad-custom-${Date.now()}`,
    name,
    tag: cleanTag,
    description: description || "A private clan dedicated to progressive overload and shared milestones.",
    icon: "🛡️",
    inviteCode,
    level: 1,
    xp: 0,
    weeklyTonnageTargetKg: 50000,
    currentWeeklyTonnageKg: 0,
    isCustom: true,
    members: [
      {
        userId: `user-${Date.now()}`,
        name: creatorName,
        role: "LEADER",
        weeklyTonnageContributedKg: 0,
        workoutsCompletedThisWeek: 0,
        bestLiftName: "Compound Lifts",
        bestLiftWeight: 0,
        joinedAt: new Date().toISOString().slice(0, 10),
      },
    ],
    activities: [
      {
        id: `act-${Date.now()}`,
        squadId: `squad-custom-${Date.now()}`,
        userId: "system",
        userName: creatorName,
        type: "LEVEL_UP",
        title: `Squad [${cleanTag}] ${name} Founded! 🎉`,
        description: "Welcome to the squad! Start logging workouts to pool weekly tonnage.",
        timestamp: "Just now",
        fistbumpsCount: 1,
        fistbumpedByUserIds: [],
      },
    ],
  };

  const currentSquads = getSavedSquads();
  const updated = [newSquad, ...currentSquads];
  saveSquadsToStorage(updated);
  return newSquad;
}

/**
 * Adds an activity item and increments squad weekly tonnage
 */
export function recordSquadWorkoutActivity(
  squadId: string,
  userName: string,
  workoutTitle: string,
  tonnageKg: number,
): Squad[] {
  const squads = getSavedSquads();
  const squadIndex = squads.findIndex((s) => s.id === squadId);
  if (squadIndex === -1) return squads;

  const targetSquad = squads[squadIndex];
  const newActivity: SquadActivityItem = {
    id: `act-work-${Date.now()}`,
    squadId,
    userId: "current-user",
    userName,
    type: "WORKOUT_COMPLETED",
    title: `Completed ${workoutTitle} (+${Math.round(tonnageKg)} kg)`,
    description: `Added ${Math.round(tonnageKg).toLocaleString()} kg to the squad's weekly tonnage milestone.`,
    timestamp: "Just now",
    fistbumpsCount: 0,
    fistbumpedByUserIds: [],
  };

  const updatedSquad: Squad = {
    ...targetSquad,
    currentWeeklyTonnageKg: targetSquad.currentWeeklyTonnageKg + Math.round(tonnageKg),
    activities: [newActivity, ...targetSquad.activities],
  };

  const updatedSquads = [...squads];
  updatedSquads[squadIndex] = updatedSquad;
  saveSquadsToStorage(updatedSquads);
  return updatedSquads;
}

/**
 * Toggles a fistbump 👊 on an activity item
 */
export function toggleActivityFistbump(
  squadId: string,
  activityId: string,
  currentUserId: string = "current-user",
): Squad[] {
  const squads = getSavedSquads();
  const squad = squads.find((s) => s.id === squadId);
  if (!squad) return squads;

  const activity = squad.activities.find((a) => a.id === activityId);
  if (!activity) return squads;

  const hasFistbumped = activity.fistbumpedByUserIds.includes(currentUserId);
  if (hasFistbumped) {
    activity.fistbumpedByUserIds = activity.fistbumpedByUserIds.filter((id) => id !== currentUserId);
    activity.fistbumpsCount = Math.max(0, activity.fistbumpsCount - 1);
  } else {
    activity.fistbumpedByUserIds.push(currentUserId);
    activity.fistbumpsCount += 1;
  }

  saveSquadsToStorage(squads);
  return [...squads];
}
