# FitFlow Planner

FitFlow Planner is a full-stack fitness transformation app for fat loss, weight loss, muscle gain, and recomposition. It combines an interactive roadmap, adaptive workout planning, nutrition templates, weekly check-ins, AI coaching, and progress tracking into one Dark+ styled experience.

The app is designed to help users understand what to do next, why it matters, and how to adjust when progress slows down. It is not limited to bodybuilding. The current product direction focuses on practical body transformation planning with a strong emphasis on consistency, visibility, and progression.

## What the app does

FitFlow Planner turns body transformation into a guided system:

- assesses your current profile with BMI, BMR, calories, macros, and hydration targets
- builds a weekly workout plan based on goal, experience level, workout days, and available equipment
- shows beginner, intermediate, and advanced gym progressions with two body parts per day
- lets users click each workout day to reveal the exact exercises
- opens an exercise detail drawer with how-to steps, common mistakes, target muscles, alternatives, and demo tips
- includes a workout mode with a session timer and set counting
- generates nutrition templates, grocery list suggestions, and meal swaps
- collects weekly check-ins for weight, waist, sleep, steps, stress, energy, and workout completion
- adapts calories, steps, cardio, and roadmap access based on readiness and recent trend
- stores state locally and syncs it to the signed-in user when possible
- provides an AI coach message based on current status and goal

## Key features

### 1. Interactive roadmap

The Roadmap page is the primary planning surface. It shows:

- an input panel for age, height, weight, sex, goal, activity, workout days, diet, experience, and equipment
- a visual node-based roadmap with completion status
- gated progression based on roadmap dependencies and readiness
- weekly workout plans and adaptive gym splits
- check-in history and trend-based adjustment guidance
- nutrition templates and grocery suggestions
- exercise detail drawer and workout execution panel

### 2. Adaptive workout planning

The workout engine adapts to the selected profile:

- goal: fat loss, weight loss, muscle gain, recomposition
- experience: beginner, intermediate, advanced
- equipment: gym or home
- workout days: 3 to 7 days per week

The gym progression currently includes:

- beginner split with five training days
- intermediate split with six training days
- advanced split with six training days

Each training day uses exactly two body parts and includes six exercises.

### 3. Exercise explorer

Each workout day can be expanded to show the exact exercises. Clicking an exercise opens a detail drawer that includes:

- how to perform the movement
- common mistakes to avoid
- target muscle groups
- alternative exercises
- a practical demo tip

### 4. Workout mode

Workout mode is a lightweight execution view that helps the user train instead of only planning.

It includes:

- a session timer
- per-exercise set counting
- quick entry from the current day workout card

### 5. Nutrition planning

The nutrition system builds practical meal templates from the user profile:

- cut template
- balance template
- performance template

It also provides:

- grocery list ideas
- meal swaps with calorie and protein deltas
- veg, non-veg, and mixed diet filtering

### 6. Weekly check-ins and readiness

Users can submit a weekly check-in with:

- date
- body weight
- waist measurement
- sleep hours
- average steps
- stress score
- energy score
- workout completion percentage

The app converts this into a readiness score and uses it to influence progression.

### 7. AI coaching

The app generates a daily coaching message based on:

- goal
- readiness score
- recent adjustment trend

This keeps the app actionable instead of only informational.

### 8. Persistence and sync

The app uses a layered persistence approach:

- localStorage for immediate offline persistence
- authenticated server sync through the user plan state endpoint
- Prisma/PostgreSQL for long-term storage and user identity

## Tech stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS 4, Framer Motion
- **Routing**: Next.js App Router
- **Visualization**: React Flow, Recharts
- **Auth**: NextAuth with Google OAuth
- **Backend**: Express 5
- **Database**: PostgreSQL with Prisma
- **AI**: Google Gemini
- **Editor**: Monaco Editor and monaco-vim
- **Deployment**: Docker, Docker Compose, PM2
- **Language**: TypeScript

## Main pages

- `/` - landing page
- `/dashboard` - summary view of current plan, calories, readiness, and workout progress
- `/roadmap` - interactive planning and execution workspace
- `/leaderboard` - ranking view
- `/profile/[id]` - public profile page

## Getting started

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

### 2. Create environment file

Copy the example environment file and update the values for your machine.

```bash
copy .env.example .env.local
```

### 3. Configure environment variables

