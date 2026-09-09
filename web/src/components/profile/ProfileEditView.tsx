"use client";

import React, { useState } from "react";
import {
  ChevronLeft,
  Calendar,
  Check,
  RefreshCw,
  AlertCircle,
  Lock,
} from "lucide-react";

interface ProfileEditViewProps {
  user: {
    name?: string | null;
    gender?: string | null;
    age?: number | null;
    birthDate?: string | null;
    whatsappNumber: string;
    email: string;
  };
  onBack: () => void;
  onSuccess: () => void;
}

export default function ProfileEditView({
  user,
  onBack,
  onSuccess,
}: ProfileEditViewProps) {
  const [name, setName] = useState(user.name || "");
  const [gender, setGender] = useState(user.gender || "male");
  const [age, setAge] = useState(user.age?.toString() || "25");
  const [birthDate, setBirthDate] = useState(user.birthDate || "");
  const [email, setEmail] = useState(user.email || "");
  const [timezone, setTimezone] = useState("Asia/Jakarta (WIB)");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || undefined,
          gender,
          age: age ? parseInt(age) : undefined,
          birthDate: birthDate || undefined,
          email: email.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSuccessMsg("Profil berhasil disimpan!");
        onSuccess();
        setTimeout(() => {
          onBack();
        }, 800);
      } else {
        setError(json.error || "Gagal menyimpan data profil");
      }
    } catch {
      setError("Terjadi kendala jaringan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 animate-tab-enter">
      {/* Header */}
      <div className="relative flex items-center justify-between py-1">
        <button
          type="button"
          onClick={onBack}
          className="h-10 w-10 rounded-full bg-white border border-stone-200/80 shadow-2xs flex items-center justify-center text-stone-700 hover:text-stone-950 hover:bg-stone-50 transition active:scale-95"
          title="Kembali ke Profil"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="text-base font-bold text-stone-900 tracking-tight">Edit Profile</h1>
        <div className="w-10" />
      </div>

      {/* Main Card Form */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 flex items-center gap-2 font-medium">
              <Check className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block font-semibold text-stone-700 mb-1.5">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama lengkap atau panggilan"
              className="w-full bg-stone-50/80 border border-stone-200 rounded-2xl px-4 py-3 text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600 transition"
              required
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block font-semibold text-stone-700 mb-1.5">Gender</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setGender("female")}
                className={`py-2.5 rounded-2xl font-bold border transition text-center text-xs ${
                  gender === "female"
                    ? "bg-emerald-800 text-white border-emerald-800 shadow-xs"
                    : "bg-stone-50/80 text-stone-600 border-stone-200 hover:bg-stone-100"
                }`}
              >
                Female (Wanita)
              </button>
              <button
                type="button"
                onClick={() => setGender("male")}
                className={`py-2.5 rounded-2xl font-bold border transition text-center text-xs ${
                  gender === "male"
                    ? "bg-emerald-800 text-white border-emerald-800 shadow-xs"
                    : "bg-stone-50/80 text-stone-600 border-stone-200 hover:bg-stone-100"
                }`}
              >
                Male (Pria)
              </button>
            </div>
          </div>

          {/* Date of Birth / Usia */}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="block font-semibold text-stone-700 mb-1.5 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-stone-400" /> Date of Birth
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full bg-stone-50/80 border border-stone-200 rounded-2xl px-3 py-2.5 text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600 transition"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1.5">Usia (Th)</label>
              <input
                type="number"
                min="10"
                max="100"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="25"
                className="w-full bg-stone-50/80 border border-stone-200 rounded-2xl px-3 py-2.5 text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600 transition"
              />
            </div>
          </div>

          {/* Phone Number (WhatsApp) - Read Only with badge */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-stone-700">Phone Number</label>
              <span className="flex items-center gap-1 text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                <Lock className="h-2.5 w-2.5" /> Terhubung WhatsApp
              </span>
            </div>
            <input
              type="text"
              value={`+${user.whatsappNumber}`}
              readOnly
              className="w-full bg-stone-100/70 border border-stone-200/80 rounded-2xl px-4 py-3 text-stone-500 text-xs cursor-not-allowed select-none font-mono"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block font-semibold text-stone-700 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="w-full bg-stone-50/80 border border-stone-200 rounded-2xl px-4 py-3 text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600 transition"
            />
          </div>

          {/* Timezone */}
          <div>
            <label className="block font-semibold text-stone-700 mb-1.5">Timezone</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full bg-stone-50/80 border border-stone-200 rounded-2xl px-3.5 py-3 text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600 transition"
            >
              <option value="Asia/Jakarta (WIB)">Asia/Jakarta (WIB)</option>
              <option value="Asia/Makassar (WITA)">Asia/Makassar (WITA)</option>
              <option value="Asia/Jayapura (WIT)">Asia/Jayapura (WIT)</option>
            </select>
          </div>

          {/* Save Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-3.5 rounded-2xl text-xs transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>Save</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
