import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { hashPassword, signToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { name, email, password, confirmPassword, whatsappNumber } = await req.json();

    // Validation
    if (!name || !email || !password || !confirmPassword || !whatsappNumber) {
      return NextResponse.json({ success: false, error: 'Semua field wajib diisi' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ success: false, error: 'Password minimal 8 karakter' }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ success: false, error: 'Password dan konfirmasi password tidak cocok' }, { status: 400 });
    }

    // Normalize WA number
    let normalizedWA = whatsappNumber.replace(/[^0-9]/g, '');
    if (normalizedWA.startsWith('08')) {
      normalizedWA = '62' + normalizedWA.substring(1);
    }

    // Check duplicate email
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return NextResponse.json({ success: false, error: 'Email sudah terdaftar. Silakan login.' }, { status: 409 });
    }

    // Check duplicate WA
    const existingWA = await prisma.user.findFirst({
      where: {
        OR: [
          { whatsappNumber: normalizedWA },
          { whatsappNumber: `+${normalizedWA}` },
          { whatsappNumber: whatsappNumber }
        ]
      }
    });
    if (existingWA) {
      return NextResponse.json({ success: false, error: 'Nomor WhatsApp sudah terdaftar.' }, { status: 409 });
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashPassword(password),
        whatsappNumber: normalizedWA,
        onboardingComplete: false
      }
    });

    // Set session cookie with onboardingComplete flag
    const token = signToken({ userId: user.id, onboardingComplete: false });
    const cookieStore = await cookies();
    cookieStore.set('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7
    });

    return NextResponse.json({
      success: true,
      data: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
