"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, Activity, AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (data.success) {
        router.push('/');
        router.refresh();
      } else {
        setError(data.error || 'Terjadi kesalahan saat login.');
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
            KyuFit AI
          </h1>
          <p className="text-xs text-stone-500 mt-1">Masuk untuk mengakses dashboard nutrisi WhatsApp Anda</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-600">Email</label>
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

          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-600">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-stone-50 border border-stone-200 focus:border-orange-400 text-xs text-stone-900 pl-10 pr-3.5 py-2.5 rounded-xl transition focus:outline-none focus:ring-2 focus:ring-orange-100 placeholder-stone-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl text-xs transition duration-200 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <span>Masuk</span>
            )}
          </button>
        </form>

        {/* Register link */}
        <div className="mt-5 text-center text-xs text-stone-500">
          Belum punya akun?{' '}
          <Link href="/register" className="text-orange-600 hover:text-orange-700 font-bold transition">
            Daftar di sini
          </Link>
        </div>

        {/* Footer info */}
        <div className="mt-6 border-t border-stone-100 pt-4 text-center text-[10px] text-stone-400">
          KyuFit AI Fitness Assistant © 2026
        </div>
      </div>
    </div>
  );
}
