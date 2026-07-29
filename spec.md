# Spec: KyuFit AI Health & Calorie Tracker Ecosystem

## 📋 Objective
KyuFit is a personalized, multi-user AI health, calorie, macronutrient, weight, and gym tracking platform. It seamlessly integrates a modern Next.js Web Dashboard with an AI-powered WhatsApp Assistant ("Kyu"). 

### User Stories & Acceptance Criteria
- **Multi-User Auth**: Users can register with Email, Password, and WhatsApp Number, and log in securely via JWT HTTP-Only Cookies.
- **Personalized Target (TDEE Engine)**: Upon onboarding, users enter personal stats (age, gender, height, weight, activity level, fitness goal) to automatically calculate RMR, TDEE, and target macros (Protein, Carbs, Fats) via the Mifflin-St Jeor equation.
- **Energy Balance Tracking**: Users can view daily calorie intake (`MealLog`), gym calorie expenditure (`WorkoutLog`), and remaining calorie budget ($\text{Remaining} = \text{Target} - \text{Intake} + \text{Exhaust}$).
- **Historical Navigation**: Users can navigate through calendar dates to view daily meal logs, workout history, and energy ring progress.
- **WhatsApp Vision AI Assistant (Kyu)**: Users can send food/beverage photos to the WhatsApp Bot (Kyu). Kyu estimates calories/macros using Gemini 2.5 Flash, formats the output in Kalg.ai mobile-friendly style, and automatically logs confirmed entries to the KyuFit DB via API.

---

## 🛠️ Tech Stack

| Layer | Component | Specification / Version |
|---|---|---|
| **Frontend & Backend** | Web Framework | Next.js 16 (App Router), React 19, TypeScript |
| **Styling & UI** | CSS System | TailwindCSS v4, Lucide React Icons |
| **Visualization** | Charts | Recharts (Interactive Weight Log LineChart) |
| **Database & ORM** | Database | PostgreSQL (Supabase Cloud + Connection Pooler) |
| | ORM | Prisma ORM 7.8.0 (`@prisma/client`, `@prisma/adapter-pg`) |
| **Bot Gateway** | WhatsApp Gateway | OpenClaw Gateway (v2026.6.9) running on Standby Laptop |
| **AI Proxy** | LLM Router | 9Router (v0.5.15) via PM2 (`127.0.0.1:20128/v1`) |
| **LLM Model** | Vision & Chat | Google AI Studio Free Tier (`gemini-2.5-flash`) |

---

## ⚡ Commands

```bash
# Web Development & Build Commands (in ./web)
npm run dev                  # Start local Next.js dev server on http://localhost:3000
npm run build                # Build production bundle
npm run start                # Run production Next.js server
npm run lint                 # Run ESLint validation

# Prisma Database Commands (in ./web)
npx prisma generate          # Generate Prisma Client
npx prisma db push           # Push schema changes to PostgreSQL database
npx prisma studio            # Open Prisma Studio GUI

# Bot Maintenance & Daemon Commands (on Standby Laptop 10.70.63.89)
pm2 status                   # Check 9Router status
pm2 restart 9router          # Restart 9Router AI Proxy
systemctl --user status openclaw-gateway.service   # Check OpenClaw status
systemctl --user restart openclaw-gateway.service  # Restart OpenClaw service
journalctl --user -u openclaw-gateway.service -f  # Real-time OpenClaw logs

# Infrastructure Keep-Alive (on Standby Laptop 10.70.63.89)
node /home/parkee/scripts/keepalive.js  # Execute Supabase ping script
```

---

## 📁 Project Structure

