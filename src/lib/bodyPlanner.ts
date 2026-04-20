export type GoalType =
  | "fat_loss"
  | "weight_loss"
  | "muscle_gain"
  | "recomposition";
export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";
export type SexType = "male" | "female";
export type DietType = "veg" | "non_veg" | "mixed";

export interface PlannerInput {
  age: number;
  sex: SexType;
  heightCm: number;
  weightKg: number;
  goal: GoalType;
  activity: ActivityLevel;
  workoutDays: number;
  diet: DietType;
}

export interface MacroTargets {
  proteinG: number;
  carbsG: number;
  fatsG: number;
  fiberG: number;
}

export interface WorkoutDayPlan {
  day: string;
  focus: string;
  durationMin: number;
  targetSteps: number;
  prescription: string;
}

export interface GymWorkoutDay {
  day: string;
  bodyParts: [string, string];
  focus: string;
  exercises: string[];
  setsReps: string;
}

export interface GymWorkoutPhase {
  level: "Beginner" | "Intermediate" | "Advanced";
  weeklySplit: string;
  days: GymWorkoutDay[];
}

export interface MealOption {
  name: string;
  category: "veg" | "non_veg";
  calories: number;
  proteinG: number;
  serving: string;
}

export interface PlanNode {
  id: string;
  title: string;
  description: string;
  level: number;
  track: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "ELITE";
  dependencies: string[];
  position: { x: number; y: number };
}

export interface PlannerResult {
  bmi: number;
  bmiCategory: string;
  bmr: number;
  maintenanceCalories: number;
  targetCalories: number;
  weeklyWeightChangeKg: number;
  suggestedTargetWeightKg: number;
  estimatedWeeksToTarget: number;
  calorieAdjustmentNote: string;
  waterLiters: number;
  macros: MacroTargets;
  workoutPlan: WorkoutDayPlan[];
  gymProgression: GymWorkoutPhase[];
  mealOptions: MealOption[];
  roadmapNodes: PlanNode[];
}

const activityMultiplier: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const goalCalorieFactor: Record<GoalType, number> = {
  fat_loss: 0.8,
  weight_loss: 0.85,
  muscle_gain: 1.1,
  recomposition: 0.92,
};

const goalProteinPerKg: Record<GoalType, number> = {
  fat_loss: 1.5,
  weight_loss: 1.5,
  muscle_gain: 1.5,
  recomposition: 1.5,
};

const dayNames = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function round(value: number, decimals = 0): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function buildWorkoutPlan(
  goal: GoalType,
  workoutDays: number,
): WorkoutDayPlan[] {
  const trainingDays = clamp(workoutDays, 3, 7);
  const plan: WorkoutDayPlan[] = [];

  for (let index = 0; index < 7; index += 1) {
    const isTrainingDay = index < trainingDays;

    if (!isTrainingDay) {
      plan.push({
        day: dayNames[index],
        focus: "Recovery + Light Cardio",
        durationMin: 35,
        targetSteps: 8000,
        prescription: "30-35 min brisk walk + 10 min mobility and breathwork.",
      });
      continue;
    }

    if (goal === "muscle_gain") {
      plan.push({
        day: dayNames[index],
        focus: "Progressive Strength",
        durationMin: 65,
        targetSteps: 7500,
        prescription:
          "4 compound lifts, 3-4 sets each, 6-12 reps, finish with core work.",
      });
      continue;
    }

    if (goal === "recomposition") {
      plan.push({
        day: dayNames[index],
        focus: "Strength + Conditioning",
        durationMin: 60,
        targetSteps: 9500,
        prescription:
          "3 strength blocks + 12 min intervals (bike/rower), 8-12 reps.",
      });
      continue;
    }

    plan.push({
      day: dayNames[index],
      focus: "Fat Loss Circuit",
      durationMin: 55,
      targetSteps: 10000,
      prescription:
        "Full-body circuit: squat, push, pull, hinge, carry. 3 rounds + 20 min incline walk.",
    });
  }

  return plan;
}

