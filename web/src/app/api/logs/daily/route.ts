import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { resolveUserFromRequest } from '@/lib/user';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date');
    const monthParam = searchParams.get('month');
    const yearParam = searchParams.get('year');
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    // Resolve user: via session token or WhatsApp Number (query param) or default
    const resolvedUser = await resolveUserFromRequest(req);

    let startWIB: Date;
    let endWIB: Date;

    if (startDateParam && endDateParam) {
      // Custom Date Range (YYYY-MM-DD to YYYY-MM-DD)
      const [sYear, sMonth, sDay] = startDateParam.split('-').map(Number);
      const [eYear, eMonth, eDay] = endDateParam.split('-').map(Number);
      startWIB = new Date(Date.UTC(sYear, sMonth - 1, sDay, 0 - 7, 0, 0));
      endWIB = new Date(Date.UTC(eYear, eMonth - 1, eDay, 23 - 7, 59, 59, 999));
    } else if (monthParam) {
      // Monthly Filter (YYYY-MM or month=8&year=2026)
      let year = yearParam ? Number(yearParam) : new Date().getFullYear();
      let month = Number(monthParam);
      if (monthParam.includes('-')) {
        const parts = monthParam.split('-').map(Number);
        year = parts[0];
        month = parts[1];
      }
      startWIB = new Date(Date.UTC(year, month - 1, 1, 0 - 7, 0, 0));
      // Last day of month
      const lastDay = new Date(year, month, 0).getDate();
      endWIB = new Date(Date.UTC(year, month - 1, lastDay, 23 - 7, 59, 59, 999));
    } else if (yearParam && !monthParam) {
      // Yearly Filter (YYYY)
      const year = Number(yearParam);
      startWIB = new Date(Date.UTC(year, 0, 1, 0 - 7, 0, 0));
      endWIB = new Date(Date.UTC(year, 11, 31, 23 - 7, 59, 59, 999));
    } else if (dateParam) {
      // Single Day Filter (YYYY-MM-DD)
      const [year, month, day] = dateParam.split('-').map(Number);
      startWIB = new Date(Date.UTC(year, month - 1, day, 0 - 7, 0, 0));
      endWIB = new Date(Date.UTC(year, month - 1, day, 23 - 7, 59, 59, 999));
    } else {
      // Default: Today WIB
      const nowWIB = new Date(new Date().getTime() + 7 * 60 * 60 * 1000);
      const year = nowWIB.getUTCFullYear();
      const month = nowWIB.getUTCMonth();
      const day = nowWIB.getUTCDate();
      
      startWIB = new Date(Date.UTC(year, month, day, 0 - 7, 0, 0));
      endWIB = new Date(Date.UTC(year, month, day, 23 - 7, 59, 59, 999));
    }

    // Fetch meal logs strictly for resolvedUser
    const mealLogs = await prisma.mealLog.findMany({
      where: {
        userId: resolvedUser.id,
        timestamp: {
          gte: startWIB,
          lte: endWIB
        }
      },
      orderBy: {
        timestamp: 'asc'
      }
    });

    // Fetch workout logs strictly for resolvedUser
    const workoutLogs = await prisma.workoutLog.findMany({
      where: {
        userId: resolvedUser.id,
        timestamp: {
          gte: startWIB,
          lte: endWIB
        }
      },
      orderBy: {
        timestamp: 'asc'
      }
    });

    // Fetch weight logs strictly for resolvedUser
    const weightLogs = await prisma.weightLog.findMany({
      where: {
        userId: resolvedUser.id,
        timestamp: {
          gte: startWIB,
          lte: endWIB
        }
      },
      orderBy: {
        timestamp: 'asc'
      }
    });

    const summary = mealLogs.reduce(
      (acc, log) => {
        acc.calories += log.calories;
        acc.proteinG += log.proteinG;
        acc.carbsG += log.carbsG;
        acc.fatsG += log.fatsG;
        return acc;
      },
      { calories: 0, proteinG: 0, carbsG: 0, fatsG: 0 }
    );

    const totalWorkoutCalories = workoutLogs.reduce((sum, log) => sum + log.caloriesBurned, 0);

    // Calculate daysInRange for target scaling
    const durationMs = Math.max(endWIB.getTime() - startWIB.getTime(), 1000);
    const daysInRange = Math.max(Math.round(durationMs / (1000 * 60 * 60 * 24)), 1);

    const mode = startDateParam && endDateParam 
      ? 'custom' 
      : monthParam 
      ? 'monthly' 
      : yearParam 
      ? 'yearly' 
      : 'daily';

    // Calculate Active Days (distinct calendar dates in WIB with meal or workout logs)
    const toWIBDateStr = (date: Date) => {
      const wibTime = new Date(date.getTime() + 7 * 60 * 60 * 1000);
      return wibTime.toISOString().slice(0, 10);
    };

    const activeDaysSet = new Set<string>();
    mealLogs.forEach(m => activeDaysSet.add(toWIBDateStr(m.timestamp)));
    workoutLogs.forEach(w => activeDaysSet.add(toWIBDateStr(w.timestamp)));

    // For single-day filter, activeDaysCount is 1. For range, it's number of unique logged days (or 0 if none)
    const activeDaysCount = mode === 'daily' ? 1 : activeDaysSet.size;
    const avgDivisor = activeDaysCount > 0 ? activeDaysCount : 1;

    const dailyAverages = {
      calories: Math.round(summary.calories / avgDivisor),
      proteinG: Math.round(summary.proteinG / avgDivisor),
      carbsG: Math.round(summary.carbsG / avgDivisor),
      fatsG: Math.round(summary.fatsG / avgDivisor),
      workoutCalories: Math.round(totalWorkoutCalories / avgDivisor)
    };

    const scaledTargets = {
      calories: resolvedUser.dailyCalorieTarget * daysInRange,
      proteinG: resolvedUser.targetProteinG * daysInRange,
      carbsG: resolvedUser.targetCarbsG * daysInRange,
      fatsG: resolvedUser.targetFatsG * daysInRange
    };

    return NextResponse.json({
      success: true,
      data: {
        user: {
          name: resolvedUser.name,
          dailyCalorieTarget: resolvedUser.dailyCalorieTarget,
          targetProteinG: resolvedUser.targetProteinG,
          targetCarbsG: resolvedUser.targetCarbsG,
          targetFatsG: resolvedUser.targetFatsG,
          fitnessGoal: resolvedUser.fitnessGoal,
          email: resolvedUser.email,
          whatsappNumber: resolvedUser.whatsappNumber,
          currentWeightKg: resolvedUser.currentWeightKg,
          heightCm: resolvedUser.heightCm,
          age: resolvedUser.age,
          gender: resolvedUser.gender,
          activityLevel: resolvedUser.activityLevel,
          bodyFatPercent: resolvedUser.bodyFatPercent,
          skeletalMuscleMassKg: resolvedUser.skeletalMuscleMassKg,
          visceralFatLevel: resolvedUser.visceralFatLevel,
          inbodyScore: resolvedUser.inbodyScore,
          targetWeightKg: resolvedUser.targetWeightKg,
          dietaryRestrictions: resolvedUser.dietaryRestrictions,
          birthDate: resolvedUser.birthDate ? resolvedUser.birthDate.toISOString().slice(0, 10) : null
        },
        meals: mealLogs,
        workouts: workoutLogs,
        weights: weightLogs,
        summary: {
          ...summary,
          workoutCalories: totalWorkoutCalories,
          daysInRange,
          activeDaysCount,
          mode,
          dailyAverages,
          scaledTargets
        }
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
