# Task List: Goal-Adapted AI Tips

- [ ] Task 1: Adapt `generateWeeklyInsights()` for Fitness Goals (`cut`, `bulk`, `maintain`)
  - Acceptance: Insights sentiments and text dynamically match the user's specific fitness goal.
  - Verify: Test function with `cut` vs `bulk` goals.
  - Files: `web/src/lib/insights.ts`

- [ ] Task 2: Pass `user.fitnessGoal` in `/api/user/insights/route.ts`
  - Acceptance: API queries user's goal from DB and forwards to insights generator.
  - Verify: Curl `/api/user/insights` for cut vs bulk users.
  - Files: `web/src/app/api/user/insights/route.ts`

- [ ] Task 3: Build & Deploy Verification
  - Acceptance: `npm run build` passes cleanly.
  - Verify: Execute `npm run build` and push.
  - Files: All touched files.
