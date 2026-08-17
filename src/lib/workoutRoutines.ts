export interface RoutineExercise {
  id: string;
  name: string;
  targetSets: number;
  targetReps: string; // e.g. "6-8", "8-10", "12-15"
  targetRpe?: number; // e.g. 8, 8.5, 9
  restSeconds?: number;
  notes?: string;
}

export interface RoutineDay {
  id: string;
  dayName: string; // e.g. "Push A", "Upper Power", "Legs 1"
  focus: string; // e.g. "Chest, Shoulders & Triceps"
  bodyParts: string[];
  exercises: RoutineExercise[];
}

export interface CustomRoutine {
  id: string;
  name: string;
  description: string;
  splitType: "ppl" | "upper_lower" | "full_body" | "bro_split" | "custom";
  daysPerWeek: number;
  days: RoutineDay[];
  createdAt: string;
  updatedAt: string;
  isTemplate?: boolean;
}

export const PRESET_ROUTINE_TEMPLATES: CustomRoutine[] = [
  {
    id: "template-ppl-6day",
    name: "Push / Pull / Legs (PPL)",
    description: "Classic 6-day hypertrophy split maximizing frequency and muscle group overlap.",
    splitType: "ppl",
    daysPerWeek: 6,
    isTemplate: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    days: [
      {
        id: "ppl-push-a",
        dayName: "Push A (Chest & Triceps Focus)",
        focus: "Chest, Front Delts & Triceps",
        bodyParts: ["Chest", "Shoulders", "Triceps"],
        exercises: [
          { id: "ppl-1", name: "Barbell Bench Press", targetSets: 4, targetReps: "6-8", targetRpe: 8, restSeconds: 180 },
          { id: "ppl-2", name: "Incline Dumbbell Press", targetSets: 3, targetReps: "8-10", targetRpe: 8, restSeconds: 120 },
          { id: "ppl-3", name: "Dumbbell Lateral Raise", targetSets: 4, targetReps: "12-15", targetRpe: 9, restSeconds: 90 },
          { id: "ppl-4", name: "Dips", targetSets: 3, targetReps: "8-12", targetRpe: 8.5, restSeconds: 120 },
          { id: "ppl-5", name: "Tricep Pushdown", targetSets: 3, targetReps: "12-15", targetRpe: 9, restSeconds: 90 },
        ],
      },
      {
        id: "ppl-pull-a",
        dayName: "Pull A (Back & Biceps Focus)",
        focus: "Lats, Upper Back & Biceps",
        bodyParts: ["Back", "Biceps", "Forearms"],
        exercises: [
          { id: "ppl-6", name: "Barbell Deadlift", targetSets: 3, targetReps: "5", targetRpe: 8, restSeconds: 240 },
          { id: "ppl-7", name: "Barbell Row", targetSets: 4, targetReps: "8-10", targetRpe: 8, restSeconds: 150 },
          { id: "ppl-8", name: "Pull-Up", targetSets: 3, targetReps: "6-10", targetRpe: 8.5, restSeconds: 120 },
          { id: "ppl-9", name: "Face Pull", targetSets: 3, targetReps: "15-20", targetRpe: 9, restSeconds: 60 },
          { id: "ppl-10", name: "Incline Dumbbell Curl", targetSets: 3, targetReps: "10-12", targetRpe: 8.5, restSeconds: 90 },
        ],
      },
      {
        id: "ppl-legs-a",
        dayName: "Legs A (Quad & Calves Focus)",
        focus: "Quads, Hamstrings & Calves",
        bodyParts: ["Legs", "Calves"],
        exercises: [
          { id: "ppl-11", name: "Barbell Squat", targetSets: 4, targetReps: "6-8", targetRpe: 8, restSeconds: 180 },
          { id: "ppl-12", name: "Romanian Deadlift", targetSets: 3, targetReps: "8-10", targetRpe: 8, restSeconds: 150 },
          { id: "ppl-13", name: "Leg Press", targetSets: 3, targetReps: "10-12", targetRpe: 8.5, restSeconds: 120 },
          { id: "ppl-14", name: "Leg Extension", targetSets: 3, targetReps: "12-15", targetRpe: 9, restSeconds: 90 },
          { id: "ppl-15", name: "Standing Calf Raise", targetSets: 4, targetReps: "15-20", targetRpe: 9, restSeconds: 60 },
        ],
      },
      {
        id: "ppl-push-b",
        dayName: "Push B (Shoulders Focus)",
        focus: "Overhead Strength & Upper Chest",
        bodyParts: ["Shoulders", "Chest", "Triceps"],
        exercises: [
          { id: "ppl-16", name: "Overhead Press", targetSets: 4, targetReps: "6-8", targetRpe: 8, restSeconds: 180 },
          { id: "ppl-17", name: "Dumbbell Bench Press", targetSets: 3, targetReps: "8-10", targetRpe: 8, restSeconds: 120 },
          { id: "ppl-18", name: "Cable Lateral Raise", targetSets: 4, targetReps: "12-15", targetRpe: 9, restSeconds: 60 },
          { id: "ppl-19", name: "Chest Fly", targetSets: 3, targetReps: "12-15", targetRpe: 9, restSeconds: 90 },
          { id: "ppl-20", name: "Skull Crusher", targetSets: 3, targetReps: "10-12", targetRpe: 8.5, restSeconds: 90 },
        ],
      },
      {
        id: "ppl-pull-b",
        dayName: "Pull B (Lat Width & Upper Back)",
        focus: "Lat Width & Bicep Peak",
        bodyParts: ["Back", "Biceps"],
        exercises: [
          { id: "ppl-21", name: "Lat Pulldown", targetSets: 4, targetReps: "8-10", targetRpe: 8, restSeconds: 120 },
          { id: "ppl-22", name: "Seated Cable Row", targetSets: 3, targetReps: "10-12", targetRpe: 8, restSeconds: 90 },
          { id: "ppl-23", name: "Chest Supported Row", targetSets: 3, targetReps: "10-12", targetRpe: 8.5, restSeconds: 90 },
          { id: "ppl-24", name: "Hammer Curl", targetSets: 3, targetReps: "10-12", targetRpe: 9, restSeconds: 90 },
          { id: "ppl-25", name: "Preacher Curl", targetSets: 3, targetReps: "12-15", targetRpe: 9, restSeconds: 60 },
        ],
      },
      {
        id: "ppl-legs-b",
        dayName: "Legs B (Posterior Chain Focus)",
        focus: "Hamstrings, Glutes & Quads",
        bodyParts: ["Legs", "Glutes", "Calves"],
        exercises: [
          { id: "ppl-26", name: "Romanian Deadlift", targetSets: 4, targetReps: "8-10", targetRpe: 8, restSeconds: 150 },
          { id: "ppl-27", name: "Barbell Hip Thrust", targetSets: 3, targetReps: "10-12", targetRpe: 8.5, restSeconds: 120 },
          { id: "ppl-28", name: "Bulgarian Split Squat", targetSets: 3, targetReps: "8-10", targetRpe: 9, restSeconds: 90 },
          { id: "ppl-29", name: "Lying Leg Curl", targetSets: 3, targetReps: "12-15", targetRpe: 9, restSeconds: 90 },
          { id: "ppl-30", name: "Seated Calf Raise", targetSets: 4, targetReps: "15-20", targetRpe: 9, restSeconds: 60 },
        ],
      },
    ],
  },
  {
    id: "template-upper-lower-4day",
    name: "Upper / Lower (4-Day)",
    description: "High-efficiency 4-day split perfect for strength, hypertrophy, and busy schedules.",
    splitType: "upper_lower",
    daysPerWeek: 4,
    isTemplate: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    days: [
      {
        id: "ul-upper-1",
        dayName: "Upper Power (Day 1)",
        focus: "Heavy Compound Pushing & Pulling",
        bodyParts: ["Chest", "Back", "Shoulders", "Arms"],
        exercises: [
          { id: "ul-1", name: "Barbell Bench Press", targetSets: 4, targetReps: "5-6", targetRpe: 8, restSeconds: 180 },
          { id: "ul-2", name: "Barbell Row", targetSets: 4, targetReps: "6-8", targetRpe: 8, restSeconds: 150 },
          { id: "ul-3", name: "Overhead Press", targetSets: 3, targetReps: "6-8", targetRpe: 8, restSeconds: 120 },
          { id: "ul-4", name: "Pull-Up", targetSets: 3, targetReps: "6-8", targetRpe: 8.5, restSeconds: 120 },
          { id: "ul-5", name: "Barbell Curl", targetSets: 3, targetReps: "8-10", targetRpe: 8.5, restSeconds: 90 },
        ],
      },
      {
        id: "ul-lower-1",
        dayName: "Lower Power (Day 2)",
        focus: "Heavy Squat & Hamstrings",
        bodyParts: ["Legs", "Calves"],
        exercises: [
          { id: "ul-6", name: "Barbell Squat", targetSets: 4, targetReps: "5-6", targetRpe: 8, restSeconds: 180 },
          { id: "ul-7", name: "Romanian Deadlift", targetSets: 3, targetReps: "6-8", targetRpe: 8, restSeconds: 150 },
          { id: "ul-8", name: "Leg Press", targetSets: 3, targetReps: "8-10", targetRpe: 8.5, restSeconds: 120 },
          { id: "ul-9", name: "Standing Calf Raise", targetSets: 4, targetReps: "10-12", targetRpe: 9, restSeconds: 60 },
          { id: "ul-10", name: "Hanging Leg Raise", targetSets: 3, targetReps: "12-15", targetRpe: 8.5, restSeconds: 60 },
        ],
      },
      {
        id: "ul-upper-2",
        dayName: "Upper Hypertrophy (Day 3)",
        focus: "Volume Chest, Lats & Arms",
        bodyParts: ["Chest", "Back", "Shoulders", "Arms"],
        exercises: [
          { id: "ul-11", name: "Incline Dumbbell Press", targetSets: 4, targetReps: "8-10", targetRpe: 8, restSeconds: 120 },
          { id: "ul-12", name: "Lat Pulldown", targetSets: 4, targetReps: "10-12", targetRpe: 8, restSeconds: 90 },
          { id: "ul-13", name: "Dumbbell Lateral Raise", targetSets: 4, targetReps: "12-15", targetRpe: 9, restSeconds: 60 },
          { id: "ul-14", name: "Chest Fly", targetSets: 3, targetReps: "12-15", targetRpe: 9, restSeconds: 60 },
          { id: "ul-15", name: "Tricep Pushdown", targetSets: 3, targetReps: "12-15", targetRpe: 9, restSeconds: 60 },
        ],
      },
      {
        id: "ul-lower-2",
        dayName: "Lower Hypertrophy (Day 4)",
        focus: "Deadlift & Quad/Glute Volume",
        bodyParts: ["Legs", "Glutes", "Calves"],
        exercises: [
          { id: "ul-16", name: "Barbell Deadlift", targetSets: 3, targetReps: "5", targetRpe: 8, restSeconds: 240 },
          { id: "ul-17", name: "Bulgarian Split Squat", targetSets: 3, targetReps: "8-10", targetRpe: 8.5, restSeconds: 90 },
          { id: "ul-18", name: "Leg Extension", targetSets: 3, targetReps: "12-15", targetRpe: 9, restSeconds: 60 },
          { id: "ul-19", name: "Lying Leg Curl", targetSets: 3, targetReps: "12-15", targetRpe: 9, restSeconds: 60 },
          { id: "ul-20", name: "Seated Calf Raise", targetSets: 4, targetReps: "15-20", targetRpe: 9, restSeconds: 60 },
        ],
      },
    ],
  },
  {
    id: "template-full-body-3day",
    name: "Full Body Strength (3-Day)",
    description: "Time-tested 3-day full body training hitting each major muscle group 3x weekly.",
    splitType: "full_body",
    daysPerWeek: 3,
    isTemplate: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    days: [
      {
        id: "fb-day-1",
        dayName: "Full Body A (Monday)",
        focus: "Squat, Bench Press & Row",
        bodyParts: ["Legs", "Chest", "Back"],
        exercises: [
          { id: "fb-1", name: "Barbell Squat", targetSets: 3, targetReps: "5", targetRpe: 8, restSeconds: 180 },
          { id: "fb-2", name: "Barbell Bench Press", targetSets: 3, targetReps: "5", targetRpe: 8, restSeconds: 180 },
          { id: "fb-3", name: "Barbell Row", targetSets: 3, targetReps: "6-8", targetRpe: 8, restSeconds: 120 },
          { id: "fb-4", name: "Dumbbell Lateral Raise", targetSets: 3, targetReps: "12-15", targetRpe: 9, restSeconds: 60 },
          { id: "fb-5", name: "Dumbbell Curl", targetSets: 2, targetReps: "10-12", targetRpe: 8.5, restSeconds: 60 },
        ],
      },
      {
        id: "fb-day-2",
        dayName: "Full Body B (Wednesday)",
        focus: "Deadlift, Overhead Press & Pull-Ups",
        bodyParts: ["Back", "Shoulders", "Arms"],
        exercises: [
          { id: "fb-6", name: "Barbell Deadlift", targetSets: 3, targetReps: "5", targetRpe: 8, restSeconds: 240 },
          { id: "fb-7", name: "Overhead Press", targetSets: 3, targetReps: "5", targetRpe: 8, restSeconds: 180 },
          { id: "fb-8", name: "Pull-Up", targetSets: 3, targetReps: "6-8", targetRpe: 8.5, restSeconds: 120 },
          { id: "fb-9", name: "Leg Press", targetSets: 3, targetReps: "10-12", targetRpe: 8, restSeconds: 90 },
          { id: "fb-10", name: "Tricep Pushdown", targetSets: 2, targetReps: "12-15", targetRpe: 9, restSeconds: 60 },
        ],
      },
      {
        id: "fb-day-3",
        dayName: "Full Body C (Friday)",
        focus: "Squat Volume, Incline Press & Accessories",
        bodyParts: ["Legs", "Chest", "Back"],
        exercises: [
          { id: "fb-11", name: "Barbell Squat", targetSets: 3, targetReps: "8", targetRpe: 8, restSeconds: 150 },
          { id: "fb-12", name: "Incline Dumbbell Press", targetSets: 3, targetReps: "8-10", targetRpe: 8, restSeconds: 120 },
          { id: "fb-13", name: "Lat Pulldown", targetSets: 3, targetReps: "10-12", targetRpe: 8, restSeconds: 90 },
          { id: "fb-14", name: "Romanian Deadlift", targetSets: 3, targetReps: "8-10", targetRpe: 8, restSeconds: 120 },
          { id: "fb-15", name: "Face Pull", targetSets: 3, targetReps: "15-20", targetRpe: 9, restSeconds: 60 },
        ],
      },
    ],
  },
];

