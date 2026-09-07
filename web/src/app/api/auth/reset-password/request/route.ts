import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendPasswordResetOtpEmail } from '@/lib/mail';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Email wajib diisi.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user exists with this email
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Akun dengan email ini tidak ditemukan di sistem KyuFit.' },
        { status: 404 }
      );
    }

    // Invalidate any older unused reset tokens for this email
    await prisma.passwordResetToken.updateMany({
      where: {
        email: cleanEmail,
        used: false,
      },
      data: {
        used: true,
      },
    });

    // Generate random 6-digit numeric OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Expiry: 5 minutes
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Save token record in database
    await prisma.passwordResetToken.create({
      data: {
        email: cleanEmail,
        otpCode,
        expiresAt,
        used: false,
      },
    });

    // Send OTP email
    await sendPasswordResetOtpEmail(cleanEmail, otpCode);

    return NextResponse.json({
      success: true,
      message: 'Kode verifikasi OTP 6-digit telah dikirim ke email Anda. Silakan periksa kotak masuk atau spam.',
    });
  } catch (error: any) {
    console.error('[ResetPasswordRequest Error]:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Gagal mengirim kode OTP. Silakan coba lagi nanti.',
      },
      { status: 500 }
    );
  }
}
