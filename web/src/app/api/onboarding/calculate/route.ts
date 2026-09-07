import { NextResponse } from 'next/server';
import { calculateAll } from '@/lib/tdee';

export async function POST(req: Request) {
  try {
    const {
      weightKg,
      heightCm,
      age,
      gender,
      activityLevel,
      goal,
      bodyFatPercent,
      skeletalMuscleMassKg,
      visceralFatLevel,
      inbodyScore,
    } = await req.json();

    if (!weightKg || !heightCm || !age || !gender || !activityLevel || !goal) {
      return NextResponse.json({ success: false, error: 'Semua field wajib diisi' }, { status: 400 });
    }

    const result = calculateAll({
      weightKg: parseFloat(weightKg),
      heightCm: parseFloat(heightCm),
      age: parseInt(age, 10),
      gender,
      activityLevel,
      goal,
      bodyFatPercent: bodyFatPercent ? parseFloat(bodyFatPercent) : null,
      skeletalMuscleMassKg: skeletalMuscleMassKg ? parseFloat(skeletalMuscleMassKg) : null,
      visceralFatLevel: visceralFatLevel ? parseInt(visceralFatLevel, 10) : null,
      inbodyScore: inbodyScore ? parseInt(inbodyScore, 10) : null,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
