"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { ActionButton, SectionHeader } from "@/components/shared/UIPrimitives";
import { PlannerInput } from "@/lib/bodyPlanner";

interface RoadmapStepperProps {
  input: PlannerInput;
  experience: string;
  equipment: string;
  onInputChange: (input: PlannerInput) => void;
  onExperienceChange: (exp: string) => void;
  onEquipmentChange: (eq: string) => void;
  onClose: () => void;
  onSave: () => void;
}

type StepType =
  | "body-model"
  | "age"
  | "goal"
  | "activity"
  | "equipment-exp"
  | "summary";

interface Step {
  id: StepType;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    id: "body-model",
    title: "Body Measurements",
    description: "Height and weight help us calculate your calorie needs.",
  },
  {
    id: "age",
    title: "Your Age",
    description: "Age influences metabolism and recovery patterns.",
  },
  {
    id: "goal",
    title: "Training Goal",
    description: "Are you building muscle, losing fat, or recomposing?",
  },
  {
    id: "activity",
    title: "Activity Level",
    description: "How often do you move or exercise in a typical week?",
  },
  {
    id: "equipment-exp",
    title: "Equipment & Experience",
    description: "Tailor workouts to your setup and strength level.",
  },
  {
    id: "summary",
    title: "Ready to Plan",
    description: "Review your settings before we start your roadmap.",
  },
];

