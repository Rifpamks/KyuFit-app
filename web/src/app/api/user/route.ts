import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getOrCreateDefaultUser } from '@/lib/user';

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
    
    const updated = await prisma.user.update({
      where: { id: defaultUser.id },
      data: {
        dailyCalorieTarget: body.dailyCalorieTarget ? parseInt(body.dailyCalorieTarget) : undefined,
        targetProteinG: body.targetProteinG ? parseInt(body.targetProteinG) : undefined,
        targetCarbsG: body.targetCarbsG ? parseInt(body.targetCarbsG) : undefined,
        targetFatsG: body.targetFatsG ? parseInt(body.targetFatsG) : undefined,
        fitnessGoal: body.fitnessGoal || undefined,
        email: body.email || undefined
      }
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
