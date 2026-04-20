# FitFlow Planner

FitFlow Planner is a full-stack fitness roadmap app that turns body transformation into a guided execution system.

The product is organized around a dark, tactical UI called the Performance Console. It combines a mission-first dashboard, an adaptive roadmap, workout execution tools, nutrition templates, weekly check-ins, and a lightweight coaching layer so the next action is always obvious.

## Product Goal

The app is designed to answer three questions as quickly as possible:

1. What should I do now?
2. Why am I doing it?
3. How should the plan change if progress slows down?

That principle drives the dashboard, roadmap, landing page, and the shared visual system.

## Key Experiences

### Dashboard

The dashboard is the command center for daily execution. It focuses on the current mission instead of showing equal-weight cards everywhere.

It includes:

- a sticky top mission strip that highlights the next best action
- a persistent Today Stack with four ordered steps: Warmup, Main Lifts, Accessories, and Recovery
- a left rail for section navigation and weekly status
- a central execution area for the active section
- a right-side analytics rail for readiness, nutrition targets, trends, and recent check-ins
- a quick check-in slide-over with progressive disclosure
- immediate coaching feedback after a check-in is prepared
- section views for overview, workouts, check-ins, exercise library, and nutrition

### Roadmap

The roadmap is the planning and progression workspace. It pairs a visual node graph with a detailed selection panel so users can understand both structure and reason.

It includes:

- the same Today Stack pattern as the dashboard for continuity
- a React Flow roadmap that shows progression phases and node dependencies
- node focus dimming so irrelevant items fade when a node is selected
- phase progress rings for faster scanning
- a selected-node panel with unlock criteria and phase rationale
- adaptive workout plans based on goal, activity, experience, and equipment
- workout execution controls and a timer-driven session mode
- check-in history, nutrition planning, and exercise explorer tools

### Landing Page

The landing page is intentionally proof-driven rather than marketing-heavy.

It follows a simple narrative:

- Problem: random plans fail
- System: adaptive roadmap
- Proof: weekly metric deltas and athlete log snapshots
- CTA: start the plan

It also includes a compact visual preview of the product so users can understand the app before signing in.

## Core Features

### Adaptive planning engine

The planning engine generates fitness guidance from the current profile.

It calculates:

- BMI and BMI category
- BMR and calorie targets
- protein, carbs, fats, and fiber targets
- hydration targets
- weekly workout structure
- gym progression phases
- meal templates
- roadmap dependencies and unlock rules

Supported goals include:

- fat loss
- weight loss
- muscle gain
- recomposition

Supported activity levels include:

- sedentary
- light
- moderate
- active
- very active

Supported equipment modes include:

- gym
- home plus bands/dumbbells

### Workout execution

Workout planning is not just static content. The app exposes exercise and workout details that make it usable during training.

Capabilities include:

- weekly workout prescriptions with duration and focus
- expandable training-day details
- per-day exercise lists
- a workout session timer
- per-exercise set counting in the execution mode
- lazy-loaded exercise thumbnails and detail drawers
- movement instructions, common mistakes, alternatives, target muscles, and rep guidance

### Nutrition planning

The nutrition system generates practical meal guidance instead of abstract macro numbers.

It includes:

- meal templates tuned to the current calorie target
- grocery list suggestions
- meal swaps with calorie and protein deltas
- diet filtering for veg, non-veg, and mixed eating patterns

### Weekly check-ins and readiness

Check-ins track trend data and feed it back into the plan.

Tracked values include:

- date
- body weight
- waist measurement
- sleep hours
- average steps
- stress score
- energy score
- workout completion percentage

The app converts these inputs into readiness-aware guidance so calories, steps, and cardio can be adjusted over time.

### Coaching and adaptation

The app includes a daily coaching message based on:

- goal
- readiness score
- recent adjustment trend

This keeps the plan responsive instead of static.

### Persistence and sync

The app uses layered persistence:

- localStorage for offline-first state recovery
- authenticated user-plan-state API sync when signed in
- Prisma/PostgreSQL for long-term storage

## Visual System

The current UI is built around the Performance Console direction.

Design principles:

- three elevation levels only: base, elevated, and highlighted actionable
- cyan for action and focus
- lime for progress and success
- amber for caution or readiness dips
- red only for destructive or error states
- strict spacing rhythm to keep pages from feeling noisy
- condensed hierarchy for key numbers and metrics
- readable body typography for long-form planning content

Shared UI primitives live in the shared component layer and are used to keep dashboard and roadmap consistent.

## Tech Stack

- Next.js 15.5.14 with the App Router
- React 19
- Tailwind CSS 4
- Framer Motion
- React Flow
- Recharts
- NextAuth with Google OAuth
- Express 5
- PostgreSQL with Prisma
- Google Gemini
- Monaco Editor and monaco-vim
- Vitest
- TypeScript
- Docker, Docker Compose, and PM2

## Project Structure

```text
.
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── public/
├── src/
│   ├── app/
│   │   ├── api/
│   │   ├── dashboard/
│   │   ├── leaderboard/
│   │   ├── profile/[id]/
│   │   ├── roadmap/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── dashboard/
│   │   ├── landing/
│   │   ├── roadmap/
│   │   └── shared/
│   ├── lib/
│   ├── prisma/
│   ├── server/
│   └── types/
├── docker-compose.yml
├── Dockerfile
├── Dockerfile.api
├── pm2.config.js
├── README.md
└── package.json
```

