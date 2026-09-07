import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { email, otpCode, newPassword } = await req.json();

    if (!email || !otpCode || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Email, kode OTP, dan password baru wajib diisi.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password baru minimal harus 6 karakter.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otpCode.trim();

    // Check user existence
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Akun pengguna tidak ditemukan.' },
        { status: 404 }
      );
    }

    // Find the active, unused, unexpired token
    const tokenRecord = await prisma.passwordResetToken.findFirst({
      where: {
        email: cleanEmail,
        otpCode: cleanOtp,
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!tokenRecord) {
      return NextResponse.json(
        {
          success: false,
          error: 'Kode OTP tidak valid atau telah kedaluwarsa (maks. 5 menit). Silakan minta kode baru.',
        },
        { status: 400 }
      );
    }

    // Hash the new password
    const passwordHash = hashPassword(newPassword);

    // Update user password and invalidate all tokens for this email
    await prisma.$transaction([
      prisma.user.update({
        where: { email: cleanEmail },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.updateMany({
        where: { email: cleanEmail, used: false },
        data: { used: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Kata sandi berhasil diperbarui! Silakan masuk dengan kata sandi baru Anda.',
    });
  } catch (error: any) {
    console.error('[ResetPasswordVerify Error]:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Terjadi kesalahan saat memperbarui kata sandi.',
      },
      { status: 500 }
    );
  }
}
