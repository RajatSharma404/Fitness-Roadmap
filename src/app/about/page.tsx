import { Card, SectionHeader } from "@/components/shared/UIPrimitives";

export default function AboutPage() {
  return (
    <div className="space-y-6 pb-8">
      <Card level="elevated">
        <SectionHeader
          kicker="About"
          title="What FitFlow is"
          description="FitFlow helps you execute fat loss, muscle gain, and recomposition with a structured roadmap."
        />
      </Card>

      <Card level="base" className="space-y-3 text-sm text-[#636380]">
        <p>
          FitFlow is a free fitness planning system built around adaptive
          roadmaps, practical workouts, check-ins, and nutrition guidance.
        </p>
        <p>
          The product goal is simple: tell you what to do now, why it matters,
          and what to adjust when progress slows.
        </p>
        <p>
          Every major feature in this app remains free to use. No premium
          gating.
        </p>
      </Card>
    </div>
  );
}
