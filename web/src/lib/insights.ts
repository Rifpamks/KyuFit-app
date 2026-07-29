export interface TargetProjection {
  targetWeightKg: number;
  currentWeightKg: number;
  weightDiffKg: number;
  avgDailyDeficitOrSurplus: number; // positive = surplus, negative = deficit
  estimatedDaysRemaining: number | null; // null if 0 deficit/surplus or maintain
  estimatedTargetDate: string | null; // ISO Date YYYY-MM-DD or null
  paceCategory: "aggressive" | "moderate" | "steady" | "stable" | "slow";
}

export interface WeeklyInsight {
  id: string;
  iconType: "flame" | "trophy" | "alert" | "pie" | "activity";
  title: string;
  description: string;
  sentiment: "positive" | "neutral" | "warning";
}

export interface MealSuggestion {
  id: string;
  title: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
  category: "high_protein" | "balanced_snack" | "light_meal";
  note: string;
}

/**
 * Calculates target date projection based on recent 7 days deficit/surplus
 */
export function calculateTargetProjection(
  currentWeightKg: number,
  targetWeightKg: number,
  recent7DaysCalories: { calories: number; workoutCalories: number }[],
  dailyTargetCalories: number,
  fitnessGoal: string = "cut"
): TargetProjection {
  const weightDiffKg = Number((targetWeightKg - currentWeightKg).toFixed(1));

  if (Math.abs(weightDiffKg) < 0.2 || fitnessGoal === "maintain") {
    return {
      targetWeightKg,
      currentWeightKg,
      weightDiffKg: 0,
      avgDailyDeficitOrSurplus: 0,
      estimatedDaysRemaining: null,
      estimatedTargetDate: null,
      paceCategory: "stable",
    };
  }

  // Calculate average daily energy balance over 7 days (or available days)
  let totalNetCalories = 0;
  const daysCount = Math.max(recent7DaysCalories.length, 1);

  for (const day of recent7DaysCalories) {
    // Net Intake = Intake - Workout
    const netIntake = day.calories - day.workoutCalories;
    // Energy balance = Net Intake - Daily Target
    totalNetCalories += netIntake - dailyTargetCalories;
  }

  // Average daily surplus/deficit relative to target (approx 500 kcal deficit = 0.5kg/week loss)
  const avgNetBalance = totalNetCalories / daysCount; // e.g. -500 kcal/day

  // Assuming 1kg body weight approx 7700 kCal
  const totalCaloriesNeeded = Math.abs(weightDiffKg) * 7700;

  // Expected daily rate towards goal
  let dailyProgressCalories = 0;
  if (fitnessGoal === "cut" && weightDiffKg < 0) {
    // Needs deficit. Target calorie is already deficit.
    // Standard recommended deficit is 500 kcal/day (0.5kg/week)
    dailyProgressCalories = Math.max(500 - avgNetBalance, 200);
  } else if (fitnessGoal === "bulk" && weightDiffKg > 0) {

    dailyProgressCalories = Math.max(350 + avgNetBalance, 200);
  } else {
    dailyProgressCalories = 350;
  }

  const estimatedDays = Math.ceil(totalCaloriesNeeded / dailyProgressCalories);

  // Calculate target date
  const targetDateObj = new Date();
  targetDateObj.setDate(targetDateObj.getDate() + estimatedDays);
  const estimatedTargetDate = targetDateObj.toISOString().split("T")[0];

  let paceCategory: TargetProjection["paceCategory"] = "moderate";
  if (dailyProgressCalories > 650) paceCategory = "aggressive";
  else if (dailyProgressCalories >= 400) paceCategory = "moderate";
  else paceCategory = "steady";

  return {
    targetWeightKg,
    currentWeightKg,
    weightDiffKg,
    avgDailyDeficitOrSurplus: Math.round(avgNetBalance),
    estimatedDaysRemaining: estimatedDays,
    estimatedTargetDate,
    paceCategory,
  };
}

/**
 * Generates Weekly AI Health Insights from 7-day logs
 */
