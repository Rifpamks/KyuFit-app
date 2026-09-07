/**
 * TDEE & Macro Calculator Library
 * Dual Scientific Engine:
 * 1. Mifflin-St Jeor (Standard default for general population without body fat data)
 * 2. Katch-McArdle (Advanced body-composition based, matching InBody machine BMR output)
 *
 * Macronutrient Allocation:
 * - Protein: Body-Weight / LBM Based (ISSN & Helms et al. 2014)
 *   - Cut: 2.0 g/kg body weight (or 2.4 g/kg LBM) to protect muscle mass during deficit
 *   - Maintain: 1.8 g/kg body weight (or 2.0 g/kg LBM)
 *   - Bulk: 1.8 g/kg body weight (or 2.0 g/kg LBM) supported by carbohydrate energy surplus
 * - Fat: 25% of total calories (minimum 0.8 g/kg for hormonal & joint health)
 * - Carbohydrates: Remaining calories allocated flexibly for workout performance & glycogen
 */

export type Gender = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'extra_active';
export type FitnessGoal = 'cut' | 'maintain' | 'bulk';

export const ACTIVITY_FACTORS: Record<ActivityLevel, { factor: number; label: string; desc: string }> = {
  sedentary: { factor: 1.2, label: 'Sedentary', desc: 'Jarang olahraga, kerja duduk' },
  light: { factor: 1.375, label: 'Ringan', desc: 'Olahraga 1-3x / minggu' },
  moderate: { factor: 1.55, label: 'Moderat', desc: 'Olahraga 3-5x / minggu' },
  active: { factor: 1.725, label: 'Aktif', desc: 'Olahraga 6-7x / minggu' },
  extra_active: { factor: 1.9, label: 'Sangat Aktif', desc: 'Fisik berat / atlet harian' },
};

export const GOAL_CONFIG: Record<FitnessGoal, { multiplier: number; label: string; desc: string }> = {
  cut: { multiplier: 0.82, label: 'Turunkan Berat (Cut)', desc: 'Defisit kalori terkontrol -18%' },
  maintain: { multiplier: 1.0, label: 'Pertahankan (Maintain)', desc: 'Kalori seimbang' },
  bulk: { multiplier: 1.12, label: 'Naikkan Berat (Bulk)', desc: 'Surplus kalori terukur +12%' },
};

/**
 * Calculate Resting Metabolic Rate using Mifflin-St Jeor Equation
 */
export function calculateRMRMifflin(weightKg: number, heightCm: number, age: number, gender: Gender): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return gender === 'male' ? base + 5 : base - 161;
}

/**
 * Calculate Resting Metabolic Rate using Katch-McArdle Equation
 * Based on Lean Body Mass (LBM) in kg. Matches InBody BMR formula.
 */
export function calculateRMRKatchMcArdle(lbmKg: number): number {
  return 370 + 21.6 * lbmKg;
}

export interface CalculateTargetsOptions {
  weightKg: number;
  heightCm: number;
  age: number;
  gender: Gender;
  activityLevel: ActivityLevel;
  goal: FitnessGoal;
  bodyFatPercent?: number | null;
  skeletalMuscleMassKg?: number | null;
  visceralFatLevel?: number | null;
  inbodyScore?: number | null;
}

export interface CalculationResult {
  rmr: number;
  tdee: number;
  dailyCalorieTarget: number;
  targetProteinG: number;
  targetCarbsG: number;
  targetFatsG: number;
  formulaUsed: 'katch_mcardle' | 'mifflin_st_jeor';
  formulaName: string;
  lbmKg?: number;
  proteinPerKg: number;
  proteinBaseType: 'lbm' | 'total_weight';
  warningLevel?: 'low' | 'moderate' | 'optimal' | 'high' | 'very_high';
}

