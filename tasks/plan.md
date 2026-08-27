# Implementation Plan: Goal-Adapted & Dynamic LLM AI Tips

## Overview
Adapt AI Tips insights, sentiments, and recommendations according to the user's explicit fitness goal (`"cut" | "bulk" | "maintain"`).

## Task List

### Phase 1: Fitness Goal Matrix Integration in `insights.ts`
- [ ] Task 1: Update `generateWeeklyInsights()` to accept `fitnessGoal` parameter and adapt sentiments (positive/warning/neutral), titles, and descriptions accordingly.

### Phase 2: Route & Controller Update
- [ ] Task 2: Pass `user.fitnessGoal` into `generateWeeklyInsights()` inside `/api/user/insights/route.ts`.

### Phase 3: Build Verification & Deployment
- [ ] Task 3: Execute `npm run build`, verify Cut vs Bulk vs Maintain outputs, commit & push to main.
