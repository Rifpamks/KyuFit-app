# Task List: Weight Chart Anomaly Fix

- [ ] Task 1: Update `/api/weight/history/route.ts` with date range parsing
  - Acceptance: API returns weight logs scoped to `[startWIB, endWIB]`.
  - Verify: Test `/api/weight/history?month=2026-07`.
  - Files: `web/src/app/api/weight/history/route.ts`

- [ ] Task 2: Group same-day weight logs & sort chronologically in `page.tsx`
  - Acceptance: `chartData` has unique date points in ascending time order.
  - Verify: Check chart rendering from 65kg to 68kg.
  - Files: `web/src/app/page.tsx`

- [ ] Task 3: Forward queryUrl & dynamic sub-label in `page.tsx`
  - Acceptance: Chart header displays active period name.
  - Verify: Check sub-label on filter change.
  - Files: `web/src/app/page.tsx`

- [ ] Task 4: Build & Deploy Verification
  - Acceptance: `npm run build` passes cleanly.
  - Verify: Execute `npm run build` and push.
  - Files: All touched files.
