import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { getOrCreateDefaultUser } from '@/lib/user';

export async function GET() {
  try {
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

    const weightLogs = await prisma.weightLog.findMany({
      where: {
        userId
      },
      orderBy: {
        timestamp: 'asc'
      }
    });

    return NextResponse.json({
      success: true,
      data: weightLogs
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
