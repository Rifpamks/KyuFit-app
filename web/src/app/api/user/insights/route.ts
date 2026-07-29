import { NextResponse } from "next/server";
import { getOrCreateDefaultUser } from "@/lib/user";
import prisma from "@/lib/prisma";
import {
  calculateTargetProjection,
  generateWeeklyInsights,
  recommendMealSuggestions,
} from "@/lib/insights";

export async function GET() {
  try {
    const user = await getOrCreateDefaultUser();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Date 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Fetch meals & workouts in last 7 days
    const meals = await prisma.mealLog.findMany({
      where: {
        userId: user.id,
        timestamp: { gte: sevenDaysAgo },
      },
    });

    const workouts = await prisma.workoutLog.findMany({
      where: {
        userId: user.id,
        timestamp: { gte: sevenDaysAgo },
      },
    });

    // Group meals & workouts by day for projection calculation
    const dailyMap: Record<string, { calories: number; workoutCalories: number }> = {};
    for (const m of meals) {
      const day = m.timestamp.toISOString().split("T")[0];
      if (!dailyMap[day]) dailyMap[day] = { calories: 0, workoutCalories: 0 };
      dailyMap[day].calories += m.calories;
    }
    for (const w of workouts) {
      const day = w.timestamp.toISOString().split("T")[0];
      if (!dailyMap[day]) dailyMap[day] = { calories: 0, workoutCalories: 0 };
      dailyMap[day].workoutCalories += w.caloriesBurned;
    }

    const recent7DaysCalories = Object.values(dailyMap);

    // Target weight (default: -3kg from current if cut, +3kg if bulk, or current)
    const currentWeight = user.currentWeightKg || 70;
    let targetWeight = currentWeight;
    if (user.fitnessGoal === "cut" || user.fitnessGoal === "Cut") targetWeight = Math.max(currentWeight - 3, 50);
    else if (user.fitnessGoal === "bulk" || user.fitnessGoal === "Bulk") targetWeight = currentWeight + 3;

    // 1. Target Projection
    const projection = calculateTargetProjection(
      currentWeight,
      targetWeight,
      recent7DaysCalories,
      user.dailyCalorieTarget,
      user.fitnessGoal.toLowerCase()
    );

    // 2. Weekly Insights
    const insights = generateWeeklyInsights(
      meals.map((m) => ({
        calories: m.calories,
        proteinG: m.proteinG,
        carbsG: m.carbsG,
        fatsG: m.fatsG,
      })),
      workouts.map((w) => ({
        caloriesBurned: w.caloriesBurned,
        durationMinutes: w.durationMinutes,
      })),
      {
        dailyCalorieTarget: user.dailyCalorieTarget,
        targetProteinG: user.targetProteinG,
      }
    );

    // 3. Today's Remaining Budget for Meal Suggestions
    const today = new Date().toISOString().split("T")[0];
    const todayMeals = meals.filter((m) => m.timestamp.toISOString().split("T")[0] === today);
    const todayWorkouts = workouts.filter((w) => w.timestamp.toISOString().split("T")[0] === today);

    const todayCalories = todayMeals.reduce((sum, m) => sum + m.calories, 0);
    const todayWorkoutCalories = todayWorkouts.reduce((sum, w) => sum + w.caloriesBurned, 0);
    const todayProtein = todayMeals.reduce((sum, m) => sum + m.proteinG, 0);

    const remainingCalories = user.dailyCalorieTarget - todayCalories + todayWorkoutCalories;
    const remainingProtein = Math.max(user.targetProteinG - todayProtein, 0);

    const mealSuggestions = recommendMealSuggestions(remainingCalories, remainingProtein);

    return NextResponse.json({
      success: true,
      projection,
      insights,
      mealSuggestions,
    });
  } catch (err: any) {
    console.error("Error fetching user insights:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
