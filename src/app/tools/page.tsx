import Link from "next/link";
import { Calculator, Scale, UtensilsCrossed } from "lucide-react";
import { Card, SectionHeader } from "@/components/shared/UIPrimitives";

const tools = [
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
  {
    href: "/tools/one-rep-max",
    title: "One Rep Max",
    description: "Estimate strength potential from weight and reps.",
    icon: Scale,
  },
];

export default function ToolsPage() {
  return (
    <div className="space-y-6 pb-8">
      <Card level="elevated">
        <SectionHeader
          kicker="Tools"
          title="Free fitness calculators"
          description="Use these utilities to plan smarter without any paywall."
        />
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.href}
              href={tool.href}
              className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-5 transition hover:border-cyan-400/40 hover:bg-cyan-400/5"
            >
              <div className="mb-3 inline-flex rounded-lg border border-[rgba(255,255,255,0.08)] p-2">
                <Icon className="h-5 w-5 text-cyan-300" />
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
