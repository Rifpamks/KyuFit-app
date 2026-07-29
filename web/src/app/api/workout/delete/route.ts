import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { getOrCreateDefaultUser } from '@/lib/user';

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let idStr = searchParams.get('id');

    if (!idStr) {
      try {
        const body = await req.json();
        idStr = body.id || body.workoutId;
      } catch (e) {
        // no json body
      }
    }

    if (!idStr) {
      return NextResponse.json({ success: false, error: 'Missing workout log id' }, { status: 400 });
    }

    const workoutId = parseInt(idStr.toString());

    // Resolve user
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

    // Delete workout log owned by this user
    await prisma.workoutLog.deleteMany({
      where: {
        id: workoutId,
        userId
      }
    });

    return NextResponse.json({ success: true, deletedId: workoutId });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  return DELETE(req);
}
