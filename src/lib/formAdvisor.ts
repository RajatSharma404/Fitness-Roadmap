export interface MovementFault {
  id: string;
  name: string;
  symptomDescription: string;
  rootCauses: string[];
  instantVerbalCues: string[];
  correctiveDrills: Array<{
    name: string;
    description: string;
    recommendedSetsReps: string;
  }>;
  severity: "MILD" | "MODERATE" | "HIGH_INJURY_RISK";
}

export interface ExerciseFormGuide {
  exerciseId: string;
  exerciseName: string;
  primaryMuscles: string[];
  setupChecklist: string[];
  executionChecklist: string[];
  commonFaults: MovementFault[];
}

export const FORM_ADVISOR_DATABASE: Record<string, ExerciseFormGuide> = {
  squat: {
    exerciseId: "squat",
    exerciseName: "Barbell Back Squat",
    primaryMuscles: ["Quads", "Glutes", "Adductors", "Core"],
    setupChecklist: [
      "Set bar at collarbone height; grip bar firmly with thumbs over or around.",
      "Pull shoulders tight under bar to build a solid upper-back shelf (high or low bar).",
      "Take 2-3 steps back; feet shoulder-width apart, toes flared 15-30 degrees.",
      "Brace core 360-degrees into belt as if taking a punch.",
    ],
    executionChecklist: [
      "Break at hips and knees simultaneously; spread the floor with your feet.",
      "Drive knees in line with toes; descend until hip crease is below top of knee.",
      "Rebound smoothly; drive upper back into bar out of the hole.",
    ],
    commonFaults: [
      {
        id: "squat-knee-valgus",
        name: "Knees Caving Inward (Knee Valgus)",
        symptomDescription: "Knees collapse inward towards each other when ascending out of the bottom of the squat.",
        rootCauses: [
          "Weak gluteus medius / hip external rotators failing under load.",
          "Stance width is too wide for hip anatomy.",
          "Feet collapsing into pronation due to poor ankle dorsiflexion.",
        ],
        instantVerbalCues: [
          "Screw your feet into the floor (right foot clockwise, left foot counter-clockwise).",
          "Spread the floor apart with the sides of your shoes.",
          "Track knees out over your pinky toes.",
        ],
        correctiveDrills: [
          {
            name: "Banded Goblet Squats (Mini-band around knees)",
            description: "Forces glute medius activation against band resistance throughout the entire range of motion.",
            recommendedSetsReps: "3 sets × 12 reps (Warm-up)",
          },
          {
            name: "Tempo 3-1-1 Pause Squats",
            description: "3 second descent with 1 second pause in the hole to reinforce knee position under control.",
            recommendedSetsReps: "3 sets × 5 reps",
          },
        ],
        severity: "MODERATE",
      },
      {
        id: "squat-butt-wink",
        name: "Butt Wink (Pelvic Tucking / Lumbar Flexion in the Hole)",
        symptomDescription: "Pelvis tilts posterior and lower back rounds at deep squat depth.",
        rootCauses: [
          "Squatting deeper than hip bone socket anatomy permits with current stance.",
          "Stiff adductors or ankle mobility limitations forcing lumbar compensation.",
          "Loss of core 360 brace before initiation.",
        ],
        instantVerbalCues: [
          "Keep your ribs pulled down to your belt buckle; do not flare ribs.",
          "Squat to parallel depth where you can maintain a rigid neutral spine.",
          "Widen stance slightly and flare toes out 5-10 degrees more.",
        ],
        correctiveDrills: [
          {
            name: "Box Squats to Parallel",
            description: "Teaches precise depth control and prevents lumbar rounding at reversal.",
            recommendedSetsReps: "4 sets × 6 reps",
          },
          {
            name: "Ankle Dorsiflexion Knee-to-Wall Mobilization",
            description: "Improves forward tibial translation to reduce pelvic tuck compensation.",
            recommendedSetsReps: "2 sets × 15 reps/side",
          },
        ],
        severity: "HIGH_INJURY_RISK",
      },
      {
        id: "squat-forward-pitch",
        name: "Good-Morning Squat (Hips Shoot Up First / Forward Bar Drift)",
        symptomDescription: "Chest collapses forward and hips rise faster than shoulders, turning the squat into a lower back extension.",
        rootCauses: [
          "Quad weakness relative to posterior chain.",
          "Loss of upper back tightness (lat engagement).",
          "Weight shifting to toes instead of mid-foot.",
        ],
        instantVerbalCues: [
          "Drive your traps and upper back hard into the bar on the way up.",
          "Stay heavy in your mid-foot and whole foot.",
          "Lead with the chest out of the hole.",
        ],
        correctiveDrills: [
          {
            name: "Pin Squats / Anderson Squats (from parallel pins)",
            description: "Dead-stop concentric forces strict quad engagement without cheating forward.",
            recommendedSetsReps: "4 sets × 4 reps",
          },
          {
            name: "Front Squats or Safety Bar Squats",
            description: "Demands upright thoracic posture and quad drive.",
            recommendedSetsReps: "3 sets × 8 reps",
          },
        ],
        severity: "MODERATE",
      },
    ],
  },
  bench: {
    exerciseId: "bench",
    exerciseName: "Barbell Bench Press",
    primaryMuscles: ["Pectorals", "Triceps", "Anterior Deltoids", "Lats"],
    setupChecklist: [
      "Lie with eyes directly under the racked bar; plant feet firmly on the floor.",
      "Retract and depress shoulder blades (pinch shoulder blades into your back pockets).",
      "Grip bar with a suicide or full grip, wrists stacked over elbows.",
      "Create a natural thoracic arch while keeping glutes in solid contact with bench.",
    ],
    executionChecklist: [
      "Unrack bar and pull it over chest with lats engaged (like bending the bar).",
      "Tuck elbows ~45-75 degrees; touch lower chest/sternum under control.",
      "Drive legs into the floor and press bar up and slightly back over shoulders.",
    ],
    commonFaults: [
      {
        id: "bench-flared-elbows",
        name: "Flared Elbows at 90 Degrees (Shoulder Impingement)",
        symptomDescription: "Elbows flare out wide in line with shoulders, causing extreme anterior shoulder stress.",
        rootCauses: [
          "Lats not engaged during descent.",
          "Grip is too wide for limb length.",
          "Focusing purely on pressing up rather than tucking on the way down.",
        ],
        instantVerbalCues: [
          "Bend the bar in half like a horseshoe to tuck your elbows.",
          "Put your shoulder blades in your back pockets and keep them glued to the pad.",
          "Touch the bar to your lower sternum, not your throat.",
        ],
        correctiveDrills: [
          {
            name: "Spoto Press (Pause 1-inch above chest)",
            description: "Forces constant lat and pec engagement without resting bar on ribs.",
            recommendedSetsReps: "3 sets × 6 reps",
          },
          {
            name: "Close-Grip Bench Press",
            description: "Naturally reinforces proper elbow tuck and tricep recruitment.",
            recommendedSetsReps: "3 sets × 8 reps",
          },
        ],
        severity: "HIGH_INJURY_RISK",
      },
      {
        id: "bench-butt-lift",
        name: "Glutes Lifting Off the Bench",
        symptomDescription: "Hips and butt lift off the bench pad during heavy concentric pressing.",
        rootCauses: [
          "Pushing straight up with legs rather than backward along the bench.",
          "Improper foot placement too far back or underneath hips.",
        ],
        instantVerbalCues: [
          "Push the floor forward away from you with your quads (like leg extensions).",
          "Glue your glutes to the bench leather throughout the entire rep.",
        ],
        correctiveDrills: [
          {
            name: "Feet-Up Bench Press (Larsen Press)",
            description: "Eliminates leg cheating to develop strict upper body tightness.",
            recommendedSetsReps: "3 sets × 8 reps",
          },
        ],
        severity: "MILD",
      },
    ],
  },
  deadlift: {
    exerciseId: "deadlift",
    exerciseName: "Barbell Conventional / Sumo Deadlift",
    primaryMuscles: ["Hamstrings", "Glutes", "Spinal Erectors", "Lats", "Traps"],
    setupChecklist: [
      "Walk up to bar until it is 1 inch from shins (over mid-foot).",
      "Hinge at hips; grip bar just outside knees without moving the bar.",
      "Bend knees until shins touch the bar; squeeze chest up and pull slack out of the bar.",
      "Pull lats down into armpits ('protect your armpits from tickling').",
    ],
    executionChecklist: [
      "Push the floor away with your legs like a leg press.",
      "Keep bar in continuous drag contact with shins and thighs.",
      "Lock out by squeezing glutes forward (stand tall, do not hyperextend lower back).",
    ],
    commonFaults: [
      {
        id: "deadlift-lumbar-rounding",
        name: "Lower Back Rounding (Lumbar Flexion under Load)",
        symptomDescription: "Spine rounds into a flexed curve during setup or breaking off the floor.",
        rootCauses: [
          "Failing to pull slack out of the bar before pulling.",
          "Weak core bracing / lack of intra-abdominal pressure.",
          "Hips starting too low or too high for individual levers.",
        ],
        instantVerbalCues: [
          "Pull the click/slack out of the bar before pushing the floor.",
          "Show the logo on your shirt to the wall in front of you.",
          "Engage lats: squeeze oranges in your armpits.",
        ],
        correctiveDrills: [
          {
            name: "Paused Deadlifts (1-inch off floor)",
            description: "Forces perfect neutral spine maintenance through the highest shear load point.",
            recommendedSetsReps: "3 sets × 4 reps",
          },
          {
            name: "McGill Big 3 (Bird Dog, Side Plank, Curl-up)",
            description: "Builds bulletproof isometric spinal stability.",
            recommendedSetsReps: "2 rounds daily",
          },
        ],
        severity: "HIGH_INJURY_RISK",
      },
      {
        id: "deadlift-stripper-pull",
        name: "Hips Shooting Up First (Stripper Pull)",
        symptomDescription: "Hips rise immediately before the bar leaves the floor, converting the lift into a stiff-leg deadlift.",
        rootCauses: [
          "Starting with hips too low like a squat.",
          "Quad weakness off the floor.",
          "Bar starting too far in front of mid-foot.",
        ],
        instantVerbalCues: [
          "Start with your hips higher, shoulders slightly in front of the bar.",
          "Push the floor away with your quads before opening your hips.",
          "Keep your back angle frozen until the bar passes your knees.",
        ],
        correctiveDrills: [
          {
            name: "Deficit Deadlifts (1-2 inch block)",
            description: "Increases leg drive requirement and forces quad initiation off the floor.",
            recommendedSetsReps: "3 sets × 5 reps",
          },
        ],
        severity: "MODERATE",
      },
    ],
  },
};

/**
 * Searches the form advisor database by exercise name
 */
export function getFormGuideForExercise(exerciseName: string): ExerciseFormGuide {
  const norm = exerciseName.toLowerCase();
  if (norm.includes("squat")) return FORM_ADVISOR_DATABASE.squat;
  if (norm.includes("bench")) return FORM_ADVISOR_DATABASE.bench;
  if (norm.includes("deadlift") || norm.includes("rdl")) return FORM_ADVISOR_DATABASE.deadlift;
  return FORM_ADVISOR_DATABASE.squat;
}

/**
 * Diagnoses a specific fault by exercise and faultId
 */
export function diagnoseMovementFault(
  exerciseName: string,
  faultId: string,
): MovementFault | null {
  const guide = getFormGuideForExercise(exerciseName);
  return guide.commonFaults.find((f) => f.id === faultId) || null;
}
