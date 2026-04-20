import {
  DietType,
  GoalType,
  GymWorkoutDay,
  GymWorkoutPhase,
  MacroTargets,
  MealOption,
  PlanNode,
  PlannerInput,
} from "@/lib/bodyPlanner";

export type ExperienceLevel = "beginner" | "intermediate" | "advanced";
export type EquipmentType = "gym" | "home";

export interface WeeklyCheckIn {
  date: string;
  weightKg: number;
  waistCm: number;
  sleepHours: number;
  stepsAvg: number;
  stress: number;
  energy: number;
  workoutCompletion: number;
}

export interface PlanAdjustment {
  calorieDelta: number;
  stepsDelta: number;
  cardioMinutesDelta: number;
  note: string;
}

export interface ExerciseDetail {
  name: string;
  bodyPart: string;
  modality: "bodyweight" | "machine";
  recommendedReps: string;
  howTo: string[];
  commonMistakes: string[];
  targetMuscles: string[];
  alternatives: string[];
  demoTip: string;
  imageUrl: string;
  imageAlt: string;
}

export interface BodyPartExerciseCatalog {
  bodyPart: string;
  bodyweight: string[];
  machine: string[];
}

export interface MealSlot {
  slot: "Breakfast" | "Lunch" | "Dinner" | "Snack";
  mealName: string;
  calories: number;
  proteinG: number;
}

export interface DailyMealTemplate {
  name: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
  meals: MealSlot[];
}

export interface GroceryItem {
  item: string;
  qty: string;
  category: "protein" | "carb" | "fat" | "produce" | "other";
}

export interface MealSwap {
  from: string;
  to: string;
  kcalDelta: number;
  proteinDelta: number;
}

const bodyPartImageMap: Record<string, string> = {
  Chest: "/exercise-guides/chest.svg",
  Back: "/exercise-guides/back.svg",
  Shoulders: "/exercise-guides/shoulders.svg",
  Biceps: "/exercise-guides/arms.svg",
  Triceps: "/exercise-guides/arms.svg",
  Forearms: "/exercise-guides/arms.svg",
  Legs: "/exercise-guides/legs.svg",
  Quads: "/exercise-guides/legs.svg",
  Hamstrings: "/exercise-guides/legs.svg",
  Glutes: "/exercise-guides/glutes.svg",
  Calves: "/exercise-guides/legs.svg",
  Core: "/exercise-guides/core.svg",
  Abs: "/exercise-guides/core.svg",
};

const bodyPartExerciseCatalog: Record<
  string,
  { bodyweight: string[]; machine: string[] }
