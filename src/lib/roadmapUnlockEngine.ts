import { calculateBodyPlan, PlanNode } from "./bodyPlanner";
import { calculateWilksScore } from "./formulas";

export interface LiftRecord {
  name: string;
  weight: number;
  reps: number;
  oneRM?: number;
  date?: string;
}

export interface CheckinRecord {
  date: string;
  weightKg?: number;
  calories?: number;
  proteinGrams?: number;
  sleepHours?: number;
  sorenessLevel?: number;
  stressLevel?: number;
  steps?: number;
}

export interface UnlockEvaluationInput {
  lifts: LiftRecord[];
  checkins: CheckinRecord[];
  currentProgress: Record<string, boolean>;
  userWeightKg: number;
  userGender?: "male" | "female";
  roadmapNodes?: PlanNode[];
}

export interface MilestoneUnlockResult {
  newlyUnlockedNodeIds: string[];
  newlyUnlockedNodes: PlanNode[];
  totalXpAwarded: number;
  updatedProgress: Record<string, boolean>;
  unlockEvents: Array<{
    nodeId: string;
    title: string;
    track: string;
    xp: number;
    reason: string;
  }>;
}

function normalizeLiftName(name: string): string {
  return name.toLowerCase().replace(/[\s\-_]/g, "");
}

function findBest1RM(lifts: LiftRecord[], targetLift: string): number {
  const normTarget = normalizeLiftName(targetLift);
  let best1RM = 0;

  for (const lift of lifts) {
    const normName = normalizeLiftName(lift.name);
    if (
      normName === normTarget ||
      normName.includes(normTarget) ||
      normTarget.includes(normName)
    ) {
      const calculated1RM =
        lift.oneRM ?? (lift.weight > 0 ? lift.weight * (1 + lift.reps / 30) : 0);
      if (calculated1RM > best1RM) {
        best1RM = calculated1RM;
      }
    }
  }

  return best1RM;
}

