"use client";

import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  Plus,
  Target,
  Sparkles,
  Calendar,
  Check,
  RefreshCw,
  AlertCircle,
  X,
  Activity,
  Flame,
  Dumbbell
} from "lucide-react";
import { calculateAll, Gender, ActivityLevel, FitnessGoal } from "@/lib/tdee";

interface AssessmentItem {
  id: number;
  title: string;
  fitnessGoal: string;
  activityLevel: string;
  weightKg: number;
  targetWeightKg?: number | null;
  dailyCalorieTarget: number;
  targetProteinG: number;
  targetCarbsG: number;
  targetFatsG: number;
  programDurationMonths?: number | null;
  pace?: string | null;
  timestamp: string;
}

interface AssessmentHistoryViewProps {
  user: {
    currentWeightKg?: number | null;
    targetWeightKg?: number | null;
    heightCm?: number | null;
    age?: number | null;
    gender?: string | null;
    activityLevel?: string | null;
    fitnessGoal?: string | null;
    bodyFatPercent?: number | null;
    dailyCalorieTarget: number;
    targetProteinG: number;
    targetCarbsG: number;
    targetFatsG: number;
  };
  onBack: () => void;
  onSuccess: () => void;
}

export default function AssessmentHistoryView({
  user,
  onBack,
  onSuccess,
}: AssessmentHistoryViewProps) {
  const [assessments, setAssessments] = useState<AssessmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Re-Assessment Modal Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [goal, setGoal] = useState<FitnessGoal>((user.fitnessGoal || "cut") as FitnessGoal);
  const [activity, setActivity] = useState<ActivityLevel>((user.activityLevel || "moderate") as ActivityLevel);
  const [weightKg, setWeightKg] = useState(user.currentWeightKg?.toString() || "70");
  const [targetWeightKg, setTargetWeightKg] = useState(user.targetWeightKg?.toString() || "65");
  const [durationMonths, setDurationMonths] = useState("3");
  const [pace, setPace] = useState("Moderate");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalSuccessMsg, setModalSuccessMsg] = useState("");

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/user/assessment");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setAssessments(json.data);
      }
    } catch (err: any) {
      setError("Gagal memuat riwayat assessment");
    } finally {
      setLoading(false);
    }
  };

  // Live calculation preview for the assessment modal
  const liveWeight = parseFloat(weightKg) || user.currentWeightKg || 70;
  const liveHeight = user.heightCm || 170;
  const liveAge = user.age || 25;
  const liveGender = (user.gender || "male") as Gender;

  const liveCalc = calculateAll({
    weightKg: liveWeight,
    heightCm: liveHeight,
    age: liveAge,
    gender: liveGender,
    activityLevel: activity,
    goal: goal,
    bodyFatPercent: user.bodyFatPercent || undefined,
  });

  const handleSaveAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/user/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Update ${goal.toUpperCase()} (${pace})`,
          fitnessGoal: goal,
          activityLevel: activity,
          weightKg: parseFloat(weightKg),
          targetWeightKg: targetWeightKg ? parseFloat(targetWeightKg) : undefined,
          programDurationMonths: parseInt(durationMonths),
          pace,
        }),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Gagal menyimpan assessment");

      setModalSuccessMsg("Goal & Target Nutrisi Berhasil Diperbarui!");
      onSuccess();
      await fetchAssessments();

      setTimeout(() => {
        setIsModalOpen(false);
        setModalSuccessMsg("");
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan assessment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 animate-tab-enter">
      {/* Top Header */}
      <div className="relative flex items-center justify-between py-1">
        <button
          type="button"
          onClick={onBack}
          className="h-10 w-10 rounded-full bg-white border border-stone-200/80 shadow-2xs flex items-center justify-center text-stone-700 hover:text-stone-950 hover:bg-stone-50 transition active:scale-95"
          title="Kembali ke Profil"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="text-base font-bold text-stone-900 tracking-tight">Riwayat Assessment</h1>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="h-10 w-10 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 shadow-2xs flex items-center justify-center transition active:scale-95"
          title="Re-Assessment Baru"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Hero Action Banner to Trigger Re-Assessment */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-5 shadow-xs flex items-center justify-between gap-3">
        <div className="space-y-0.5">
          <h2 className="text-xs font-bold text-stone-900">Ubah Goal & Personalisasi Kebugaran</h2>
          <p className="text-[11px] text-stone-500">
            Perbarui data medis, intensitas olahraga, atau ganti tujuan (Cut / Maintain / Bulk).
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="shrink-0 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold px-3.5 py-2.5 rounded-2xl transition shadow-xs flex items-center gap-1.5 active:scale-95"
        >
          <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
          <span>Ubah Goal</span>
        </button>
      </div>

      {/* Assessment History Cards (Matching Reference Screenshot 5) */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-8 text-center text-xs text-stone-400">
            <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-stone-400" />
            Memuat riwayat assessment...
          </div>
        ) : assessments.length > 0 ? (
          assessments.map((item, index) => {
            const dateStr = new Date(item.timestamp).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });
            const assessmentNumber = assessments.length - index;

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-stone-200/80 p-5 shadow-xs space-y-3.5 transition hover:border-emerald-200"
              >
                {/* Header item */}
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-stone-900 tracking-tight">
                    Assessment #{assessmentNumber}
                  </h3>
                  <span className="text-[11px] font-medium text-stone-400">
                    {dateStr}
                  </span>
                </div>

                {/* 4 Metric Columns Grid (Matching reference screenshot: Kalori, Protein, Durasi, Target) */}
                <div className="grid grid-cols-2 gap-y-2.5 gap-x-2 text-xs">
                  {/* Kalori Harian */}
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-xs bg-emerald-600 shrink-0" />
                    <span className="text-stone-500 text-[11px]">Kalori harian</span>
                    <strong className="text-stone-900 font-black ml-auto">{item.dailyCalorieTarget} kcal</strong>
                  </div>

                  {/* Durasi Program */}
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-xs bg-amber-400 shrink-0" />
                    <span className="text-stone-500 text-[11px]">Durasi Program</span>
                    <strong className="text-stone-900 font-black ml-auto">
                      {item.programDurationMonths || 3} bulan
                    </strong>
                  </div>

                  {/* Protein */}
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-xs bg-amber-600 shrink-0" />
                    <span className="text-stone-500 text-[11px]">Protein</span>
                    <strong className="text-stone-900 font-black ml-auto">{item.targetProteinG} g</strong>
                  </div>

                  {/* Target Berat */}
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-xs bg-rose-500 shrink-0" />
                    <span className="text-stone-500 text-[11px]">Target</span>
                    <strong className="text-stone-900 font-black ml-auto">
                      {item.targetWeightKg ? `${item.targetWeightKg} kg` : "-"}
                    </strong>
                  </div>
                </div>

                {/* Badges footer (Title tag & Pace tag) */}
                <div className="flex items-center justify-between pt-1 border-t border-stone-100">
                  <span className="text-[10px] font-semibold text-stone-600 bg-stone-100 px-2.5 py-1 rounded-full">
                    {item.title}
                  </span>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200/60 px-2.5 py-0.5 rounded-full capitalize">
                    {item.pace || "Moderate"}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-xs text-stone-400 bg-white rounded-3xl border border-stone-200/80">
            Belum ada riwayat assessment.
          </div>
        )}
      </div>

      {/* Modal: Re-Assessment / Ubah Goal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50/70">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                  <Target className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-stone-900">Re-Assessment & Ganti Goal</h2>
                  <p className="text-[11px] text-stone-500">Kalkulasi ulang kalori & makro otomatis</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveAssessment} className="overflow-y-auto px-6 py-4 space-y-4 text-xs">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {modalSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 flex items-center gap-2 font-medium">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{modalSuccessMsg}</span>
                </div>
              )}

              {/* Goal Selector */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1.5">Tujuan Kebugaran Baru</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "cut", title: "CUT", desc: "Defisit Kalori" },
                    { id: "maintain", title: "MAINTAIN", desc: "Stabilisasi" },
                    { id: "bulk", title: "BULK", desc: "Surplus Otot" },
                  ].map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setGoal(g.id as FitnessGoal)}
                      className={`p-2.5 rounded-2xl border text-center transition flex flex-col items-center justify-center ${
                        goal === g.id
                          ? "bg-emerald-800 text-white border-emerald-800 shadow-xs"
                          : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100"
                      }`}
                    >
                      <span className="font-bold text-xs">{g.title}</span>
                      <span className={`text-[9px] mt-0.5 ${goal === g.id ? "text-emerald-200" : "text-stone-400"}`}>
                        {g.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Activity Level */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1.5 flex items-center gap-1">
                  <Activity className="h-3.5 w-3.5 text-stone-400" /> Tingkat Aktivitas Saat Ini
                </label>
                <select
                  value={activity}
                  onChange={(e) => setActivity(e.target.value as ActivityLevel)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-3.5 py-2.5 text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600 transition"
                >
                  <option value="sedentary">Sedenter (Jarang olahraga / kerja kantoran)</option>
                  <option value="light">Ringan (Olahraga 1-3 hari / minggu)</option>
                  <option value="moderate">Moderat (Olahraga 3-5 hari / minggu)</option>
                  <option value="very_active">Aktif (Olahraga intens 6-7 hari / minggu)</option>
                  <option value="extra_active">Sangat Aktif (Latihan 2x sehari / atlet)</option>
                </select>
              </div>

              {/* Weight & Target Weight */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Berat Saat Ini (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-3.5 py-2.5 text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-200"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Target Berat (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={targetWeightKg}
                    onChange={(e) => setTargetWeightKg(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-3.5 py-2.5 text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  />
                </div>
              </div>

              {/* Pace & Program Duration */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Intensitas Program</label>
                  <select
                    value={pace}
                    onChange={(e) => setPace(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-3.5 py-2.5 text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  >
                    <option value="Relaxed">Santai (Defisit/Surplus ~10%)</option>
                    <option value="Moderate">Moderat (Defisit/Surplus ~15%)</option>
                    <option value="Aggressive">Agresif (Defisit/Surplus ~20%)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Durasi Program</label>
                  <select
                    value={durationMonths}
                    onChange={(e) => setDurationMonths(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-3.5 py-2.5 text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  >
                    <option value="1">1 Bulan</option>
                    <option value="3">3 Bulan</option>
                    <option value="6">6 Bulan</option>
                  </select>
                </div>
              </div>

              {/* Live Scientific Recalculation Preview */}
              <div className="p-3.5 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-emerald-950">
                  <span className="flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-700" />
                    Kalkulasi Kalori & Makro Baru (Otomatis):
                  </span>
                  <span className="text-[10px] bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded">
                    Sains TDEE
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-1.5 text-center pt-1">
                  <div className="p-2 bg-white rounded-xl border border-emerald-100">
                    <span className="text-[9px] text-stone-400 uppercase font-semibold block">Kalori</span>
                    <strong className="text-xs font-black text-stone-900 mt-0.5 block">{liveCalc.dailyCalorieTarget}</strong>
                    <span className="text-[8px] text-stone-400">kcal</span>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-emerald-100">
                    <span className="text-[9px] text-stone-400 uppercase font-semibold block">Protein</span>
                    <strong className="text-xs font-black text-stone-900 mt-0.5 block">{liveCalc.targetProteinG}</strong>
                    <span className="text-[8px] text-stone-400">g</span>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-emerald-100">
                    <span className="text-[9px] text-stone-400 uppercase font-semibold block">Karbo</span>
                    <strong className="text-xs font-black text-stone-900 mt-0.5 block">{liveCalc.targetCarbsG}</strong>
                    <span className="text-[8px] text-stone-400">g</span>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-emerald-100">
                    <span className="text-[9px] text-stone-400 uppercase font-semibold block">Lemak</span>
                    <strong className="text-xs font-black text-stone-900 mt-0.5 block">{liveCalc.targetFatsG}</strong>
                    <span className="text-[8px] text-stone-400">g</span>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold py-3 rounded-2xl text-xs transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-3 rounded-2xl text-xs transition flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Menghitung...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Simpan & Sinkronkan Target</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
