import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { resolveUserFromRequest } from '@/lib/user';

export async function GET(req: Request) {
  try {
    // Resolve user: via session token or WhatsApp Number or default
    const user = await resolveUserFromRequest(req);
    const userId = user.id;

    // Parse date filter query parameters
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");
    const monthParam = searchParams.get("month");
    const yearParam = searchParams.get("year");
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    let startWIB: Date | undefined;
    let endWIB: Date | undefined;

    if (startDateParam && endDateParam) {
      startWIB = new Date(`${startDateParam}T00:00:00.000+07:00`);
      endWIB = new Date(`${endDateParam}T23:59:59.999+07:00`);
    } else if (monthParam) {
      const [y, m] = monthParam.split("-").map(Number);
      startWIB = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0) - 7 * 3600 * 1000);
      const lastDay = new Date(Date.UTC(y, m, 0)).getDate();
      endWIB = new Date(Date.UTC(y, m - 1, lastDay, 23, 59, 59, 999) - 7 * 3600 * 1000);
    } else if (yearParam) {
      const y = Number(yearParam);
      startWIB = new Date(Date.UTC(y, 0, 1, 0, 0, 0) - 7 * 3600 * 1000);
      endWIB = new Date(Date.UTC(y, 11, 31, 23, 59, 59, 999) - 7 * 3600 * 1000);
    } else if (dateParam) {
      // For daily view, show 30 days prior up to target date for context
      endWIB = new Date(`${dateParam}T23:59:59.999+07:00`);
      startWIB = new Date(endWIB.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const whereClause: any = { userId };
    if (startWIB && endWIB) {
      whereClause.timestamp = { gte: startWIB, lte: endWIB };
    }

    const weightLogs = await prisma.weightLog.findMany({
      where: whereClause,
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
