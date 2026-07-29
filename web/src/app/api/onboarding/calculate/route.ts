import { NextResponse } from 'next/server';
import { calculateAll } from '@/lib/tdee';

export async function POST(req: Request) {
  try {
    const { weightKg, heightCm, age, gender, activityLevel, goal } = await req.json();

    if (!weightKg || !heightCm || !age || !gender || !activityLevel || !goal) {
      return NextResponse.json({ success: false, error: 'Semua field wajib diisi' }, { status: 400 });
    }

    const result = calculateAll({
      weightKg: parseFloat(weightKg),
      heightCm: parseFloat(heightCm),
      age: parseInt(age),
      gender,
      activityLevel,
      goal
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
