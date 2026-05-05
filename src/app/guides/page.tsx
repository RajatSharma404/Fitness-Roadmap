import Link from "next/link";
import { Card, SectionHeader } from "@/components/shared/UIPrimitives";

const guides = [
  {
    slug: "progressive-overload",
    title: "Progressive Overload Basics",
    tag: "Training",
    summary: "How to increase volume and intensity without stalling recovery.",
  },
  {
    slug: "perfect-form-cues",
    title: "Perfect Form Cues",
    tag: "Exercise Form",
    summary: "Quick setup cues for the lifts used most in beginner plans.",
  },
  {
    slug: "sleep-and-recovery",
    title: "Sleep and Recovery",
    tag: "Recovery",
    summary:
      "How sleep, stress, and steps influence readiness and performance.",
  },
  {
    slug: "protein-and-macros",
    title: "Protein and Macros",
    tag: "Nutrition",
    summary: "Simple rules to hit protein and calories consistently.",
  },
  {
    slug: "plateau-breakers",
    title: "Plateau Breakers",
    tag: "Coaching",
    summary: "When to change calories, sets, or cardio if progress slows down.",
  },
  {
    slug: "home-workout-structure",
    title: "Home Workout Structure",
    tag: "Equipment",
    summary: "How to train effectively with bands, dumbbells, and bodyweight.",
  },
];

export default function GuidesPage() {
  return (
    <div className="space-y-6 pb-8">
      <Card level="elevated">
        <SectionHeader
          kicker="Guides"
          title="Free training knowledge hub"
          description="Practical explainers for form, progression, recovery, and nutrition."
        />
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {guides.map((guide) => (
          <Link key={guide.slug} href={`/guides/${guide.slug}`}>
            <Card
              level="base"
              className="space-y-3 h-full hover:border-cyan-400/40 transition"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">
                {guide.tag}
              </p>
              <h3 className="font-display text-xl font-semibold text-[#eeeef2]">
                {guide.title}
              </h3>
              <p className="text-sm text-[#636380]">{guide.summary}</p>
              <p className="inline-flex text-sm text-cyan-300 hover:text-cyan-200">
                Read guide →
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
