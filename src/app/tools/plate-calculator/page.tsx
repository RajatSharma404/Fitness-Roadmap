"use client";

import { useState, useMemo } from "react";
import {
  WeightUnit,
  BARBELL_PRESETS,
  METRIC_PLATES,
  IMPERIAL_PLATES,
  calculatePlates,
  generateWarmupPyramid,
} from "@/lib/plateCalculator";
import { Card, SectionHeader } from "@/components/shared/UIPrimitives";
import { VisualBarbell } from "@/components/tools/VisualBarbell";
import { WarmupPyramid } from "@/components/tools/WarmupPyramid";
import { Percent, Check } from "lucide-react";
import { cn } from "@/lib/cn";

export default function PlateCalculatorPage() {
  const [unit, setUnit] = useState<WeightUnit>("kg");
  const [targetWeight, setTargetWeight] = useState<number>(100);
  const [selectedBarId, setSelectedBarId] = useState<string>("olympic_mens");
  const [customBarWeight, setCustomBarWeight] = useState<number>(20);
  const [collarWeight, setCollarWeight] = useState<number>(0);
  const [disabledPlateWeights, setDisabledPlateWeights] = useState<number[]>([]);

  // Resolve current bar weight
  const currentBarWeight = useMemo(() => {
    if (selectedBarId === "custom") {
      return customBarWeight;
    }
    const preset = BARBELL_PRESETS.find((p) => p.id === selectedBarId);
    if (!preset) return unit === "kg" ? 20 : 45;
    return unit === "kg" ? preset.weightKg : preset.weightLbs;
  }, [selectedBarId, customBarWeight, unit]);

  // All plates available for the current unit
  const allPlates = unit === "kg" ? METRIC_PLATES : IMPERIAL_PLATES;

  // Filter available plate weights
  const availablePlateWeights = useMemo(() => {
    return allPlates
      .filter((p) => !disabledPlateWeights.includes(p.weight))
      .map((p) => p.weight);
  }, [allPlates, disabledPlateWeights]);

  // Calculate plate loading breakdown
  const calculation = useMemo(() => {
    return calculatePlates({
      targetWeight,
      barWeight: currentBarWeight,
      collarWeight,
      unit,
      availablePlateWeights,
    });
  }, [targetWeight, currentBarWeight, collarWeight, unit, availablePlateWeights]);

  // Generate Warmup Ramp
  const warmupSets = useMemo(() => {
    return generateWarmupPyramid(
      targetWeight,
      currentBarWeight,
      unit,
      availablePlateWeights,
    );
  }, [targetWeight, currentBarWeight, unit, availablePlateWeights]);

  // Quick delta adjustments
  const adjustWeight = (delta: number) => {
    setTargetWeight((prev) => Math.max(currentBarWeight, Number((prev + delta).toFixed(2))));
  };

  // Toggle plate in inventory
  const togglePlateAvailability = (weight: number) => {
    setDisabledPlateWeights((prev) =>
      prev.includes(weight) ? prev.filter((w) => w !== weight) : [...prev, weight],
    );
  };

  // Percentage Matrix Breakdown
  const percentageMatrix = useMemo(() => {
    const percentages = [50, 60, 70, 75, 80, 85, 90, 95, 100];
    const step = unit === "kg" ? 2.5 : 5;

    return percentages.map((pct) => {
      const raw = (targetWeight * pct) / 100;
      const rounded = Math.max(currentBarWeight, Math.round(raw / step) * step);
      const calc = calculatePlates({
        targetWeight: rounded,
        barWeight: currentBarWeight,
        collarWeight,
        unit,
        availablePlateWeights,
      });

      return {
        percentage: pct,
        weight: rounded,
        calc,
      };
    });
  }, [targetWeight, currentBarWeight, collarWeight, unit, availablePlateWeights]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <Card
        level="elevated"
        className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-[#0d131f] via-[#121124] to-[#1a111a] border-white/10"
      >
        <div className="space-y-1">
          <span className="lab-kicker text-cyan-400">Strength Utilities</span>
          <h2 className="font-display text-[28px] font-bold text-[#eeeef2] flex items-center gap-3">
            Visual Olympic Barbell Plate Calculator
          </h2>
          <p className="text-sm text-[#8e8ea6]">
            Interactive 2D barbell sleeve loading, custom collars, inventory filtering, and warm-up sets.
          </p>
        </div>

        {/* Unit Switcher */}
        <div className="flex items-center gap-2 bg-white/[0.04] p-1.5 rounded-xl border border-white/10">
          <button
            type="button"
            onClick={() => {
              if (unit !== "kg") {
                setUnit("kg");
                setTargetWeight(100);
                setDisabledPlateWeights([]);
              }
            }}
            className={cn(
              "px-4 py-1.5 rounded-lg text-xs font-bold transition font-mono",
              unit === "kg"
                ? "bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                : "text-zinc-400 hover:text-white",
            )}
          >
            Metric (KG)
          </button>
          <button
            type="button"
            onClick={() => {
              if (unit !== "lbs") {
                setUnit("lbs");
                setTargetWeight(225);
                setDisabledPlateWeights([]);
              }
            }}
            className={cn(
              "px-4 py-1.5 rounded-lg text-xs font-bold transition font-mono",
              unit === "lbs"
                ? "bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                : "text-zinc-400 hover:text-white",
            )}
          >
            Imperial (LBS)
          </button>
        </div>
      </Card>

      {/* Visual Barbell Stage */}
      <VisualBarbell
        platesPerSide={calculation.platesPerSide}
        barWeight={currentBarWeight}
        totalWeight={calculation.actualLoadedWeight}
        unit={unit}
        collarWeight={collarWeight}
      />

      {/* Remainder Alert if not exact */}
      {!calculation.isExact && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-300 font-mono flex items-center justify-between">
          <span>
            ⚠️ Target weight {targetWeight} {unit} cannot be perfectly matched with available plates. Nearest load is {calculation.actualLoadedWeight} {unit} ({calculation.remainder > 0 ? `-${calculation.remainder}` : `+${Math.abs(calculation.remainder)}`} {unit} off).
          </span>
          <button
            type="button"
            onClick={() => setTargetWeight(calculation.actualLoadedWeight)}
            className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 font-bold border border-amber-500/30 text-amber-200"
          >
            Snap to {calculation.actualLoadedWeight} {unit}
          </button>
        </div>
      )}

      {/* Main Controls & Breakdown Grid */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        {/* Left Column: Weight Inputs & Quick Adjustment */}
        <div className="space-y-6">
          <Card level="base" className="space-y-5">
            <SectionHeader
              kicker="Weight Target"
              title="Set Working Load"
              description="Type your target weight or use quick increment buttons."
            />

            {/* Big Input Stepper */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => adjustWeight(-(unit === "kg" ? 10 : 25))}
                className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-300 hover:bg-white/10 hover:text-white transition font-mono font-bold"
              >
                -{unit === "kg" ? "10" : "25"}
              </button>
              <button
                type="button"
                onClick={() => adjustWeight(-(unit === "kg" ? 2.5 : 5))}
                className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-300 hover:bg-white/10 hover:text-white transition font-mono font-bold"
              >
                -{unit === "kg" ? "2.5" : "5"}
              </button>

              <div className="relative flex-1">
                <input
                  type="number"
                  min={currentBarWeight}
                  step={unit === "kg" ? 0.5 : 1}
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(Number(e.target.value) || currentBarWeight)}
                  className="w-full h-12 rounded-xl border border-white/15 bg-white/[0.03] px-4 font-mono text-2xl font-bold text-center text-white focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-xs text-zinc-400 font-bold uppercase">
                  {unit}
                </span>
              </div>

              <button
                type="button"
                onClick={() => adjustWeight(unit === "kg" ? 2.5 : 5)}
                className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-300 hover:bg-white/10 hover:text-white transition font-mono font-bold"
              >
                +{unit === "kg" ? "2.5" : "5"}
              </button>
              <button
                type="button"
                onClick={() => adjustWeight(unit === "kg" ? 10 : 25)}
                className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-300 hover:bg-white/10 hover:text-white transition font-mono font-bold"
              >
                +{unit === "kg" ? "10" : "25"}
              </button>
            </div>

            {/* Quick Presets Row */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs uppercase tracking-wider text-[#636380] font-mono mr-1">
                Benchmarks:
              </span>
              {(unit === "kg" ? [60, 80, 100, 120, 140, 180, 220] : [135, 185, 225, 275, 315, 405, 495]).map((bench) => (
                <button
                  key={bench}
                  type="button"
                  onClick={() => setTargetWeight(bench)}
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-mono font-semibold transition border",
                    targetWeight === bench
                      ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                      : "bg-white/[0.02] text-zinc-400 border-white/5 hover:text-white hover:border-white/15",
                  )}
                >
                  {bench} {unit}
                </button>
              ))}
            </div>
          </Card>

          {/* Barbell & Collars Configuration Card */}
          <Card level="base" className="space-y-4">
            <SectionHeader
              kicker="Equipment Specs"
              title="Barbell & Collar Setup"
              description="Select standard Olympic bars, trap bars, or enter custom weights."
            />

            <div className="grid gap-3 sm:grid-cols-2">
              {BARBELL_PRESETS.map((preset) => {
                const presetWeight = unit === "kg" ? preset.weightKg : preset.weightLbs;
                const isSelected = selectedBarId === preset.id;

                return (
                  <div
                    key={preset.id}
                    onClick={() => setSelectedBarId(preset.id)}
                    className={cn(
                      "p-3.5 rounded-xl border transition cursor-pointer flex flex-col justify-between",
                      isSelected
                        ? "bg-cyan-500/10 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                        : "bg-white/[0.02] border-white/5 hover:border-white/15",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-white">
                        {preset.name}
                      </span>
                      <span className="font-mono text-xs font-bold text-cyan-300">
                        {presetWeight} {unit}
                      </span>
                    </div>
                    <p className="text-xs text-[#8e8ea6] mt-1 line-clamp-1">
                      {preset.description}
                    </p>
                  </div>
                );
              })}

              {/* Custom Bar Option */}
              <div
                onClick={() => setSelectedBarId("custom")}
                className={cn(
                  "p-3.5 rounded-xl border transition cursor-pointer flex flex-col justify-between",
                  selectedBarId === "custom"
                    ? "bg-cyan-500/10 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                    : "bg-white/[0.02] border-white/5 hover:border-white/15",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-white">
                    Custom Barbell
                  </span>
                  {selectedBarId === "custom" ? (
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={customBarWeight}
                      onChange={(e) => setCustomBarWeight(Number(e.target.value) || 20)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-16 h-7 text-xs font-mono font-bold text-center rounded border border-cyan-400 bg-black/60 text-cyan-300"
                    />
                  ) : (
                    <span className="font-mono text-xs font-bold text-cyan-300">
                      {customBarWeight} {unit}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#8e8ea6] mt-1 line-clamp-1">
                  Specify any non-standard barbell weight
                </p>
              </div>
            </div>

            {/* Collars Weight Toggle */}
            <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs uppercase tracking-wider text-zinc-400 font-mono">
                Collar Clamps (Pair Total):
              </span>
              <div className="flex items-center gap-1.5">
                {[
                  { label: "None (0)", val: 0 },
                  { label: unit === "kg" ? "0.5 kg (Clamps)" : "1 lb (Clamps)", val: unit === "kg" ? 0.5 : 1 },
                  { label: unit === "kg" ? "2.5 kg (Competition)" : "5 lb (Comp)", val: unit === "kg" ? 2.5 : 5 },
                ].map((col) => (
                  <button
                    key={col.label}
                    type="button"
                    onClick={() => setCollarWeight(col.val)}
                    className={cn(
                      "px-3 py-1 rounded-lg text-xs font-mono font-medium transition border",
                      collarWeight === col.val
                        ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold"
                        : "bg-white/[0.02] text-zinc-400 border-white/5 hover:text-white",
                    )}
                  >
                    {col.label}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Available Gym Inventory Filter */}
          <Card level="base" className="space-y-4">
            <div className="flex items-center justify-between">
              <SectionHeader
                kicker="Gym Inventory"
                title="Available Plate Sizes"
                description="Toggle plates available at your gym. The calculator will automatically adapt."
              />
              <button
                type="button"
                onClick={() => setDisabledPlateWeights([])}
                className="text-xs text-cyan-400 hover:underline font-mono"
              >
                Reset All
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {allPlates.map((plate) => {
                const isEnabled = !disabledPlateWeights.includes(plate.weight);

                return (
                  <button
                    key={plate.weight}
                    type="button"
                    onClick={() => togglePlateAvailability(plate.weight)}
                    className={cn(
                      "flex items-center justify-between p-2.5 rounded-xl border transition text-left",
                      isEnabled
                        ? "bg-white/[0.04] border-white/15"
                        : "bg-zinc-900/40 border-white/5 opacity-40 grayscale",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: plate.color }}
                      />
                      <span className="font-mono text-xs font-bold text-white">
                        {plate.label}
                      </span>
                    </div>
                    {isEnabled ? (
                      <Check className="w-3.5 h-3.5 text-green-400 shrink-0" />
                    ) : (
                      <span className="text-[10px] text-zinc-500 font-mono">Off</span>
                    )}
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right Column: Exact Sleeve Breakdown & Warmup Pyramid */}
        <div className="space-y-6">
          {/* Detailed Loading Recipe Card */}
          <Card level="elevated" className="space-y-4 border-white/10">
            <SectionHeader
              kicker="Loading Recipe"
              title="Per-Sleeve Breakdown"
              description="Plates to slide onto each side of the barbell:"
            />

            {calculation.plateCounts.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-zinc-400">
                Empty Barbell. No plates required on either sleeve.
              </div>
            ) : (
              <div className="space-y-2.5">
                {calculation.plateCounts.map(({ plate, countPerSide, totalCount }) => (
                  <div
                    key={plate.weight}
                    className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/[0.02]"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-4 h-8 rounded-sm shadow-md flex items-center justify-center font-bold text-[9px] font-mono"
                        style={{ backgroundColor: plate.color, color: plate.textColor }}
                      >
                        {plate.weight}
                      </span>
                      <div>
                        <div className="font-mono text-sm font-bold text-white">
                          {countPerSide}x {plate.label}
                        </div>
                        <p className="text-xs text-zinc-500 font-mono">
                          {countPerSide * plate.weight} {unit} on each side
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-cyan-300">
                        {totalCount} total
                      </span>
                      <p className="text-[10px] text-zinc-500 font-mono">
                        ({totalCount * plate.weight} {unit})
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Total Math Summary */}
            <div className="pt-3 border-t border-white/5 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-zinc-400">
                <span>Barbell Weight:</span>
                <span className="text-white">{currentBarWeight} {unit}</span>
              </div>
              {collarWeight > 0 && (
                <div className="flex justify-between text-zinc-400">
                  <span>Collars Weight:</span>
                  <span className="text-white">{collarWeight} {unit}</span>
                </div>
              )}
              <div className="flex justify-between text-zinc-400">
                <span>Plates Weight (Both Sleeves):</span>
                <span className="text-white">{calculation.weightPerSide * 2} {unit}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-cyan-300 pt-2 border-t border-white/5">
                <span>Total Barbell Weight:</span>
                <span>{calculation.actualLoadedWeight} {unit}</span>
              </div>
            </div>
          </Card>

          {/* Warmup Ramp Pyramid */}
          <WarmupPyramid
            warmupSets={warmupSets}
            currentWeight={targetWeight}
            unit={unit}
            onSelectWeight={(w) => setTargetWeight(w)}
          />

          {/* Working Percentage Matrix */}
          <Card level="base" className="space-y-3">
            <div className="flex items-center gap-2">
              <Percent className="w-4 h-4 text-cyan-400" />
              <h4 className="font-display text-sm font-bold text-white">
                Working Percentages Matrix
              </h4>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {percentageMatrix.map(({ percentage, weight, calc }) => (
                <button
                  key={percentage}
                  type="button"
                  onClick={() => setTargetWeight(weight)}
                  className={cn(
                    "p-2 rounded-xl border text-left transition",
                    targetWeight === weight
                      ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300"
                      : "bg-white/[0.02] border-white/5 text-zinc-400 hover:text-white hover:border-white/15",
                  )}
                >
                  <div className="text-[10px] font-mono font-bold uppercase">
                    {percentage}%
                  </div>
                  <div className="text-xs font-mono font-bold text-white">
                    {weight} {unit}
                  </div>
                  <div className="text-[9px] font-mono text-zinc-500 truncate mt-0.5">
                    {calc.platesPerSide.length === 0
                      ? "Bar only"
                      : calc.platesPerSide.map((p) => p.weight).join("+")}
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
