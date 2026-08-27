# Task List

- [ ] Task 1: Audit & Enforce Strict User Data Isolation in API Endpoints
  - Acceptance: All API endpoints strictly verify session token and return user-specific data.
  - Verify: Test APIs with different user session cookies.
  - Files: `web/src/app/api/logs/daily/route.ts`, `web/src/app/api/weight/route.ts`, `web/src/app/api/workout/route.ts`

- [ ] Task 2: Backend Date Range Query Support
  - Acceptance: APIs accept `startDate`, `endDate`, `month`, `year` and return filtered logs.
  - Verify: Curl API with different date parameters.
  - Files: `web/src/app/api/logs/daily/route.ts`

- [ ] Task 3: Create `DateFilterBar` UI Component
  - Acceptance: Interactive filter bar for Daily, Monthly, Yearly, and Custom Range.
  - Verify: Component renders correctly with active state indicators.
  - Files: `web/src/components/DateFilterBar.tsx`

- [ ] Task 4: Integrate Date Filter into Dashboard & Log Pages
  - Acceptance: Changing date filter updates displayed meals, workouts, and calories dynamically.
  - Verify: Manual check on `/dashboard`, `/meals`, `/workout`.
  - Files: `web/src/app/dashboard/page.tsx`

- [ ] Task 5: Upgrade `insights.ts` for Deep AI Health Analysis
  - Acceptance: `generateWeeklyInsights()` combines Meals, Workouts, and Weight Trends.
  - Verify: Unit test / function test of insights output with mock multi-metric data.
  - Files: `web/src/lib/insights.ts`

- [ ] Task 6: Upgrade AI Tips UI Page
  - Acceptance: Display dynamic multi-metric insights, weight trend correlation, and actionable tips.
  - Verify: Check `/insights` page rendering.
  - Files: `web/src/app/insights/page.tsx`

- [ ] Task 7: End-to-End Build Verification
  - Acceptance: `npm run build` succeeds without type errors or lint failures.
  - Verify: `npm run build` command exit code 0.
  - Files: All touched files.