> = {
  Chest: {
    bodyweight: [
      "Push-up",
      "Incline push-up",
      "Decline push-up",
      "Wide push-up",
      "Diamond push-up",
      "Archer push-up",
      "Pseudo planche push-up",
      "Chest dips",
      "Plyometric push-up",
      "Deficit push-up",
    ],
    machine: [
      "Machine chest press",
      "Incline machine press",
      "Smith machine bench press",
      "Cable chest fly",
      "Pec deck fly",
      "Barbell bench press",
      "Incline barbell press",
      "Flat dumbbell press",
      "Incline dumbbell press",
      "Cable crossover",
      "Machine chest fly",
      "Paused bench press",
    ],
  },
  Back: {
    bodyweight: [
      "Inverted row",
      "Pull-up",
      "Chin-up",
      "Neutral-grip pull-up",
      "Commando pull-up",
      "Towel row",
      "Scapular pull-up",
      "Australian row",
      "Superman hold",
      "Prone Y-T-I raise",
    ],
    machine: [
      "Lat pulldown",
      "Wide-grip lat pulldown",
      "Weighted pulldown",
      "Seated cable row",
      "Seated close-grip row",
      "Chest-supported row",
      "Chest-supported T-bar row",
      "T-bar row",
      "Pendlay row",
      "One-arm dumbbell row",
      "Straight-arm pulldown",
      "Single-arm cable row",
      "Assisted pull-up",
      "Weighted pull-up",
    ],
  },
  Shoulders: {
    bodyweight: [
      "Pike push-up",
      "Handstand hold",
      "Handstand push-up",
      "Wall walk",
      "Plank shoulder tap",
      "Bear crawl",
      "Dive bomber push-up",
    ],
    machine: [
      "Seated shoulder press",
      "Overhead press",
      "Standing OHP",
      "Lateral raise",
      "Front raise",
      "Rear delt fly",
      "Rear delt cable fly",
      "Cable lateral raise",
      "Face pull",
      "Lateral raise mechanical drops",
    ],
  },
  Biceps: {
    bodyweight: [
      "Chin-up",
      "Bodyweight curl (rings/TRX)",
      "Towel chin-up",
      "Isometric chin hold",
    ],
    machine: [
      "Dumbbell biceps curl",
      "Hammer curl",
      "EZ-bar curl",
      "Incline dumbbell curl",
      "Incline dumbbell curls",
      "Preacher curl",
      "Bayesian cable curl",
      "Cable hammer curl",
    ],
  },
  Triceps: {
    bodyweight: [
      "Bench dips",
      "Diamond push-up",
      "Close-grip push-up",
      "Bodyweight triceps extension",
    ],
    machine: [
      "Cable triceps pushdown",
      "Rope triceps pressdown",
      "Rope pushdown",
      "Overhead triceps extension",
      "Overhead dumbbell triceps extension",
      "Overhead cable triceps extension",
      "Overhead cable extension",
      "Skull crushers",
      "Close-grip bench press",
    ],
  },
  Legs: {
    bodyweight: [
      "Bodyweight squat",
      "Split squat",
      "Reverse lunge",
      "Walking lunge",
      "Walking lunges",
      "Step-up",
      "Cossack squat",
      "Wall sit",
      "Jump squat",
      "Pistol squat",
    ],
    machine: [
      "Goblet squat",
      "Back squat",
      "Front squat",
      "Hack squat",
      "Leg press",
      "Leg extension",
      "Bulgarian split squat",
      "Walking lunge",
      "Calf raise",
      "Stiff-leg deadlift",
      "Romanian deadlift",
    ],
  },
  Hamstrings: {
    bodyweight: [
      "Single-leg hip hinge",
      "Nordic hamstring curl",
      "Glute bridge walkout",
      "Sliding leg curl",
    ],
    machine: [
      "Romanian deadlift",
      "Lying leg curl",
      "Seated leg curl",
      "Hamstring curl",
      "Stiff-leg deadlift",
    ],
  },
  Glutes: {
    bodyweight: [
      "Glute bridge",
      "Single-leg glute bridge",
      "Frog pump",
      "Donkey kick",
      "Fire hydrant",
      "Hip thrust",
    ],
    machine: [
      "Hip thrust",
      "Barbell hip thrust",
      "Cable glute kickback",
      "Cable pull-through",
      "Glute-focused back extension",
      "45-degree back extension",
    ],
  },
  Core: {
    bodyweight: [
      "Plank",
      "Plank variations",
      "Dead bug",
      "Hollow hold",
      "Side plank",
      "Mountain climber",
      "Bird dog",
      "V-up",
      "Hanging knee raise",
      "Hanging leg raise",
      "Ab wheel rollout",
    ],
    machine: [
      "Cable crunch",
      "Cable woodchopper",
      "Decline sit-up",
      "Machine crunch",
    ],
  },
};

function findExerciseInCatalog(
  name: string,
): { bodyPart: string; modality: "bodyweight" | "machine" } | null {
  for (const [bodyPart, groups] of Object.entries(bodyPartExerciseCatalog)) {
    if (groups.bodyweight.includes(name)) {
      return { bodyPart, modality: "bodyweight" };
    }
    if (groups.machine.includes(name)) {
      return { bodyPart, modality: "machine" };
    }
  }

  return null;
}

function defaultRepRangeForBodyPart(bodyPart: string): string {
  if (["Legs", "Quads", "Hamstrings", "Glutes"].includes(bodyPart)) {
    return "3-5 sets x 6-12 reps";
  }
  if (["Core", "Abs"].includes(bodyPart)) {
    return "3-4 sets x 10-20 reps";
  }
  return "3-4 sets x 8-15 reps";
}