Use the following values as a baseline:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/fitness_roadmap"
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="your-secret-key-here-min-32-chars"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
JWT_SECRET="your-jwt-secret-key-here-min-32-chars"
GEMINI_API_KEY="your-gemini-api-key"
DB_USER="postgres"
DB_PASSWORD="postgres"
DB_NAME="fitness_roadmap"
```

Notes:

- the frontend runs on port `3001`
- `DATABASE_URL` should point to your PostgreSQL instance
- `NEXTAUTH_URL` should match the local or deployed app URL
- `JWT_SECRET` should be at least 32 characters

### 4. Prepare the database

Generate Prisma client and sync the schema:

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

## Production build

Build the frontend and server separately:

```bash
npm run build
npm run build:server
```

Start the production app:

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

For database initialization or deployment, make sure Prisma is applied appropriately for your environment.

## PM2 deployment

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

## Available npm scripts

| Script                 | Description                                      |
| ---------------------- | ------------------------------------------------ |
| `npm run dev`          | Start the Next.js dev server on port 3001        |
| `npm run dev:api`      | Start the Express API in development mode        |
| `npm run build`        | Build the Next.js app for production             |
| `npm run build:server` | Type-check and build the server TypeScript       |
| `npm run start`        | Start the Next.js production server on port 3001 |
| `npm run start:api`    | Start the Express API in production-style mode   |
| `npm run lint`         | Run ESLint across the codebase                   |
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

## Project structure

```text
my-app/
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
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── public/
├── docker-compose.yml
├── Dockerfile
├── Dockerfile.api
├── pm2.config.js
└── README.md
```

## Data model overview

The Prisma schema currently centers around these entities:

- **User**: profile data, goal, bodyweight, units, accounts, sessions
- **Lift**: logged lifts, one-rep max, notes, videos, timestamps
- **Node**: roadmap nodes and unlock criteria
- **UserNode**: per-user roadmap status
- **Achievement**: achievements earned by users

Enums used in the schema include:

- `Goal`
- `Unit`
- `SetType`
- `Track`
- `NodeStatus`

## API surface

### Auth

- `GET /api/auth/[...nextauth]`
- `POST /api/auth/[...nextauth]`

### App-specific routes

- `GET /api/og` - Open Graph image generation
- `GET /api/user-plan-state` - fetch current saved plan state for the authenticated user
- `POST /api/user-plan-state` - save plan state for the authenticated user

### Express API routes

The Express server also exposes routes for:

- auth
- lifts
- leaderboard
- profile
- roadmap
- AI chat

Exact payloads may evolve as the app changes, but these route groups are the main integration points in the server layer.

## Roadmap flow

The roadmap is organized around a progression loop:

1. Baseline assessment
2. Calorie strategy
3. Macro targets
4. Hydration protocol
5. Weekly training split
6. Meal combinations
7. Progress tracking
8. Adaptive adjustments

The app unlocks later phases based on completed dependencies and readiness signals.

## Workout flow

The training experience is built around practical execution:

- pick a goal
- select experience level
- choose available equipment
- review the adapted split
- expand a day to see six exercises
- inspect exercise details
- start workout mode
- record sets
- review weekly trends and adjust

## Troubleshooting

### The app starts on the wrong port

The frontend is configured for `3001`. If another app already uses that port, update the scripts and `NEXTAUTH_URL` together.

### Prisma client errors

Run:

```bash
npm run db:generate
```

If the schema changed significantly, also run:

```bash
npm run db:push
```

### Auth does not persist

Check:

- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- Google OAuth credentials
- browser cookies
- whether the app is running under `http://localhost:3001`

### AI chat or Gemini features fail

Check:

- `GEMINI_API_KEY`
- network access
- server logs from the Express process

### Build succeeds but the browser shows stale data

Clear:

- browser localStorage for the app
- `.next`
- `dist`

Then restart the dev server.

## Development notes

- The UI uses a dark VS Code-like theme intentionally.
- Roadmap state is persisted locally and also synchronized to the authenticated user when available.
- The current fitness planner emphasizes transformation and adherence over one-size-fits-all bodybuilding plans.
- The app is designed to be iterative, so a lot of the logic is centralized in planner modules rather than scattered across components.

## License

MIT

## Disclaimer

This app provides general fitness planning guidance and should not replace medical or professional advice. Users should adapt training and nutrition to their own health conditions, recovery, and professional recommendations.