```
/home/rifpamks/Documents/AI Bot/
├── README.md                      # Operational guide & cheat sheet for Kyu Bot
├── spec.md                        # Master Specification Document (This File)
├── update_bot_prompts.py          # Script to update OpenClaw prompts to Kalg.ai format
├── integrate_bot_api.py           # Script to inject KyuFit API endpoint into OpenClaw
├── md/                            # Specs & Review Analysis Documents
│   ├── spec login and registerv1.md
│   └── reviewspecv1.md
└── web/                           # Next.js Full-Stack Application
    ├── .env                       # Supabase PostgreSQL Database URLs
    ├── keepalive.js               # Supabase Database Keep-Alive Script
    ├── prisma/
    │   └── schema.prisma          # Database models (User, MealLog, WeightLog, WorkoutLog)
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx           # Main Interactive Dashboard (Energy Ring, Date Nav, Logs)
    │   │   ├── login/page.tsx     # Login Page
    │   │   ├── register/page.tsx  # Multi-User Registration Page
    │   │   ├── onboarding/page.tsx# TDEE Multi-Step Calculator Page
    │   │   └── api/               # Next.js API Routes (auth, logs, onboarding, user, workout, weight)
    │   ├── lib/
    │   │   ├── auth.ts            # JWT Cookie Session Utilities
    │   │   ├── tdee.ts            # Mifflin-St Jeor TDEE & RMR Engine
    │   │   ├── user.ts            # User session helper
    │   │   └── prisma.ts          # Singleton Prisma Client Instance
    │   └── proxy.ts               # Next.js Proxy Middleware
    └── package.json               # Dependencies & scripts
```

---

## 💻 Code Style Conventions

### React/Next.js Client Components
* Use `"use client";` directive at the top of client pages.
* Prefer clean functional components with explicit TypeScript interfaces.
* Use TailwindCSS utility classes for styling. No ad-hoc inline style objects unless necessary for dynamic chart bounds.

### Example Code Snippet:
```typescript
interface DailySummary {
  user: {
    dailyCalorieTarget: number;
    targetProteinG: number;
    targetCarbsG: number;
    targetFatsG: number;
    fitnessGoal: "cut" | "bulk" | "maintain";
  };
  meals: Meal[];
  workouts: Workout[];
  summary: {
    calories: number;
    proteinG: number;
    carbsG: number;
    fatsG: number;
    workoutCalories: number;
  };
}

export function calculateEnergyBalance(summary: DailySummary["summary"], target: number): number {
  return target - summary.calories + summary.workoutCalories;
}
```

---

## 🧪 Testing Strategy

* **API Verification**: Verify endpoints (`POST /api/logs/add`, `GET /api/logs/daily?date=`) using `curl` or automated POST scripts.
* **Database Connection Test**: Execute `node keepalive.js` to ensure PostgreSQL connection pooler responds with `SELECT NOW()`.
* **Bot Vision Test**: Send food image via WhatsApp to verify Gemini vision analysis and Kalg.ai formatted output.
* **UI Responsiveness**: Verify dashboard views on mobile viewport (375px) and desktop (1440px).

---

## 🛡️ Boundaries

### Always Do:
- Validate input payloads (`calories`, `proteinG`, `carbsG`, `fatsG`) before database write.
- Enforce ISO string dates (`YYYY-MM-DD`) for date-filtered queries.
- Ensure JWT authentication token is verified on protected API routes.

### Ask First:
- Altering existing Prisma schema fields that require database migration.
- Adding third-party external npm dependencies.
- Modifying systemd or PM2 daemon service configuration on standby laptop.

### Never Do:
- Commit raw API keys or database passwords to public repositories.
- Perform direct raw SQL data patching on production database without flyway/ansible migration scripts.
- Use markdown tables in WhatsApp Bot responses (must use bullet points with cat emojis).

---

##🎯 Success Criteria

- [x] Multi-user registration & login flow complete with JWT cookies.
- [x] Onboarding TDEE calculator accurately calculates target calories based on Mifflin-St Jeor.
- [x] Web Dashboard displays Dual-Progress Energy Ring ($\text{Target} - \text{Intake} + \text{Exhaust}$).
- [x] Date Navigation bar allows viewing food logs and workout logs by date.
- [x] Recharts Weight Log line chart renders 30-day weight trends.
- [x] WhatsApp Bot Kyu analyzes food photos and posts entries directly to KyuFit API.
- [x] Automated daily cron keep-alive script prevents Supabase database auto-pausing.

---

## ❓ Open Questions & Future Backlog
1. **Public Tunneling**: Should we configure Tailscale or Cloudflare Tunnel to expose `http://localhost:3000` to public mobile browsers?
2. **Auto Recalculate Prompt**: Should the dashboard prompt users to update their TDEE when weight changes by $> 2\text{ kg}$?
3. **Local Database Migration**: Should we migrate from Supabase Cloud to local PostgreSQL on standby laptop (`10.70.63.89`) for zero latency?
