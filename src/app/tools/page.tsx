import Link from "next/link";
import { Calculator, Scale, UtensilsCrossed, Dumbbell } from "lucide-react";
import { Card, SectionHeader } from "@/components/shared/UIPrimitives";

const tools = [
  {
    href: "/tools/plate-calculator",
    title: "Barbell Plate Calculator",
    description: "Visual 2D Olympic barbell loader with custom collars and warm-up sets.",
    icon: Dumbbell,
    badge: "Interactive",
  },
  {
    href: "/tools/one-rep-max",
    title: "One Rep Max",
    description: "Estimate strength potential and working load percentages.",
    icon: Scale,
  },
  {
    href: "/tools/calorie",
    title: "Calorie Calculator",
    description: "Estimate maintenance and target calories from your profile.",
    icon: Calculator,
  },
  {
    href: "/tools/macros",
    title: "Macro Calculator",
    description: "Split daily calories into protein, carbs, and fats.",
    icon: UtensilsCrossed,
  },
];

export default function ToolsPage() {
  return (
    <div className="space-y-6 pb-8">
      <Card level="elevated">
        <SectionHeader
          kicker="Tools"
          title="Free Fitness & Strength Calculators"
          description="Use these utilities to plan workouts, nutrition, and barbell loads without any paywall."
        />
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.href}
              href={tool.href}
              className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-5 transition hover:border-cyan-400/40 hover:bg-cyan-400/5 group relative"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="inline-flex rounded-lg border border-[rgba(255,255,255,0.08)] p-2 bg-white/[0.02]">
                  <Icon className="h-5 w-5 text-cyan-300 group-hover:scale-110 transition" />
                </div>
                {tool.badge && (
                  <span className="text-[10px] font-bold font-mono text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {tool.badge}
                  </span>
                )}
              </div>
              <h3 className="font-display text-xl font-semibold text-[#eeeef2]">
                {tool.title}
              </h3>
              <p className="mt-2 text-sm text-[#636380]">{tool.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
