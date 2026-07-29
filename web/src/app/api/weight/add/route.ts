import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { getOrCreateDefaultUser } from '@/lib/user';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { weightKg, date } = body;

    if (weightKg === undefined) {
      return NextResponse.json({ success: false, error: 'Missing weightKg' }, { status: 400 });
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

    let timestamp = new Date();
    if (date) {
      const [year, month, day] = date.split('-').map(Number);
      timestamp = new Date(Date.UTC(year, month - 1, day, 12 - 7, 0, 0));
    }

    const weightLog = await prisma.weightLog.create({
      data: {
        userId,
        weightKg: parseFloat(weightKg),
        timestamp
      }
    });

    return NextResponse.json({ success: true, data: weightLog });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