export function RoadmapStepper({
  input,
  experience,
  equipment,
  onInputChange,
  onExperienceChange,
  onEquipmentChange,
  onClose,
  onSave,
}: RoadmapStepperProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const currentStep = steps[currentStepIndex];

  const goNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const goBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;
  const completionPercent = Math.round(
    ((currentStepIndex + 1) / steps.length) * 100,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm">
      <div className="h-auto max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-[rgba(255,255,255,0.06)] bg-bg-elevated p-6">
        {/* Progress Bar */}
        <div className="mb-6 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.2em] text-[#636380]">
              Step {currentStepIndex + 1} of {steps.length}
            </p>
            <p className="text-xs font-semibold text-cyan-300">
              {completionPercent}%
            </p>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
            <div
              className="h-full bg-linear-to-r from-cyan-400 to-cyan-300 transition-all duration-300"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>

        {/* Step Header */}
        <SectionHeader
          kicker={`Step ${currentStepIndex + 1}`}
          title={currentStep.title}
          description={currentStep.description}
        />

        {/* Step Content */}
        <div className="mt-6 space-y-4">
          {currentStep.id === "body-model" && (
            <>
              <label className="block text-sm text-[#636380]">
                Height (cm)
                <input
                  className="mt-1 w-full rounded-md border border-[rgba(255,255,255,0.06)] bg-bg-surface px-3 py-2 text-[#eeeef2]"
                  type="number"
                  min={120}
                  max={220}
                  value={input.heightCm}
                  onChange={(e) =>
                    onInputChange({
                      ...input,
                      heightCm: Number(e.target.value),
                    })
                  }
                />
              </label>
              <label className="block text-sm text-[#636380]">
                Weight (kg)
                <input
                  className="mt-1 w-full rounded-md border border-[rgba(255,255,255,0.06)] bg-bg-surface px-3 py-2 text-[#eeeef2]"
                  type="number"
                  min={35}
                  max={220}
                  value={input.weightKg}
                  onChange={(e) =>
                    onInputChange({
                      ...input,
                      weightKg: Number(e.target.value),
                    })
                  }
                />
              </label>
            </>
          )}

          {currentStep.id === "age" && (
            <label className="block text-sm text-[#636380]">
              Age
              <input
                className="mt-1 w-full rounded-md border border-[rgba(255,255,255,0.06)] bg-bg-surface px-3 py-2 text-[#eeeef2]"
                type="number"
                min={13}
                max={100}
                value={input.age}
                onChange={(e) =>
                  onInputChange({
                    ...input,
                    age: Number(e.target.value),
                  })
                }
              />
            </label>
          )}

          {currentStep.id === "goal" && (
            <label className="block text-sm text-[#636380]">
              Training Goal
              <select
                className="mt-1 w-full rounded-md border border-[rgba(255,255,255,0.06)] bg-bg-surface px-3 py-2 text-[#eeeef2]"
                value={input.goal}
                onChange={(e) =>
                  onInputChange({
                    ...input,
                    goal: e.target.value as typeof input.goal,
                  })
                }
              >
                {(
                  [
                    "fat_loss",
                    "weight_loss",
                    "muscle_gain",
                    "recomposition",
                  ] as const
                ).map((goal) => (
                  <option key={goal} value={goal}>
                    {goal.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </label>
          )}

          {currentStep.id === "activity" && (
            <label className="block text-sm text-[#636380]">
              Activity Level
              <select
                className="mt-1 w-full rounded-md border border-[rgba(255,255,255,0.06)] bg-bg-surface px-3 py-2 text-[#eeeef2]"
                value={input.activity}
                onChange={(e) =>
                  onInputChange({
                    ...input,
                    activity: e.target.value as typeof input.activity,
                  })
                }
              >
                {(
                  [
                    "sedentary",
                    "light",
                    "moderate",
                    "active",
                    "very_active",
                  ] as const
                ).map((activity) => (
                  <option key={activity} value={activity}>
                    {activity.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </label>
          )}

          {currentStep.id === "equipment-exp" && (
            <>
              <label className="block text-sm text-[#636380]">
                Strength Level
                <select
                  className="mt-1 w-full rounded-md border border-[rgba(255,255,255,0.06)] bg-bg-surface px-3 py-2 text-[#eeeef2]"
                  value={experience}
                  onChange={(e) => onExperienceChange(e.target.value)}
                >
                  {(["beginner", "intermediate", "advanced"] as const).map(
                    (value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ),
                  )}
                </select>
              </label>
              <label className="block text-sm text-[#636380]">
                Available Equipment
                <select
                  className="mt-1 w-full rounded-md border border-[rgba(255,255,255,0.06)] bg-bg-surface px-3 py-2 text-[#eeeef2]"
                  value={equipment}
                  onChange={(e) => onEquipmentChange(e.target.value)}
                >
                  {(["gym", "home"] as const).map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>
            </>
          )}

          {currentStep.id === "summary" && (
            <div className="space-y-3 rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[#636380]">
                    Height
                  </p>
                  <p className="mt-1 font-semibold text-[#eeeef2]">
                    {input.heightCm} cm
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[#636380]">
                    Weight
                  </p>
                  <p className="mt-1 font-semibold text-[#eeeef2]">
                    {input.weightKg} kg
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[#636380]">
                    Age
                  </p>
                  <p className="mt-1 font-semibold text-[#eeeef2]">
                    {input.age}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[#636380]">
                    Goal
                  </p>
                  <p className="mt-1 font-semibold text-[#eeeef2]">
                    {input.goal.replaceAll("_", " ")}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[#636380]">
                    Activity
                  </p>
                  <p className="mt-1 font-semibold text-[#eeeef2]">
                    {input.activity.replaceAll("_", " ")}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[#636380]">
                    Experience
                  </p>
                  <p className="mt-1 font-semibold text-[#eeeef2]">
                    {experience}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[#636380]">
                    Equipment
                  </p>
                  <p className="mt-1 font-semibold text-[#eeeef2]">
                    {equipment}
                  </p>
                </div>
              </div>
              <p className="text-xs text-[#636380]">
                ✨ You&apos;re all set! Click below to save and start your
                roadmap.
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="mt-6 flex gap-2">
          <ActionButton
            variant="secondary"
            className="flex-1"
            onClick={goBack}
            disabled={isFirstStep}
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </ActionButton>
          {!isLastStep && (
            <ActionButton className="flex-1" onClick={goNext}>
              Next
              <ChevronRight className="h-4 w-4" />
            </ActionButton>
          )}
          {isLastStep && (
            <ActionButton
              className="flex-1"
              onClick={() => {
                onSave();
                onClose();
              }}
            >
              <Check className="h-4 w-4" />
              Save Plan
            </ActionButton>
          )}
          <ActionButton variant="secondary" className="px-3" onClick={onClose}>
            ✕
          </ActionButton>
        </div>
      </div>
    </div>
  );
}
