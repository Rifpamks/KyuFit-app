"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Lock, Mail, Phone, Activity, AlertCircle, Loader2, Check } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password minimal 8 karakter');
      return;
    }

    if (password !== confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, confirmPassword, whatsappNumber })
      });

      const data = await res.json();

      if (data.success) {
        router.push('/onboarding');
        router.refresh();
      } else {
        setError(data.error || 'Terjadi kesalahan saat registrasi.');
      }
    } catch (err) {
      setError('Koneksi internet bermasalah.');
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
            Buat Akun KyuFit
          </h1>
          <p className="text-xs text-stone-500 mt-1">Mulai perjalanan fitness Anda bersama Kyu</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleRegister} className="space-y-3.5">
          {/* Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-600">Nama Lengkap</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rifaldi Adi"
                className="w-full bg-stone-50 border border-stone-200 focus:border-orange-400 text-xs text-stone-900 pl-10 pr-3.5 py-2.5 rounded-xl transition focus:outline-none focus:ring-2 focus:ring-orange-100 placeholder-stone-400"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-600">Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full bg-stone-50 border border-stone-200 focus:border-orange-400 text-xs text-stone-900 pl-10 pr-3.5 py-2.5 rounded-xl transition focus:outline-none focus:ring-2 focus:ring-orange-100 placeholder-stone-400"
              />
            </div>
          </div>

          {/* Password */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-600">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 char"
                  className="w-full bg-stone-50 border border-stone-200 focus:border-orange-400 text-xs text-stone-900 pl-9 pr-2.5 py-2.5 rounded-xl transition focus:outline-none focus:ring-2 focus:ring-orange-100 placeholder-stone-400"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-600">Konfirmasi</label>
              <div className="relative">
                <Check className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi"
                  className="w-full bg-stone-50 border border-stone-200 focus:border-orange-400 text-xs text-stone-900 pl-9 pr-2.5 py-2.5 rounded-xl transition focus:outline-none focus:ring-2 focus:ring-orange-100 placeholder-stone-400"
                />
              </div>
            </div>
          </div>

          {/* WhatsApp */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-600">Nomor WhatsApp</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="tel"
                required
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="08xxxxxxxxxx"
                className="w-full bg-stone-50 border border-stone-200 focus:border-orange-400 text-xs text-stone-900 pl-10 pr-3.5 py-2.5 rounded-xl transition focus:outline-none focus:ring-2 focus:ring-orange-100 placeholder-stone-400"
              />
            </div>
            <p className="text-[10px] text-stone-400 mt-0.5">Sinkron dengan WhatsApp Bot KyuFit</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl text-xs transition duration-200 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Mendaftarkan...</span>
              </>
            ) : (
              <span>Daftar Sekarang</span>
            )}
          </button>
        </form>

        {/* Login link */}
        <div className="mt-5 text-center text-xs text-stone-500">
          Sudah punya akun?{' '}
          <Link href="/login" className="text-orange-600 hover:text-orange-700 font-bold transition">
            Masuk di sini
          </Link>
        </div>

        {/* Footer info */}
        <div className="mt-6 border-t border-stone-100 pt-4 text-center text-[10px] text-stone-400">
          KyuFit Personal Fitness Tracker © 2026
        </div>
      </div>
    </div>
  );
}