export function generateWeeklyInsights(
  meals: { calories: number; proteinG: number; carbsG: number; fatsG: number }[],
  workouts: { caloriesBurned: number; durationMinutes: number }[],
  targets: { dailyCalorieTarget: number; targetProteinG: number }
): WeeklyInsight[] {
  const insights: WeeklyInsight[] = [];

  const totalProteinLogged = meals.reduce((sum, m) => sum + (m.proteinG || 0), 0);
  const avgProteinDaily = Math.round(totalProteinLogged / 7);

  // 1. Protein Intake Insight
  const proteinRatio = Math.round((avgProteinDaily / targets.targetProteinG) * 100);
  if (proteinRatio >= 80) {
    insights.push({
      id: "protein-high",
      iconType: "trophy",
      title: "Konsistensi Protein Sangat Baik!",
      description: `Rata-rata asupan protein kamu minggu ini mencapai ${avgProteinDaily}g (${proteinRatio}% dari target). Sangat mendukung pemulihan otot!`,
      sentiment: "positive",
    });
  } else {
    insights.push({
      id: "protein-low",
      iconType: "alert",
      title: "Asupan Protein Perlu Ditingkatkan",
      description: `Rata-rata protein harian kamu baru ${avgProteinDaily}g dari target ${targets.targetProteinG}g. Pertimbangkan tambah telur, dada ayam, atau tempe.`,
      sentiment: "warning",
    });
  }

  // 2. Workout & Exhaust Insight
  const totalWorkoutCalories = workouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
  const totalWorkoutMinutes = workouts.reduce((sum, w) => sum + (w.durationMinutes || 0), 0);

  if (totalWorkoutCalories > 0) {
    insights.push({
      id: "workout-active",
      iconType: "flame",
      title: "Pembakaran Kalori Aktif",
      description: `Kamu berhasil membakar ${totalWorkoutCalories} kCal lewat ${totalWorkoutMinutes} menit sesi latihan minggu ini. Kerja bagus!`,
      sentiment: "positive",
    });
  } else {
    insights.push({
      id: "workout-idle",
      iconType: "activity",
      title: "Tingkatkan Aktivitas Fisik",
      description: "Belum ada sesi olahraga terdaftar minggu ini. Jalan santai 20 menit atau latihan beban ringan bisa bantu tingkatkan metabolisme.",
      sentiment: "neutral",
    });
  }

  // 3. Nutrition Balance Insight
  const totalCalories = meals.reduce((sum, m) => sum + (m.calories || 0), 0);
  const totalFat = meals.reduce((sum, m) => sum + (m.fatsG || 0), 0);
  const fatCalories = totalFat * 9;
  const fatPercentage = totalCalories > 0 ? Math.round((fatCalories / totalCalories) * 100) : 0;

  if (fatPercentage > 35) {
    insights.push({
      id: "fat-high",
      iconType: "pie",
      title: "Proporsi Lemak Cukup Tinggi",
      description: `${fatPercentage}% kalori minggu ini berasal dari lemak. Coba kurangi gorengan & olahan minyak berlebih agar defisit lebih tajam.`,
      sentiment: "warning",
    });
  } else {
    insights.push({
      id: "macro-balanced",
      iconType: "pie",
      title: "Keseimbangan Makro Nutrisi Terjaga",
      description: "Distribusi karbohidrat, protein, dan lemak kamu berada di kisaran sehat sesuai target TDEE.",
      sentiment: "positive",
    });
  }

  return insights;
}

/**
 * Suggests meal options based on remaining daily calories & protein
 */
export function recommendMealSuggestions(
  remainingCalories: number,
  remainingProteinG: number
): MealSuggestion[] {
  const suggestions: MealSuggestion[] = [];

  if (remainingCalories <= 0) {
    suggestions.push({
      id: "zero-budget",
      title: "Air Putih / Teh Hijau Tanpa Gula",
      calories: 0,
      proteinG: 0,
      carbsG: 0,
      fatsG: 0,
      category: "light_meal",
      note: "Budget kalori hari ini sudah terpenuhi 100%. Fokus hidrasi agar tubuh tetap fit!",
    });
    return suggestions;
  }

  if (remainingProteinG > 20) {
    suggestions.push({
      id: "high-protein-1",
      title: "Dada Ayam Bakar / Panggang (150g)",
      calories: 240,
      proteinG: 31,
      carbsG: 0,
      fatsG: 4,
      category: "high_protein",
      note: "Sangat efektif menutup kekurangan protein tanpa menghabiskan banyak budget kalori.",
    });
    suggestions.push({
      id: "high-protein-2",
      title: "Telur Rebus (2 Butir) + Tahu Kukus",
      calories: 220,
      proteinG: 18,
      carbsG: 4,
      fatsG: 12,
      category: "balanced_snack",
      note: "Cemilan kaya protein & lemak sehat yang cepat disiapkan.",
    });
  } else {
    suggestions.push({
      id: "snack-1",
      title: "Greek Yogurt / Yoghurt Plain + Buah Apel",
      calories: 160,
      proteinG: 10,
      carbsG: 22,
      fatsG: 2,
      category: "balanced_snack",
      note: "Segar, tinggi serat, dan mengenyangkan untuk sore hari.",
    });
    suggestions.push({
      id: "snack-2",
      title: "Oatmeal Polos (4 Opsional Sendok) + Pisang",
      calories: 190,
      proteinG: 5,
      carbsG: 36,
      fatsG: 3,
      category: "light_meal",
      note: "Karbohidrat kompleks yang memberikan energi stabil sebelum atau sesudah gym.",
    });
  }

  return suggestions;
}
