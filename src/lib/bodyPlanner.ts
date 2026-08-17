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

export type TrackCategory =
  | "FOUNDATION"
  | "STRENGTH"
  | "HYPERTROPHY"
  | "CALISTHENICS"
  | "METABOLIC"
  | "APEX"
  | "BEGINNER"
  | "INTERMEDIATE"
  | "ADVANCED"
  | "ELITE";

export interface PlanNodeTask {
  id: string;
  label: string;
  xp: number;
}

export interface PlanNode {
  id: string;
  title: string;
  description: string;
  level: number;
  track: TrackCategory;
  xpReward: number;
  icon?: string;
  tasks?: PlanNodeTask[];
  unlockCriteria?: {
    type?: string;
    lift?: string;
    value?: number;
    unit?: string;
    metric?: string;
  };
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
    // --- FOUNDATION TRUNK ---
    {
      id: "assessment",
      title: "Baseline & Biometrics",
      description:
        "Capture baseline weight, waist circumference, BMI, and movement mobility.",
      level: 1,
      track: "FOUNDATION",
      xpReward: 100,
      icon: "Shield",
      tasks: [
        { id: "task_bw", label: "Log initial bodyweight & height", xp: 30 },
        { id: "task_waist", label: "Measure waist circumference", xp: 30 },
        { id: "task_mobility", label: "Perform full body mobility screen", xp: 40 },
      ],
      unlockCriteria: { type: "simple", lift: "Profile Setup", value: 1 },
      dependencies: [],
      position: { x: 450, y: 30 },
    },
    {
      id: "energy_foundation",
      title: "Energy & Macro Matrix",
      description:
        "Establish baseline maintenance calories, protein floor, and hydration cadence.",
      level: 2,
      track: "FOUNDATION",
      xpReward: 150,
      icon: "Flame",
      tasks: [
        { id: "task_tdee", label: "Calculate TDEE and calorie deficit/surplus", xp: 50 },
        { id: "task_protein", label: "Set daily 1.6g-2.0g/kg protein target", xp: 50 },
        { id: "task_water", label: "Hit 3L hydration target 3 days in a row", xp: 50 },
      ],
      unlockCriteria: { type: "simple", lift: "Diet Calibration", value: 1 },
      dependencies: ["assessment"],
      position: { x: 450, y: 190 },
    },
    {
      id: "movement_literacy",
      title: "Foundational Movement",
      description:
        "Master the primary movement patterns: squat, hinge, push, pull, and core brace.",
      level: 3,
      track: "FOUNDATION",
      xpReward: 200,
      icon: "Zap",
      tasks: [
        { id: "task_brace", label: "Master diaphragmatic bracing on heavy sets", xp: 60 },
        { id: "task_form", label: "Log form checks for Squat, Bench & Deadlift", xp: 70 },
        { id: "task_split", label: "Complete 1 full week of your training split", xp: 70 },
      ],
      unlockCriteria: { type: "lift", lift: "Squat", value: 0.8, unit: "x BW" },
      dependencies: ["energy_foundation"],
      position: { x: 450, y: 350 },
    },

    // --- BRANCH 1: IRON TRACK (STRENGTH & POWERLIFTING) ---
    {
      id: "strength_t1",
      title: "1x BW Squat & Bench",
      description:
        "Build foundational powerlifting strength. Hit bodyweight squat and solid bench press.",
      level: 4,
      track: "STRENGTH",
      xpReward: 250,
      icon: "Dumbbell",
      tasks: [
        { id: "task_s1", label: "Log 1.0x Bodyweight Back Squat 1RM", xp: 100 },
        { id: "task_b1", label: "Log 0.75x Bodyweight Bench Press 1RM", xp: 80 },
        { id: "task_rpe", label: "Execute RPE 8 working sets for 3 weeks", xp: 70 },
      ],
      unlockCriteria: { type: "lift", lift: "Squat", value: 1.0, unit: "x BW" },
      dependencies: ["movement_literacy"],
      position: { x: 80, y: 520 },
    },
    {
      id: "strength_t2",
      title: "1.5x BW Squat & Peak",
      description:
        "Heavy neural adaptations. Ascend to 1.5x BW squat, 1.2x bench, and 1.8x deadlift.",
      level: 5,
      track: "STRENGTH",
      xpReward: 350,
      icon: "Trophy",
      tasks: [
        { id: "task_s2", label: "Log 1.5x Bodyweight Squat 1RM", xp: 150 },
        { id: "task_d2", label: "Log 1.8x Bodyweight Deadlift 1RM", xp: 120 },
        { id: "task_peak", label: "Complete a 4-week strength peaking block", xp: 80 },
      ],
      unlockCriteria: { type: "lift", lift: "Deadlift", value: 1.8, unit: "x BW" },
      dependencies: ["strength_t1"],
      position: { x: 80, y: 700 },
    },
    {
      id: "strength_t3",
      title: "300+ Wilks Elite Club",
      description:
        "Enter competitive powerlifting territory. Achieve a 300+ Wilks strength total.",
      level: 6,
      track: "STRENGTH",
      xpReward: 500,
      icon: "Crown",
      tasks: [
        { id: "task_wilks", label: "Calculate and confirm 300+ Wilks score", xp: 250 },
        { id: "task_sbd_total", label: "Log official competition SBD PRs", xp: 150 },
        { id: "task_deload", label: "Execute scheduled deload & recovery wave", xp: 100 },
      ],
      unlockCriteria: { type: "wilks", metric: "wilks_score", value: 300 },
      dependencies: ["strength_t2"],
      position: { x: 80, y: 880 },
    },

