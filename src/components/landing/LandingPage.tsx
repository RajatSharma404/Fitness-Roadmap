"use client";

import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import {
  Activity,
  Beef,
  ChevronRight,
  Cpu,
  Droplets,
  Flame,
  LineChart,
  Scale,
  ShieldCheck,
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
    <div className="lab-shell relative overflow-x-clip text-[#edf3f7]">
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_12%_5%,rgba(22,217,255,0.2),transparent_30%),radial-gradient(circle_at_84%_0%,rgba(183,255,69,0.14),transparent_24%),linear-gradient(180deg,rgba(17,19,21,0.92),rgba(17,19,21,0.98))]" />

      <nav className="sticky top-0 z-30 border-b border-[rgba(67,81,95,0.7)] bg-[rgba(15,20,25,0.82)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="lab-kicker text-[#abf2ff]">FitFlow</p>
            <h1 className="text-lg font-semibold text-[#dcff9d]">
              Performance Lab Roadmap
            </h1>
          </div>
          <button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="lab-btn-primary rounded-lg px-4 py-2 text-sm transition"
          >
            Sign in
          </button>
        </div>
      </nav>

      <main className="relative z-10 mx-auto max-w-7xl px-6 pb-20 pt-12">
        <section className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(22,217,255,0.34)] bg-[rgba(10,27,33,0.7)] px-3 py-1 text-xs text-[#abf2ff]">
              <Target className="h-3.5 w-3.5" />
              Athlete-grade planning engine for real-world transformation
            </div>

            <h2 className="lab-display max-w-2xl text-4xl leading-tight text-[#edf3f7] md:text-6xl">
              Build your body with a
              <span className="text-[#16d9ff]"> precise roadmap</span>, not
              random workouts.
            </h2>

            <p className="max-w-xl text-lg text-[#adc0cd]">
              This platform is built for fat loss, weight loss, and muscle
              building. Your plan evolves from readiness, check-ins, and
              progression phases so every week has clear purpose.
            </p>

            <div className="grid max-w-2xl gap-2 text-xs md:grid-cols-4">
              <div className="rounded border border-[rgba(74,92,108,0.62)] bg-[rgba(14,19,24,0.82)] px-3 py-2 text-[#adc0cd]">
                <span className="text-[#ff6b6b]">Problem</span>: random plans
                fail
              </div>
              <div className="rounded border border-[rgba(74,92,108,0.62)] bg-[rgba(14,19,24,0.82)] px-3 py-2 text-[#adc0cd]">
                <span className="text-[#7fe8ff]">System</span>: adaptive roadmap
              </div>
              <div className="rounded border border-[rgba(74,92,108,0.62)] bg-[rgba(14,19,24,0.82)] px-3 py-2 text-[#adc0cd]">
                <span className="text-[#b7ff45]">Proof</span>: weekly metric
                deltas
              </div>
              <div className="rounded border border-[rgba(74,92,108,0.62)] bg-[rgba(14,19,24,0.82)] px-3 py-2 text-[#adc0cd]">
                <span className="text-[#dcff9d]">CTA</span>: start your plan
              </div>
            </div>

            <div className="lab-grid max-w-2xl md:grid-cols-3">
              <div className="lab-panel p-4">
                <p className="lab-kicker mb-2 text-[#7fe8ff]">
                  Weeks to Target
                </p>
                <p className="text-3xl font-semibold text-white">12-18</p>
                <p className="mt-1 text-sm text-[#9bb1bf]">
                  Adaptive timeline engine
                </p>
              </div>
              <div className="lab-panel p-4">
                <p className="lab-kicker mb-2 text-[#7fe8ff]">
                  Daily Readiness
                </p>
                <p className="text-3xl font-semibold text-white">62-89</p>
                <p className="mt-1 text-sm text-[#9bb1bf]">
                  Recovery-aware training load
                </p>
              </div>
              <div className="lab-panel p-4">
                <p className="lab-kicker mb-2 text-[#7fe8ff]">
                  Tracking Inputs
                </p>
                <p className="text-3xl font-semibold text-white">9</p>
                <p className="mt-1 text-sm text-[#9bb1bf]">
                  Body, effort, lifestyle metrics
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => signIn("google", { callbackUrl: "/roadmap" })}
                className="lab-btn-primary inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm transition"
              >
                Build My Roadmap
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                className="lab-btn-secondary rounded-lg px-5 py-3 text-sm font-medium transition"
              >
                Open Dashboard
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lab-elevated relative overflow-hidden p-5"
          >
            <div className="pointer-events-none absolute -right-8 -top-10 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(22,217,255,0.22),transparent_70%)]" />
            <p className="lab-kicker mb-4 text-[#7fe8ff]">
              Command Center Preview
            </p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border border-[rgba(74,92,108,0.72)] bg-[rgba(14,19,24,0.86)] p-3">
                <div className="text-[#90a5b5]">BMI</div>
                <div className="mt-1 text-xl font-semibold text-white">
                  27.2
                </div>
                <div className="text-xs text-[#ffd36a]">Overweight</div>
              </div>
              <div className="rounded-lg border border-[rgba(74,92,108,0.72)] bg-[rgba(14,19,24,0.86)] p-3">
                <div className="text-[#90a5b5]">Daily Calories</div>
                <div className="mt-1 text-xl font-semibold text-white">
                  1970 kcal
                </div>
                <div className="text-xs text-[#6be9af]">Fat-loss deficit</div>
              </div>
              <div className="rounded-lg border border-[rgba(74,92,108,0.72)] bg-[rgba(14,19,24,0.86)] p-3">
                <div className="text-[#90a5b5]">Protein</div>
                <div className="mt-1 text-xl font-semibold text-white">
                  156 g
                </div>
                <div className="text-xs text-[#7fe8ff]">Muscle retention</div>
              </div>
              <div className="rounded-lg border border-[rgba(74,92,108,0.72)] bg-[rgba(14,19,24,0.86)] p-3">
                <div className="text-[#90a5b5]">Water</div>
                <div className="mt-1 text-xl font-semibold text-white">
                  3.1 L
                </div>
                <div className="text-xs text-[#7fe8ff]">Daily target</div>
              </div>
            </div>
            <div className="mt-4 rounded-lg border border-[rgba(74,92,108,0.72)] bg-[rgba(14,19,24,0.86)] p-3 text-sm text-[#9bb1bf]">
              <p className="flex items-center gap-2 text-[#dcff9d]">
                <Timer className="h-4 w-4 text-[#16d9ff]" /> Weekly prescription
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
              className="lab-panel p-5"
            >
              <div className="mb-3 inline-flex rounded-lg border border-[rgba(74,92,108,0.72)] bg-[rgba(14,19,24,0.86)] p-2">
                <feature.icon className="h-5 w-5 text-[#7fe8ff]" />
              </div>
              <h3 className="text-lg font-semibold text-[#edf3f7]">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-[#adc0cd]">
                {feature.description}
              </p>
            </motion.article>
          ))}
        </section>

        <section className="mt-14 rounded-2xl border border-[rgba(67,81,95,0.72)] bg-[rgba(17,22,27,0.9)] p-6 md:p-8">
          <p className="lab-kicker text-[#7fe8ff]">Proof Module</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">
            Week 3 Athlete Log Snapshot
          </h3>
          <p className="mt-2 max-w-3xl text-sm text-[#adc0cd]">
            One realistic week of adherence data showing how the system adjusts
            training load and nutrition instead of guessing.
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <article className="lab-panel p-4">
              <p className="text-xs uppercase tracking-wide text-[#7fe8ff]">
                Weight Trend
              </p>
              <p className="mt-1 text-2xl font-semibold text-white">-0.8 kg</p>
              <p className="text-xs text-[#adc0cd]">7-day average</p>
            </article>
            <article className="lab-panel p-4">
              <p className="text-xs uppercase tracking-wide text-[#7fe8ff]">
                Workout Completion
              </p>
              <p className="mt-1 text-2xl font-semibold text-white">92%</p>
              <p className="text-xs text-[#adc0cd]">11 of 12 sessions done</p>
            </article>
            <article className="lab-panel p-4">
              <p className="text-xs uppercase tracking-wide text-[#7fe8ff]">
                Readiness Drift
              </p>
              <p className="mt-1 text-2xl font-semibold text-white">
                68 -&gt; 74
              </p>
              <p className="text-xs text-[#adc0cd]">Stress down, sleep up</p>
            </article>
            <article className="lab-panel p-4">
              <p className="text-xs uppercase tracking-wide text-[#7fe8ff]">
                Adjustment Applied
              </p>
              <p className="mt-1 text-2xl font-semibold text-white">
                +20g carbs
              </p>
              <p className="text-xs text-[#adc0cd]">Leg-day recovery support</p>
            </article>
          </div>
        </section>

        <section className="mt-14 rounded-2xl border border-[rgba(67,81,95,0.72)] bg-[rgba(17,22,27,0.92)] p-6 md:p-8">
          <div className="grid gap-6 md:grid-cols-3">
            <article className="lab-panel p-5">
              <div className="mb-3 inline-flex rounded-lg bg-[rgba(9,29,35,0.84)] p-2">
                <Cpu className="h-5 w-5 text-[#7fe8ff]" />
              </div>
              <h3 className="text-xl font-semibold text-white">
                Adaptive Engine
              </h3>
              <p className="mt-2 text-sm text-[#adc0cd]">
                Readiness, check-ins, and progression signals keep your plan
                aggressive but recoverable.
              </p>
            </article>
            <article className="lab-panel p-5">
              <div className="mb-3 inline-flex rounded-lg bg-[rgba(26,35,12,0.84)] p-2">
                <LineChart className="h-5 w-5 text-[#b7ff45]" />
              </div>
              <h3 className="text-xl font-semibold text-white">
                Weekly Signal Review
              </h3>
              <p className="mt-2 text-sm text-[#adc0cd]">
                Auto-adjust calories, volume, and intensity from trend history,
                not daily emotion.
              </p>
            </article>
            <article className="lab-panel p-5">
              <div className="mb-3 inline-flex rounded-lg bg-[rgba(18,23,30,0.9)] p-2">
                <ShieldCheck className="h-5 w-5 text-[#dcff9d]" />
              </div>
              <h3 className="text-xl font-semibold text-white">
                Execution Guardrails
              </h3>
              <p className="mt-2 text-sm text-[#adc0cd]">
                Built-in form cues, rep ranges, and training split logic reduce
                junk volume and injury risk.
              </p>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}