/**
 * Creates a unique new custom routine with a given template or blank split
 */
export function createNewRoutine(
  name: string,
  splitType: CustomRoutine["splitType"] = "custom",
  daysCount: number = 3,
): CustomRoutine {
  const timestamp = new Date().toISOString();
  const id = `custom-routine-${Date.now()}`;

  const days: RoutineDay[] = Array.from({ length: daysCount }, (_, i) => ({
    id: `${id}-day-${i + 1}`,
    dayName: `Day ${i + 1}`,
    focus: "General Training",
    bodyParts: ["Full Body"],
    exercises: [
      {
        id: `${id}-ex-${i + 1}-1`,
        name: "Barbell Squat",
        targetSets: 3,
        targetReps: "8-10",
        targetRpe: 8,
        restSeconds: 120,
      },
    ],
  }));

  return {
    id,
    name,
    description: `Custom ${daysCount}-day workout routine`,
    splitType,
    daysPerWeek: daysCount,
    days,
    createdAt: timestamp,
    updatedAt: timestamp,
    isTemplate: false,
  };
}

/**
 * Clones a preset template into a user's editable custom routine
 */
export function cloneRoutineTemplate(templateId: string, customName?: string): CustomRoutine | null {
  const template = PRESET_ROUTINE_TEMPLATES.find((t) => t.id === templateId);
  if (!template) return null;

  const timestamp = new Date().toISOString();
  const newId = `custom-routine-${Date.now()}`;

  return {
    ...template,
    id: newId,
    name: customName || `${template.name} (Custom)`,
    isTemplate: false,
    createdAt: timestamp,
    updatedAt: timestamp,
    days: template.days.map((d, dIdx) => ({
      ...d,
      id: `${newId}-day-${dIdx + 1}`,
      exercises: d.exercises.map((ex, exIdx) => ({
        ...ex,
        id: `${newId}-day-${dIdx + 1}-ex-${exIdx + 1}`,
      })),
    })),
  };
}
