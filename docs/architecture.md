# KyuFit System Architecture

## Architecture Overview

KyuFit is a hybrid health-tracking platform combining a full-stack Next.js web application with an automated WhatsApp Vision AI assistant.

```
+------------------+         +-----------------------+         +------------------------+
|  WhatsApp Client | <-----> |   OpenClaw Gateway    | <-----> |   9Router LLM Proxy    |
|   (User Device)  |         | (10.70.63.89:18789)   |         | (10.70.63.89:20128/v1) |
+------------------+         +-----------------------+         +------------------------+
                                         |                                  |
                                         v                                  v
                             +-----------------------+         +------------------------+
                             |   KyuFit Web API      |         | LLM Providers          |
                             |  (Vercel Production)  |         | - Direct Gemini 2.5    |
                             +-----------------------+         | - OpenRouter Fallbacks |
                                         |                     +------------------------+
                                         v
                             +-----------------------+
                             | PostgreSQL Database   |
                             |   (Supabase Cloud)    |
                             +-----------------------+
```

## System Components

### 1. Web Application (`./web`)
- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **Database & ORM**: PostgreSQL via Supabase Cloud, Prisma ORM 7.8.0
- **Authentication**: JWT HTTP-Only cookie sessions
- **Deployment**: Vercel Serverless Platform

### 2. WhatsApp Bot Engine
- **Bot Gateway**: OpenClaw Gateway `v2026.6.9` running as a user `systemd` daemon on local host (`10.70.63.89`)
- **AI Router**: 9Router Proxy `v0.5.15` managed via PM2 (`127.0.0.1:20128/v1`)
- **Skill Engine**: `calorie-tracker` skill, posting intake logs to `POST /api/logs/add`

## Model Failover Policy

To maximize reliability and eliminate unexpected API charges, LLM invocation follows a multi-tier fallback pattern:

### Text Processing
1. `9router/gemini/gemini-2.5-flash` (Primary: Google AI Studio Direct, Free Tier)
2. `9router/openrouter/poolside/laguna-m.1:free` (Fallback 1: OpenRouter Free Model)
3. `9router/openrouter/google/gemma-4-31b-it:free` (Fallback 2: OpenRouter Free Model)
4. `9router/openrouter/google/gemini-3.1-flash-lite` (Last Resort: OpenRouter Paid Model)

### Vision & Image Processing
1. `9router/gemini/gemini-2.5-flash` (Primary: Google AI Studio Direct, Free Tier)
2. `9router/openrouter/google/gemini-3.1-flash-lite` (Last Resort: OpenRouter Paid Model)
