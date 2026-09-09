import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getOrCreateDefaultUser } from '@/lib/user';
import { calculateAll, Gender, ActivityLevel, FitnessGoal } from '@/lib/tdee';

export async function GET() {
  try {
    const user = await getOrCreateDefaultUser();
    return NextResponse.json({ success: true, data: user });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const defaultUser = await getOrCreateDefaultUser();

    let newDailyCalorieTarget = body.dailyCalorieTarget ? parseInt(body.dailyCalorieTarget) : undefined;
    let newTargetProteinG = body.targetProteinG ? parseInt(body.targetProteinG) : undefined;
    let newTargetCarbsG = body.targetCarbsG ? parseInt(body.targetCarbsG) : undefined;
    let newTargetFatsG = body.targetFatsG ? parseInt(body.targetFatsG) : undefined;
    let calculationResult = null;

    // Check if user requested scientific TDEE recalculation based on updated biometrics
    if (body.recalculateTdee) {
      const weight = body.currentWeightKg ? parseFloat(body.currentWeightKg) : (defaultUser.currentWeightKg || 70);
      const height = body.heightCm ? parseFloat(body.heightCm) : (defaultUser.heightCm || 170);
      const age = body.age ? parseInt(body.age) : (defaultUser.age || 25);
      const gender = (body.gender || defaultUser.gender || 'male') as Gender;
      const activityLevel = (body.activityLevel || defaultUser.activityLevel || 'moderate') as ActivityLevel;
      const goal = (body.fitnessGoal || defaultUser.fitnessGoal || 'cut') as FitnessGoal;
      const bodyFat = defaultUser.bodyFatPercent;

      const calc = calculateAll({
        weightKg: weight,
        heightCm: height,
        age,
        gender,
        activityLevel,
        goal,
        bodyFatPercent: bodyFat,
      });

      newDailyCalorieTarget = calc.dailyCalorieTarget;
      newTargetProteinG = calc.targetProteinG;
      newTargetCarbsG = calc.targetCarbsG;
      newTargetFatsG = calc.targetFatsG;
      calculationResult = calc;
    }

    const updated = await prisma.user.update({
      where: { id: defaultUser.id },
      data: {
        name: body.name !== undefined ? body.name : undefined,
        email: body.email !== undefined ? body.email : undefined,
        age: body.age !== undefined ? parseInt(body.age) : undefined,
        gender: body.gender !== undefined ? body.gender : undefined,
        heightCm: body.heightCm !== undefined ? parseFloat(body.heightCm) : undefined,
        currentWeightKg: body.currentWeightKg !== undefined ? parseFloat(body.currentWeightKg) : undefined,
        targetWeightKg: body.targetWeightKg !== undefined ? parseFloat(body.targetWeightKg) : undefined,
        dietaryRestrictions: body.dietaryRestrictions !== undefined ? body.dietaryRestrictions : undefined,
        birthDate: body.birthDate ? new Date(body.birthDate) : undefined,
        activityLevel: body.activityLevel !== undefined ? body.activityLevel : undefined,
        fitnessGoal: body.fitnessGoal !== undefined ? body.fitnessGoal : undefined,
        dailyCalorieTarget: newDailyCalorieTarget,
        targetProteinG: newTargetProteinG,
        targetCarbsG: newTargetCarbsG,
        targetFatsG: newTargetFatsG,
      },
    });

    return NextResponse.json({ 
      success: true, 
      data: updated,
      calculation: calculationResult
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
