export type WeightUnit = "kg" | "lbs";

export interface PlateDefinition {
  weight: number;
  color: string;
  textColor: string;
  diameterRatio: number; // Ratio relative to standard 450mm full-sized bumper (1.0)
  widthRatio: number; // Width relative to thick bumper
  label: string;
}

export const METRIC_PLATES: PlateDefinition[] = [
  { weight: 25, color: "#ef4444", textColor: "#ffffff", diameterRatio: 1.0, widthRatio: 1.2, label: "25 kg" },
  { weight: 20, color: "#3b82f6", textColor: "#ffffff", diameterRatio: 1.0, widthRatio: 1.0, label: "20 kg" },
  { weight: 15, color: "#eab308", textColor: "#000000", diameterRatio: 0.9, widthRatio: 0.85, label: "15 kg" },
  { weight: 10, color: "#22c55e", textColor: "#ffffff", diameterRatio: 0.78, widthRatio: 0.7, label: "10 kg" },
  { weight: 5, color: "#f4f4f5", textColor: "#18181b", diameterRatio: 0.58, widthRatio: 0.55, label: "5 kg" },
  { weight: 2.5, color: "#27272a", textColor: "#ffffff", diameterRatio: 0.48, widthRatio: 0.45, label: "2.5 kg" },
  { weight: 1.25, color: "#a1a1aa", textColor: "#18181b", diameterRatio: 0.38, widthRatio: 0.35, label: "1.25 kg" },
  { weight: 0.5, color: "#06b6d4", textColor: "#ffffff", diameterRatio: 0.3, widthRatio: 0.25, label: "0.5 kg" },
];

export const IMPERIAL_PLATES: PlateDefinition[] = [
  { weight: 55, color: "#ef4444", textColor: "#ffffff", diameterRatio: 1.0, widthRatio: 1.2, label: "55 lb" },
  { weight: 45, color: "#3b82f6", textColor: "#ffffff", diameterRatio: 1.0, widthRatio: 1.0, label: "45 lb" },
  { weight: 35, color: "#eab308", textColor: "#000000", diameterRatio: 0.9, widthRatio: 0.85, label: "35 lb" },
  { weight: 25, color: "#22c55e", textColor: "#ffffff", diameterRatio: 0.78, widthRatio: 0.7, label: "25 lb" },
  { weight: 10, color: "#f4f4f5", textColor: "#18181b", diameterRatio: 0.58, widthRatio: 0.55, label: "10 lb" },
  { weight: 5, color: "#27272a", textColor: "#ffffff", diameterRatio: 0.48, widthRatio: 0.45, label: "5 lb" },
  { weight: 2.5, color: "#a1a1aa", textColor: "#18181b", diameterRatio: 0.38, widthRatio: 0.35, label: "2.5 lb" },
  { weight: 1.25, color: "#06b6d4", textColor: "#ffffff", diameterRatio: 0.3, widthRatio: 0.25, label: "1.25 lb" },
];

export interface BarbellPreset {
  id: string;
  name: string;
  weightKg: number;
  weightLbs: number;
  description: string;
}

export const BARBELL_PRESETS: BarbellPreset[] = [
  { id: "olympic_mens", name: "Standard Men's Olympic Bar", weightKg: 20, weightLbs: 45, description: "20kg (45lbs), 28mm shaft, 220cm length" },
  { id: "olympic_womens", name: "Standard Women's Olympic Bar", weightKg: 15, weightLbs: 35, description: "15kg (35lbs), 25mm shaft, 201cm length" },
  { id: "technique_bar", name: "Technique / Junior Bar", weightKg: 10, weightLbs: 22, description: "10kg (22lbs) lightweight practice bar" },
  { id: "trap_bar", name: "Hex / Trap Bar", weightKg: 25, weightLbs: 55, description: "25kg (55lbs) heavy hex deadlift bar" },
  { id: "smith_machine", name: "Smith Machine Bar (Counterbalanced)", weightKg: 7, weightLbs: 15, description: "Typical counterbalanced smith machine carriage" },
];

export interface PlateCalculationOptions {
  targetWeight: number;
  barWeight: number;
  collarWeight?: number; // per pair (i.e. total added collar weight)
  unit: WeightUnit;
  availablePlateWeights?: number[]; // subset of plate weights available in gym
}

export interface PlateCount {
  plate: PlateDefinition;
  countPerSide: number;
  totalCount: number;
}

