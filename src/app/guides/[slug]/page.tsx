import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Card } from "@/components/shared/UIPrimitives";

interface GuideContent {
  title: string;
  tag: string;
  content: React.ReactNode;
}

const guides: Record<string, GuideContent> = {
  "progressive-overload": {
    title: "Progressive Overload Basics",
    tag: "Training",
    content: (
      <div className="space-y-4 text-[#636380]">
        <p>
          Progressive overload is the foundation of strength and muscle growth.
          It means consistently increasing the demands on your muscles over
          time.
        </p>
        <h3 className="font-display text-lg font-semibold text-[#eeeef2]">
          The Three Ways to Progress
        </h3>
        <ul className="space-y-2 list-disc list-inside">
          <li>
            <span className="text-[#eeeef2]">Add Weight:</span> Increase the
            pounds or kilograms lifted
          </li>
          <li>
            <span className="text-[#eeeef2]">Add Reps:</span> Do one or two more
            reps with the same weight
          </li>
          <li>
            <span className="text-[#eeeef2]">Add Sets:</span> Include an extra
            set of 6–8 reps when ready
          </li>
        </ul>
        <h3 className="font-display text-lg font-semibold text-[#eeeef2]">
          The Minimum Viable Progress
        </h3>
        <p>
          You don&apos;t need to add 10 lbs every week. Even adding 1–2 reps
          every other workout compounds to real gains over months. Track what
          you do in your check-ins and compare to last week.
        </p>
        <h3 className="font-display text-lg font-semibold text-[#eeeef2]">
          When to Reset
        </h3>
        <p>
          If you miss a workout or deload, it&apos;s okay to drop the weight
          5–10%. The goal is consistency over months, not perfection over days.
        </p>
      </div>
    ),
  },
  "perfect-form-cues": {
    title: "Perfect Form Cues",
    tag: "Exercise Form",
    content: (
      <div className="space-y-4 text-[#636380]">
        <p>
          Form is not about looking good. It&apos;s about safety, consistency,
          and hitting the target muscle.
        </p>
        <h3 className="font-display text-lg font-semibold text-[#eeeef2]">
          Bench Press
        </h3>
        <ul className="space-y-1 list-disc list-inside text-sm">
          <li>Feet flat on floor, shoulder-width apart</li>
          <li>Lower the bar to your mid-chest, not your neck</li>
          <li>Keep elbows at ~45° from your body, not flared out</li>
          <li>Full lockout at the top, but no hyperextension</li>
        </ul>
        <h3 className="font-display text-lg font-semibold text-[#eeeef2]">
          Squat
        </h3>
        <ul className="space-y-1 list-disc list-inside text-sm">
          <li>Chest up, neutral spine, core braced</li>
          <li>Knees track over toes, not caving inward</li>
          <li>Depth: hips below parallel when possible</li>
          <li>Drive through heels, not toes</li>
        </ul>
        <h3 className="font-display text-lg font-semibold text-[#eeeef2]">
          Deadlift
        </h3>
        <ul className="space-y-1 list-disc list-inside text-sm">
          <li>Shoulders over the bar at the start</li>
          <li>Chest stays proud, core tight</li>
          <li>Hips and shoulders rise together, not hips first</li>
          <li>Bar stays over mid-foot throughout</li>
        </ul>
      </div>
    ),
  },
  "sleep-and-recovery": {
    title: "Sleep and Recovery",
    tag: "Recovery",
    content: (
      <div className="space-y-4 text-[#636380]">
        <p>
          Training breaks down muscle. Sleep and rest build it back stronger.
          Ignore sleep and your gains stall, regardless of diet or programming.
        </p>
        <h3 className="font-display text-lg font-semibold text-[#eeeef2]">
          Sleep Duration
        </h3>
        <p>
          Aim for 7–9 hours per night. This is when testosterone rises, cortisol
          drops, and protein synthesis peaks. If you can&apos;t hit 8 hours,
          prioritize quality over quantity.
        </p>
        <h3 className="font-display text-lg font-semibold text-[#eeeef2]">
          Sleep Quality Tips
        </h3>
        <ul className="space-y-2 list-disc list-inside">
          <li>Dark, cool room (60–67°F)</li>
          <li>No screens 1 hour before bed</li>
          <li>Consistent wake time, even on weekends</li>
          <li>Limit caffeine after 2 PM</li>
        </ul>
        <h3 className="font-display text-lg font-semibold text-[#eeeef2]">
          Non-Sleep Recovery
        </h3>
        <p>
          Active recovery days (walking, yoga, swimming) boost blood flow and
          reduce soreness without taxing your nervous system. Add 1–2 per week
          on your &quot;off&quot; days.
        </p>
      </div>
    ),
  },
  "protein-and-macros": {
    title: "Protein and Macros",
    tag: "Nutrition",
    content: (
      <div className="space-y-4 text-[#636380]">
        <p>
          Calories drive weight change. Protein drives muscle retention. Get
          both right and the rest is logistics.
        </p>
        <h3 className="font-display text-lg font-semibold text-[#eeeef2]">
          Protein Target
        </h3>
        <p>
          <span className="text-[#eeeef2]">
            0.8–1.0g per pound of bodyweight
          </span>
        </p>
        <p className="text-sm">
          Muscle gain: 1.0g. Maintenance: 0.8g. Fat loss: 1.0g (preserve
          muscle). Too much won&apos;t hurt, but more than 1.2g rarely helps.
        </p>
        <h3 className="font-display text-lg font-semibold text-[#eeeef2]">
          Carbs and Fats
        </h3>
        <p>
          After hitting your protein and calorie targets, split the rest 40% fat
          / 60% carbs. Adjust if energy is low (add carbs) or digestion is rough
          (add fat).
        </p>
        <h3 className="font-display text-lg font-semibold text-[#eeeef2]">
          How to Eat More Protein
        </h3>
        <ul className="space-y-1 list-disc list-inside text-sm">
          <li>Chicken, beef, fish: 30g per 3.5 oz</li>
          <li>Eggs: 6g per egg</li>
          <li>Greek yogurt: 15g per cup</li>
          <li>Protein powder: 20–25g per scoop</li>
        </ul>
      </div>
    ),
  },
  "plateau-breakers": {
    title: "Plateau Breakers",
    tag: "Coaching",
    content: (
      <div className="space-y-4 text-[#636380]">
        <p>
          If you&apos;ve trained the same way for 4–6 weeks and strength is
          flat, it&apos;s time to change something.
        </p>
        <h3 className="font-display text-lg font-semibold text-[#eeeef2]">
          Plateau Checklist
        </h3>
        <ul className="space-y-2 list-disc list-inside">
          <li>
            <span className="text-[#eeeef2]">Are you eating enough?</span> Add
            200 calories and train for 2 weeks.
          </li>
          <li>
            <span className="text-[#eeeef2]">Are you sleeping?</span> Even one
            bad night tanks performance.
          </li>
          <li>
            <span className="text-[#eeeef2]">Are you progressing?</span> Check
            your log—if reps haven&apos;t moved, you need a deload.
          </li>
        </ul>
        <h3 className="font-display text-lg font-semibold text-[#eeeef2]">
          The Deload Week
        </h3>
        <p>
          Every 4–6 weeks, cut volume by 40–50% for one week. Use the same
          weight but fewer sets/reps. This gives your CNS a break and often
          leads to PRs the following week.
        </p>
        <h3 className="font-display text-lg font-semibold text-[#eeeef2]">
          Change One Variable
        </h3>
        <p>
          Add an extra rep, drop 5–10 lbs for 2 weeks, or add a new exercise
          variation. Small changes compound.
        </p>
      </div>
    ),
  },
  "home-workout-structure": {
    title: "Home Workout Structure",
    tag: "Equipment",
    content: (
      <div className="space-y-4 text-[#636380]">
        <p>
          You don&apos;t need a full gym to build muscle. Bodyweight, dumbbells,
          and bands are enough.
        </p>
        <h3 className="font-display text-lg font-semibold text-[#eeeef2]">
          Bodyweight Essentials
        </h3>
        <ul className="space-y-1 list-disc list-inside text-sm">
          <li>Push-ups: chest, shoulders, triceps</li>
          <li>Pull-ups or rows (sturdy bar needed): back, biceps</li>
          <li>Squats: legs</li>
          <li>Planks: core</li>
        </ul>
        <h3 className="font-display text-lg font-semibold text-[#eeeef2]">
          Minimal Home Setup
        </h3>
        <p>
          Adjustable dumbbells (5–50 lbs), resistance bands, and a pull-up bar
          cover 80% of movements. Total cost: $300–500.
        </p>
        <h3 className="font-display text-lg font-semibold text-[#eeeef2]">
          Using Resistance Bands
        </h3>
        <ul className="space-y-1 list-disc list-inside text-sm">
          <li>Combine them with dumbbells for added resistance</li>
          <li>Great for isolation: leg curls, flyes, lateral raises</li>
          <li>Portable and easy to adjust mid-set</li>
        </ul>
        <h3 className="font-display text-lg font-semibold text-[#eeeef2]">
          The Weekly Home Routine
        </h3>
        <p>
          Push day: push-ups, pike presses, dips. Pull day: rows, pull-ups,
          reverse flyes. Leg day: squats, lunges, glute bridges. 3–5 sets per
          exercise, 6–12 reps.
        </p>
      </div>
    ),
  },
};

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = guides[slug];

  if (!guide) {
    return (
      <div className="space-y-6 pb-8">
        <Card level="elevated">
          <div className="flex items-center justify-between">
            <div>
              <p className="lab-kicker text-[#60a5fa]">Guides</p>
              <h2 className="font-display text-2xl font-bold text-[#eeeef2]">
                Guide not found
              </h2>
            </div>
            <Link
              href="/guides"
              className="flex items-center gap-2 rounded-lg border border-[rgba(255,255,255,0.06)] px-4 py-2 text-sm text-[#636380] hover:text-[#eeeef2]"
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <Card level="elevated">
        <div className="flex items-center justify-between">
          <div>
            <p className="lab-kicker text-cyan-300">{guide.tag}</p>
            <h1 className="font-display text-3xl font-bold text-[#eeeef2]">
              {guide.title}
            </h1>
          </div>
          <Link
            href="/guides"
            className="flex items-center gap-2 rounded-lg border border-[rgba(255,255,255,0.06)] px-4 py-2 text-sm text-[#636380] hover:text-[#eeeef2] transition"
          >
            <ChevronLeft className="h-4 w-4" /> Back to Guides
          </Link>
        </div>
      </Card>

      <Card level="base" className="prose prose-invert max-w-none">
        {guide.content}
      </Card>

      <Card level="base" className="space-y-3 text-center">
        <p className="text-sm text-[#636380]">
          Want to dive deeper? Start your roadmap or join the leaderboard to
          share your progress.
        </p>
        <div className="flex gap-2 justify-center">
          <Link
            href="/roadmap"
            className="rounded-lg border border-cyan-400/40 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-300 hover:bg-cyan-400/20 transition"
          >
            Start Roadmap
          </Link>
          <Link
            href="/guides"
            className="rounded-lg border border-[rgba(255,255,255,0.06)] px-4 py-2 text-sm text-[#636380] hover:text-[#eeeef2] transition"
          >
            More Guides
          </Link>
        </div>
      </Card>
    </div>
  );
}
