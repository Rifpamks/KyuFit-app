/**
 * TDEE Calculator Library
 * Based on Mifflin-St Jeor Equation (same methodology as Kalg.ai)
 */

type Gender = 'male' | 'female';
type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'extra_active';
type FitnessGoal = 'cut' | 'maintain' | 'bulk';

const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  extra_active: 1.9
};

const GOAL_MULTIPLIERS: Record<FitnessGoal, number> = {
  cut: 0.82,      // ~18% deficit
  maintain: 1.0,
  bulk: 1.12       // ~12% surplus
};

// Default macro ratio (percentage of total calories)
const MACRO_RATIOS = {
  protein: 0.30,   // 30%
  carbs: 0.45,     // 45%
  fat: 0.25        // 25%
};

/**
 * Calculate Resting Metabolic Rate using Mifflin-St Jeor Equation
 */
export function calculateRMR(weightKg: number, heightCm: number, age: number, gender: Gender): number {
  const base = (10 * weightKg) + (6.25 * heightCm) - (5 * age);
  return gender === 'male' ? base + 5 : base - 161;
}

/**
 * Calculate Total Daily Energy Expenditure
 */
export function calculateTDEE(rmr: number, activityLevel: ActivityLevel): number {
  return Math.round(rmr * ACTIVITY_FACTORS[activityLevel]);
}

/**
 * Calculate daily calorie target and macro targets
 */
export function calculateTargets(tdee: number, goal: FitnessGoal) {
  const dailyCalorieTarget = Math.round(tdee * GOAL_MULTIPLIERS[goal]);

  const targetProteinG = Math.round((dailyCalorieTarget * MACRO_RATIOS.protein) / 4);
  const targetCarbsG = Math.round((dailyCalorieTarget * MACRO_RATIOS.carbs) / 4);
  const targetFatsG = Math.round((dailyCalorieTarget * MACRO_RATIOS.fat) / 9);

  return { dailyCalorieTarget, targetProteinG, targetCarbsG, targetFatsG };
}

/**
 * Full calculation pipeline: RMR → TDEE → Targets
 */
export function calculateAll(data: {
  weightKg: number;
  heightCm: number;
  age: number;
  gender: Gender;
  activityLevel: ActivityLevel;
  goal: FitnessGoal;
}) {
  const rmr = calculateRMR(data.weightKg, data.heightCm, data.age, data.gender);
  const tdee = calculateTDEE(rmr, data.activityLevel);
  const targets = calculateTargets(tdee, data.goal);

  return {
    rmr: Math.round(rmr),
    tdee,
    ...targets
  };
}
