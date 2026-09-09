import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { resolveUserFromRequest } from '@/lib/user';
import { calculateAll, Gender, ActivityLevel, FitnessGoal } from '@/lib/tdee';

export async function GET(req: Request) {
  try {
    const user = await resolveUserFromRequest(req);

    // Fetch existing assessment logs
    let assessments = await prisma.assessmentLog.findMany({
      where: { userId: user.id },
      orderBy: { timestamp: 'desc' },
    });

    // If no historical assessments exist yet, seed initial assessment from user profile
    if (assessments.length === 0) {
      const initial = await prisma.assessmentLog.create({
        data: {
          userId: user.id,
          title: "Assessment Awal",
          fitnessGoal: user.fitnessGoal || "cut",
          activityLevel: user.activityLevel || "moderate",
          weightKg: user.currentWeightKg || 70,
          targetWeightKg: user.targetWeightKg || (user.currentWeightKg ? user.currentWeightKg - 5 : 65),
          bodyFatPercent: user.bodyFatPercent || null,
          dailyCalorieTarget: user.dailyCalorieTarget,
          targetProteinG: user.targetProteinG,
          targetCarbsG: user.targetCarbsG,
          targetFatsG: user.targetFatsG,
          programDurationMonths: 3,
          pace: "Moderate",
          timestamp: user.createdAt || new Date(),
        },
      });
      assessments = [initial];
    }

    return NextResponse.json({
      success: true,
      data: assessments,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await resolveUserFromRequest(req);
    const body = await req.json();

    const weightKg = body.weightKg !== undefined ? parseFloat(body.weightKg) : (user.currentWeightKg || 70);
    const targetWeightKg = body.targetWeightKg !== undefined ? parseFloat(body.targetWeightKg) : (user.targetWeightKg || null);
    const bodyFatPercent = body.bodyFatPercent !== undefined ? parseFloat(body.bodyFatPercent) : user.bodyFatPercent;
    const fitnessGoal = (body.fitnessGoal || user.fitnessGoal || 'cut') as FitnessGoal;
    const activityLevel = (body.activityLevel || user.activityLevel || 'moderate') as ActivityLevel;
    const programDurationMonths = body.programDurationMonths ? parseInt(body.programDurationMonths) : 3;
    const pace = body.pace || "Moderate";
    const title = body.title || `Re-Assessment ${fitnessGoal.toUpperCase()}`;

    // Calculate scientifically via Mifflin-St Jeor or Katch-McArdle
    const calc = calculateAll({
      weightKg,
      heightCm: user.heightCm || 170,
      age: user.age || 25,
      gender: (user.gender || 'male') as Gender,
      activityLevel,
      goal: fitnessGoal,
      bodyFatPercent: bodyFatPercent || undefined,
    });

    // Update User active targets & profile
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        currentWeightKg: weightKg,
        targetWeightKg,
        bodyFatPercent: bodyFatPercent || undefined,
        fitnessGoal,
        activityLevel,
        dailyCalorieTarget: calc.dailyCalorieTarget,
        targetProteinG: calc.targetProteinG,
        targetCarbsG: calc.targetCarbsG,
        targetFatsG: calc.targetFatsG,
      },
    });

    // Save assessment log snapshot
    const assessmentLog = await prisma.assessmentLog.create({
      data: {
        userId: user.id,
        title,
        fitnessGoal,
        activityLevel,
        weightKg,
        targetWeightKg,
        bodyFatPercent: bodyFatPercent || null,
        dailyCalorieTarget: calc.dailyCalorieTarget,
        targetProteinG: calc.targetProteinG,
        targetCarbsG: calc.targetCarbsG,
        targetFatsG: calc.targetFatsG,
        programDurationMonths,
        pace,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        assessment: assessmentLog,
        user: updatedUser,
        calculation: calc,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
