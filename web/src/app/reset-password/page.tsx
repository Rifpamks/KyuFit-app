"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Lock,
  Mail,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';

export default function ResetPasswordPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Resend OTP countdown timer
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const router = useRouter();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 2 && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  // Handle Step 1: Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccessMessage(data.message || 'Kode OTP telah dikirim ke email Anda.');
        setStep(2);
        setResendTimer(60);
        setCanResend(false);
      } else {
        setError(data.error || 'Gagal mengirim kode OTP.');
      }
    } catch (err) {
      setError('Gagal menghubungi server. Periksa koneksi internet Anda.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Resend OTP in Step 2
  const handleResendOtp = async () => {
    if (!canResend || loading) return;
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccessMessage('Kode OTP baru telah dikirimkan ke email Anda.');
        setResendTimer(60);
        setCanResend(false);
      } else {
        setError(data.error || 'Gagal mengirim ulang OTP.');
      }
    } catch (err) {
      setError('Koneksi internet bermasalah.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Step 2: Verify OTP and set new password
  const handleVerifyAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Kata sandi baru minimal harus 6 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          otpCode,
          newPassword,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setStep(3);
      } else {
        setError(data.error || 'Gagal memperbarui kata sandi.');
      }
    } catch (err) {
      setError('Terjadi kendala jaringan saat mengatur ulang password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col justify-center items-center p-4 font-sans antialiased">
      {/* Main Container */}
      <div className="w-full max-w-md bg-white border border-stone-200 p-8 rounded-2xl shadow-sm">
        
        {/* Header/Logo */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="h-14 w-14 rounded-2xl bg-orange-500 flex items-center justify-center text-white text-3xl font-black shadow-sm mb-3">
            🐱
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">
            {step === 3 ? 'Selesai!' : 'Reset Password'}
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            {step === 1 && 'Masukkan email terdaftar untuk menerima 6-digit kode OTP'}
            {step === 2 && 'Masukkan kode OTP dan buat kata sandi baru Anda'}
            {step === 3 && 'Kata sandi Anda telah berhasil diperbarui'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: Input Email */}
        {step === 1 && (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-600">Email Akun KyuFit</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rifaldiadi88@gmail.com"
                  className="w-full bg-stone-50 border border-stone-200 focus:border-orange-400 text-xs text-stone-900 pl-10 pr-3.5 py-2.5 rounded-xl transition focus:outline-none focus:ring-2 focus:ring-orange-100 placeholder-stone-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full mt-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl text-xs transition duration-200 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mengirim OTP...</span>
                </>
              ) : (
                <span>Kirim Kode OTP</span>
              )}
            </button>

            <div className="mt-4 pt-4 border-t border-stone-100 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-800 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke Halaman Masuk</span>
              </Link>
            </div>
          </form>
        )}

        {/* STEP 2: Input OTP & New Password */}
        {step === 2 && (
          <form onSubmit={handleVerifyAndReset} className="space-y-4">
            {/* Info Badge */}
            <div className="p-3 bg-orange-50/80 border border-orange-200 rounded-xl flex items-center justify-between text-xs text-orange-900">
              <div className="flex items-center gap-2 overflow-hidden">
                <ShieldCheck className="w-4 h-4 text-orange-600 shrink-0" />
                <span className="truncate font-medium">OTP dikirim ke <strong>{email}</strong></span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setError('');
                }}
                className="text-[11px] font-bold text-orange-600 hover:underline shrink-0 ml-2"
              >
                Ubah
              </button>
            </div>

            {/* OTP Code Field */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-stone-600">Kode OTP 6-Digit</label>
                <span className="text-[10px] text-stone-400 font-medium">Cek Inbox / Spam</span>
              </div>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full bg-stone-50 border border-stone-200 focus:border-orange-400 text-sm font-bold tracking-widest text-stone-900 pl-10 pr-3.5 py-2.5 rounded-xl transition focus:outline-none focus:ring-2 focus:ring-orange-100 placeholder-stone-300"
                />
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-600">Kata Sandi Baru</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full bg-stone-50 border border-stone-200 focus:border-orange-400 text-xs text-stone-900 pl-10 pr-3.5 py-2.5 rounded-xl transition focus:outline-none focus:ring-2 focus:ring-orange-100 placeholder-stone-400"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-600">Konfirmasi Kata Sandi Baru</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi kata sandi baru"
                  className="w-full bg-stone-50 border border-stone-200 focus:border-orange-400 text-xs text-stone-900 pl-10 pr-3.5 py-2.5 rounded-xl transition focus:outline-none focus:ring-2 focus:ring-orange-100 placeholder-stone-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || otpCode.length < 6 || !newPassword}
              className="w-full mt-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl text-xs transition duration-200 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memperbarui Sandi...</span>
                </>
              ) : (
                <span>Simpan Kata Sandi Baru</span>
              )}
            </button>

            {/* Resend OTP button */}
            <div className="flex items-center justify-center pt-2 text-xs">
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="text-orange-600 hover:text-orange-700 font-bold transition flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Kirim Ulang Kode OTP</span>
                </button>
              ) : (
                <span className="text-stone-400 text-[11px]">
                  Kirim ulang kode dalam <strong className="text-stone-600">{resendTimer}s</strong>
                </span>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-stone-100 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-800 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Batal & Kembali ke Login</span>
              </Link>
            </div>
          </form>
        )}

        {/* STEP 3: Success State */}
        {step === 3 && (
          <div className="space-y-5 text-center py-2">
            <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h2 className="text-base font-bold text-stone-900">Kata Sandi Berhasil Diubah!</h2>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                Silakan masuk kembali ke dashboard KyuFit Anda menggunakan kata sandi yang baru saja Anda buat.
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.push('/login')}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl text-xs transition duration-200 flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Masuk Sekarang</span>
            </button>
          </div>
        )}

        {/* Footer info */}
        <div className="mt-6 border-t border-stone-100 pt-4 text-center text-[10px] text-stone-400">
          KyuFit AI Fitness Assistant © 2026
        </div>
      </div>
    </div>
  );
}
