import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { getOrCreateDefaultUser } from '@/lib/user';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Support parameter name aliases for high resilience
    const foodName = body.foodName || body.food_name || body.name;
    const calories = body.calories !== undefined ? body.calories : body.cal;
    const proteinG = body.proteinG !== undefined ? body.proteinG : (body.protein !== undefined ? body.protein : body.protein_g);
    const carbsG = body.carbsG !== undefined ? body.carbsG : (body.carbs !== undefined ? body.carbs : (body.carbohydrates !== undefined ? body.carbohydrates : body.carbs_g));
    const fatsG = body.fatsG !== undefined ? body.fatsG : (body.fats !== undefined ? body.fats : (body.fat !== undefined ? body.fat : body.fats_g));
    const imageUrl = body.imageUrl || body.image_url || null;
    const logDate = body.timestamp || body.date ? new Date(body.timestamp || body.date) : new Date();

    if (!foodName || calories === undefined || proteinG === undefined || carbsG === undefined || fatsG === undefined) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters. Required: foodName, calories, proteinG, carbsG, fatsG (aliases supported: protein, carbs/carbohydrates, fat/fats)'
      }, { status: 400 });
    }

    // Resolve user: try session token, fallback to default seed user (for WhatsApp bot calls)
    let userId: number;
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;

    if (token) {
      const payload = verifyToken(token);
      if (payload && payload.userId) {
        userId = payload.userId;
      } else {
        const defaultUser = await getOrCreateDefaultUser();
        userId = defaultUser.id;
      }
    } else {
      const defaultUser = await getOrCreateDefaultUser();
      userId = defaultUser.id;
    }

    const mealLog = await prisma.mealLog.create({
      data: {
        userId,
        foodName,
        calories: Math.round(Number(calories)),
        proteinG: Math.round(Number(proteinG)),
        carbsG: Math.round(Number(carbsG)),
        fatsG: Math.round(Number(fatsG)),
        imageUrl: imageUrl || null,
        timestamp: isNaN(logDate.getTime()) ? new Date() : logDate
      }
    });

    return NextResponse.json({ success: true, data: mealLog });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