export interface PlateCalculationResult {
  targetWeight: number;
  actualLoadedWeight: number;
  barWeight: number;
  collarWeight: number;
  weightPerSide: number;
  platesPerSide: PlateDefinition[];
  plateCounts: PlateCount[];
  remainder: number;
  unit: WeightUnit;
  isExact: boolean;
}

export function calculatePlates(options: PlateCalculationOptions): PlateCalculationResult {
  const {
    targetWeight,
    barWeight,
    collarWeight = 0,
    unit,
    availablePlateWeights,
  } = options;

  const allDefinitions = unit === "kg" ? METRIC_PLATES : IMPERIAL_PLATES;

  // Filter available plates
  const usablePlates = availablePlateWeights
    ? allDefinitions.filter((p) => availablePlateWeights.includes(p.weight))
    : allDefinitions;

  // Sort descending
  const sortedPlates = [...usablePlates].sort((a, b) => b.weight - a.weight);

  const baseWeight = barWeight + collarWeight;
  const weightNeededTotal = Math.max(0, targetWeight - baseWeight);
  let weightNeededPerSide = weightNeededTotal / 2;

  const platesPerSide: PlateDefinition[] = [];
  const plateCountMap = new Map<number, { plate: PlateDefinition; count: number }>();

  // Initialize count map
  sortedPlates.forEach((p) => {
    plateCountMap.set(p.weight, { plate: p, count: 0 });
  });

  // Greedy plate selection per side
  for (const plate of sortedPlates) {
    while (weightNeededPerSide >= plate.weight - 0.0001) {
      platesPerSide.push(plate);
      weightNeededPerSide -= plate.weight;
      const entry = plateCountMap.get(plate.weight);
      if (entry) {
        entry.count += 1;
      }
    }
  }

  const loadedWeightPerSide = platesPerSide.reduce((sum, p) => sum + p.weight, 0);
  const actualLoadedWeight = baseWeight + loadedWeightPerSide * 2;
  const remainder = Number((targetWeight - actualLoadedWeight).toFixed(2));
  const isExact = Math.abs(remainder) < 0.001;

  const plateCounts: PlateCount[] = Array.from(plateCountMap.values())
    .filter((entry) => entry.count > 0)
    .map((entry) => ({
      plate: entry.plate,
      countPerSide: entry.count,
      totalCount: entry.count * 2,
    }));

  return {
    targetWeight,
    actualLoadedWeight,
    barWeight,
    collarWeight,
    weightPerSide: loadedWeightPerSide,
    platesPerSide,
    plateCounts,
    remainder,
    unit,
    isExact,
  };
}

export interface WarmupSet {
  setNumber: number;
  percentage: number;
  targetWeight: number;
  reps: number;
  note: string;
  calculation: PlateCalculationResult;
}

export function generateWarmupPyramid(
  workingWeight: number,
  barWeight: number,
  unit: WeightUnit,
  availablePlateWeights?: number[],
): WarmupSet[] {
  // If target weight is less than or equal to bar weight, warm-up is simply the bar
  if (workingWeight <= barWeight) {
    const calc = calculatePlates({ targetWeight: barWeight, barWeight, unit, availablePlateWeights });
    return [
      {
        setNumber: 1,
        percentage: 100,
        targetWeight: barWeight,
        reps: 10,
        note: "Empty Bar Warm-up",
        calculation: calc,
      },
    ];
  }

  const stepRounding = unit === "kg" ? 2.5 : 5;

  const roundToStep = (val: number) => {
    return Math.max(barWeight, Math.round(val / stepRounding) * stepRounding);
  };

  const steps = [
    { pct: 0, reps: 10, note: "Empty Bar Activation & Mobility" },
    { pct: 0.45, reps: 5, note: "Light Explosive Groove" },
    { pct: 0.65, reps: 3, note: "Moderate Loading & Technique" },
    { pct: 0.80, reps: 2, note: "Heavy Acclimation" },
    { pct: 0.90, reps: 1, note: "Final Potentiation Single" },
    { pct: 1.00, reps: 5, note: "🔥 Target Working Weight" },
  ];

  return steps.map((step, idx) => {
    const rawWeight = step.pct === 0 ? barWeight : workingWeight * step.pct;
    const targetWeight = step.pct === 1.00 ? workingWeight : roundToStep(rawWeight);
    const calc = calculatePlates({
      targetWeight,
      barWeight,
      unit,
      availablePlateWeights,
    });

    return {
      setNumber: idx + 1,
      percentage: Math.round(step.pct * 100),
      targetWeight,
      reps: step.reps,
      note: step.note,
      calculation: calc,
    };
  });
}
