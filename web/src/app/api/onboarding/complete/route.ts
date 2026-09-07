import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { verifyToken, signToken } from '@/lib/auth';
import { calculateAll } from '@/lib/tdee';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ success: false, error: 'Invalid session' }, { status: 401 });
    }

    const {
      age,
      gender,
      heightCm,
      currentWeightKg,
      activityLevel,
      fitnessGoal,
      bodyFatPercent,
      skeletalMuscleMassKg,
      visceralFatLevel,
      inbodyScore,
    } = await req.json();

    if (!age || !gender || !heightCm || !currentWeightKg || !activityLevel || !fitnessGoal) {
      return NextResponse.json({ success: false, error: 'Semua field wajib diisi' }, { status: 400 });
    }

    // Calculate targets
    const result = calculateAll({
      weightKg: parseFloat(currentWeightKg),
      heightCm: parseFloat(heightCm),
      age: parseInt(age, 10),
      gender,
      activityLevel,
      goal: fitnessGoal,
      bodyFatPercent: bodyFatPercent ? parseFloat(bodyFatPercent) : null,
      skeletalMuscleMassKg: skeletalMuscleMassKg ? parseFloat(skeletalMuscleMassKg) : null,
      visceralFatLevel: visceralFatLevel ? parseInt(visceralFatLevel, 10) : null,
      inbodyScore: inbodyScore ? parseInt(inbodyScore, 10) : null,
    });

    // Save to user profile
    const updatedUser = await prisma.user.update({
      where: { id: payload.userId },
      data: {
        age: parseInt(age, 10),
        gender,
        heightCm: parseFloat(heightCm),
        currentWeightKg: parseFloat(currentWeightKg),
        activityLevel,
        fitnessGoal,
        bodyFatPercent: bodyFatPercent ? parseFloat(bodyFatPercent) : null,
        skeletalMuscleMassKg: skeletalMuscleMassKg ? parseFloat(skeletalMuscleMassKg) : null,
        visceralFatLevel: visceralFatLevel ? parseInt(visceralFatLevel, 10) : null,
        inbodyScore: inbodyScore ? parseInt(inbodyScore, 10) : null,
        dailyCalorieTarget: result.dailyCalorieTarget,
        targetProteinG: result.targetProteinG,
        targetCarbsG: result.targetCarbsG,
        targetFatsG: result.targetFatsG,
        onboardingComplete: true,
      },
    });

    // Refresh token with updated onboardingComplete flag
    const newToken = signToken({ userId: updatedUser.id, onboardingComplete: true });
    cookieStore.set('session_token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7
    });

    return NextResponse.json({
      success: true,
      data: {
        rmr: result.rmr,
        tdee: result.tdee,
        dailyCalorieTarget: result.dailyCalorieTarget,
        targetProteinG: result.targetProteinG,
        targetCarbsG: result.targetCarbsG,
        targetFatsG: result.targetFatsG
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
