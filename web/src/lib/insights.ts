export interface TargetProjection {
  targetWeightKg: number;
  currentWeightKg: number;
  weightDiffKg: number;
  avgDailyDeficitOrSurplus: number; // positive = surplus, negative = deficit
  estimatedDaysRemaining: number | null; // null if 0 deficit/surplus or maintain
  estimatedTargetDate: string | null; // ISO Date YYYY-MM-DD or null
  paceCategory: "aggressive" | "moderate" | "steady" | "stable" | "slow";
  weightTrendKgPerWeek?: number;
}

export interface WeeklyInsight {
  id: string;
  iconType: "flame" | "trophy" | "alert" | "pie" | "activity" | "scale";
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
 * Calculates target date projection based on recent calories and weight logs
 */
export function calculateTargetProjection(
  currentWeightKg: number,
  targetWeightKg: number,
  recent7DaysCalories: { calories: number; workoutCalories: number }[],
  dailyTargetCalories: number,
  fitnessGoal: string = "cut",
  weightLogs: { weightKg: number; timestamp: Date | string }[] = []
): TargetProjection {
  const weightDiffKg = Number((targetWeightKg - currentWeightKg).toFixed(1));

  // Calculate actual weight trend over available weight logs
  let weightTrendKgPerWeek = 0;
  if (weightLogs.length >= 2) {
    const sorted = [...weightLogs].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const daysDiff = Math.max(
      (new Date(last.timestamp).getTime() - new Date(first.timestamp).getTime()) /
        (1000 * 60 * 60 * 24),
      1
    );
    const diff = last.weightKg - first.weightKg;
    weightTrendKgPerWeek = Number(((diff / daysDiff) * 7).toFixed(2));
  }

  if (Math.abs(weightDiffKg) < 0.2 || fitnessGoal === "maintain") {
    return {
      targetWeightKg,
      currentWeightKg,
      weightDiffKg: 0,
      avgDailyDeficitOrSurplus: 0,
      estimatedDaysRemaining: null,
      estimatedTargetDate: null,
      paceCategory: "stable",
      weightTrendKgPerWeek: 0,
    };
  }

  // Calculate average daily energy balance
  let totalNetCalories = 0;
  const daysCount = Math.max(recent7DaysCalories.length, 1);

  for (const day of recent7DaysCalories) {
    const netIntake = day.calories - day.workoutCalories;
    totalNetCalories += netIntake - dailyTargetCalories;
  }

  const avgNetBalance = totalNetCalories / daysCount;
  const totalCaloriesNeeded = Math.abs(weightDiffKg) * 7700;

  let dailyProgressCalories = 0;
  if (fitnessGoal === "cut" && weightDiffKg < 0) {
    dailyProgressCalories = Math.max(500 - avgNetBalance, 200);
  } else if (fitnessGoal === "bulk" && weightDiffKg > 0) {
    dailyProgressCalories = Math.max(350 + avgNetBalance, 200);
  } else {
    dailyProgressCalories = 350;
  }

  const estimatedDays = Math.ceil(totalCaloriesNeeded / dailyProgressCalories);

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
    weightTrendKgPerWeek,
  };
}

/**
 * Generates Deep AI Health Insights synthesizing Meals + Workouts + Weight Logs,
 * dynamically adapting to the user's specific fitness goal (Cut, Bulk, Maintain).
 */
