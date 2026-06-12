"use client";

import Image from "next/image";

const frontMuscles = [
  { id: "chest", label: "chest", paths: ["36,25 64,25 62,35 38,35"] },
  { id: "abs", label: "abs", paths: ["42,36 58,36 56,50 44,50"] },
  { id: "obliques_l", label: "obliques", paths: ["36,36 41,36 43,48 35,48"] },
  { id: "obliques_r", label: "obliques", paths: ["59,36 64,36 65,48 57,48"] },
  { id: "shoulder_l_f", label: "shoulders", paths: ["28,22 36,22 34,30 26,30"] },
  { id: "shoulder_r_f", label: "shoulders", paths: ["64,22 72,22 74,30 66,30"] },
  { id: "biceps_l", label: "biceps", paths: ["24,32 31,32 29,44 21,44"] },
  { id: "biceps_r", label: "biceps", paths: ["69,32 76,32 79,44 71,44"] },
  { id: "forearm_l_f", label: "forearms", paths: ["18,46 27,46 24,58 14,58"] },
  { id: "forearm_r_f", label: "forearms", paths: ["73,46 82,46 86,58 76,58"] },
  { id: "quad_l", label: "quads", paths: ["36,55 48,55 44,75 32,75"] },
  { id: "quad_r", label: "quads", paths: ["52,55 64,55 68,75 56,75"] },
];

const backMuscles = [
  { id: "back", label: "back", paths: ["35,22 65,22 58,45 42,45"] },
  { id: "shoulder_l_b", label: "shoulders", paths: ["26,22 34,22 32,30 24,30"] },
  { id: "shoulder_r_b", label: "shoulders", paths: ["66,22 74,22 76,30 68,30"] },
  { id: "triceps_l", label: "triceps", paths: ["22,32 30,32 28,44 20,44"] },
  { id: "triceps_r", label: "triceps", paths: ["70,32 78,32 80,44 72,44"] },
  { id: "forearm_l_b", label: "forearms", paths: ["16,46 26,46 22,58 12,58"] },
  { id: "forearm_r_b", label: "forearms", paths: ["74,46 84,46 88,58 78,58"] },
  { id: "glutes", label: "glutes", paths: ["40,48 60,48 58,60 42,60"] },
  { id: "hamstring_l", label: "hamstrings", paths: ["38,62 48,62 45,78 35,78"] },
  { id: "hamstring_r", label: "hamstrings", paths: ["52,62 62,62 65,78 55,78"] },
  { id: "calves_l", label: "calves", paths: ["36,80 44,80 41,95 33,95"] },
  { id: "calves_r", label: "calves", paths: ["56,80 64,80 67,95 59,95"] },
];

function matchesMuscleGroup(targetMuscles: string[], groupLabel: string): boolean {
  const normalizedTargets = targetMuscles.map((m) => m.toLowerCase());
  const label = groupLabel.toLowerCase();

  if (label === "chest") return normalizedTargets.some((t) => t.includes("chest"));
  if (label === "abs")
    return normalizedTargets.some(
      (t) => t.includes("abs") || t.includes("core") || t.includes("rectus")
    );
  if (label === "obliques")
    return normalizedTargets.some((t) => t.includes("oblique") || t.includes("core"));
  if (label === "shoulders")
    return normalizedTargets.some((t) => t.includes("delt") || t.includes("shoulder"));
  if (label === "biceps") return normalizedTargets.some((t) => t.includes("bicep"));
  if (label === "triceps") return normalizedTargets.some((t) => t.includes("tricep"));
  if (label === "forearms")
    return normalizedTargets.some((t) => t.includes("forearm") || t.includes("grip"));
  if (label === "quads")
    return normalizedTargets.some(
      (t) => t.includes("quad") || t.includes("thigh") || t.includes("leg")
    );
  if (label === "back")
    return normalizedTargets.some(
      (t) =>
        t.includes("back") ||
        t.includes("lat") ||
        t.includes("traps") ||
        t.includes("rhomboid") ||
        t.includes("erector")
    );
  if (label === "glutes") return normalizedTargets.some((t) => t.includes("glute") || t.includes("butt"));
  if (label === "hamstrings")
    return normalizedTargets.some(
      (t) => t.includes("hamstring") || t.includes("posterior chain")
    );
  if (label === "calves")
    return normalizedTargets.some(
      (t) =>
        t.includes("calf") ||
        t.includes("calves") ||
        t.includes("soleus") ||
        t.includes("gastrocnemius")
    );

  return normalizedTargets.some((t) => t.includes(label));
}

interface MiniBodyMapProps {
  targetMuscles: string[];
}

export function MiniBodyMap({ targetMuscles }: MiniBodyMapProps) {
  return (
    <div className="flex justify-center gap-6 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-4">
      {/* Front Panel */}
      <div className="relative w-[120px] aspect-[3/4] rounded-lg overflow-hidden bg-bg-surface border border-[rgba(255,255,255,0.04)]">
        <Image
          src="/images/body-male-front.png"
          alt="Front muscle map"
          fill
          unoptimized
          className="object-cover opacity-60"
        />
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
          {frontMuscles.map((muscle) => {
            const isHighlighted = matchesMuscleGroup(targetMuscles, muscle.label);
            return muscle.paths.map((p, idx) => (
              <polygon
                key={`${muscle.id}-${idx}`}
                points={p}
                className={`transition-all duration-300 ${
                  isHighlighted
                    ? "fill-cyan-400/50 stroke-cyan-300/80 stroke-[0.8]"
                    : "fill-transparent stroke-transparent"
                }`}
              />
            ));
          })}
        </svg>
        <span className="absolute bottom-1 left-2 text-[10px] uppercase font-bold tracking-widest text-[#636380]">
          Front
        </span>
      </div>

      {/* Back Panel */}
      <div className="relative w-[120px] aspect-[3/4] rounded-lg overflow-hidden bg-bg-surface border border-[rgba(255,255,255,0.04)]">
        <Image
          src="/images/body-male-back.png"
          alt="Back muscle map"
          fill
          unoptimized
          className="object-cover opacity-60"
        />
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
          {backMuscles.map((muscle) => {
            const isHighlighted = matchesMuscleGroup(targetMuscles, muscle.label);
            return muscle.paths.map((p, idx) => (
              <polygon
                key={`${muscle.id}-${idx}`}
                points={p}
                className={`transition-all duration-300 ${
                  isHighlighted
                    ? "fill-red-400/50 stroke-red-300/80 stroke-[0.8]"
                    : "fill-transparent stroke-transparent"
                }`}
              />
            ));
          })}
        </svg>
        <span className="absolute bottom-1 left-2 text-[10px] uppercase font-bold tracking-widest text-[#636380]">
          Back
        </span>
      </div>
    </div>
  );
}