function buildGymProgression(goal: GoalType): GymWorkoutPhase[] {
  const repScheme =
    goal === "muscle_gain"
      ? "4 sets x 6-10 reps"
      : goal === "recomposition"
        ? "3-4 sets x 8-12 reps"
        : "3 sets x 10-15 reps";

  return [
    {
      level: "Beginner",
      weeklySplit: "5 training days + 2 recovery days",
      days: [
        {
          day: "Monday",
          bodyParts: ["Chest", "Triceps"],
          focus: "Pressing foundation",
          exercises: [
            "Flat dumbbell press",
            "Machine chest press",
            "Cable chest fly",
            "Cable triceps pushdown",
            "Overhead dumbbell triceps extension",
            "Bench dips",
          ],
          setsReps: repScheme,
        },
        {
          day: "Tuesday",
          bodyParts: ["Back", "Biceps"],
          focus: "Pulling mechanics",
          exercises: [
            "Lat pulldown",
            "Seated cable row",
            "Assisted pull-up",
            "One-arm dumbbell row",
            "Dumbbell biceps curl",
            "Hammer curl",
          ],
          setsReps: repScheme,
        },
        {
          day: "Wednesday",
          bodyParts: ["Legs", "Core"],
          focus: "Lower body stability",
          exercises: [
            "Goblet squat",
            "Romanian deadlift",
            "Leg press",
            "Walking lunges",
            "Plank variations",
            "Dead bug",
          ],
          setsReps: repScheme,
        },
        {
          day: "Thursday",
          bodyParts: ["Shoulders", "Abs"],
          focus: "Posture and shoulder strength",
          exercises: [
            "Seated shoulder press",
            "Lateral raise",
            "Front raise",
            "Face pull",
            "Hanging knee raise",
            "Cable crunch",
          ],
          setsReps: repScheme,
        },
        {
          day: "Friday",
          bodyParts: ["Glutes", "Hamstrings"],
          focus: "Posterior chain basics",
          exercises: [
            "Hip thrust",
            "Lying leg curl",
            "Romanian deadlift",
            "Walking lunges",
            "Cable glute kickback",
            "45-degree back extension",
          ],
          setsReps: repScheme,
        },
      ],
    },
    {
      level: "Intermediate",
      weeklySplit: "6 training days + 1 recovery day",
      days: [
        {
          day: "Monday",
          bodyParts: ["Chest", "Triceps"],
          focus: "Heavy push",
          exercises: [
            "Barbell bench press",
            "Incline dumbbell press",
            "Weighted dips",
            "Pec deck fly",
            "Overhead triceps extension",
            "Rope triceps pressdown",
          ],
          setsReps: "4 sets x 6-10 reps",
        },
        {
          day: "Tuesday",
          bodyParts: ["Back", "Biceps"],
          focus: "Vertical + horizontal pull",
          exercises: [
            "Weighted pulldown",
            "Chest-supported row",
            "Straight-arm pulldown",
            "Seated close-grip row",
            "EZ-bar curl",
            "Incline dumbbell curl",
          ],
          setsReps: "4 sets x 8-12 reps",
        },
        {
          day: "Wednesday",
          bodyParts: ["Quads", "Hamstrings"],
          focus: "Strength base lower",
          exercises: [
            "Back squat",
            "Romanian deadlift",
            "Leg press",
            "Leg extension",
            "Seated leg curl",
            "Bulgarian split squat",
          ],
          setsReps: "4 sets x 6-10 reps",
        },
        {
          day: "Thursday",
          bodyParts: ["Shoulders", "Core"],
          focus: "Stability + control",
          exercises: [
            "Overhead press",
            "Rear delt fly",
            "Cable lateral raise",
            "Face pull",
            "Cable woodchopper",
            "Hanging leg raise",
          ],
          setsReps: "3-4 sets x 10-12 reps",
        },
        {
          day: "Friday",
          bodyParts: ["Chest", "Back"],
          focus: "Upper body density",
          exercises: [
            "Incline barbell press",
            "One-arm dumbbell row",
            "Machine chest fly",
            "Wide-grip lat pulldown",
            "Cable crossover",
            "Chest-supported T-bar row",
          ],
          setsReps: "3-4 sets x 8-12 reps",
        },
        {
          day: "Saturday",
          bodyParts: ["Legs", "Arms"],
          focus: "Pump + volume",
          exercises: [
            "Leg press",
            "Hamstring curl",
            "Walking lunge",
            "Calf raise",
            "Superset EZ-bar curl + rope pushdown",
            "Overhead cable triceps extension",
          ],
          setsReps: "3 sets x 10-15 reps",
        },
      ],
    },
    {
      level: "Advanced",
      weeklySplit: "6 training days + 1 strategic recovery day",
      days: [
        {
          day: "Monday",
          bodyParts: ["Chest", "Back"],
          focus: "Strength contrast",
          exercises: [
            "Paused bench press",
            "Pendlay row",
            "Weighted dips",
            "Weighted pull-up",
            "Incline dumbbell press",
            "Chest-supported row",
          ],
          setsReps: "4-5 sets x 5-8 reps",
        },
        {
          day: "Tuesday",
          bodyParts: ["Shoulders", "Arms"],
          focus: "Overhead and arm specialization",
          exercises: [
            "Standing OHP",
            "Lateral raise mechanical drops",
            "Rear delt cable fly",
            "Skull crushers",
            "Incline dumbbell curls",
            "Cable hammer curl",
          ],
          setsReps: "4 sets x 8-12 reps",
        },
        {
          day: "Wednesday",
          bodyParts: ["Quads", "Hamstrings"],
          focus: "High-output lower body",
          exercises: [
            "Front squat",
            "Stiff-leg deadlift",
            "Bulgarian split squat",
            "Hack squat",
            "Seated leg curl",
            "Leg extension dropset",
          ],
          setsReps: "4-5 sets x 6-10 reps",
        },
        {
          day: "Thursday",
          bodyParts: ["Chest", "Triceps"],
          focus: "Hypertrophy push",
          exercises: [
            "Incline barbell press",
            "Cable fly",
            "Close-grip bench press",
            "Machine chest press",
            "Rope pushdown",
            "Overhead cable extension",
          ],
          setsReps: "4 sets x 8-12 reps",
        },
        {
          day: "Friday",
          bodyParts: ["Back", "Biceps"],
          focus: "Lat width + thickness",
          exercises: [
            "Weighted pull-up",
            "T-bar row",
            "Single-arm cable row",
            "Straight-arm pulldown",
            "Preacher curl",
            "Bayesian cable curl",
          ],
          setsReps: "4 sets x 8-12 reps",
        },
        {
          day: "Saturday",
          bodyParts: ["Glutes", "Core"],
          focus: "Athletic posterior chain",
          exercises: [
            "Barbell hip thrust",
            "Cable pull-through",
            "Romanian deadlift",
            "Glute-focused back extension",
            "Ab wheel rollout",
            "Hanging leg raise",
          ],
          setsReps: "3-4 sets x 10-15 reps",
        },
      ],
    },
  ];
}

