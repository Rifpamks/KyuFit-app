# KyuFit - AI-Powered Health & Calorie Tracker

KyuFit is a multi-user health platform that combines a Next.js web dashboard with an AI-powered WhatsApp assistant ("Kyu"). The system tracks daily energy balance, macronutrient targets, gym workouts, and body weight trends.

## Features

- **Energy Balance Ring**: Calculates daily calorie intake, workout expenditure, and remaining allowance.
- **TDEE & Macro Engine**: Automated RMR, TDEE, and macro target calculation via Mifflin-St Jeor equation.
- **WhatsApp Vision Assistant (Kyu)**: Send food photos on WhatsApp for instant nutritional estimation and direct logging.
- **Weight Trend Tracking**: Interactive weight logging chart via Recharts.
- **Multi-User Authentication**: JWT HTTP-Only session cookies.

## System Architecture

```
WhatsApp User <---> OpenClaw Gateway <---> 9Router LLM Proxy <---> LLM Providers (Gemini / OpenRouter)
                         |
                         v
                 Next.js Web API <---> Supabase PostgreSQL
```

For detailed architectural details and model failover policies, see [docs/architecture.md](docs/architecture.md).

## Quick Start (Development)

### Web Application (`./web`)

```bash
cd web
npm install
npx prisma db push
npm run dev
```

The web dashboard will be available at `http://localhost:3000`.

### Scripts

- `integrate_bot_api.py`: Configures API endpoints for OpenClaw calorie-tracker skill.
- `update_bot_prompts.py`: Updates prompt templates for nutrition estimation format.

## Deployment & Operations

For deployment instructions on Vercel and standby gateway operation commands, see [docs/deployment.md](docs/deployment.md).

## Specification Document

Full specification and acceptance criteria are documented in [spec.md](spec.md).
