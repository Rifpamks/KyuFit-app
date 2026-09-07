import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { resolveUserFromRequest } from '@/lib/user';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const weightKg = body.weightKg !== undefined ? body.weightKg : (body.weight !== undefined ? body.weight : (body.berat !== undefined ? body.berat : body.weight_kg));
    const date = body.date || body.timestamp;

    if (weightKg === undefined || isNaN(Number(weightKg))) {
      return NextResponse.json({ success: false, error: 'Missing or invalid weightKg (aliases: weight, berat)' }, { status: 400 });
    }

    // Resolve user: via session token or WhatsApp Number (for bot calls) or default
    const user = await resolveUserFromRequest(req, body);
    const userId = user.id;

    let timestamp = new Date();
    if (date) {
      const [year, month, day] = date.split('-').map(Number);
      timestamp = new Date(Date.UTC(year, month - 1, day, 12 - 7, 0, 0));
    }

    const numericWeight = parseFloat(weightKg);

    // Create log and keep user.currentWeightKg synced
    const [weightLog] = await prisma.$transaction([
      prisma.weightLog.create({
        data: {
          userId,
          weightKg: numericWeight,
          timestamp
        }
      }),
      prisma.user.update({
        where: { id: userId },
        data: { currentWeightKg: numericWeight }
      })
    ]);

    return NextResponse.json({ success: true, data: weightLog, currentWeightKg: numericWeight });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
