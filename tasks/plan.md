# Implementation Plan: Dynamic Progress Tab & Weight Chart Anomaly Fix

## Overview
Fix weight history API scoping by date filter and resolve the same-day log ordering/grouping anomaly on Recharts LineChart.

## Task List

### Phase 1: API Route Filtering
- [ ] Task 1: Update `/api/weight/history/route.ts` to parse date filter parameters and scope query to `[startWIB, endWIB]`.

### Phase 2: Chart Data Deduplication & Chronological Sorting
- [ ] Task 2: Group same-day weight logs in `page.tsx` so each date has a single latest entry, sorted chronologically ascending by timestamp.

### Phase 3: Client Fetch & Dynamic Sub-label
- [ ] Task 3: Forward date query parameters in `fetchData()` to `/api/weight/history` and render active period name in chart header.

### Phase 4: Build & Deployment Verification
- [ ] Task 4: Execute `npm run build`, verify smooth weight curve, commit & push to main.
