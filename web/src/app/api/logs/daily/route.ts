import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { getOrCreateDefaultUser } from '@/lib/user';
import { verifyToken } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date');

    // Resolve user: try session token, fallback to default seed user (for WhatsApp bot calls)
    let resolvedUser = await getOrCreateDefaultUser();
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;

    if (token) {
      const payload = verifyToken(token);
      if (payload && payload.userId) {
        const user = await prisma.user.findUnique({
          where: { id: payload.userId }
        });
        if (user) {
          resolvedUser = user;
        }
      }
    }

    let startWIB: Date;
    let endWIB: Date;

    if (dateParam) {
      const [year, month, day] = dateParam.split('-').map(Number);
      startWIB = new Date(Date.UTC(year, month - 1, day, 0 - 7, 0, 0));
      endWIB = new Date(Date.UTC(year, month - 1, day, 23 - 7, 59, 59, 999));
    } else {
      const nowWIB = new Date(new Date().getTime() + 7 * 60 * 60 * 1000);
      const year = nowWIB.getUTCFullYear();
      const month = nowWIB.getUTCMonth();
      const day = nowWIB.getUTCDate();
      
      startWIB = new Date(Date.UTC(year, month, day, 0 - 7, 0, 0));
      endWIB = new Date(Date.UTC(year, month, day, 23 - 7, 59, 59, 999));
    }

    // Fetch meal logs
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

    // Fetch workout logs
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

    return NextResponse.json({
      success: true,
      data: {
        user: {
          dailyCalorieTarget: resolvedUser.dailyCalorieTarget,
          targetProteinG: resolvedUser.targetProteinG,
          targetCarbsG: resolvedUser.targetCarbsG,
          targetFatsG: resolvedUser.targetFatsG,
          fitnessGoal: resolvedUser.fitnessGoal,
          email: resolvedUser.email,
          whatsappNumber: resolvedUser.whatsappNumber
        },
        meals: mealLogs,
        workouts: workoutLogs,
        summary: {
          ...summary,
          workoutCalories: totalWorkoutCalories
        }
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
