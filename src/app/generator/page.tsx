"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ActionButton,
  Card,
  SectionHeader,
} from "@/components/shared/UIPrimitives";
import {
  PlannerInput,
  SexType,
  GoalType,
  ActivityLevel,
} from "@/lib/bodyPlanner";
import {
  persistPlannerSnapshot,
  readPlannerSnapshot,
  syncPlannerSnapshotFromServer,
} from "@/lib/plannerView";

type GeneratorStep = 1 | 2 | 3 | 4 | 5;

const steps: Array<{ id: GeneratorStep; label: string }> = [
  { id: 1, label: "Body" },
  { id: 2, label: "Goal" },
  { id: 3, label: "Metrics" },
  { id: 4, label: "Lifestyle" },
  { id: 5, label: "Review" },
];

export default function GeneratorPage() {
  const initial = readPlannerSnapshot();
  const [step, setStep] = useState<GeneratorStep>(1);
  const [sex, setSex] = useState<SexType>(initial.input.sex);
  const [goal, setGoal] = useState<GoalType>(initial.input.goal);
  const [age, setAge] = useState(initial.input.age);
  const [heightCm, setHeightCm] = useState(initial.input.heightCm);
  const [weightKg, setWeightKg] = useState(initial.input.weightKg);
  const [activity, setActivity] = useState<ActivityLevel>(
    initial.input.activity,
  );
  const [workoutDays, setWorkoutDays] = useState(initial.input.workoutDays);
  const [diet, setDiet] = useState(initial.input.diet);
  const [equipment, setEquipment] = useState<"gym" | "home">(initial.equipment);
  const [experience, setExperience] = useState<
    "beginner" | "intermediate" | "advanced"
  >(initial.experience);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    void syncPlannerSnapshotFromServer().then((snapshot) => {
      setSex(snapshot.input.sex);
      setGoal(snapshot.input.goal);
      setAge(snapshot.input.age);
      setHeightCm(snapshot.input.heightCm);
      setWeightKg(snapshot.input.weightKg);
      setActivity(snapshot.input.activity);
      setWorkoutDays(snapshot.input.workoutDays);
      setDiet(snapshot.input.diet);
      setEquipment(snapshot.equipment);
      setExperience(snapshot.experience);
    });
  }, []);

  const assembled = useMemo<PlannerInput>(
    () => ({ age, sex, heightCm, weightKg, goal, activity, workoutDays, diet }),
    [age, sex, heightCm, weightKg, goal, activity, workoutDays, diet],
  );

  async function handleSaveGenerator() {
    if (isSaving) return;

    setIsSaving(true);
    setSaveMessage(null);

    const current = readPlannerSnapshot();
    const saved = await persistPlannerSnapshot({
      input: assembled,
      checkins: current.checkins,
      equipment,
      experience,
      progress: current.progress,
    });

    setSaveMessage(
      saved
        ? "Plan saved and synced to your profile."
        : "Plan saved locally. Sign in to sync across devices.",
    );
    setIsSaving(false);
  }

  return (
    <div className="space-y-6 pb-8">
      <Card level="elevated">
        <SectionHeader
          kicker="Generator"
          title="Build your plan in five steps"
          description="A guided setup flow that updates your roadmap and workout pages."
        />
      </Card>

      <Card level="base" className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {steps.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`rounded-full border px-3 py-2 text-xs uppercase tracking-[0.15em] ${step === item.id ? "border-cyan-400 bg-cyan-400/10 text-cyan-300" : "border-[rgba(255,255,255,0.06)] text-[#636380]"}`}
              onClick={() => setStep(item.id)}
            >
              Step {item.id} · {item.label}
            </button>
          ))}
        </div>

        {step === 1 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setSex("male")}
              className={`rounded-xl border p-4 text-left ${sex === "male" ? "border-cyan-400 bg-cyan-400/10" : "border-[rgba(255,255,255,0.06)]"}`}
            >
              <p className="font-semibold text-[#eeeef2]">Male</p>
              <p className="text-sm text-[#636380]">Male body model</p>
            </button>
            <button
              type="button"
              onClick={() => setSex("female")}
              className={`rounded-xl border p-4 text-left ${sex === "female" ? "border-cyan-400 bg-cyan-400/10" : "border-[rgba(255,255,255,0.06)]"}`}
            >
              <p className="font-semibold text-[#eeeef2]">Female</p>
              <p className="text-sm text-[#636380]">Female body model</p>
            </button>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {(
              [
                { id: "fat_loss", label: "Fat Loss" },
                { id: "weight_loss", label: "Weight Loss" },
                { id: "muscle_gain", label: "Muscle Gain" },
                { id: "recomposition", label: "Recomposition" },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setGoal(item.id)}
                className={`rounded-xl border p-4 text-left ${goal === item.id ? "border-cyan-400 bg-cyan-400/10" : "border-[rgba(255,255,255,0.06)]"}`}
              >
                <p className="font-semibold text-[#eeeef2]">{item.label}</p>
              </button>
            ))}
          </div>
        ) : null}

        {step === 3 ? (
          <div className="grid gap-3 md:grid-cols-3">
            <label className="text-sm text-[#636380]">
              Age
              <input
                className="mt-1 w-full rounded-md border border-[rgba(255,255,255,0.06)] bg-bg-surface px-3 py-2 text-[#eeeef2]"
                type="number"
                min={13}
                max={100}
                value={age}
                onChange={(event) => setAge(Number(event.target.value))}
              />
            </label>
            <label className="text-sm text-[#636380]">
              Height (cm)
              <input
                className="mt-1 w-full rounded-md border border-[rgba(255,255,255,0.06)] bg-bg-surface px-3 py-2 text-[#eeeef2]"
                type="number"
                min={120}
                max={230}
                value={heightCm}
                onChange={(event) => setHeightCm(Number(event.target.value))}
              />
            </label>
            <label className="text-sm text-[#636380]">
              Weight (kg)
              <input
                className="mt-1 w-full rounded-md border border-[rgba(255,255,255,0.06)] bg-bg-surface px-3 py-2 text-[#eeeef2]"
                type="number"
                min={35}
                max={260}
                value={weightKg}
                onChange={(event) => setWeightKg(Number(event.target.value))}
              />
            </label>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm text-[#636380]">
              Activity
              <select
                className="mt-1 w-full rounded-md border border-[rgba(255,255,255,0.06)] bg-bg-surface px-3 py-2 text-[#eeeef2]"
                value={activity}
                onChange={(event) =>
                  setActivity(event.target.value as ActivityLevel)
                }
              >
                <option value="sedentary">Sedentary</option>
                <option value="light">Light</option>
                <option value="moderate">Moderate</option>
                <option value="active">Active</option>
                <option value="very_active">Very active</option>
              </select>
            </label>
            <label className="text-sm text-[#636380]">
              Workout days per week
              <input
                className="mt-1 w-full rounded-md border border-[rgba(255,255,255,0.06)] bg-bg-surface px-3 py-2 text-[#eeeef2]"
                type="number"
                min={3}
                max={7}
                value={workoutDays}
                onChange={(event) => setWorkoutDays(Number(event.target.value))}
              />
            </label>
            <label className="text-sm text-[#636380]">
              Diet
              <select
                className="mt-1 w-full rounded-md border border-[rgba(255,255,255,0.06)] bg-bg-surface px-3 py-2 text-[#eeeef2]"
                value={diet}
                onChange={(event) =>
                  setDiet(event.target.value as PlannerInput["diet"])
                }
              >
                <option value="veg">Veg</option>
                <option value="non_veg">Non-veg</option>
                <option value="mixed">Mixed</option>
              </select>
            </label>
            <label className="text-sm text-[#636380]">
              Equipment
              <select
                className="mt-1 w-full rounded-md border border-[rgba(255,255,255,0.06)] bg-bg-surface px-3 py-2 text-[#eeeef2]"
                value={equipment}
                onChange={(event) =>
                  setEquipment(event.target.value as "gym" | "home")
                }
              >
                <option value="gym">Gym</option>
                <option value="home">Home</option>
              </select>
            </label>
            <label className="text-sm text-[#636380]">
              Experience
              <select
                className="mt-1 w-full rounded-md border border-[rgba(255,255,255,0.06)] bg-bg-surface px-3 py-2 text-[#eeeef2]"
                value={experience}
                onChange={(event) =>
                  setExperience(
                    event.target.value as
                      | "beginner"
                      | "intermediate"
                      | "advanced",
                  )
                }
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </label>
          </div>
        ) : null}

        {step === 5 ? (
          <Card level="elevated" className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-[#636380]">
              Review
            </p>
            <p className="text-sm text-[#eeeef2]">Sex: {assembled.sex}</p>
            <p className="text-sm text-[#eeeef2]">
              Goal: {assembled.goal.replaceAll("_", " ")}
            </p>
            <p className="text-sm text-[#eeeef2]">Age: {assembled.age}</p>
            <p className="text-sm text-[#eeeef2]">
              Height/Weight: {assembled.heightCm} cm / {assembled.weightKg} kg
            </p>
            <p className="text-sm text-[#eeeef2]">
              Activity: {assembled.activity.replaceAll("_", " ")}
            </p>
            <p className="text-sm text-[#eeeef2]">
              Workout days: {assembled.workoutDays}
            </p>
            <p className="text-sm text-[#eeeef2]">Diet: {assembled.diet}</p>
            <p className="text-sm text-[#eeeef2]">
              Equipment/Experience: {equipment} / {experience}
            </p>
          </Card>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <ActionButton
            variant="secondary"
            disabled={step === 1}
            onClick={() =>
              setStep((prev) => Math.max(1, prev - 1) as GeneratorStep)
            }
          >
            Back
          </ActionButton>
          {step < 5 ? (
            <ActionButton
              onClick={() =>
                setStep((prev) => Math.min(5, prev + 1) as GeneratorStep)
              }
            >
              Next
            </ActionButton>
          ) : (
            <>
              <ActionButton onClick={handleSaveGenerator} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Plan"}
              </ActionButton>
              <Link
                href="/roadmap"
                className="lab-btn-secondary rounded-md px-3 py-2 text-sm font-medium"
              >
                Open Roadmap
              </Link>
              <Link
                href="/workouts"
                className="lab-btn-secondary rounded-md px-3 py-2 text-sm font-medium"
              >
                Open Workouts
              </Link>
            </>
          )}
        </div>
        {saveMessage ? (
          <p className="text-sm text-cyan-300">{saveMessage}</p>
        ) : null}
      </Card>
    </div>
  );
}
