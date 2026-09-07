import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { resolveUserFromRequest } from '@/lib/user';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Parameter aliases for high flexibility (bot & UI)
    const activityName = body.activityName || body.activity || body.workout || body.name;
    const durationMinutes = body.durationMinutes !== undefined ? body.durationMinutes : (body.duration !== undefined ? body.duration : body.minutes);
    const caloriesBurned = body.caloriesBurned !== undefined ? body.caloriesBurned : (body.calories !== undefined ? body.calories : (body.burned !== undefined ? body.burned : body.cal));
    const date = body.date || body.timestamp;

    if (!activityName || durationMinutes === undefined || caloriesBurned === undefined) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required parameters: activityName, durationMinutes, caloriesBurned (aliases: activity, duration, calories/burned)' 
      }, { status: 400 });
    }

    // Resolve user: via session token or WhatsApp Number (for bot calls) or default
    const user = await resolveUserFromRequest(req, body);
    const userId = user.id;

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