    // --- BRANCH 2: AESTHETIC TRACK (HYPERTROPHY & MUSCLE DENSITY) ---
    {
      id: "hypertrophy_t1",
      title: "Volume Accumulation",
      description:
        "Master effective reps (RIR 1-3), progressive overload, and pump mechanics.",
      level: 4,
      track: "HYPERTROPHY",
      xpReward: 250,
      icon: "Sparkles",
      tasks: [
        { id: "task_vol1", label: "Hit 12-16 weekly sets per major muscle group", xp: 90 },
        { id: "task_tempo", label: "Implement 3-second eccentric control", xp: 80 },
        { id: "task_pump", label: "Log 4 hypertrophy workouts with 8-12 rep range", xp: 80 },
      ],
      unlockCriteria: { type: "simple", lift: "Hypertrophy Volume", value: 1 },
      dependencies: ["movement_literacy"],
      position: { x: 320, y: 520 },
    },
    {
      id: "hypertrophy_t2",
      title: "Metabolic Overload",
      description:
        "Incorporate mechanical drop sets, myo-reps, and lengthened-partial techniques.",
      level: 5,
      track: "HYPERTROPHY",
      xpReward: 350,
      icon: "Activity",
      tasks: [
        { id: "task_dropset", label: "Perform double drop-sets on isolation movements", xp: 120 },
        { id: "task_stretch", label: "Perform loaded stretching for chest & lats", xp: 110 },
        { id: "task_density", label: "Increase training density by 10% across 4 weeks", xp: 120 },
      ],
      unlockCriteria: { type: "simple", lift: "Density Block", value: 1 },
      dependencies: ["hypertrophy_t1"],
      position: { x: 320, y: 700 },
    },
    {
      id: "hypertrophy_t3",
      title: "Symmetry & Peak Density",
      description:
        "Sculpt weak points, maximize upper/lower balance, and achieve optimal vascularity.",
      level: 6,
      track: "HYPERTROPHY",
      xpReward: 500,
      icon: "Target",
      tasks: [
        { id: "task_symm", label: "Complete 6-week weak point specialization", xp: 200 },
        { id: "task_photo", label: "Record standardized physique comparison photos", xp: 150 },
        { id: "task_pump_max", label: "Hit personal 10RM records on compound presses", xp: 150 },
      ],
      unlockCriteria: { type: "simple", lift: "Physique Peak", value: 1 },
      dependencies: ["hypertrophy_t2"],
      position: { x: 320, y: 880 },
    },

    // --- BRANCH 3: KINETIC TRACK (CALISTHENICS & FUNCTIONAL POWER) ---
    {
      id: "calisthenics_t1",
      title: "Weighted Pull-Up & Dips",
      description:
        "Own relative bodyweight strength. Achieve strict pull-ups, push-ups, and parallel bar dips.",
      level: 4,
      track: "CALISTHENICS",
      xpReward: 250,
      icon: "Activity",
      tasks: [
        { id: "task_pull1", label: "Log 10 strict dead-hang pull-ups", xp: 90 },
        { id: "task_dip1", label: "Log 15 full-depth parallel bar dips", xp: 80 },
        { id: "task_core1", label: "Hold 60s active hollow body plank", xp: 80 },
      ],
      unlockCriteria: { type: "simple", lift: "Bodyweight Mastery", value: 1 },
      dependencies: ["movement_literacy"],
      position: { x: 580, y: 520 },
    },
    {
      id: "calisthenics_t2",
      title: "Handstand & Ring Power",
      description:
        "Develop gymnastic ring stability, freestanding handstand balance, and L-sits.",
      level: 5,
      track: "CALISTHENICS",
      xpReward: 350,
      icon: "Zap",
      tasks: [
        { id: "task_hs", label: "Hold 30s wall-assisted handstand with PPT", xp: 130 },
        { id: "task_ring", label: "Perform ring dips with external rotation lockout", xp: 110 },
        { id: "task_lsit", label: "Hold 20s strict floor or bar L-sit", xp: 110 },
      ],
      unlockCriteria: { type: "simple", lift: "Ring Control", value: 1 },
      dependencies: ["calisthenics_t1"],
      position: { x: 580, y: 700 },
    },
    {
      id: "calisthenics_t3",
      title: "Muscle-Up & Lever",
      description:
        "Master elite calisthenics skills: strict bar/ring muscle-up and straddle front lever.",
      level: 6,
      track: "CALISTHENICS",
      xpReward: 500,
      icon: "Award",
      tasks: [
        { id: "task_mu", label: "Execute 3 consecutive clean bar muscle-ups", xp: 200 },
        { id: "task_lever", label: "Hold 10s straddle front lever", xp: 150 },
        { id: "task_wpull", label: "Log +0.5x Bodyweight weighted pull-up", xp: 150 },
      ],
      unlockCriteria: { type: "simple", lift: "Elite Skill", value: 1 },
      dependencies: ["calisthenics_t2"],
      position: { x: 580, y: 880 },
    },

