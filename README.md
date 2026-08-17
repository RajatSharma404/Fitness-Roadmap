# FitFlow — The Evidence-Based RPG Fitness & Progression Platform

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Vitest](https://img.shields.io/badge/Vitest-3.2-6E9F18?style=for-the-badge&logo=vitest)](https://vitest.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**FitFlow** is an open-source, evidence-based fitness operating system and multiplayer RPG progression console. It seamlessly fuses **Dr. Mike Israetel's Hypertrophy Volume Science (MEV/MAV/MRV)**, **MacroFactor-style Adaptive TDEE energy balance physics**, **Dr. Stuart McGill biomechanical technique analysis**, and **multiplayer Clan/Raid mechanics** into an ultra-premium, dark glassmorphic web application.

---

## 📑 Table of Contents

- [Architectural Overview](#architectural-overview)
- [Key Feature Suites](#key-feature-suites)
  - [1. Workout Execution & Custom Routine Builder](#1-workout-execution--custom-routine-builder)
  - [2. Deep Analytics & Progression Science](#2-deep-analytics--progression-science)
  - [3. Daily Nutrition & Adaptive Food Diary](#3-daily-nutrition--adaptive-food-diary)
  - [4. RPG Gamification, Gym Squads & Cooperative Raids](#4-rpg-gamification-gym-squads--cooperative-raids)
  - [5. AI Coach Intelligence & Biomechanics Advisor](#5-ai-coach-intelligence--biomechanics-advisor)
  - [6. Interactive RPG Roadmap & Skill Tree](#6-interactive-rpg-roadmap--skill-tree)
  - [7. Interactive Calculators & Tools Hub](#7-interactive-calculators--tools-hub)
  - [8. Modern Navigation & Responsive Drawer](#8-modern-navigation--responsive-drawer)
- [Tech Stack](#tech-stack)
- [Directory Structure](#directory-structure)
- [Getting Started & Local Setup Guide](#getting-started--local-setup-guide)
  - [Prerequisites](#prerequisites)
  - [Installation Steps](#installation-steps)
  - [Environment Configuration](#environment-configuration)
  - [Database Setup & Migration](#database-setup--migration)
  - [Running the Development Server](#running-the-development-server)
  - [Running Automated Unit Tests](#running-automated-unit-tests)
- [Contributing](#contributing)
- [License](#license)

---

## 🏛️ Architectural Overview

FitFlow is built with a **local-first, cloud-synchronized** architecture:
- **Instant Offline & Guest Mode:** All workout routines, food logs, PR histories, and clan activities function offline via structured `localStorage` caches (`PlannerSnapshot`).
- **Seamless Cloud Sync:** When an athlete signs in (via NextAuth with Google), the application seamlessly synchronizes client state with PostgreSQL via Prisma ORM (`/api/user-plan-state`).
- **Zero Layout Shifts:** High-performance responsive layouts powered by Tailwind CSS and Framer Motion with hardware-accelerated animations.

```mermaid
graph TD
    A[Client User Interface] --> B[PlannerSnapshot State Manager]
    B -->|Offline Local Storage| C[(Browser LocalStorage)]
    B -->|Authenticated Sync| D[Next.js API Routes]
    D --> E[Prisma ORM Layer]
    E --> F[(PostgreSQL Database)]

    B --> G[Workout Powerhouse Engine]
    B --> H[Volume Landmarks MEV/MAV Engine]
    B --> I[Adaptive TDEE & Food Diary Engine]
    B --> J[Gym Squads & Community Raid Engine]
    B --> K[AI Biomechanics & Readiness Engine]
```

---

## 🚀 Key Feature Suites

### 1. Workout Execution & Custom Routine Builder

Turns periodization theory into seamless gym execution.

- **Custom Routine Builder (`/workouts/builder`):**
  - Interactive multi-day split builder supporting custom naming, focus targets, and day-by-day exercise sequences.
  - **1-Click Built-in Templates:** Instant cloning for **Push / Pull / Legs (6-Day)**, **Upper / Lower (4-Day)**, and **Full Body (3-Day)** splits.
  - **Active Routine Switcher:** Seamlessly toggles between standard roadmap tier plans and personalized custom routines.
- **Dynamic Warm-Up Ladder Engine (`src/lib/warmupCalculator.ts`):**
  - Calculates science-based warm-up sets based on the target working load (Empty Bar $\rightarrow$ 50% $\rightarrow$ 70% $\rightarrow$ 85% $\rightarrow$ 92%).
  - **Barbell Plate Visualizer:** Shows the exact 20kg, 15kg, 10kg, 5kg, 2.5kg, and 1.25kg Olympic plate loading per side.
  - **1-Click Set Insertion:** Inserts calculated warm-up sets directly into the active workout session.
- **In-Session Exercise Swapper (`ExerciseSwapModal.tsx`):**
  - Replace any exercise mid-workout with direct biomechanical alternatives or same-muscle group variations from the library.
- **Set Tagging & Intensity Management:**
  - Tag individual sets as **Warmup (`W`)**, **Working Set (`1..N`)**, **Drop Set (`D`)**, or **Failure (`F`)**.
- **Workout History & Logbook Calendar (`/workouts/history`):**
  - Monthly completion calendar heatmap with cumulative volume tonnage and time metrics.
  - Drill-down session breakdown modal and **1-Click CSV data export**.

---

### 2. Deep Analytics & Progression Science

Transforms raw workout logs and PR records into actionable hypertrophy and powerlifting science.

- **Renaissance Periodization (RP) Hypertrophy Landmarks (`src/lib/volumeLandmarks.ts`):**
  - Tracks weekly direct sets (1.0 credit) and compound secondary synergy sets (0.5 credit) across 10 major muscle groups over a rolling 7-day window.
  - Compares volume against **MEV** (Minimum Effective Volume), **MAV** (Maximum Adaptive Volume), and **MRV** (Maximum Recoverable Volume).
  - Status classification: `Under-stimulated`, `Maintenance`, `Optimal (MAV)`, `Overreaching`, and `Overtraining`.
- **Interactive 2D Muscle Volume Heatmap (`MuscleVolumeHeatmap.tsx`):**
  - Anatomical front and back body maps dynamically color-coded by real-time volume status (Optimal Growth = Cyan/Green, Overreaching = Amber, Overtraining = Red).
  - Detailed diagnostic inspector showing sets completed, landmark progress bars, and recovery windows.
- **Automated Lift Plateau Detection & Deload Engine (`src/lib/plateauDetector.ts`):**
  - Evaluates 1RM trajectories over consecutive sessions to automatically diagnose stalls on primary compound lifts (Squat, Bench, Deadlift, Overhead Press, Rows).
  - **1-Week Active Deload Protocol:** Prescribes a 70% load reduction, 50% set volume reduction, and RPE 6 target.
  - **Weak-Point Technical Variations:** Suggests targeted movement variations (Pause Squats for out-of-the-hole stalls, Spoto Press for mid-range sticking points, Deficit Deadlifts for off-the-floor speed).
- **Strength Standards & DOTS Radar (`src/lib/strengthStandards.ts`):**
  - Classifies lifters across **Untrained**, **Novice**, **Intermediate**, **Advanced**, and **Elite** percentiles adjusted for bodyweight and gender.
  - Computes real-time **DOTS Score**, **Wilks Score**, and **SBD Total** with an interactive multi-axis symmetry radar chart.

---

### 3. Daily Nutrition & Adaptive Food Diary

Precision daily fueling tailored for home cooking, local Indian markets, and international staples.

- **Interactive Daily Food Diary (`DailyFoodDiary.tsx`):**
  - Date navigator with 4 dedicated meal slots: **Breakfast 🍳**, **Lunch 🍛**, **Snack / Pre-Workout 🥜**, and **Dinner 🍲**.
  - Dynamic top macro status rings tracking **Calories Consumed & Remaining Deficit**, **Protein (g)**, **Carbohydrates (g)**, **Fats (g)**, and **Fiber (g)**.
  - Searchable food item picker with quantity adjusters and custom food quick-entry form.
- **Curated Indian & Global Food Database (`src/lib/indianFoodDatabase.ts`):**
  - Over 30+ staple foods with realistic portion sizes (Roti/Chapati, Rice, Moong Dal, Toor Dal, Rajma, Chole, Paneer, Soya Chunks, Eggs, Chicken Breast, Dahi/Curd, Greek Yogurt, Whey Protein, Roasted Chana, Fruits).
  - Filterable by diet: **Vegetarian**, **Vegan**, **Non-Vegetarian**, and **Jain-Friendly**.
- **MacroFactor-Style Adaptive TDEE Engine (`src/lib/adaptiveTDEE.ts`):**
  - Calculates true metabolic expenditure by comparing daily caloric intake against scale weight trends ($1\text{ kg body weight} \approx 7,700\text{ kcal}$).
  - Detects metabolic adaptation and offers **1-Click Auto-Calibration** of daily calorie targets.
- **Smart Grocery List with WhatsApp Export (`SmartGroceryList.tsx`):**
  - Categorizes ingredients into High-Protein Sources, Dairy & Eggs, Complex Carbs, Produce, and Healthy Fats.
  - **1-Click Share to WhatsApp:** Formats a clean, emoji-styled grocery checklist for instant messaging.
- **Hydration Quick-Tracker:**
  - Quick-add water logging with `+250ml (Glass)`, `+500ml (Bottle)`, and `+1.0L (Shaker)` buttons.

---

### 4. RPG Gamification, Gym Squads & Cooperative Raids

Multiplayer fitness mechanics that build accountability and community camaraderie.

- **Private Gym Squads & Clans (`src/lib/squadEngine.ts`):**
  - Create custom private squads with custom tags and 6-character invite codes (e.g. `[IRON] IRON01`, `[BLR] BLR99`).
  - **Weekly Shared Tonnage Milestone:** Clan members pool weekly lifted volume towards collective milestones (e.g. 50,000 kg/week) to unlock Clan XP bonuses.
  - Member leaderboard tracking weekly tonnage, completed workouts, and top PRs.
- **Live Squad Activity Feed with Fistbumps (`SquadActivityFeed.tsx`):**
  - Real-time social stream displaying teammates' PRs broken 🔥, workouts finished 💪, and roadmap nodes unlocked ⚡.
  - Interactive **Fistbump (👊)** cheering button with live counter updates.
- **Cooperative Weekly Raid Boss (`src/lib/raidBossEngine.ts`):**
  - Community-wide boss battle featuring **"Gorgon the Iron Colossus"** (500,000 kg HP). Every workout logged by any athlete deals real-time damage to the boss.
  - Assigns combat archetypes: 🛡️ **Vanguard Tank** (Heavy PRs), 🗡️ **Damage Dealer** (High Volume), and ⚡ **Berserker** (Workout Consistency).
  - Rewards community with exclusive badges and +1,500 XP upon victory.
- **Shareable Instagram & WhatsApp PR Story Cards (`PRStoryCardModal.tsx`):**
  - Generates 9:16 vertical glassmorphic cards optimized for Instagram Stories and WhatsApp Statuses.
  - 4 customizable themes: **Cyberpunk Neon**, **Solar Flare**, **Emerald Apex**, and **Onyx Stealth**.
  - 1-Click download and instant WhatsApp share.

---

### 5. AI Coach Intelligence & Biomechanics Advisor

An expert strength coach and biomechanist accessible anywhere across the app.

- **Biomechanical Technique & Fault Advisor (`src/lib/formAdvisor.ts`):**
  - Implements Dr. Stuart McGill & Mark Rippetoe principles covering common movement faults on Squat, Bench Press, Deadlift, Overhead Press, and Rows.
  - Diagnoses faults such as **Knee Valgus**, **Butt Wink**, **Flared Elbows**, **Stripper Pulls**, and **Lumbar Flexion**.
  - Provides instant platform verbal cues (e.g., *"Screw your feet into the floor"*, *"Bend the bar like a horseshoe"*) and corrective warm-up drills (e.g., Banded Goblet Squats, Spoto Press, Paused Deadlifts).
- **Interactive Form Check Analyzer (`FormCheckAnalyzer.tsx`):**
  - Visual lift and fault selector embedded in the Tools hub for zero-paywall biomechanical analysis.
- **Smart Daily Readiness & Energy Adjuster (`src/lib/readinessEngine.ts`):**
  - Computes CNS readiness (0-100) based on sleep duration, sleep quality, soreness ratings, stress, and 48-hour volume.
  - Auto-regulates daily volume and intensity (prescribes full progressive overload on Optimal days, drops accessory volume on Fatigued days).
- **Global AI Coaching Widget (`AIChat.tsx`):**
  - Floating SSE chat widget integrated with Google Gemini.
  - Features 1-tap quick action prompt chips for Form Cues, Daily Readiness, Deload Protocols, Indian Meal Swaps, and Hypertrophy Volume.

---

### 6. Interactive RPG Roadmap & Skill Tree

- **React Flow Visual Skill Tree (`/roadmap`):** Visual node graph organizing fitness progression into Foundation, Strength, Hypertrophy, Calisthenics, and Apex tiers.
- **Interactive Node Drawer:** View unlock criteria, phase rationales, dynamic lift charts, and 1-click PR logging.
- **Automated Milestone Unlocks (`src/lib/roadmapUnlockEngine.ts`):** Logging a PR automatically evaluates unlock criteria across all skill tree nodes and rewards XP with milestone celebration banners.

---

### 7. Interactive Calculators & Tools Hub (`/tools`)

- **Interactive Barbell Plate Loader (`/tools/plate-calculator`):** 2D Olympic barbell preview with plate breakdown.
- **One-Rep Max (1RM) Calculator (`/tools/one-rep-max`):** Epley & Brzycki formulas with percentage load breakdown tables.
- **Calorie & Macro Calculators (`/tools/calorie`, `/tools/macros`):** Mifflin-St Jeor metabolic calculations.

---

### 8. Modern Navigation & Responsive Drawer

- **Sleek Glassmorphic Mobile Drawer (`Sidebar.tsx`):** Smooth slide-over navigation with category headers (**Command**, **Execution**, **Knowledge**), glowing Cyan active indicators, live Readiness progress ring, and authenticated account controls.
- **Responsive TopBar (`TopBar.tsx`):** Mobile clearance ensuring clean visibility on all mobile and desktop viewports.

---

## 🛠️ Tech Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | [Next.js 16 (App Router)](https://nextjs.org/) | Server Components, Server-Sent Events, Streaming |
| **Language** | [TypeScript 5.9](https://www.typescriptlang.org/) | Strict type safety across all calculation engines |
| **UI & Styling** | [Tailwind CSS](https://tailwindcss.com/) & Vanilla CSS | Curated HSL dark palette, glassmorphism |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) | Spring transitions, slide-over modals, and toasts |
| **Visual Node Graph** | [React Flow (@xyflow/react)](https://reactflow.dev/) | Interactive RPG roadmap skill tree graph |
| **Charts** | [Recharts](https://recharts.org/) | Radar charts, area trends, and volume progress bars |
| **Database & ORM** | [Prisma](https://www.prisma.io/) & [PostgreSQL](https://www.postgresql.org/) | Relational database modeling with automated migrations |
| **Authentication** | [NextAuth.js](https://next-auth.js.org/) | Google OAuth and session management |
| **Validation** | [Zod](https://zod.dev/) | Schema validation on all API payloads |
| **Testing** | [Vitest 3.2](https://vitest.dev/) | Ultra-fast unit testing across all scientific engines |

---

## 📁 Directory Structure

```
Fitness-Roadmap/
├── prisma/
│   └── schema.prisma           # Prisma PostgreSQL data models
├── public/
│   ├── images/                 # Anatomical body illustrations (male/female front/back)
│   └── logo-fitflow.svg        # Brand logo
├── src/
│   ├── app/                    # Next.js App Router pages and API routes
│   │   ├── analytics/          # Deep Analytics Hub (Volume Landmarks, Plateaus, DOTS)
│   │   ├── checkins/           # Weekly Check-in recovery trends
│   │   ├── generator/          # Guided workout plan generator stepper
│   │   ├── guides/             # Topic-specific fitness education articles
│   │   ├── leaderboard/        # Community & Squads, Raid Boss, Global Leaderboards
│   │   ├── library/            # Searchable exercise database with BodyMap
│   │   ├── nutrition/          # Daily Food Diary, TDEE, Grocery list, Meal plans
│   │   ├── roadmap/            # React Flow interactive RPG skill tree
│   │   ├── tools/              # Plate calculator, 1RM, Calorie/Macro calculators
│   │   ├── workouts/           # Workout execution, Routine Builder, History Calendar
│   │   └── api/                # REST endpoints (lifts, sessions, user-plan-state, ai)
│   ├── components/
│   │   ├── analytics/          # MuscleVolumeHeatmap, PlateauDiagnosisCard, StrengthStandardsRadar
│   │   ├── coach/              # FormCheckAnalyzer
│   │   ├── dashboard/          # StrengthRadar, TodayStack, MissionStrip
│   │   ├── layout/             # Sidebar (hamburger drawer), TopBar, ShellChrome, Footer
│   │   ├── library/            # BodyMap, ExerciseCard, ExerciseDetailModal
│   │   ├── nutrition/          # DailyFoodDiary, AdaptiveTDEECard, SmartGroceryList
│   │   ├── roadmap/            # FlowRoadmap, NodeDetailDrawer, PhaseProgressRing
│   │   ├── shared/             # AIChat, UIPrimitives, Modal
│   │   ├── social/             # SquadsView, SquadActivityFeed, CommunityRaidCard, PRStoryCardModal
│   │   └── workouts/           # LiveWorkoutModal, WarmupCalculatorModal, ExerciseSwapModal
│   └── lib/                    # Core calculation engines & unit tests
│       ├── adaptiveTDEE.ts     # MacroFactor-style energy balance engine
│       ├── bodyPlanner.ts      # Core profile, BMR, TDEE, macro split engine
│       ├── formAdvisor.ts      # Dr. McGill & Rippetoe biomechanical technique engine
│       ├── formulas.ts         # Epley 1RM, DOTS, Wilks, Brzycki formulas
│       ├── indianFoodDatabase.ts # Curated Indian & global food database
│       ├── plateCalculator.ts  # Barbell plate loading optimizer
│       ├── plateauDetector.ts  # Lift stall detection & 70% deload protocol engine
│       ├── readinessEngine.ts  # Daily systemic recovery & auto-regulation engine
│       ├── roadmapUnlockEngine.ts # RPG node unlock and milestone evaluator
│       ├── squadEngine.ts      # Private gym clans, tonnage milestones & activity feeds
│       ├── strengthStandards.ts # IPF/USAPL powerlifting standards & classification
│       ├── volumeLandmarks.ts  # RP hypertrophy volume landmarks (MEV/MAV/MRV)
│       └── workoutRoutines.ts  # Custom workout splits & PPL templates
├── README.md                   # Comprehensive documentation
├── LICENSE                     # MIT License
├── package.json                # Project dependencies and scripts
└── tsconfig.json               # TypeScript compiler configuration
```

---

## ⚡ Getting Started & Local Setup Guide

Follow these steps to run FitFlow locally on your development machine.

### Prerequisites

Ensure you have the following installed:
- **Node.js:** `v18.18.0` or higher (Node 20+ recommended)
- **Package Manager:** `npm` (comes with Node.js) or `pnpm` / `yarn`
- **PostgreSQL Database:** A local PostgreSQL instance or a free cloud instance (such as [Neon.tech](https://neon.tech), [Supabase](https://supabase.com), or [Railway](https://railway.app)).

---

### Installation Steps

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/RajatSharma404/Fitness-Roadmap.git
   cd Fitness-Roadmap
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   # PostgreSQL Connection URL
   DATABASE_URL="postgresql://username:password@localhost:5432/fitness_roadmap?schema=public"

   # NextAuth Configuration
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="generate-a-secure-random-secret-key"

   # Google OAuth (Optional for local guest mode; required for Google Sign-In)
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"

   # Google Gemini API Key (For AI Coach streaming responses)
   GEMINI_API_KEY="your-gemini-api-key"
   ```

4. **Initialize Database Schema with Prisma:**
   ```bash
   npx prisma db push
   # or run migrations:
   npx prisma migrate dev --name init
   ```

5. **Generate Prisma Client:**
   ```bash
   npx prisma generate
   ```

6. **Start the Development Server:**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser to explore FitFlow.

---

### Running Automated Unit Tests

FitFlow includes extensive automated unit test suites covering all scientific calculation engines:

```bash
npm run test:run
```

To run tests in watch mode during development:
```bash
npm run test
```

To verify TypeScript type safety across the entire codebase:
```bash
npx tsc --noEmit
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/RajatSharma404/Fitness-Roadmap/issues).

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

---

**Built with passion for evidence-based lifting, hypertrophy science, and strength progression.** 💪