function filterMealsByDiet(diet: DietType): MealOption[] {
  const options: MealOption[] = [
    {
      name: "Greek yogurt + oats + berries",
      category: "veg",
      calories: 390,
      proteinG: 28,
      serving: "1 bowl",
    },
    {
      name: "Paneer stir-fry + millet roti",
      category: "veg",
      calories: 520,
      proteinG: 34,
      serving: "1 plate",
    },
    {
      name: "Lentil quinoa bowl + salad",
      category: "veg",
      calories: 460,
      proteinG: 24,
      serving: "1 bowl",
    },
    {
      name: "Tofu bhurji + whole wheat toast",
      category: "veg",
      calories: 410,
      proteinG: 30,
      serving: "1 plate",
    },
    {
      name: "Egg white omelette + sweet potato",
      category: "non_veg",
      calories: 360,
      proteinG: 32,
      serving: "1 plate",
    },
    {
      name: "Grilled chicken + rice + sauteed veggies",
      category: "non_veg",
      calories: 540,
      proteinG: 46,
      serving: "1 plate",
    },
    {
      name: "Fish curry + steamed rice + cucumber",
      category: "non_veg",
      calories: 500,
      proteinG: 40,
      serving: "1 plate",
    },
    {
      name: "Turkey/chicken salad wrap",
      category: "non_veg",
      calories: 430,
      proteinG: 36,
      serving: "1 wrap",
    },
  ];

  if (diet === "veg") {
    return options.filter((item) => item.category === "veg");
  }

  if (diet === "non_veg") {
    return options.filter((item) => item.category === "non_veg");
  }

  return options;
}

function buildRoadmapNodes(): PlanNode[] {
  return [
    {
      id: "assessment",
      title: "Baseline Assessment",
      description:
        "Capture age, weight, height, BMI, lifestyle and current routine.",
      level: 1,
      track: "BEGINNER",
      dependencies: [],
      position: { x: 0, y: 40 },
    },
    {
      id: "calories",
      title: "Calorie Strategy",
      description:
        "Use maintenance calories and set a safe deficit/surplus based on goal.",
      level: 1,
      track: "BEGINNER",
      dependencies: ["assessment"],
      position: { x: 280, y: 40 },
    },
    {
      id: "macros",
      title: "Protein + Macro Targets",
      description:
        "Set daily protein, carbs, fats, and fiber targets per body weight.",
      level: 2,
      track: "INTERMEDIATE",
      dependencies: ["calories"],
      position: { x: 560, y: 40 },
    },
    {
      id: "hydration",
      title: "Hydration Protocol",
      description:
        "Daily water target and electrolyte strategy for recovery and satiety.",
      level: 2,
      track: "INTERMEDIATE",
      dependencies: ["macros"],
      position: { x: 840, y: 40 },
    },
    {
      id: "training",
      title: "Weekly Training Split",
      description:
        "Daily workouts with volume targets aligned to fat loss and muscle retention.",
      level: 3,
      track: "ADVANCED",
      dependencies: ["macros"],
      position: { x: 420, y: 240 },
    },
    {
      id: "nutrition_execution",
      title: "Meal Combinations",
      description:
        "Build veg/non-veg meals that hit calories and protein consistently.",
      level: 3,
      track: "ADVANCED",
      dependencies: ["macros"],
      position: { x: 140, y: 240 },
    },
    {
      id: "progress_tracking",
      title: "Progress Tracking",
      description:
        "Track weight trend, waist, sleep, and weekly adherence score.",
      level: 4,
      track: "ELITE",
      dependencies: ["training", "nutrition_execution", "hydration"],
      position: { x: 700, y: 240 },
    },
    {
      id: "adjustments",
      title: "Adaptive Adjustments",
      description:
        "Adjust calories, steps, and cardio when progress stalls for 2+ weeks.",
      level: 4,
      track: "ELITE",
      dependencies: ["progress_tracking"],
      position: { x: 980, y: 240 },
    },
  ];
}

