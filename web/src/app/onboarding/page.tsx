"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Check,
  Flame,
  Loader2,
  Ruler,
  Scale,
  User,
  Zap,
  Target,
  TrendingDown,
  TrendingUp,
  Minus
} from "lucide-react";

type Gender = "male" | "female";
type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "extra_active";
type FitnessGoal = "cut" | "maintain" | "bulk";

interface CalcResult {
  rmr: number;
  tdee: number;
  dailyCalorieTarget: number;
  targetProteinG: number;
  targetCarbsG: number;
  targetFatsG: number;
}

const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string; desc: string; icon: string }[] = [
  { value: "sedentary", label: "Sedentary", desc: "Jarang olahraga, kerja duduk", icon: "🪑" },
  { value: "light", label: "Ringan", desc: "Olahraga 1-3x / minggu", icon: "🚶" },
  { value: "moderate", label: "Moderat", desc: "Olahraga 3-5x / minggu", icon: "🏃" },
  { value: "active", label: "Aktif", desc: "Olahraga 6-7x / minggu", icon: "💪" },
  { value: "extra_active", label: "Sangat Aktif", desc: "Fisik berat / atlet", icon: "🔥" },
];

const GOAL_OPTIONS: { value: FitnessGoal; label: string; desc: string; icon: React.ReactNode; color: string }[] = [
  { value: "cut", label: "Turunkan Berat", desc: "Defisit kalori ~18%", icon: <TrendingDown className="h-6 w-6" />, color: "text-rose-400 border-rose-500 bg-rose-500/10" },
  { value: "maintain", label: "Pertahankan", desc: "Stabil di berat saat ini", icon: <Minus className="h-6 w-6" />, color: "text-amber-400 border-amber-500 bg-amber-500/10" },
  { value: "bulk", label: "Naikkan Berat", desc: "Surplus kalori ~12%", icon: <TrendingUp className="h-6 w-6" />, color: "text-emerald-400 border-emerald-500 bg-emerald-500/10" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<Gender | "">("");
  const [heightCm, setHeightCm] = useState("");
  const [currentWeightKg, setCurrentWeightKg] = useState("");

  // Step 2
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | "">("");

  // Step 3
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal | "">("");

  // Step 4 — preview
  const [calcResult, setCalcResult] = useState<CalcResult | null>(null);

  const totalSteps = 4;

  const canProceed = () => {
    switch (step) {
      case 1: return age && gender && heightCm && currentWeightKg;
      case 2: return activityLevel !== "";
      case 3: return fitnessGoal !== "";
      case 4: return calcResult !== null;
      default: return false;
    }
  };

  const handleNext = async () => {
    setError("");

    if (step === 3) {
      // Fetch preview calculation before going to step 4
      setPreviewLoading(true);
      try {
        const res = await fetch("/api/onboarding/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            weightKg: currentWeightKg,
            heightCm,
            age,
            gender,
            activityLevel,
            goal: fitnessGoal,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setCalcResult(data.data);
          setStep(4);
        } else {
          setError(data.error || "Gagal menghitung target.");
        }
      } catch {
        setError("Koneksi internet bermasalah.");
      } finally {
        setPreviewLoading(false);
      }
      return;
    }

    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleConfirm = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age,
          gender,
          heightCm,
          currentWeightKg,
          activityLevel,
          fitnessGoal,
        }),
      });

      const data = await res.json();
      if (data.success) {
        router.push("/");
        router.refresh();
      } else {
        setError(data.error || "Gagal menyimpan data.");
      }
    } catch {
      setError("Koneksi internet bermasalah.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col justify-center items-center p-4 font-sans antialiased">
      <div className="w-full max-w-lg bg-white border border-stone-200 p-8 rounded-2xl shadow-sm">
        {/* Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="h-14 w-14 rounded-2xl bg-orange-500 flex items-center justify-center text-white text-3xl font-black shadow-sm mb-3">
            🐱
          </div>
          <h1 className="text-xl font-bold text-stone-900">Personalisasi Target Anda</h1>
          <p className="text-xs text-stone-500 mt-1">Data ini digunakan untuk menghitung target kalori & makro harian</p>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex-1 flex flex-col items-center gap-1">
              <div
                className={`h-1.5 w-full rounded-full transition-all duration-300 ${
                  s <= step ? "bg-orange-500" : "bg-stone-100"
                }`}
              />
              <span className={`text-[9px] font-bold uppercase tracking-wider ${s <= step ? "text-orange-600" : "text-stone-400"}`}>
                {s === 1 ? "Data Diri" : s === 2 ? "Aktivitas" : s === 3 ? "Goal" : "Hasil"}
              </span>
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
            {error}
          </div>
        )}

        {/* Step 1: Data Diri */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-2">
              <User className="h-4 w-4 text-orange-500" /> Data Diri
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Usia (tahun)</label>
                <input
                  type="number"
                  required
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="25"
                  className="w-full bg-stone-50 border border-stone-200 focus:border-orange-400 text-xs text-stone-900 px-3.5 py-2.5 rounded-xl transition focus:outline-none focus:ring-2 focus:ring-orange-100 placeholder-stone-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Gender</label>
                <div className="flex gap-2">
                  {(["male", "female"] as Gender[]).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition ${
                        gender === g
                          ? "bg-orange-50 border-orange-400 text-orange-700 font-bold"
                          : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                      }`}
                    >
                      {g === "male" ? "♂ Pria" : "♀ Wanita"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1 flex items-center gap-1">
                  <Ruler className="h-3.5 w-3.5 text-stone-400" /> Tinggi (cm)
                </label>
                <input
                  type="number"
                  required
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  placeholder="170"
                  className="w-full bg-stone-50 border border-stone-200 focus:border-orange-400 text-xs text-stone-900 px-3.5 py-2.5 rounded-xl transition focus:outline-none focus:ring-2 focus:ring-orange-100 placeholder-stone-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1 flex items-center gap-1">
                  <Scale className="h-3.5 w-3.5 text-stone-400" /> Berat (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={currentWeightKg}
                  onChange={(e) => setCurrentWeightKg(e.target.value)}
                  placeholder="70"
                  className="w-full bg-stone-50 border border-stone-200 focus:border-orange-400 text-xs text-stone-900 px-3.5 py-2.5 rounded-xl transition focus:outline-none focus:ring-2 focus:ring-orange-100 placeholder-stone-400"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Activity Level */}
        {step === 2 && (
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-2 mb-3">
              <Zap className="h-4 w-4 text-orange-500" /> Seberapa Aktif Anda?
            </h2>
            {ACTIVITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setActivityLevel(opt.value)}
                className={`w-full flex items-center gap-3.5 p-3.5 rounded-xl border text-left transition ${
                  activityLevel === opt.value
                    ? "bg-orange-50 border-orange-400 shadow-sm"
                    : "bg-stone-50 border-stone-200 hover:bg-stone-100"
                }`}
              >
                <span className="text-2xl">{opt.icon}</span>
                <div>
                  <div className={`text-xs font-bold ${activityLevel === opt.value ? "text-orange-700" : "text-stone-900"}`}>
                    {opt.label}
                  </div>
                  <div className="text-[11px] text-stone-500">{opt.desc}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Step 3: Fitness Goal */}
        {step === 3 && (
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-2 mb-3">
              <Target className="h-4 w-4 text-orange-500" /> Apa Tujuan Fitness Anda?
            </h2>
            {GOAL_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setFitnessGoal(opt.value)}
                className={`w-full flex items-center gap-3.5 p-4 rounded-xl border text-left transition ${
                  fitnessGoal === opt.value
                    ? "bg-orange-50 border-orange-400 shadow-sm"
                    : "bg-stone-50 border-stone-200 hover:bg-stone-100"
                }`}
              >
                <div className={fitnessGoal === opt.value ? "text-orange-600" : "text-stone-400"}>
                  {opt.icon}
                </div>
                <div>
                  <div className={`text-xs font-bold ${fitnessGoal === opt.value ? "text-orange-700" : "text-stone-900"}`}>
                    {opt.label}
                  </div>
                  <div className="text-[11px] text-stone-500">{opt.desc}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Step 4: Preview Results */}
        {step === 4 && calcResult && (
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" /> Target Personal Anda
            </h2>

            {/* Methodology Education Card */}
            <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl">
              <p className="text-xs text-stone-700 font-bold mb-1">📐 Metodologi Kalkulasi</p>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                Target dihitung menggunakan <strong>Mifflin-St Jeor Equation</strong> untuk mengestimasi 
                <strong> RMR (Resting Metabolic Rate)</strong>, lalu disesuaikan dengan aktivitas menjadi 
                <strong> TDEE</strong>, dan dimodifikasi sesuai goal Anda.
              </p>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-center">
                <div className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">RMR</div>
                <div className="text-lg font-black text-stone-900 mt-0.5">{calcResult.rmr}</div>
                <div className="text-[10px] text-stone-500">kcal/hari</div>
              </div>
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-center">
                <div className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">TDEE</div>
                <div className="text-lg font-black text-stone-900 mt-0.5">{calcResult.tdee}</div>
                <div className="text-[10px] text-stone-500">kcal/hari</div>
              </div>
            </div>

            {/* Main Target */}
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl text-center">
              <div className="text-xs text-orange-700 font-bold uppercase tracking-wider">🎯 Target Kalori Harian</div>
              <div className="text-3xl font-black text-stone-900 mt-1">{calcResult.dailyCalorieTarget}</div>
              <div className="text-xs text-orange-600 font-medium">kcal / hari</div>
            </div>

            {/* Macro Targets */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 bg-stone-50 border border-orange-200 rounded-xl text-center">
                <div className="text-[10px] text-orange-600 font-bold uppercase">Protein</div>
                <div className="text-base font-black text-stone-900 mt-0.5">{calcResult.targetProteinG}g</div>
              </div>
              <div className="p-2.5 bg-stone-50 border border-purple-200 rounded-xl text-center">
                <div className="text-[10px] text-purple-600 font-bold uppercase">Karbo</div>
                <div className="text-base font-black text-stone-900 mt-0.5">{calcResult.targetCarbsG}g</div>
              </div>
              <div className="p-2.5 bg-stone-50 border border-amber-200 rounded-xl text-center">
                <div className="text-[10px] text-amber-600 font-bold uppercase">Lemak</div>
                <div className="text-base font-black text-stone-900 mt-0.5">{calcResult.targetFatsG}g</div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-6 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1 text-xs text-stone-600 hover:text-stone-900 font-semibold transition"
            >
              <ArrowLeft className="h-4 w-4" /> Kembali
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              onClick={handleNext}
              disabled={!canProceed() || previewLoading}
              className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              {previewLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Menghitung...
                </>
              ) : (
                <>
                  Lanjut <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Menyimpan...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" /> Konfirmasi & Mulai
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