export function generateWeeklyInsights(
  meals: { calories: number; proteinG: number; carbsG: number; fatsG: number }[],
  workouts: { caloriesBurned: number; durationMinutes: number }[],
  targets: { dailyCalorieTarget: number; targetProteinG: number },
  weightLogs: { weightKg: number; timestamp: Date | string }[] = [],
  fitnessGoal: string = "cut",
  daysInRange: number = 7,
  periodLabel: string = "Periode Aktif"
): WeeklyInsight[] {
  const insights: WeeklyInsight[] = [];
  const normalizedGoal = (fitnessGoal || "cut").toLowerCase();

  // 1. Weight Progress & Calorie Correlation Insight (Goal-Adapted)
  if (weightLogs.length >= 2) {
    const sorted = [...weightLogs].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    const initial = sorted[0].weightKg;
    const latest = sorted[sorted.length - 1].weightKg;
    const diff = Number((latest - initial).toFixed(1));

    if (normalizedGoal === "bulk") {
      if (diff > 0) {
        insights.push({
          id: "weight-gain-trend",
          iconType: "scale",
          title: `Progres Muscle/Weight Gain On Track (${periodLabel})`,
          description: `Timbangan Anda menunjukkan kenaikan +${diff} kg. Surplus kalori dan asupan protein Anda mendukung pembentukan massa otot!`,
          sentiment: "positive",
        });
      } else if (diff < 0) {
        insights.push({
          id: "weight-loss-trend",
          iconType: "scale",
          title: "Penurunan BB (Menghambat Bulking)",
          description: `Terjadi penurunan ${Math.abs(diff)} kg pada ${periodLabel}. Tingkatkan asupan kalori & karbohidrat agar target bulking tercapai.`,
          sentiment: "warning",
        });
      } else {
        insights.push({
          id: "weight-stable",
          iconType: "scale",
          title: "Berat Badan Stagnan (Bulking)",
          description: "Berat badan belum mengalami kenaikan. Anda membutuhkan sedikit surplus kalori (300-500 kcal) untuk menambah BB.",
          sentiment: "neutral",
        });
      }
    } else if (normalizedGoal === "maintain") {
      if (Math.abs(diff) <= 0.5) {
        insights.push({
          id: "weight-stable",
          iconType: "scale",
          title: `Berat Badan Sangat Stabil (${periodLabel})`,
          description: `Berat badan Anda bertahan sangat stabil di angka ${latest} kg. Asupan energi harian Anda berada tepat di titik TDEE maintenance.`,
          sentiment: "positive",
        });
      } else if (diff > 0.5) {
        insights.push({
          id: "weight-gain-trend",
          iconType: "scale",
          title: "Kenaikan BB di Luar Target Maintenance",
          description: `Terjadi kenaikan +${diff} kg pada ${periodLabel}. Evaluasi kembali camilan berkalori tinggi.`,
          sentiment: "warning",
        });
      } else {
        insights.push({
          id: "weight-loss-trend",
          iconType: "scale",
          title: "Penurunan BB di Luar Target Maintenance",
          description: `Terjadi penurunan ${Math.abs(diff)} kg pada ${periodLabel}. Pastikan Anda memenuhi budget maintenance harian.`,
          sentiment: "warning",
        });
      }
    } else {
      // Default: Cut (Weight Loss)
      if (diff < 0) {
        insights.push({
          id: "weight-loss-trend",
          iconType: "scale",
          title: `Penurunan BB Konsisten (${periodLabel})`,
          description: `Timbangan Anda menunjukkan penurunan ${Math.abs(diff)} kg. Defisit kalori harian Anda bekerja dengan sangat baik!`,
          sentiment: "positive",
        });
      } else if (diff > 0) {
        insights.push({
          id: "weight-gain-trend",
          iconType: "scale",
          title: "Terjadi Kenaikan Berat Badan",
          description: `Terdapat kenaikan +${diff} kg pada ${periodLabel}. Pastikan asupan kalori sesuai target defisit cut.`,
          sentiment: "warning",
        });
      } else {
        insights.push({
          id: "weight-stable",
          iconType: "scale",
          title: "Berat Badan Stabil",
          description: `Berat badan Anda berada di angka stabil (${latest} kg). Pertahankan konsistensi defisit kalori & latihan beban.`,
          sentiment: "positive",
        });
      }
    }
  }

  // 2. Protein Intake Insight
  const totalProteinLogged = meals.reduce((sum, m) => sum + (m.proteinG || 0), 0);
  const daysCount = Math.max(daysInRange, 1);
  const avgProteinDaily = Math.round(totalProteinLogged / daysCount);
  const proteinRatio = Math.round((avgProteinDaily / targets.targetProteinG) * 100);

  if (proteinRatio >= 80) {
    insights.push({
      id: "protein-high",
      iconType: "trophy",
      title: `Konsistensi Protein Sangat Baik (${periodLabel})`,
      description: `Rata-rata asupan protein Anda mencapai ${avgProteinDaily}g/hari (${proteinRatio}% dari target). Sangat mendukung pemulihan & pembentukan otot!`,
      sentiment: "positive",
    });
  } else {
    insights.push({
      id: "protein-low",
      iconType: "alert",
      title: `Asupan Protein Perlu Ditingkatkan (${periodLabel})`,
      description: `Rata-rata protein harian Anda baru ${avgProteinDaily}g dari target ${targets.targetProteinG}g. Tambah dada ayam, telur, atau tempe untuk makro optimal.`,
      sentiment: "warning",
    });
  }

  // 3. Workout & Energy Recovery Insight
  const totalWorkoutCalories = workouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
  const totalWorkoutMinutes = workouts.reduce((sum, w) => sum + (w.durationMinutes || 0), 0);

  if (totalWorkoutCalories > 0) {
    insights.push({
      id: "workout-active",
      iconType: "flame",
      title: `Pembakaran Kalori & Aktivitas Aktif (${periodLabel})`,
      description: `Anda berhasil membakar total ${totalWorkoutCalories} kCal lewat ${totalWorkoutMinutes} menit sesi olahraga pada ${periodLabel}. Energi metabolisme meningkat tajam!`,
      sentiment: "positive",
    });
  } else {
    insights.push({
      id: "workout-idle",
      iconType: "activity",
      title: `Tingkatkan Aktivitas Fisik (${periodLabel})`,
      description: `Belum ada sesi olahraga terdaftar pada ${periodLabel}. Jalan santai 20-30 menit atau latihan ringan sangat bagus menjaga TDEE.`,
      sentiment: "neutral",
    });
  }

  // 4. Nutrition Balance Insight
  const totalCalories = meals.reduce((sum, m) => sum + (m.calories || 0), 0);
  const totalFat = meals.reduce((sum, m) => sum + (m.fatsG || 0), 0);
  const fatCalories = totalFat * 9;
  const fatPercentage = totalCalories > 0 ? Math.round((fatCalories / totalCalories) * 100) : 0;

  if (fatPercentage > 35) {
    insights.push({
      id: "fat-high",
      iconType: "pie",
      title: "Proporsi Lemak Cukup Tinggi",
      description: `${fatPercentage}% kalori berasal dari lemak. Kurangi gorengan & minyak berlebih agar defisit/surplus kalori lebih terukur.`,
      sentiment: "warning",
    });
  } else if (totalCalories > 0) {
    insights.push({
      id: "macro-balanced",
      iconType: "pie",
      title: "Keseimbangan Makro Nutrisi Terjaga",
      description: "Distribusi karbohidrat, protein, dan lemak Anda berada di kisaran sehat sesuai target TDEE.",
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
      title: "Oatmeal Polos (4 Sendok Makan) + Pisang",
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