export function calculateBodyPlan(input: PlannerInput): PlannerResult {
  const safeHeightCm = clamp(input.heightCm, 130, 230);
  const safeWeightKg = clamp(input.weightKg, 35, 260);
  const safeAge = clamp(input.age, 14, 85);
  const safeWorkoutDays = clamp(input.workoutDays, 3, 7);

  const heightM = safeHeightCm / 100;
  const bmi = safeWeightKg / (heightM * heightM);

  let bmiCategory = "Normal";
  if (bmi < 18.5) bmiCategory = "Underweight";
  else if (bmi < 25) bmiCategory = "Normal";
  else if (bmi < 30) bmiCategory = "Overweight";
  else bmiCategory = "Obesity";

  const sexBias = input.sex === "male" ? 5 : -161;
  const bmr = 10 * safeWeightKg + 6.25 * safeHeightCm - 5 * safeAge + sexBias;
  const maintenanceCalories = bmr * activityMultiplier[input.activity];
  const targetCalories = maintenanceCalories * goalCalorieFactor[input.goal];

  const dailyDelta = maintenanceCalories - targetCalories;
  const weeklyWeightChangeKg = (dailyDelta * 7) / 7700;

  const healthyBmiAnchor = input.goal === "muscle_gain" ? 24 : 22;
  const suggestedTargetWeightKg = healthyBmiAnchor * (heightM * heightM);
  const deltaToTarget = Math.abs(suggestedTargetWeightKg - safeWeightKg);
  const speed = Math.max(0.2, Math.abs(weeklyWeightChangeKg));
  const estimatedWeeksToTarget = deltaToTarget / speed;

  const proteinG = safeWeightKg * goalProteinPerKg[input.goal];
  const fatsG = safeWeightKg * (input.goal === "muscle_gain" ? 0.9 : 0.75);
  const caloriesLeft = targetCalories - proteinG * 4 - fatsG * 9;
  const carbsG = Math.max(60, caloriesLeft / 4);
  const fiberG = Math.max(25, (targetCalories / 1000) * 14);

  const waterLiters = (safeWeightKg * 35 + safeWorkoutDays * 250) / 1000;

  let calorieAdjustmentNote =
    "Keep the current calories for 2 weeks and review trend weight.";
  if (input.goal === "fat_loss" || input.goal === "weight_loss") {
    calorieAdjustmentNote =
      "If weight does not drop for 14 days, reduce 120-160 kcal or add 1500 steps/day.";
  }
  if (input.goal === "muscle_gain") {
    calorieAdjustmentNote =
      "If weekly gain is <0.15 kg for 2 weeks, add 100-150 kcal/day.";
  }

  return {
    bmi: round(bmi, 1),
    bmiCategory,
    bmr: round(bmr),
    maintenanceCalories: round(maintenanceCalories),
    targetCalories: round(targetCalories),
    weeklyWeightChangeKg: round(weeklyWeightChangeKg, 2),
    suggestedTargetWeightKg: round(suggestedTargetWeightKg, 1),
    estimatedWeeksToTarget: round(estimatedWeeksToTarget),
    calorieAdjustmentNote,
    waterLiters: round(waterLiters, 1),
    macros: {
      proteinG: round(proteinG),
      carbsG: round(carbsG),
      fatsG: round(fatsG),
      fiberG: round(fiberG),
    },
    workoutPlan: buildWorkoutPlan(input.goal, safeWorkoutDays),
    gymProgression: buildGymProgression(input.goal),
    mealOptions: filterMealsByDiet(input.diet),
    roadmapNodes: buildRoadmapNodes(),
  };
}