## Main Routes

- `/` - landing page
- `/dashboard` - mission-first command center for plan execution
- `/roadmap` - adaptive planning workspace with graph navigation and check-ins
- `/leaderboard` - ranking view
- `/profile/[id]` - public profile page

## API Surface

### Next.js API routes

- `GET /api/og` - Open Graph image generation
- `GET /api/user-plan-state` - fetch the current saved plan state
- `POST /api/user-plan-state` - save the current plan state
- `GET /api/auth/[...nextauth]` - NextAuth handler
- `POST /api/auth/[...nextauth]` - NextAuth handler

### Express routes

The Express server exposes routes for:

- auth
- lifts
- leaderboard
- profile
- roadmap
- AI helpers

## Local Setup

### Prerequisites

- Node.js 20 or newer
- npm
- PostgreSQL
- Google OAuth credentials
- Google Gemini API key

### 1. Install dependencies

```bash
npm install
```

### 2. Create environment files

Create a local `.env` file from your existing template if one is available, then fill in the values for your machine.

### 3. Configure environment variables

Use the following as a baseline:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/fitness_roadmap"
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="your-secret-key-here-min-32-chars"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
JWT_SECRET="your-jwt-secret-key-here-min-32-chars"
GEMINI_API_KEY="your-gemini-api-key"
FRONTEND_URL="http://localhost:3001"
FRONTEND_URLS="http://localhost:3001"
```

Notes:

- the frontend runs on port `3001`
- the Express API runs on port `5000`
- `DATABASE_URL` should point to your PostgreSQL instance
- `NEXTAUTH_URL` should match the local or deployed app URL
- `JWT_SECRET` should be at least 32 characters

### 4. Prepare the database

Generate the Prisma client and sync the schema:

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

If you prefer migrations instead of push:

```bash
npm run db:migrate
```

### 5. Start the app in development

Open two terminals.

Terminal 1 - Next.js frontend:

```bash
npm run dev
```

Terminal 2 - Express API:

```bash
npm run dev:api
```

Then open:

```text
http://localhost:3001
```

## Production Build

Build the frontend and the server separately:

```bash
npm run build
npm run build:server
```

Start the production services:

```bash
npm run start
npm run start:api
```

## Docker

The repository includes Docker support for local containerized development and deployment.

Start all services:

```bash
docker-compose up -d
```

The Docker setup starts:

- Next.js frontend on `3001`
- Express API on `5000`
- PostgreSQL in the compose network

## PM2 Deployment

PM2 is available for long-running production processes.

Start processes:

```bash
npm run pm2:start
```

View logs:

```bash
npm run pm2:logs
```

Restart:

```bash
npm run pm2:restart
```

Stop:

```bash
npm run pm2:stop
```

Delete PM2 config:

```bash
npm run pm2:delete
```

## Available npm Scripts

| Script                 | Description                                      |
| ---------------------- | ------------------------------------------------ |
| `npm run dev`          | Start the Next.js dev server on port 3001        |
| `npm run dev:api`      | Start the Express API in development mode        |
| `npm run build`        | Build the Next.js app for production             |
| `npm run build:server` | Type-check and build the server TypeScript       |
| `npm run start`        | Start the Next.js production server on port 3001 |
| `npm run start:api`    | Start the Express API in production-style mode   |
| `npm run lint`         | Run ESLint across the codebase                   |
| `npm run test`         | Run Vitest in watch mode                         |
| `npm run test:run`     | Run Vitest once                                  |
| `npm run db:generate`  | Generate Prisma client                           |
| `npm run db:push`      | Push Prisma schema to the database               |
| `npm run db:migrate`   | Run Prisma migration flow                        |
| `npm run db:seed`      | Seed the database                                |
| `npm run db:studio`    | Open Prisma Studio                               |
| `npm run pm2:start`    | Start PM2 processes                              |
| `npm run pm2:stop`     | Stop PM2 processes                               |
| `npm run pm2:restart`  | Restart PM2 processes                            |
| `npm run pm2:delete`   | Delete PM2 processes                             |
| `npm run pm2:logs`     | Stream PM2 logs                                  |

## Data Model Overview

The Prisma schema centers around these entities:

- `User` - profile data, goal, bodyweight, units, accounts, sessions
- `Lift` - logged lifts, one-rep max, notes, videos, timestamps
- `Node` - roadmap nodes and unlock criteria
- `UserNode` - per-user roadmap status
- `Achievement` - achievements earned by users
- `UserPlanState` - persisted planner state for synced roadmap settings and check-ins

Enums used in the schema include:

- `Goal`
- `Unit`
- `SetType`
- `Track`
- `NodeStatus`

## Development Notes

- The app is intentionally dark themed and data dense, but the current layout keeps the hierarchy focused on one mission at a time.
- The shared `lab-*` classes in `src/app/globals.css` define the surface and typography language.
- The dashboard and roadmap both use the Today Stack pattern so execution feels consistent across pages.
- The codebase is split between Next.js route handlers and an Express API layer, so you need both processes running for full local functionality.

## Verification

The current build completes successfully with `npm run build`.

## License

This repository does not currently include a license file.
