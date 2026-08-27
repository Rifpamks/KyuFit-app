import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getOrCreateDefaultUser } from "@/lib/user";
import { verifyToken } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  calculateTargetProjection,
  generateWeeklyInsights,
  recommendMealSuggestions,
} from "@/lib/insights";

export async function GET() {
  try {
    let user = await getOrCreateDefaultUser();

    // Check session_token cookie for authenticated web user
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;
    if (token) {
      const payload = verifyToken(token);
      if (payload && payload.userId) {
        const foundUser = await prisma.user.findUnique({
          where: { id: payload.userId },
        });
        if (foundUser) {
          user = foundUser;
        }
      }
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Date 30 days ago for richer weight and trend analysis
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Fetch meals, workouts, and weight logs in last 30 days for user
    const meals = await prisma.mealLog.findMany({
      where: {
        userId: user.id,
        timestamp: { gte: thirtyDaysAgo },
      },
    });

    const workouts = await prisma.workoutLog.findMany({
      where: {
        userId: user.id,
        timestamp: { gte: thirtyDaysAgo },
      },
    });

    const weightLogs = await prisma.weightLog.findMany({
      where: {
        userId: user.id,
        timestamp: { gte: thirtyDaysAgo },
      },
      orderBy: { timestamp: "asc" },
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

    // Target weight calculation
    const currentWeight = user.currentWeightKg || (weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].weightKg : 70);
    let targetWeight = currentWeight;
    if (user.fitnessGoal === "cut" || user.fitnessGoal === "Cut") targetWeight = Math.max(currentWeight - 3, 50);
    else if (user.fitnessGoal === "bulk" || user.fitnessGoal === "Bulk") targetWeight = currentWeight + 3;

    // 1. Target Projection (incorporating weight logs)
    const projection = calculateTargetProjection(
      currentWeight,
      targetWeight,
      recent7DaysCalories,
      user.dailyCalorieTarget,
      user.fitnessGoal.toLowerCase(),
      weightLogs
    );

    // 2. Multi-Metric Weekly AI Insights
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
      },
      weightLogs
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