export function calculateAll(options: CalculateTargetsOptions): CalculationResult {
  const { weightKg, heightCm, age, gender, activityLevel, goal, bodyFatPercent } = options;

  let rmr: number;
  let formulaUsed: 'katch_mcardle' | 'mifflin_st_jeor' = 'mifflin_st_jeor';
  let formulaName = 'Mifflin-St Jeor (Standar)';
  let lbmKg: number | undefined;

  // Determine if valid body fat % is provided (typical range 3% - 60%)
  if (typeof bodyFatPercent === 'number' && bodyFatPercent >= 3 && bodyFatPercent <= 60) {
    lbmKg = Number((weightKg * (1 - bodyFatPercent / 100)).toFixed(1));
    rmr = Math.round(calculateRMRKatchMcArdle(lbmKg));
    formulaUsed = 'katch_mcardle';
    formulaName = 'Katch-McArdle (InBody LBM Edition)';
  } else {
    rmr = Math.round(calculateRMRMifflin(weightKg, heightCm, age, gender));
  }

  // Calculate TDEE
  const activityFactor = ACTIVITY_FACTORS[activityLevel]?.factor || 1.2;
  const tdee = Math.round(rmr * activityFactor);

  // Calculate Daily Calorie Target
  const goalMultiplier = GOAL_CONFIG[goal]?.multiplier || 1.0;
  let dailyCalorieTarget = Math.round(tdee * goalMultiplier);

  // Safety floor: Minimum 1500 kcal for males, 1200 kcal for females to prevent metabolic suppression
  const minimumSafeCalories = gender === 'male' ? 1500 : 1200;
  if (dailyCalorieTarget < minimumSafeCalories) {
    dailyCalorieTarget = minimumSafeCalories;
  }

  // Protein Allocation (Scientific g/kg approach)
  let targetProteinG: number;
  let proteinPerKg: number;
  let proteinBaseType: 'lbm' | 'total_weight';

  if (lbmKg && lbmKg > 0) {
    // If Lean Body Mass is available:
    // Cut: 2.4 g/kg LBM, Maintain: 2.0 g/kg LBM, Bulk: 2.0 g/kg LBM
    const factor = goal === 'cut' ? 2.4 : 2.0;
    targetProteinG = Math.round(lbmKg * factor);
    proteinPerKg = factor;
    proteinBaseType = 'lbm';
  } else {
    // If only Total Body Weight is available:
    // Cut: 2.0 g/kg BB (muscle retention), Maintain: 1.8 g/kg BB, Bulk: 1.8 g/kg BB
    const factor = goal === 'cut' ? 2.0 : 1.8;
    targetProteinG = Math.round(weightKg * factor);
    proteinPerKg = factor;
    proteinBaseType = 'total_weight';
  }

  // Fat Allocation:
  // Standard 25% of total calories (with minimum 0.8 g/kg body weight for hormone balance)
  const fatCalories = dailyCalorieTarget * 0.25;
  const minFatG = Math.round(weightKg * 0.8);
  const targetFatsG = Math.max(Math.round(fatCalories / 9), minFatG);

  // Carbohydrate Allocation:
  // Residual flexible macro = (Total Calories - Protein Kcal - Fat Kcal) / 4
  const proteinKcal = targetProteinG * 4;
  const fatKcal = targetFatsG * 9;
  const remainingCarbKcal = Math.max(0, dailyCalorieTarget - proteinKcal - fatKcal);
  const targetCarbsG = Math.round(remainingCarbKcal / 4);

  // Warning bands evaluation
  const effectiveRatio = targetProteinG / weightKg;
  let warningLevel: 'low' | 'moderate' | 'optimal' | 'high' | 'very_high' = 'optimal';
  if (effectiveRatio < 1.2) warningLevel = 'low';
  else if (effectiveRatio < 1.6) warningLevel = 'moderate';
  else if (effectiveRatio <= 2.2) warningLevel = 'optimal';
  else if (effectiveRatio <= 2.5) warningLevel = 'high';
  else warningLevel = 'very_high';

  return {
    rmr,
    tdee,
    dailyCalorieTarget,
    targetProteinG,
    targetCarbsG,
    targetFatsG,
    formulaUsed,
    formulaName,
    lbmKg,
    proteinPerKg,
    proteinBaseType,
    warningLevel,
  };
}
