import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { resolveUserFromRequest } from '@/lib/user';
import { calculateTargetCaloriesAndMacros, ActivityLevel } from '@/lib/tdee';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const user = await resolveUserFromRequest(req, body);

    const weightKg = body.weightKg !== undefined && body.weightKg !== null && body.weightKg !== ''
      ? parseFloat(body.weightKg)
      : undefined;

    const bodyFatPercent = body.bodyFatPercent !== undefined && body.bodyFatPercent !== null && body.bodyFatPercent !== ''
      ? parseFloat(body.bodyFatPercent)
      : undefined;

    const skeletalMuscleMassKg = body.skeletalMuscleMassKg !== undefined && body.skeletalMuscleMassKg !== null && body.skeletalMuscleMassKg !== ''
      ? parseFloat(body.skeletalMuscleMassKg)
      : undefined;

    const visceralFatLevel = body.visceralFatLevel !== undefined && body.visceralFatLevel !== null && body.visceralFatLevel !== ''
      ? parseInt(body.visceralFatLevel, 10)
      : undefined;

    const bodyScore = body.bodyScore !== undefined && body.bodyScore !== null && body.bodyScore !== ''
      ? parseInt(body.bodyScore, 10)
      : (body.inbodyScore !== undefined && body.inbodyScore !== null && body.inbodyScore !== ''
        ? parseInt(body.inbodyScore, 10)
        : undefined);

    const recalculateTargets = body.recalculateTargets !== false;

    // Use updated or existing weight
    const effectiveWeight = weightKg ?? user.currentWeightKg ?? 70;
    const effectiveHeight = user.heightCm ?? 170;
    const effectiveAge = user.age ?? 25;
    const effectiveGender = (user.gender as 'male' | 'female') ?? 'male';
    const effectiveActivity = (user.activityLevel as ActivityLevel) ?? 'moderate';
    const effectiveGoal = (user.fitnessGoal as 'cut' | 'maintain' | 'bulk') ?? 'maintain';
    const effectiveBf = bodyFatPercent ?? user.bodyFatPercent ?? undefined;
    const effectiveSmm = skeletalMuscleMassKg ?? user.skeletalMuscleMassKg ?? undefined;

    let calcResult = null;
    let newTargets: any = {};

    if (recalculateTargets) {
      calcResult = calculateTargetCaloriesAndMacros({
        weightKg: effectiveWeight,
        heightCm: effectiveHeight,
        age: effectiveAge,
        gender: effectiveGender,
        activityLevel: effectiveActivity,
        goal: effectiveGoal,
        bodyFatPercent: effectiveBf,
        skeletalMuscleMassKg: effectiveSmm
      });

      newTargets = {
        dailyCalorieTarget: calcResult.dailyCalorieTarget,
        targetProteinG: calcResult.targetProteinG,
        targetCarbsG: calcResult.targetCarbsG,
        targetFatsG: calcResult.targetFatsG,
      };
    }

    // Build update object
    const updateData: any = {
      ...newTargets,
    };

    if (weightKg !== undefined) updateData.currentWeightKg = weightKg;
    if (bodyFatPercent !== undefined) updateData.bodyFatPercent = bodyFatPercent;
    if (skeletalMuscleMassKg !== undefined) updateData.skeletalMuscleMassKg = skeletalMuscleMassKg;
    if (visceralFatLevel !== undefined) updateData.visceralFatLevel = visceralFatLevel;
    if (bodyScore !== undefined) updateData.inbodyScore = bodyScore;

    // Execute in transaction: update user and optionally add weight log
    const operations: any[] = [
      prisma.user.update({
        where: { id: user.id },
        data: updateData
      })
    ];

    if (weightKg !== undefined) {
      operations.push(
        prisma.weightLog.create({
          data: {
            userId: user.id,
            weightKg,
            timestamp: new Date()
          }
        })
      );
    }

    const [updatedUser] = await prisma.$transaction(operations);

    return NextResponse.json({
      success: true,
      data: {
        user: updatedUser,
        calculation: calcResult
      }
    });
  } catch (error: any) {
    console.error('Error updating body composition:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
