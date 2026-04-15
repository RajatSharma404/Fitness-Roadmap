"use client";

import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import {
  Activity,
  Beef,
  Droplets,
  Flame,
  Scale,
  Target,
  Timer,
  UtensilsCrossed,
} from "lucide-react";

const features = [
  {
    icon: Scale,
    title: "BMI + Bodyweight Categories",
    description:
      "Get instant category detection using height, weight, and BMI to set realistic fat-loss targets.",
  },
  {
    icon: Flame,
    title: "Calories for Your Category",
    description:
      "Daily calorie targets are generated from BMR, activity level, and your goal: fat loss, weight loss, or muscle gain.",
  },
  {
    icon: Beef,
    title: "Protein and Macro Targets",
    description:
      "Receive protein, carbs, fats, and fiber goals to preserve muscle while reducing fat.",
  },
  {
    icon: Activity,
    title: "Daily Workout Prescription",
    description:
      "Know exactly what to train each day, how long to train, and how much activity to hit.",
  },
  {
    icon: UtensilsCrossed,
    title: "Veg and Non-Veg Meal Combos",
    description:
      "Smart meal combinations that fit your calories and protein without forcing one diet style.",
  },
  {
    icon: Droplets,
    title: "Hydration and Recovery",
    description:
      "Personalized water goals, practical recovery guidance, and weekly adjustment rules.",
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#1e1e1e] text-[#d4d4d4]">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_15%_20%,rgba(0,122,204,0.25),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(78,201,176,0.14),transparent_30%)]" />

      <nav className="sticky top-0 z-20 border-b border-[#30363d] bg-[#252526]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#569cd6]">
              FitFlow
            </p>
            <h1 className="text-lg font-semibold text-[#dcdcaa]">
              Weight, Fat Loss & Muscle Planner
            </h1>
          </div>
          <button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="rounded-md border border-[#007acc] bg-[#04395e] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#005a9e]"
          >
            Sign in
          </button>
        </div>
      </nav>

      <main className="relative z-10 mx-auto max-w-7xl px-6 pb-20 pt-12">
        <section className="grid items-center gap-8 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-[#3c3c3c] bg-[#252526] px-3 py-1 text-xs text-[#9cdcfe]">
              <Target className="h-3.5 w-3.5" />
              AI-assisted roadmap for real-world body transformation
            </div>

            <h2 className="text-4xl font-semibold leading-tight text-[#dcdcaa] md:text-5xl">
              Rework your body plan using data, not guesswork.
            </h2>

            <p className="max-w-xl text-lg text-[#9aa1a8]">
              This platform is built for fat loss, weight loss, and muscle
              building. Build a complete strategy from BMI, calories, workouts,
              meal combinations, hydration, and weekly progress adjustments.
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => signIn("google", { callbackUrl: "/roadmap" })}
                className="rounded-md border border-[#007acc] bg-[#007acc] px-5 py-3 font-medium text-white transition hover:bg-[#005a9e]"
              >
                Build My Roadmap
              </button>
              <button
                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                className="rounded-md border border-[#3c3c3c] bg-[#252526] px-5 py-3 font-medium text-[#d4d4d4] transition hover:border-[#569cd6]"
              >
                Open Dashboard
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-2xl border border-[#30363d] bg-[#252526] p-5"
          >
            <p className="mb-4 text-xs uppercase tracking-[0.2em] text-[#9cdcfe]">
              Preview Output
            </p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border border-[#3c3c3c] bg-[#1e1e1e] p-3">
                <div className="text-[#9aa1a8]">BMI</div>
                <div className="mt-1 text-xl font-semibold">27.2</div>
                <div className="text-xs text-[#ce9178]">Overweight</div>
              </div>
              <div className="rounded-lg border border-[#3c3c3c] bg-[#1e1e1e] p-3">
                <div className="text-[#9aa1a8]">Daily Calories</div>
                <div className="mt-1 text-xl font-semibold">1970 kcal</div>
                <div className="text-xs text-[#4ec9b0]">Fat-loss deficit</div>
              </div>
              <div className="rounded-lg border border-[#3c3c3c] bg-[#1e1e1e] p-3">
                <div className="text-[#9aa1a8]">Protein</div>
                <div className="mt-1 text-xl font-semibold">156 g</div>
                <div className="text-xs text-[#9cdcfe]">Muscle retention</div>
              </div>
              <div className="rounded-lg border border-[#3c3c3c] bg-[#1e1e1e] p-3">
                <div className="text-[#9aa1a8]">Water</div>
                <div className="mt-1 text-xl font-semibold">3.1 L</div>
                <div className="text-xs text-[#4fc1ff]">Daily target</div>
              </div>
            </div>
            <div className="mt-4 rounded-lg border border-[#3c3c3c] bg-[#1e1e1e] p-3 text-sm text-[#9aa1a8]">
              <p className="flex items-center gap-2 text-[#dcdcaa]">
                <Timer className="h-4 w-4 text-[#569cd6]" /> Weekly prescription
              </p>
              <p className="mt-2">
                5 training days, 2 recovery days, 10k daily steps, and adaptive
                calorie adjustment every 14 days.
              </p>
            </div>
          </motion.div>
        </section>

        <section className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.article
              key={feature.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06 }}
              className="rounded-xl border border-[#30363d] bg-[#252526] p-5"
            >
              <div className="mb-3 inline-flex rounded-lg border border-[#3c3c3c] bg-[#1e1e1e] p-2">
                <feature.icon className="h-5 w-5 text-[#9cdcfe]" />
              </div>
              <h3 className="text-lg font-semibold text-[#dcdcaa]">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-[#9aa1a8]">
                {feature.description}
              </p>
            </motion.article>
          ))}
        </section>
      </main>
    </div>
  );
}
