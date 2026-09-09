"use client";

import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  User,
  HeartPulse,
  History,
  FileText,
  LogOut,
  CheckCircle2,
} from "lucide-react";
import KyuMascot from "@/components/KyuMascot";

interface ProfileMainListProps {
  user: {
    name?: string | null;
    email: string;
    whatsappNumber: string;
    gender?: string | null;
    age?: number | null;
    fitnessGoal?: string;
  };
  onSelectMenu: (menu: "edit-profile" | "medical-info" | "weight-history" | "assessment-history" | "logout") => void;
  onBackToToday: () => void;
}

export default function ProfileMainList({
  user,
  onSelectMenu,
  onBackToToday,
}: ProfileMainListProps) {
  const genderLabel = user.gender === "female" ? "Female" : "Male";
  const ageLabel = user.age ? `${user.age} Tahun` : "25 Tahun";
  const displayName = user.name || user.email.split("@")[0] || "Pengguna";

  return (
    <div className="space-y-4 animate-tab-enter">
      {/* Top Bar with Back Arrow */}
      <div className="relative flex items-center justify-between py-1">
        <button
          type="button"
          onClick={onBackToToday}
          className="h-10 w-10 rounded-full bg-white border border-stone-200/80 shadow-2xs flex items-center justify-center text-stone-700 hover:text-stone-950 hover:bg-stone-50 transition active:scale-95"
          title="Kembali ke Dashboard"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="text-base font-bold text-stone-900 tracking-tight">Profil</h1>
        <div className="w-10" /> {/* Spacer for optical center alignment */}
      </div>

      {/* User Identity Banner (Inspired by Reference) */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-xs text-center flex flex-col items-center justify-center space-y-2">
        <div className="relative">
          <div className="h-20 w-20 rounded-full bg-emerald-100/90 border-2 border-emerald-300/80 flex items-center justify-center shadow-xs overflow-hidden">
            <KyuMascot mood="happy" size={48} />
          </div>
        </div>

        <div className="space-y-0.5">
          <div className="flex items-center justify-center gap-1.5">
            <h2 className="text-lg font-black text-stone-900 tracking-tight capitalize">
              {displayName}
            </h2>
            <CheckCircle2 className="h-4 w-4 text-emerald-600 fill-emerald-100" />
          </div>
          <p className="text-xs text-stone-500 font-medium">
            {genderLabel} <span className="text-stone-300 mx-1">|</span> {ageLabel}
          </p>
        </div>
      </div>

      {/* Group 1: Preferensi */}
      <div className="space-y-1.5">
        <h3 className="text-xs font-bold text-stone-500 px-2 tracking-wide">
          Preferensi
        </h3>

        <div className="bg-white rounded-3xl border border-stone-200/80 divide-y divide-stone-100 shadow-xs overflow-hidden">
          {/* Menu 1: Edit Profil */}
          <button
            type="button"
            onClick={() => onSelectMenu("edit-profile")}
            className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-stone-50/80 transition text-left group active:bg-stone-100"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center group-hover:scale-105 transition">
                <User className="h-4 w-4" />
              </div>
              <span className="text-xs font-semibold text-stone-800">
                Edit Profil
              </span>
            </div>
            <ChevronRight className="h-4 w-4 text-stone-300 group-hover:text-stone-500 group-hover:translate-x-0.5 transition" />
          </button>

          {/* Menu 2: Informasi Medis */}
          <button
            type="button"
            onClick={() => onSelectMenu("medical-info")}
            className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-stone-50/80 transition text-left group active:bg-stone-100"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center group-hover:scale-105 transition">
                <HeartPulse className="h-4 w-4" />
              </div>
              <span className="text-xs font-semibold text-stone-800">
                Informasi Medis & Komposisi Tubuh
              </span>
            </div>
            <ChevronRight className="h-4 w-4 text-stone-300 group-hover:text-stone-500 group-hover:translate-x-0.5 transition" />
          </button>

          {/* Menu 3: Riwayat Berat Badan */}
          <button
            type="button"
            onClick={() => onSelectMenu("weight-history")}
            className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-stone-50/80 transition text-left group active:bg-stone-100"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center group-hover:scale-105 transition">
                <History className="h-4 w-4" />
              </div>
              <span className="text-xs font-semibold text-stone-800">
                Riwayat Berat Badan
              </span>
            </div>
            <ChevronRight className="h-4 w-4 text-stone-300 group-hover:text-stone-500 group-hover:translate-x-0.5 transition" />
          </button>
        </div>
      </div>

      {/* Group 2: Manajemen Data */}
      <div className="space-y-1.5 pt-1">
        <h3 className="text-xs font-bold text-stone-500 px-2 tracking-wide">
          Manajemen Data
        </h3>

        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
          {/* Menu 4: Riwayat Assessment & Goals */}
          <button
            type="button"
            onClick={() => onSelectMenu("assessment-history")}
            className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-stone-50/80 transition text-left group active:bg-stone-100"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center group-hover:scale-105 transition">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs font-semibold text-stone-800 block">
                  Riwayat Assessment & Target Goals
                </span>
                <span className="text-[10px] text-emerald-700 font-medium block">
                  Aktif: {user.fitnessGoal ? user.fitnessGoal.toUpperCase() : "CUT"}
                </span>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-stone-300 group-hover:text-stone-500 group-hover:translate-x-0.5 transition" />
          </button>
        </div>
      </div>

      {/* Group 3: Akun (Keluar - Cohesive Deep Emerald / Stone Palette) */}
      <div className="space-y-1.5 pt-1">
        <h3 className="text-xs font-bold text-stone-500 px-2 tracking-wide">
          Akun
        </h3>

        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
          <button
            type="button"
            onClick={() => onSelectMenu("logout")}
            className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-stone-50 transition text-left group active:bg-stone-100"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-stone-100 text-stone-600 border border-stone-200/80 flex items-center justify-center group-hover:scale-105 transition">
                <LogOut className="h-4 w-4" />
              </div>
              <span className="text-xs font-semibold text-stone-700">
                Keluar
              </span>
            </div>
            <ChevronRight className="h-4 w-4 text-stone-300 group-hover:text-stone-500 group-hover:translate-x-0.5 transition" />
          </button>
        </div>
      </div>
    </div>
  );
}
