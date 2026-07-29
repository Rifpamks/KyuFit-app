import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { getOrCreateDefaultUser } from '@/lib/user';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { activityName, durationMinutes, caloriesBurned, date } = body;

    if (!activityName || durationMinutes === undefined || caloriesBurned === undefined) {
      return NextResponse.json({ success: false, error: 'Missing required parameters' }, { status: 400 });
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

    // Handle date backdating
    let timestamp = new Date();
    if (date) {
      // Create a date in local midday to avoid timezone shifts
      timestamp = new Date(`${date}T12:00:00`);
    }

    const workout = await prisma.workoutLog.create({
      data: {
        userId,
        activityName,
        durationMinutes: parseInt(durationMinutes),
        caloriesBurned: parseFloat(caloriesBurned),
        timestamp
      }
    });

    return NextResponse.json({ success: true, data: workout });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