function buildExerciseImageDataUrl(
  name: string,
  bodyPart: string,
  modality: "bodyweight" | "machine",
): string {
  const accent = modality === "bodyweight" ? "#4ec9b0" : "#9cdcfe";
  const title = `${name}`.slice(0, 40);
  const subtitle = `${bodyPart} • ${modality}`;

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="720" height="420" viewBox="0 0 720 420" role="img" aria-label="${title} form example">
  <rect width="720" height="420" fill="#101418"/>
  <rect x="24" y="24" width="672" height="372" rx="20" fill="#1a222b" stroke="#2b3a4a"/>
  <circle cx="360" cy="125" r="34" fill="${accent}"/>
  <line x1="360" y1="159" x2="360" y2="276" stroke="#d4d4d4" stroke-width="10"/>
  <line x1="304" y1="199" x2="416" y2="199" stroke="#d4d4d4" stroke-width="10"/>
  <line x1="360" y1="276" x2="315" y2="338" stroke="#d4d4d4" stroke-width="10"/>
  <line x1="360" y1="276" x2="405" y2="338" stroke="#d4d4d4" stroke-width="10"/>
  <text x="360" y="72" text-anchor="middle" fill="#9cdcfe" font-size="28" font-family="Segoe UI, Arial, sans-serif">${title}</text>
  <text x="360" y="356" text-anchor="middle" fill="#dcdcaa" font-size="20" font-family="Segoe UI, Arial, sans-serif">${subtitle}</text>
  <text x="360" y="386" text-anchor="middle" fill="#9aa1a8" font-size="18" font-family="Segoe UI, Arial, sans-serif">Control tempo • Full range • Stable core</text>
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function buildGenericExerciseDetail(
  name: string,
  bodyPart: string,
  modality: "bodyweight" | "machine",
  alternatives: string[],
): ExerciseDetail {
  const imageUrl =
    bodyPartImageMap[bodyPart] ?? "/exercise-guides/full-body.svg";

  return {
    name,
    bodyPart,
    modality,
    recommendedReps: defaultRepRangeForBodyPart(bodyPart),
    howTo: [
      "Set up with stable posture and brace your core before the first rep.",
      "Move through a full, controlled range of motion without rushing.",
      "Keep the target muscle under tension and avoid momentum.",
      "Exhale on effort, inhale on return, and stop 1-2 reps before failure.",
    ],
    commonMistakes: [
      "Cutting range of motion short.",
      "Using momentum instead of controlled reps.",
      "Losing bracing and joint alignment under fatigue.",
    ],
    targetMuscles: [bodyPart],
    alternatives,
    demoTip:
      "Record one working set from the side. Keep tempo smooth and repeatable rep-to-rep.",
    imageUrl,
    imageAlt: `${name} ${bodyPart} form example`,
  };
}

const exerciseLibrary: Record<string, Omit<ExerciseDetail, "name">> = {
  "Flat dumbbell press": {
    bodyPart: "Chest",
    modality: "machine",
    recommendedReps: "3-4 sets x 8-12 reps",
    howTo: [
      "Set bench to flat and keep feet planted.",
      "Lower dumbbells to chest line with elbows 45 degrees.",
      "Press up while keeping shoulders packed.",
    ],
    commonMistakes: [
      "Flaring elbows too wide.",
      "Bouncing dumbbells at the bottom.",
      "Lifting hips off bench.",
    ],
    targetMuscles: ["Chest", "Front delts", "Triceps"],
    alternatives: ["Push-up", "Machine chest press"],
    demoTip: "Use a 2-second lowering phase for better chest activation.",
    imageUrl: "/exercise-guides/chest.svg",
    imageAlt: "Flat dumbbell press form example",
  },
  "Lat pulldown": {
    bodyPart: "Back",
    modality: "machine",
    recommendedReps: "3-4 sets x 8-12 reps",
    howTo: [
      "Grip bar slightly wider than shoulders.",
      "Lean back slightly and pull elbows to ribs.",
      "Control the bar up without shrugging.",
    ],
    commonMistakes: [
      "Pulling behind the neck.",
      "Using momentum and torso swing.",
      "Stopping short of full range.",
    ],
    targetMuscles: ["Lats", "Mid-back", "Biceps"],
    alternatives: ["Assisted pull-up", "Band pulldown"],
    demoTip: "Think chest up and drive elbows down, not hands down.",
    imageUrl: "/exercise-guides/back.svg",
    imageAlt: "Lat pulldown form example",
  },
  "Goblet squat": {
    bodyPart: "Legs",
    modality: "machine",
    recommendedReps: "3-4 sets x 8-15 reps",
    howTo: [
      "Hold dumbbell at chest and brace core.",
      "Sit between hips while keeping heels grounded.",
      "Stand up by driving through mid-foot.",
    ],
    commonMistakes: [
      "Knees collapsing inward.",
      "Rounding lower back.",
      "Heels lifting off floor.",
    ],
    targetMuscles: ["Quads", "Glutes", "Core"],
    alternatives: ["Bodyweight squat", "Leg press"],
    demoTip: "Pause for one second at the bottom to improve control.",
    imageUrl: "/exercise-guides/legs.svg",
    imageAlt: "Goblet squat form example",
  },
};

function fallbackDetail(name: string): ExerciseDetail {
  const found = findExerciseInCatalog(name);
  if (found) {
    const pool = bodyPartExerciseCatalog[found.bodyPart][found.modality];
    const alternatives = pool.filter((item) => item !== name).slice(0, 3);
    return buildGenericExerciseDetail(
      name,
      found.bodyPart,
      found.modality,
      alternatives,
    );
  }

  return {
    name,
    bodyPart: "Full Body",
    modality: "machine",
    recommendedReps: "3-4 sets x 8-12 reps",
    howTo: [
      "Set up with a stable posture and brace core.",
      "Move through full controlled range of motion.",
      "Keep tempo smooth and stop 1-2 reps before failure.",
    ],
    commonMistakes: [
      "Using too much momentum.",
      "Cutting range of motion.",
      "Ignoring breathing and bracing.",
    ],
    targetMuscles: ["Primary target", "Secondary stabilizers"],
    alternatives: ["Machine variation", "Bodyweight variation"],
    demoTip: "Record one set from side angle to check form weekly.",
    imageUrl: "/exercise-guides/full-body.svg",
    imageAlt: `${name} form example`,
  };
}

export function getExerciseDetail(name: string): ExerciseDetail {
  const known = exerciseLibrary[name];
  const detail = known ? { name, ...known } : fallbackDetail(name);

  return {
    ...detail,
    imageUrl: buildExerciseImageDataUrl(
      detail.name,
      detail.bodyPart,
      detail.modality,
    ),
    imageAlt: `${detail.name} ${detail.bodyPart} ${detail.modality} form example`,
  };
}

export function getBodyPartExerciseCatalog(): BodyPartExerciseCatalog[] {
  return Object.entries(bodyPartExerciseCatalog).map(([bodyPart, groups]) => ({
    bodyPart,
    bodyweight: [...new Set(groups.bodyweight)].sort((a, b) =>
      a.localeCompare(b),
    ),
    machine: [...new Set(groups.machine)].sort((a, b) => a.localeCompare(b)),
  }));
}

function convertExerciseForEquipment(
  name: string,
  equipment: EquipmentType,
): string {
  if (equipment === "gym") return name;

  const homeMap: Record<string, string> = {
    "Lat pulldown": "Resistance-band lat pulldown",
    "Seated cable row": "Resistance-band seated row",
    "Machine chest press": "Deficit push-up",
    "Cable triceps pushdown": "Band triceps pushdown",
    "Leg press": "Heel-elevated goblet squat",
    "Lying leg curl": "Swiss-ball hamstring curl",
    "Face pull": "Band face pull",
    "Cable crunch": "Dead bug crunch",
    "Weighted pull-up": "Band-assisted pull-up",
    "T-bar row": "Two-dumbbell bent-over row",
    "Hack squat": "Tempo split squat",
    "Rope pushdown": "Band pushdown",
  };

  return homeMap[name] ?? name;
}

function byExperienceOrder(
  level: ExperienceLevel,
): Array<"Beginner" | "Intermediate" | "Advanced"> {
  if (level === "advanced") return ["Advanced", "Intermediate", "Beginner"];
  if (level === "intermediate") return ["Intermediate", "Beginner", "Advanced"];
  return ["Beginner", "Intermediate", "Advanced"];
}

export function getAdaptiveGymProgression(
  basePhases: GymWorkoutPhase[],
  experience: ExperienceLevel,
  workoutDays: number,
  equipment: EquipmentType,
): GymWorkoutPhase[] {
  const ordered = byExperienceOrder(experience)
    .map((level) => basePhases.find((phase) => phase.level === level))
    .filter((phase): phase is GymWorkoutPhase => Boolean(phase));

  const cappedDays = Math.max(3, Math.min(6, workoutDays));

  return ordered.map((phase, phaseIndex) => {
    const dayCount = Math.max(
      3,
      Math.min(cappedDays + (phaseIndex === 0 ? 0 : 1), 6),
    );
    const days = phase.days.slice(0, dayCount).map(
      (day): GymWorkoutDay => ({
        ...day,
        exercises: day.exercises.map((exercise) =>
          convertExerciseForEquipment(exercise, equipment),
        ),
      }),
    );

    return {
      ...phase,
      weeklySplit: `${dayCount} training days + ${7 - dayCount} recovery days (${equipment})`,
      days,
    };
  });
}

export function computeReadinessScore(checkin: WeeklyCheckIn): number {
  const sleepScore = Math.max(0, Math.min(100, (checkin.sleepHours / 9) * 100));
  const stepsScore = Math.max(
    0,
    Math.min(100, (checkin.stepsAvg / 10000) * 100),
  );
  const stressScore = Math.max(0, Math.min(100, 100 - checkin.stress * 10));
  const energyScore = Math.max(0, Math.min(100, checkin.energy * 10));
  const completionScore = Math.max(0, Math.min(100, checkin.workoutCompletion));

  const weighted =
    sleepScore * 0.2 +
    stepsScore * 0.2 +
    stressScore * 0.15 +
    energyScore * 0.2 +
    completionScore * 0.25;

  return Math.round(weighted);
}

export function getProgressBasedAdjustment(
  input: PlannerInput,
  checkins: WeeklyCheckIn[],
): PlanAdjustment {
  if (checkins.length < 2) {
    return {
      calorieDelta: 0,
      stepsDelta: 0,
      cardioMinutesDelta: 0,
      note: "Need at least two check-ins before auto-adjustments activate.",
    };
  }

  const latest = checkins[checkins.length - 1];
  const previous = checkins[checkins.length - 2];
  const weightDiff = latest.weightKg - previous.weightKg;
  const readiness = computeReadinessScore(latest);

  if (
    (input.goal === "fat_loss" || input.goal === "weight_loss") &&
    weightDiff >= -0.1
  ) {
    return {
      calorieDelta: -140,
      stepsDelta: 1500,
      cardioMinutesDelta: 20,
      note: "Fat-loss trend stalled: reduce 140 kcal, add 1500 steps, and 20 min cardio weekly.",
    };
  }

  if (input.goal === "muscle_gain" && weightDiff <= 0.05) {
    return {
      calorieDelta: 120,
      stepsDelta: 0,
      cardioMinutesDelta: 0,
      note: "Muscle-gain trend is too slow: add 120 kcal/day and keep strength progression.",
    };
  }

  if (readiness < 55) {
    return {
      calorieDelta: 0,
      stepsDelta: -500,
      cardioMinutesDelta: -10,
      note: "Readiness is low: hold calories and reduce training fatigue this week.",
    };
  }

  return {
    calorieDelta: 0,
    stepsDelta: 500,
    cardioMinutesDelta: 5,
    note: "Progress is on track: keep nutrition steady and push slight activity progression.",
  };
}

export function getEnhancedNodeStatus(
  node: PlanNode,
  manualProgress: Record<string, boolean>,
  checkins: WeeklyCheckIn[],
): "locked" | "active" | "completed" {
  if (manualProgress[node.id]) return "completed";

  const dependenciesUnlocked = node.dependencies.every(
    (dependency) => manualProgress[dependency],
  );
  if (!dependenciesUnlocked) return "locked";

  if (node.level >= 4) {
    const latest = checkins[checkins.length - 1];
    if (!latest) return "locked";
    const readiness = computeReadinessScore(latest);
    if (readiness < 60 || latest.workoutCompletion < 70) return "locked";
  }

  return "active";
}

function pickMeal(options: MealOption[], minProtein: number): MealOption {
  const sorted = [...options].sort((a, b) => b.proteinG - a.proteinG);
  return sorted.find((item) => item.proteinG >= minProtein) ?? sorted[0];
}

export function buildDailyMealTemplates(
  targetCalories: number,
  macros: MacroTargets,
  diet: DietType,
  mealOptions: MealOption[],
): DailyMealTemplate[] {
  const allowed =
    diet === "mixed"
      ? mealOptions
      : mealOptions.filter((meal) => meal.category === diet);

  const breakfast = pickMeal(allowed, 25);
  const lunch = pickMeal(allowed, 35);
  const dinner = pickMeal(allowed, 30);
  const snack = pickMeal(allowed, 20);

  const cutTemplate: DailyMealTemplate = {
    name: "Cut Template",
    calories: Math.max(1300, targetCalories - 120),
    proteinG: Math.round(macros.proteinG),
    carbsG: Math.round(macros.carbsG * 0.9),
    fatsG: Math.round(macros.fatsG * 0.95),
    meals: [
      {
        slot: "Breakfast",
        mealName: breakfast.name,
        calories: breakfast.calories,
        proteinG: breakfast.proteinG,
      },
      {
        slot: "Lunch",
        mealName: lunch.name,
        calories: lunch.calories,
        proteinG: lunch.proteinG,
      },
      {
        slot: "Dinner",
        mealName: dinner.name,
        calories: dinner.calories,
        proteinG: dinner.proteinG,
      },
      {
        slot: "Snack",
        mealName: snack.name,
        calories: snack.calories,
        proteinG: snack.proteinG,
      },
    ],
  };

  const balanceTemplate: DailyMealTemplate = {
    name: "Balance Template",
    calories: targetCalories,
    proteinG: macros.proteinG,
    carbsG: macros.carbsG,
    fatsG: macros.fatsG,
    meals: cutTemplate.meals,
  };

  const performanceTemplate: DailyMealTemplate = {
    name: "Performance Template",
    calories: targetCalories + 120,
    proteinG: Math.round(macros.proteinG * 1.02),
    carbsG: Math.round(macros.carbsG * 1.1),
    fatsG: macros.fatsG,
    meals: cutTemplate.meals,
  };

  return [cutTemplate, balanceTemplate, performanceTemplate];
}

export function buildGroceryList(
  templates: DailyMealTemplate[],
): GroceryItem[] {
  const names = templates.flatMap((template) =>
    template.meals.map((meal) => meal.mealName.toLowerCase()),
  );

  const has = (needle: string) => names.some((name) => name.includes(needle));

  const list: GroceryItem[] = [
    { item: "Eggs / Egg whites", qty: "18 pcs", category: "protein" },
    { item: "Chicken / Paneer / Tofu", qty: "1.5-2 kg", category: "protein" },
    { item: "Greek yogurt", qty: "7 cups", category: "protein" },
    { item: "Rice / Quinoa / Millet", qty: "2-3 kg", category: "carb" },
    { item: "Oats", qty: "1 kg", category: "carb" },
    { item: "Olive oil / Ghee", qty: "500 ml", category: "fat" },
    { item: "Mixed vegetables", qty: "3-4 kg", category: "produce" },
    { item: "Berries / seasonal fruits", qty: "2 kg", category: "produce" },
  ];

  if (has("fish")) {
    list.push({ item: "Fish", qty: "1-1.5 kg", category: "protein" });
  }

  return list;
}

export function buildMealSwaps(meals: MealOption[]): MealSwap[] {
  if (meals.length < 2) return [];

  const sortedByCalories = [...meals].sort((a, b) => a.calories - b.calories);
  const lower = sortedByCalories[0];
  const higher = sortedByCalories[sortedByCalories.length - 1];

  const sortedByProtein = [...meals].sort((a, b) => b.proteinG - a.proteinG);
  const proteinHigh = sortedByProtein[0];
  const proteinLow = sortedByProtein[sortedByProtein.length - 1];

  return [
    {
      from: higher.name,
      to: lower.name,
      kcalDelta: lower.calories - higher.calories,
      proteinDelta: lower.proteinG - higher.proteinG,
    },
    {
      from: proteinLow.name,
      to: proteinHigh.name,
      kcalDelta: proteinHigh.calories - proteinLow.calories,
      proteinDelta: proteinHigh.proteinG - proteinLow.proteinG,
    },
  ];
}

export function getDailyCoachMessage(
  goal: GoalType,
  readinessScore: number,
  adjustment: PlanAdjustment,
): string {
  if (readinessScore < 50) {
    return "Recovery-first day: keep technique clean, shorten session by 10 minutes, and hit hydration + sleep target.";
  }

  if (goal === "fat_loss" || goal === "weight_loss") {
    if (adjustment.calorieDelta < 0) {
      return "Scale is flat but not a failure. Tighten tracking today, hit steps, and execute the updated deficit.";
    }
    return "Momentum day: keep protein high, complete the full workout, and finish with a 15-minute incline walk.";
  }

  if (goal === "muscle_gain") {
    if (adjustment.calorieDelta > 0) {
      return "Growth phase is active. Add the extra calories around workout window and push load on first compound lift.";
    }
    return "Strong progression day: prioritize quality reps and add 1-2 reps or 2.5% load where form allows.";
  }

  return "Recomposition focus: train hard, keep nutrition precise, and track waist + strength together this week.";
}
