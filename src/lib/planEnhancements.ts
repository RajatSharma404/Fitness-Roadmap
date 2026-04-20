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
  exerciseType: "compound" | "isolation";
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

interface MuscleArtStyle {
  bgStart: string;
  bgEnd: string;
  panelFill: string;
  panelStroke: string;
  titleColor: string;
  subtitleColor: string;
  accent: string;
  motif: string;
  targetHighlight: string;
  pose: "push" | "pull" | "legs" | "hinge" | "core" | "overhead";
}

const muscleArtStyles: Record<string, MuscleArtStyle> = {
  chest: {
    bgStart: "#1f0d18",
    bgEnd: "#3b1428",
    panelFill: "#2a1220",
    panelStroke: "#7d2851",
    titleColor: "#ffd3e8",
    subtitleColor: "#ffc1df",
    accent: "#fb7185",
    motif:
      '<path d="M92 124H628" stroke="#f472b6" stroke-opacity="0.25" stroke-width="5"/><path d="M92 164H628" stroke="#f472b6" stroke-opacity="0.16" stroke-width="5"/>',
    targetHighlight:
      '<ellipse cx="360" cy="210" rx="54" ry="38" fill="#fb7185" fill-opacity="0.42"/>',
    pose: "push",
  },
  back: {
    bgStart: "#0a1a2f",
    bgEnd: "#102e4f",
    panelFill: "#102338",
    panelStroke: "#2a6ea1",
    titleColor: "#c7e8ff",
    subtitleColor: "#9dd8ff",
    accent: "#38bdf8",
    motif:
      '<path d="M120 84L300 264" stroke="#38bdf8" stroke-opacity="0.18" stroke-width="7"/><path d="M240 84L420 264" stroke="#38bdf8" stroke-opacity="0.15" stroke-width="7"/><path d="M360 84L540 264" stroke="#38bdf8" stroke-opacity="0.18" stroke-width="7"/>',
    targetHighlight:
      '<rect x="320" y="172" width="80" height="112" rx="30" fill="#38bdf8" fill-opacity="0.36"/>',
    pose: "pull",
  },
  shoulders: {
    bgStart: "#1d142e",
    bgEnd: "#2f1d4f",
    panelFill: "#201831",
    panelStroke: "#7a4bcc",
    titleColor: "#ede1ff",
    subtitleColor: "#d7c2ff",
    accent: "#a78bfa",
    motif:
      '<path d="M220 108Q360 38 500 108" stroke="#a78bfa" stroke-opacity="0.28" stroke-width="8" fill="none"/><path d="M250 136Q360 76 470 136" stroke="#a78bfa" stroke-opacity="0.2" stroke-width="6" fill="none"/>',
    targetHighlight:
      '<ellipse cx="320" cy="194" rx="24" ry="24" fill="#a78bfa" fill-opacity="0.4"/><ellipse cx="400" cy="194" rx="24" ry="24" fill="#a78bfa" fill-opacity="0.4"/>',
    pose: "overhead",
  },
  arms: {
    bgStart: "#0f2616",
    bgEnd: "#174328",
    panelFill: "#12301d",
    panelStroke: "#2a8b4d",
    titleColor: "#cfffe0",
    subtitleColor: "#adf3c5",
    accent: "#4ade80",
    motif:
      '<path d="M124 118C188 70 252 70 316 118" stroke="#4ade80" stroke-opacity="0.22" stroke-width="7" fill="none"/><path d="M404 118C468 70 532 70 596 118" stroke="#4ade80" stroke-opacity="0.22" stroke-width="7" fill="none"/>',
    targetHighlight:
      '<ellipse cx="300" cy="212" rx="22" ry="34" fill="#4ade80" fill-opacity="0.35"/><ellipse cx="420" cy="212" rx="22" ry="34" fill="#4ade80" fill-opacity="0.35"/>',
    pose: "pull",
  },
  legs: {
    bgStart: "#1d1708",
    bgEnd: "#3a2a0a",
    panelFill: "#271d0a",
    panelStroke: "#9a7b2f",
    titleColor: "#ffeec2",
    subtitleColor: "#f4dc9f",
    accent: "#facc15",
    motif:
      '<path d="M172 92V284" stroke="#facc15" stroke-opacity="0.2" stroke-width="8"/><path d="M262 92V284" stroke="#facc15" stroke-opacity="0.14" stroke-width="8"/><path d="M352 92V284" stroke="#facc15" stroke-opacity="0.2" stroke-width="8"/><path d="M442 92V284" stroke="#facc15" stroke-opacity="0.14" stroke-width="8"/><path d="M532 92V284" stroke="#facc15" stroke-opacity="0.2" stroke-width="8"/>',
    targetHighlight:
      '<rect x="325" y="268" width="30" height="72" rx="12" fill="#facc15" fill-opacity="0.4"/><rect x="365" y="268" width="30" height="72" rx="12" fill="#facc15" fill-opacity="0.4"/>',
    pose: "legs",
  },
  glutes: {
    bgStart: "#2a0e22",
    bgEnd: "#4a1a3d",
    panelFill: "#33142b",
    panelStroke: "#ac4b8a",
    titleColor: "#ffd9ef",
    subtitleColor: "#f9bedd",
    accent: "#f472b6",
    motif:
      '<circle cx="256" cy="148" r="56" fill="#f472b6" fill-opacity="0.12"/><circle cx="464" cy="148" r="56" fill="#f472b6" fill-opacity="0.12"/><path d="M210 238H510" stroke="#f472b6" stroke-opacity="0.22" stroke-width="6"/>',
    targetHighlight:
      '<ellipse cx="348" cy="280" rx="34" ry="24" fill="#f472b6" fill-opacity="0.4"/><ellipse cx="390" cy="280" rx="34" ry="24" fill="#f472b6" fill-opacity="0.4"/>',
    pose: "hinge",
  },
  core: {
    bgStart: "#102221",
    bgEnd: "#1a4240",
    panelFill: "#14312f",
    panelStroke: "#2a8d86",
    titleColor: "#d4fffb",
    subtitleColor: "#a7efe9",
    accent: "#2dd4bf",
    motif:
      '<circle cx="360" cy="186" r="120" stroke="#2dd4bf" stroke-opacity="0.2" stroke-width="8" fill="none"/><circle cx="360" cy="186" r="84" stroke="#2dd4bf" stroke-opacity="0.16" stroke-width="8" fill="none"/><circle cx="360" cy="186" r="50" stroke="#2dd4bf" stroke-opacity="0.14" stroke-width="8" fill="none"/>',
    targetHighlight:
      '<rect x="334" y="206" width="52" height="90" rx="22" fill="#2dd4bf" fill-opacity="0.38"/>',
    pose: "core",
  },
  default: {
    bgStart: "#101418",
    bgEnd: "#1a222b",
    panelFill: "#1a222b",
    panelStroke: "#2b3a4a",
    titleColor: "#d7edff",
    subtitleColor: "#dcdcaa",
    accent: "#9cdcfe",
    motif:
      '<path d="M96 136H624" stroke="#8ca5bf" stroke-opacity="0.18" stroke-width="6"/><path d="M96 184H624" stroke="#8ca5bf" stroke-opacity="0.12" stroke-width="6"/>',
    targetHighlight:
      '<rect x="336" y="190" width="48" height="104" rx="20" fill="#9cdcfe" fill-opacity="0.28"/>',
    pose: "push",
  },
};

