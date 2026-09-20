import type { Metadata } from "next";
import { HomeDashboardClient } from "@/components/dashboard/HomeDashboardClient";

export const metadata: Metadata = {
  title: "Fitness Roadmap | Evidence-Based Strength, Hypertrophy & Bioenergetics",
  description:
    "Interactive roadmap for fat loss, hypertrophy, and strength progression. Calculate personalized macro targets, track weekly tonnage, and follow science-based athletic periodization.",
  openGraph: {
    title: "Fitness Roadmap | Evidence-Based Strength & Nutrition Planner",
    description:
      "Interactive RPG skill tree and workout planner with plate calculator, adaptive TDEE, and AI strength coaching.",
    type: "website",
  },
};

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <HomeDashboardClient />
    </main>
  );
}
