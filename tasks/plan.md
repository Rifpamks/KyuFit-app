# Implementation Plan: KyuFit UX Refinement & Date Range Target Scaling

## Overview
Refine the KyuFit UI/UX for Date Filtering and Target Aggregation based on user review:
1. **Daily Mode UX**: Restore the 5-day quick selector strip (`MIN 23`, `SEN 24`, `SEL 25`, `RAB 26`, `KAM 27`) alongside a calendar icon button for backdating beyond 5 days.
2. **Date Range Target Scaling**: Fix the target mismatch in Monthly, Yearly, and Custom Range modes by displaying both **Rata-Rata Harian (Daily Average)** and **Total Accumulation Proportional Target** ($Target_{daily} \times N_{days}$).

## Architecture & Math Specification

### Target Scaling Formula
When mode is `monthly`, `yearly`, or `custom` with duration $N$ days (number of days in range):
- **Period Target Calories** = $Target_{daily} \times N$
- **Period Target Protein** = $Target_{protein} \times N$
- **Period Target Carbs** = $Target_{carbs} \times N$
- **Period Target Fats** = $Target_{fats} \times N$

### Dual-View Display Strategy
1. **Daily Average Toggle / Subheader**:
   - Displays **Rata-Rata Harian (Daily Avg)**: e.g. `234.7 kcal / 1779 kcal per hari` (with % completion relative to daily target).
   - Displays **Total Akumulasi Periode (Period Total)**: e.g. `7,277 kcal / 55,149 kcal total bulan ini`.

---

## Task List

### Phase 1: UX Restoration for Daily Mode
- [ ] Task 1: Re-integrate 5-day quick selector strip + Calendar Backdate Picker in `DateFilterBar.tsx`

### Phase 2: Backend & Logic Target Scaling
- [ ] Task 2: Update `/api/logs/daily` response to include `daysInRange`, `periodTargetCalories`, `periodTargetProteinG`, `periodTargetCarbsG`, `periodTargetFatsG`, and `dailyAverages`.

### Phase 3: UI Enhancement for Multi-Day Modes
- [ ] Task 3: Update `page.tsx` Dashboard Cards to display scaled targets & daily averages in Monthly, Yearly, and Custom Range modes.

### Phase 4: Verification
- [ ] Task 4: Run `npm run build` and verify all date modes.