export function evaluateMilestoneUnlocks(
  input: UnlockEvaluationInput,
): MilestoneUnlockResult {
  const {
    lifts,
    checkins,
    currentProgress,
    userWeightKg = 75,
    userGender = "male",
    roadmapNodes,
  } = input;

  const defaultNodes = roadmapNodes || calculateBodyPlan({
    age: 25,
    sex: userGender,
    heightCm: 175,
    weightKg: userWeightKg,
    goal: "recomposition",
    activity: "moderate",
    workoutDays: 4,
    diet: "mixed",
  }).roadmapNodes;

  const updatedProgress: Record<string, boolean> = { ...currentProgress };
  const newlyUnlockedNodeIds: string[] = [];
  const newlyUnlockedNodes: PlanNode[] = [];
  const unlockEvents: MilestoneUnlockResult["unlockEvents"] = [];
  let totalXpAwarded = 0;

  // Best Lifts
  const bestSquat = findBest1RM(lifts, "Squat");
  const bestBench = findBest1RM(lifts, "Bench");
  const bestDeadlift = findBest1RM(lifts, "Deadlift");
  const bestOHP = findBest1RM(lifts, "Overhead Press");
  const bestPullUp = findBest1RM(lifts, "Pull Up");

  const totalSBD = bestSquat + bestBench + bestDeadlift;
  const currentWilks = calculateWilksScore(totalSBD, userWeightKg, userGender === "female");

  // Checkin adherence
  const recentCheckins = checkins.slice(-7);
  const avgSleepHours =
    recentCheckins.length > 0
      ? recentCheckins.reduce((acc, c) => acc + (c.sleepHours || 7), 0) /
        recentCheckins.length
      : 7;

  for (const node of defaultNodes) {
    if (updatedProgress[node.id]) {
      continue; // Already unlocked/completed
    }

    const prereqsMet =
      node.dependencies.length === 0 ||
      node.dependencies.every((depId) => updatedProgress[depId]);

    if (!prereqsMet) {
      continue; // Cannot unlock before prerequisites are done
    }

    let shouldUnlock = false;
    let reason = "";

    const criteria = (node.unlockCriteria || {}) as {
      type?: string;
      lift?: string;
      value?: number;
      unit?: string;
    };

    switch (node.id) {
      case "assessment":
        if (lifts.length >= 1 || checkins.length >= 1) {
          shouldUnlock = true;
          reason = "Baseline assessment completed with first recorded log.";
        }
        break;

      case "energy_foundation":
        if (checkins.length >= 3) {
          shouldUnlock = true;
          reason = "Energy & Macro foundation verified across 3+ daily check-ins.";
        }
        break;

      case "movement_literacy":
        if (bestSquat > 0 && bestBench > 0 && bestDeadlift > 0) {
          shouldUnlock = true;
          reason = "SBD foundational movement patterns established.";
        }
        break;

      case "strength_t1":
        if (bestSquat >= userWeightKg * 1.0) {
          shouldUnlock = true;
          reason = `Hit 1.0x BW Back Squat milestone (${bestSquat.toFixed(1)}kg @ ${userWeightKg}kg BW).`;
        }
        break;

      case "strength_t2":
        if (bestSquat >= userWeightKg * 1.5 || bestDeadlift >= userWeightKg * 1.75) {
          shouldUnlock = true;
          reason = `Hit 1.5x BW Squat / 1.75x BW Deadlift milestone (${bestSquat.toFixed(1)}kg Squat).`;
        }
        break;

      case "strength_t3":
        if (currentWilks >= 300 || bestDeadlift >= userWeightKg * 2.0) {
          shouldUnlock = true;
          reason = `Achieved 300+ Wilks score (${currentWilks.toFixed(1)} Wilks) across SBD.`;
        }
        break;

      case "hypertrophy_t1":
        if (bestBench >= userWeightKg * 0.8 || lifts.length >= 6) {
          shouldUnlock = true;
          reason = `Hypertrophy foundational volume target achieved (${bestBench.toFixed(1)}kg Bench).`;
        }
        break;

      case "hypertrophy_t2":
        if (bestBench >= userWeightKg * 1.1 || lifts.length >= 12) {
          shouldUnlock = true;
          reason = "Metabolic overload volume threshold satisfied.";
        }
        break;

      case "hypertrophy_t3":
        if (bestBench >= userWeightKg * 1.3 && checkins.length >= 14) {
          shouldUnlock = true;
          reason = "Peak muscular density and symmetry milestone unlocked.";
        }
        break;

      case "calisthenics_t1":
        if (bestPullUp >= 1 || findBest1RM(lifts, "Dips") >= 1 || lifts.some((l) => l.name.toLowerCase().includes("pull"))) {
          shouldUnlock = true;
          reason = "Kinetic bodyweight pull & dip foundation unlocked.";
        }
        break;

      case "calisthenics_t2":
        if (bestPullUp >= userWeightKg * 0.2 || findBest1RM(lifts, "Weighted Pull Up") > 0) {
          shouldUnlock = true;
          reason = "Weighted calisthenics power threshold unlocked.";
        }
        break;

      case "calisthenics_t3":
        if (findBest1RM(lifts, "Muscle Up") > 0 || bestPullUp >= userWeightKg * 0.4) {
          shouldUnlock = true;
          reason = "Advanced calisthenics leverage mastery unlocked.";
        }
        break;

      case "metabolic_t1":
        if ((checkins.length >= 5 && avgSleepHours >= 6.5) || bestOHP >= userWeightKg * 0.5) {
          shouldUnlock = true;
          reason = "Bioenergetic recovery adherence and overhead push stability verified.";
        }
        break;

      case "metabolic_t2":
        if (checkins.length >= 10) {
          shouldUnlock = true;
          reason = "Metabolic adaptation & refeed cycling verified.";
        }
        break;

      case "metabolic_t3":
        if (checkins.length >= 21) {
          shouldUnlock = true;
          reason = "Sustained lean metabolic homeostasis unlocked.";
        }
        break;

      case "apex_mastery":
        if (
          currentWilks >= 350 ||
          (updatedProgress["strength_t3"] && updatedProgress["hypertrophy_t3"])
        ) {
          shouldUnlock = true;
          reason = "👑 Apex Athletic Singularity — All disciplines mastered!";
        }
        break;

      default:
        // Generic criteria match
        if (criteria.type === "lift" && criteria.lift && criteria.value) {
          const lift1RM = findBest1RM(lifts, criteria.lift);
          if (lift1RM >= userWeightKg * criteria.value) {
            shouldUnlock = true;
            reason = `Recorded ${criteria.lift} of ${(userWeightKg * criteria.value).toFixed(1)}kg (${criteria.value}x BW).`;
          }
        }
        break;
    }

    if (shouldUnlock) {
      updatedProgress[node.id] = true;
      newlyUnlockedNodeIds.push(node.id);
      newlyUnlockedNodes.push(node);
      const xp = node.xpReward || 150;
      totalXpAwarded += xp;
      unlockEvents.push({
        nodeId: node.id,
        title: node.title,
        track: node.track,
        xp,
        reason,
      });
    }
  }

  return {
    newlyUnlockedNodeIds,
    newlyUnlockedNodes,
    totalXpAwarded,
    updatedProgress,
    unlockEvents,
  };
}