    // --- BRANCH 4: METABOLIC TRACK (BIOENERGETICS & RECOMP) ---
    {
      id: "metabolic_t1",
      title: "Deficit & Step Adherence",
      description:
        "Establish an unbroken 14-day calorie deficit and 9,000+ daily step baseline.",
      level: 4,
      track: "METABOLIC",
      xpReward: 250,
      icon: "Flame",
      tasks: [
        { id: "task_step1", label: "Average 9,000+ steps/day for 2 consecutive weeks", xp: 90 },
        { id: "task_log1", label: "Log daily calories accurately for 14 days", xp: 80 },
        { id: "task_sleep1", label: "Average 7.5+ hours sleep per night", xp: 80 },
      ],
      unlockCriteria: { type: "simple", lift: "Adherence Streak", value: 1 },
      dependencies: ["energy_foundation"],
      position: { x: 820, y: 520 },
    },
    {
      id: "metabolic_t2",
      title: "Refeed & Leptin Cycling",
      description:
        "Implement 48-hour carbohydrate refeeds and structured diet breaks to prevent metabolic slowdown.",
      level: 5,
      track: "METABOLIC",
      xpReward: 350,
      icon: "Shield",
      tasks: [
        { id: "task_refeed", label: "Execute structured 2-day high-carb maintenance refeed", xp: 120 },
        { id: "task_hrv", label: "Track weekly morning resting HR and recovery trends", xp: 110 },
        { id: "task_fiber", label: "Hit 35g+ daily fiber goal consistently", xp: 120 },
      ],
      unlockCriteria: { type: "simple", lift: "Metabolic Flexibility", value: 1 },
      dependencies: ["metabolic_t1"],
      position: { x: 820, y: 700 },
    },
    {
      id: "metabolic_t3",
      title: "Lean Maintenance Mastery",
      description:
        "Reverse diet back to maintenance and sustain peak leanness without metabolic drop.",
      level: 6,
      track: "METABOLIC",
      xpReward: 500,
      icon: "Trophy",
      tasks: [
        { id: "task_revdiet", label: "Increase daily intake by 250 kcal to maintenance", xp: 200 },
        { id: "task_bodycomp", label: "Maintain stable trend weight (+/-0.5kg) for 3 weeks", xp: 150 },
        { id: "task_readiness", label: "Achieve 85+ average weekly readiness score", xp: 150 },
      ],
      unlockCriteria: { type: "simple", lift: "Peak Recomp", value: 1 },
      dependencies: ["metabolic_t2"],
      position: { x: 820, y: 880 },
    },

    // --- CAPSTONE: APEX MASTERY ---
    {
      id: "apex_mastery",
      title: "Apex Athletic Singularity",
      description:
        "The ultimate zenith. Unlocked when mastery across Strength, Hypertrophy, Calisthenics & Bioenergetics converges.",
      level: 7,
      track: "APEX",
      xpReward: 1000,
      icon: "Crown",
      tasks: [
        { id: "task_apex1", label: "Achieve Level 6 completion in at least 2 specialization tracks", xp: 400 },
        { id: "task_apex2", label: "Maintain 90+ days unbroken fitness journey momentum", xp: 300 },
        { id: "task_apex3", label: "Log lifetime PRs across all Big 3 compounds", xp: 300 },
      ],
      unlockCriteria: { type: "simple", lift: "Grandmaster", value: 1 },
      dependencies: ["strength_t3", "hypertrophy_t3", "calisthenics_t3", "metabolic_t3"],
      position: { x: 450, y: 1060 },
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