function normalizeBodyPartForStyle(
  bodyPart: string,
): keyof typeof muscleArtStyles {
  const value = bodyPart.toLowerCase();
  if (value.includes("chest")) return "chest";
  if (value.includes("back")) return "back";
  if (value.includes("shoulder") || value.includes("delt")) return "shoulders";
  if (
    value.includes("bicep") ||
    value.includes("tricep") ||
    value.includes("arm") ||
    value.includes("forearm")
  ) {
    return "arms";
  }
  if (
    value.includes("leg") ||
    value.includes("quad") ||
    value.includes("hamstring") ||
    value.includes("calf")
  ) {
    return "legs";
  }
  if (value.includes("glute")) return "glutes";
  if (
    value.includes("core") ||
    value.includes("abs") ||
    value.includes("abdom")
  ) {
    return "core";
  }
  return "default";
}

function escapeSvgText(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getPoseLines(
  pose: MuscleArtStyle["pose"],
  stroke: string,
): { armLines: string; legLines: string } {
  switch (pose) {
    case "pull":
      return {
        armLines:
          `<line x1="360" y1="202" x2="300" y2="162" stroke="${stroke}" stroke-width="10"/>` +
          `<line x1="360" y1="202" x2="420" y2="162" stroke="${stroke}" stroke-width="10"/>`,
        legLines:
          `<line x1="360" y1="280" x2="322" y2="338" stroke="${stroke}" stroke-width="10"/>` +
          `<line x1="360" y1="280" x2="398" y2="338" stroke="${stroke}" stroke-width="10"/>`,
      };
    case "overhead":
      return {
        armLines:
          `<line x1="360" y1="202" x2="320" y2="138" stroke="${stroke}" stroke-width="10"/>` +
          `<line x1="360" y1="202" x2="400" y2="138" stroke="${stroke}" stroke-width="10"/>`,
        legLines:
          `<line x1="360" y1="280" x2="324" y2="338" stroke="${stroke}" stroke-width="10"/>` +
          `<line x1="360" y1="280" x2="396" y2="338" stroke="${stroke}" stroke-width="10"/>`,
      };
    case "legs":
      return {
        armLines:
          `<line x1="360" y1="202" x2="308" y2="212" stroke="${stroke}" stroke-width="10"/>` +
          `<line x1="360" y1="202" x2="412" y2="212" stroke="${stroke}" stroke-width="10"/>`,
        legLines:
          `<line x1="360" y1="280" x2="316" y2="314" stroke="${stroke}" stroke-width="10"/>` +
          `<line x1="316" y1="314" x2="332" y2="346" stroke="${stroke}" stroke-width="10"/>` +
          `<line x1="360" y1="280" x2="404" y2="314" stroke="${stroke}" stroke-width="10"/>` +
          `<line x1="404" y1="314" x2="388" y2="346" stroke="${stroke}" stroke-width="10"/>`,
      };
    case "hinge":
      return {
        armLines:
          `<line x1="360" y1="202" x2="314" y2="220" stroke="${stroke}" stroke-width="10"/>` +
          `<line x1="360" y1="202" x2="412" y2="198" stroke="${stroke}" stroke-width="10"/>`,
        legLines:
          `<line x1="360" y1="280" x2="326" y2="338" stroke="${stroke}" stroke-width="10"/>` +
          `<line x1="360" y1="280" x2="398" y2="338" stroke="${stroke}" stroke-width="10"/>`,
      };
    case "core":
      return {
        armLines:
          `<line x1="360" y1="202" x2="316" y2="238" stroke="${stroke}" stroke-width="10"/>` +
          `<line x1="360" y1="202" x2="404" y2="238" stroke="${stroke}" stroke-width="10"/>`,
        legLines:
          `<line x1="360" y1="280" x2="332" y2="338" stroke="${stroke}" stroke-width="10"/>` +
          `<line x1="360" y1="280" x2="396" y2="320" stroke="${stroke}" stroke-width="10"/>`,
      };
    case "push":
    default:
      return {
        armLines:
          `<line x1="360" y1="202" x2="304" y2="202" stroke="${stroke}" stroke-width="10"/>` +
          `<line x1="360" y1="202" x2="416" y2="202" stroke="${stroke}" stroke-width="10"/>`,
        legLines:
          `<line x1="360" y1="280" x2="320" y2="338" stroke="${stroke}" stroke-width="10"/>` +
          `<line x1="360" y1="280" x2="400" y2="338" stroke="${stroke}" stroke-width="10"/>`,
      };
  }
}

function buildExerciseImageDataUrl(
  name: string,
  bodyPart: string,
  modality: "bodyweight" | "machine",
): string {
  const styleKey = normalizeBodyPartForStyle(bodyPart);
  const style = muscleArtStyles[styleKey];
  const title = escapeSvgText(`${name}`.slice(0, 40));
  const subtitle = escapeSvgText(`${bodyPart} • ${modality}`);
  const figureStroke = modality === "bodyweight" ? "#f8fafc" : "#e5e7eb";
  const accent = modality === "bodyweight" ? "#2dd4bf" : style.accent;
  const poseLines = getPoseLines(style.pose, figureStroke);

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="720" height="420" viewBox="0 0 720 420" role="img" aria-label="${title} form example">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${style.bgStart}"/>
      <stop offset="100%" stop-color="${style.bgEnd}"/>
    </linearGradient>
  </defs>
  <rect width="720" height="420" fill="url(#bg)"/>
  <rect x="24" y="24" width="672" height="372" rx="20" fill="${style.panelFill}" stroke="${style.panelStroke}" stroke-width="2"/>
  ${style.motif}
  ${style.targetHighlight}
  <circle cx="360" cy="126" r="33" fill="${accent}"/>
  <line x1="360" y1="160" x2="360" y2="280" stroke="${figureStroke}" stroke-width="10"/>
  ${poseLines.armLines}
  ${poseLines.legLines}
  <text x="360" y="72" text-anchor="middle" fill="${style.titleColor}" font-size="28" font-family="Segoe UI, Arial, sans-serif">${title}</text>
  <text x="360" y="356" text-anchor="middle" fill="${style.subtitleColor}" font-size="20" font-family="Segoe UI, Arial, sans-serif">${subtitle}</text>
  <text x="360" y="386" text-anchor="middle" fill="#cbd5e1" font-size="18" font-family="Segoe UI, Arial, sans-serif">Control tempo • Full range • Stable core</text>
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function getExerciseImageDataUrl(
  name: string,
  bodyPart: string,
  modality: "bodyweight" | "machine",
): string {
  return buildExerciseImageDataUrl(name, bodyPart, modality);
}

function buildGenericExerciseDetail(
  name: string,
  bodyPart: string,
  modality: "bodyweight" | "machine",
  alternatives: string[],
  exerciseType: "compound" | "isolation" = "compound",
): ExerciseDetail {
  const imageUrl =
    bodyPartImageMap[bodyPart] ?? "/exercise-guides/full-body.svg";

  return {
    name,
    bodyPart,
    modality,
    exerciseType,
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

// Define which exercises are compound (multi-joint) vs isolation (single-joint)
const compoundExercises = new Set([
  "Push-up",
  "Incline push-up",
  "Decline push-up",
  "Dips",
  "Chest dips",
  "Pull-up",
  "Chin-up",
  "Weighted pull-up",
  "Assisted pull-up",
  "Inverted row",
  "Australian row",
  "Machine chest press",
  "Barbell bench press",
  "Incline barbell press",
  "Flat dumbbell press",
  "Incline dumbbell press",
  "Lat pulldown",
  "Seated cable row",
  "Seated close-grip row",
  "T-bar row",
  "Pendlay row",
  "One-arm dumbbell row",
  "Overhead press",
  "Standing OHP",
  "Seated shoulder press",
  "Bodyweight squat",
  "Back squat",
  "Front squat",
  "Goblet squat",
  "Hack squat",
  "Leg press",
  "Bulgarian split squat",
  "Split squat",
  "Deadlift",
  "Stiff-leg deadlift",
  "Romanian deadlift",
  "Nordic hamstring curl",
  "Close-grip bench press",
  "Chest-supported row",
  "Chest-supported T-bar row",
]);

function getExerciseType(name: string): "compound" | "isolation" {
  // Check if exercise is in compound set
  if (compoundExercises.has(name)) return "compound";

  // Heuristic: if exercise name contains isolation keywords, mark as isolation
  const isolationKeywords = [
    "curl",
    "raise",
    "fly",
    "extension",
    "pushdown",
    "hold",
    "leg curl",
    "leg extension",
    "calf raise",
  ];
  if (
    isolationKeywords.some((keyword) => name.toLowerCase().includes(keyword))
  ) {
    return "isolation";
  }

  return "compound"; // Default to compound for unknown exercises
}

const exerciseAliasMap: Record<string, string[]> = {
  "pull-up": ["pullup", "pull ups", "pullups", "chin over bar"],
  "chin-up": ["chinup", "chin ups", "chinups", "underhand pull-up"],
  "barbell bench press": ["bench press", "flat bench", "bb bench"],
  "flat dumbbell press": ["dumbbell bench press", "db bench", "flat db press"],
  "incline barbell press": ["incline bench", "incline barbell bench"],
  "machine chest press": ["chest press machine", "seated chest press"],
  "romanian deadlift": ["rdl", "romanian dl"],
  "stiff-leg deadlift": ["stiff leg deadlift", "sldl"],
  "lat pulldown": ["lat pull down", "pulldown", "lat pull"],
  "seated cable row": ["cable row", "seated row"],
  "one-arm dumbbell row": ["single arm row", "one arm row", "db row"],
  "overhead press": ["ohp", "shoulder press", "military press"],
  "seated shoulder press": ["machine shoulder press", "seated ohp"],
  "bodyweight squat": ["air squat", "bw squat"],
  "bulgarian split squat": ["bss", "rear foot elevated split squat"],
  "walking lunge": ["walking lunges", "lunge walk"],
  "cable triceps pushdown": [
    "tricep pushdown",
    "triceps push down",
    "cable pushdown",
  ],
  "rope triceps pressdown": ["rope pushdown", "rope tricep pushdown"],
  "hanging knee raise": ["knee raise", "captain chair knee raise"],
  "hanging leg raise": ["leg raise", "toes to bar progression"],
};

function normalizeExerciseSearchTerm(value: string): string {
  return value
    .toLowerCase()
    .replace(/[\-_/]+/g, " ")
    .replace(/[^a-z0-9 ]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function getExerciseSearchTerms(name: string): string[] {
  const canonical = normalizeExerciseSearchTerm(name);
  const mappedAliases = exerciseAliasMap[canonical] ?? [];
  return [canonical, ...mappedAliases.map(normalizeExerciseSearchTerm)];
}

const exerciseLibrary: Record<string, Omit<ExerciseDetail, "name">> = {
  "Flat dumbbell press": {
    bodyPart: "Chest",
    modality: "machine",
    exerciseType: "compound",
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
    exerciseType: "compound",
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
    exerciseType: "compound",
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
      getExerciseType(name),
    );
  }

  return {
    name,
    bodyPart: "Full Body",
    modality: "machine",
    exerciseType: getExerciseType(name),
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

// Find related exercises that share target muscles with the given exercise
export function getRelatedExercises(
  exerciseName: string,
  limit: number = 3,
): string[] {
  const catalog = getBodyPartExerciseCatalog();
  const exercise = getExerciseDetail(exerciseName);
  const allExercises = catalog.flatMap((entry) => [
    ...entry.bodyweight,
    ...entry.machine,
  ]);

  // Find exercises that share at least one target muscle
  const targetMuscles = new Set(exercise.targetMuscles);
  const related = allExercises
    .filter((name) => {
      if (name === exerciseName) return false;
      const other = getExerciseDetail(name);
      const overlap = other.targetMuscles.some((muscle) =>
        targetMuscles.has(muscle),
      );
      return overlap;
    })
    .slice(0, limit);

  return related;
}

// Get all exercises with a specific exercise type (compound or isolation)
export function getExercisesByType(
  exerciseType: "compound" | "isolation",
): BodyPartExerciseCatalog[] {
  const catalog = getBodyPartExerciseCatalog();
  return catalog.map((entry) => ({
    ...entry,
    bodyweight: entry.bodyweight.filter(
      (name) => getExerciseType(name) === exerciseType,
    ),
    machine: entry.machine.filter(
      (name) => getExerciseType(name) === exerciseType,
    ),
  }));
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
