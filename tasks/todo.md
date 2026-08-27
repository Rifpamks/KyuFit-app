# Task List: UX Refinement & Target Scaling

- [ ] Task 1: Re-integrate 5-day quick selector strip + Calendar Backdate Picker
  - Acceptance: Harian mode displays 5 recent days strip AND calendar picker for backdating.
  - Verify: Click on day pills and pick backdates in date picker.
  - Files: `web/src/components/DateFilterBar.tsx`

- [ ] Task 2: Backend Target Scaling & Daily Averages
  - Acceptance: API returns `daysInRange`, scaled period targets, and `dailyAverages`.
  - Verify: Test `/api/logs/daily?month=2026-07` output.
  - Files: `web/src/app/api/logs/daily/route.ts`

- [ ] Task 3: UI Cards Adaptation for Multi-Day Modes
  - Acceptance: Dashboard displays Rata-rata Harian and Period Totals without showing false "Kelebihan" statistics.
  - Verify: Check Monthly and Yearly tab cards on `/`.
  - Files: `web/src/app/page.tsx`

- [ ] Task 4: Full Build Verification & Deploy
  - Acceptance: `npm run build` succeeds cleanly.
  - Verify: Execute `npm run build`.
  - Files: All modified files.
