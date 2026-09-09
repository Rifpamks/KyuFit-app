"use client";

import React, { useState } from "react";
import {
  Scale,
  Activity,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Check,
  RefreshCw,
  Info,
  ShieldCheck
} from "lucide-react";

interface BodyCompositionCardProps {
  user: {
    gender?: string | null;
    currentWeightKg?: number | null;
    heightCm?: number | null;
    bodyFatPercent?: number | null;
    skeletalMuscleMassKg?: number | null;
    visceralFatLevel?: number | null;
    inbodyScore?: number | null;
    dailyCalorieTarget: number;
    targetProteinG: number;
  };
  onSuccess?: () => void;
}

export default function BodyCompositionCard({ user, onSuccess }: BodyCompositionCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [weightKg, setWeightKg] = useState(user.currentWeightKg?.toString() || "");
  const [bodyFatPercent, setBodyFatPercent] = useState(user.bodyFatPercent?.toString() || "");
  const [skeletalMuscleMassKg, setSkeletalMuscleMassKg] = useState(user.skeletalMuscleMassKg?.toString() || "");
  const [recalculate, setRecalculate] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const hasData = Boolean(
    user.bodyFatPercent !== null &&
    user.bodyFatPercent !== undefined &&
    user.bodyFatPercent > 0
  );

  // Auto-calculated values based on current user or input
  const weightVal = user.currentWeightKg || (weightKg ? parseFloat(weightKg) : 0);
  const bfVal = user.bodyFatPercent || (bodyFatPercent ? parseFloat(bodyFatPercent) : 0);
  const heightVal = user.heightCm || 170;

  const fatMassVal = weightVal > 0 && bfVal > 0 ? Number((weightVal * (bfVal / 100)).toFixed(1)) : null;
  const lbmVal = weightVal > 0 && bfVal > 0 ? Number((weightVal * (1 - bfVal / 100)).toFixed(1)) : null;
  const bmiVal = weightVal > 0 && heightVal > 0 ? Number((weightVal / Math.pow(heightVal / 100, 2)).toFixed(1)) : null;

  // Live calculation for the form input
  const formWeightNum = parseFloat(weightKg);
  const formBfNum = parseFloat(bodyFatPercent);
  const hasFormLiveCalc = !isNaN(formWeightNum) && formWeightNum > 0 && !isNaN(formBfNum) && formBfNum > 0;
  const formFatMass = hasFormLiveCalc ? (formWeightNum * (formBfNum / 100)).toFixed(1) : null;
  const formLbm = hasFormLiveCalc ? (formWeightNum * (1 - formBfNum / 100)).toFixed(1) : null;
  const formBmi = !isNaN(formWeightNum) && formWeightNum > 0 && heightVal > 0
    ? (formWeightNum / Math.pow(heightVal / 100, 2)).toFixed(1)
    : null;

  // Body Fat Category
  const getBfCategory = (bf: number, gender?: string | null) => {
    const isFemale = gender === "female";
    if (isFemale) {
      if (bf < 18) return { label: "Rendah", color: "text-amber-800 bg-amber-100/80" };
      if (bf <= 24) return { label: "Fit", color: "text-emerald-800 bg-emerald-100/80" };
      if (bf <= 31) return { label: "Ideal", color: "text-teal-800 bg-teal-100/80" };
      return { label: "Overfat", color: "text-rose-800 bg-rose-100/80" };
    } else {
      if (bf < 10) return { label: "Rendah", color: "text-amber-800 bg-amber-100/80" };
      if (bf <= 17) return { label: "Fit", color: "text-emerald-800 bg-emerald-100/80" };
      if (bf <= 24) return { label: "Ideal", color: "text-teal-800 bg-teal-100/80" };
      return { label: "Overfat", color: "text-rose-800 bg-rose-100/80" };
    }
  };

  const bfCategory = user.bodyFatPercent ? getBfCategory(user.bodyFatPercent, user.gender) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const res = await fetch("/api/user/body-composition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weightKg: weightKg ? parseFloat(weightKg) : undefined,
          bodyFatPercent: bodyFatPercent ? parseFloat(bodyFatPercent) : undefined,
          skeletalMuscleMassKg: skeletalMuscleMassKg ? parseFloat(skeletalMuscleMassKg) : undefined,
          recalculateTargets: recalculate,
        }),
      });

      const json = await res.json();
      if (json.success) {
        if (json.data?.calculation) {
          setSuccessMessage(
            `Data disimpan! Target: ${json.data.calculation.dailyCalorieTarget} kcal • Protein: ${json.data.calculation.targetProteinG}g`
          );
        } else {
          setSuccessMessage("Data komposisi tubuh berhasil disimpan!");
        }

        if (onSuccess) {
          onSuccess();
        }

        setTimeout(() => {
          setIsOpen(false);
          setSuccessMessage("");
        }, 2200);
      } else {
        setError(json.error || "Gagal memperbarui data");
      }
    } catch {
      setError("Terjadi kesalahan koneksi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-200/80 p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/60">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs uppercase font-bold text-stone-900 tracking-wider">
              Update Komposisi Tubuh
            </h3>
            <p className="text-[11px] text-stone-500">
              {hasData
                ? "Bioimpedansi & Analisis Massa Tubuh"
                : "Tingkatkan akurasi kalori dengan data smart scale"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsOpen(!isOpen);
            setError("");
            setSuccessMessage("");
          }}
          className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl transition ${
            isOpen
              ? "bg-stone-100 text-stone-700 hover:bg-stone-200"
              : "bg-emerald-800 text-white hover:bg-emerald-900 shadow-xs"
          }`}
        >
          <span>{isOpen ? "Tutup" : "Perbarui"}</span>
          {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Snapshot Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-0.5">
        <div className="p-3 bg-stone-50/80 border border-stone-200/70 rounded-2xl text-center relative flex flex-col justify-between">
          <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">
            Lemak Tubuh
          </span>
          <span className="text-base font-black text-stone-900 my-0.5 block">
            {user.bodyFatPercent ? `${user.bodyFatPercent}%` : "-"}
          </span>
          <div className="flex items-center justify-center gap-1">
            <span className="text-[9px] text-stone-500 font-medium">Body Fat (%BF)</span>
            {bfCategory && (
              <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded ${bfCategory.color}`}>
                {bfCategory.label}
              </span>
            )}
          </div>
        </div>

        <div className="p-3 bg-stone-50/80 border border-stone-200/70 rounded-2xl text-center flex flex-col justify-between">
          <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">
            Fat Mass
          </span>
          <span className="text-base font-black text-stone-900 my-0.5 block">
            {fatMassVal ? `${fatMassVal} kg` : "-"}
          </span>
          <span className="text-[9px] text-stone-500 font-medium">Massa Lemak</span>
        </div>

        <div className="p-3 bg-stone-50/80 border border-stone-200/70 rounded-2xl text-center flex flex-col justify-between">
          <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">
            LBM (Bebas Lemak)
          </span>
          <span className="text-base font-black text-stone-900 my-0.5 block">
            {lbmVal ? `${lbmVal} kg` : "-"}
          </span>
          <span className="text-[9px] text-stone-500 font-medium">Lean Body Mass</span>
        </div>

        <div className="p-3 bg-stone-50/80 border border-stone-200/70 rounded-2xl text-center flex flex-col justify-between">
          <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">
            Massa Otot (SMM)
          </span>
          <span className="text-base font-black text-stone-900 my-0.5 block">
            {user.skeletalMuscleMassKg ? `${user.skeletalMuscleMassKg} kg` : "-"}
          </span>
          <span className="text-[9px] text-stone-500 font-medium">Skeletal Muscle</span>
        </div>
      </div>

      {/* Lean Body Mass Callout if available */}
      {lbmVal && (
        <div className="flex items-center justify-between px-3.5 py-2 bg-emerald-50/80 border border-emerald-200/70 rounded-2xl text-xs text-emerald-950">
          <span className="flex items-center gap-1.5 font-semibold">
            <ShieldCheck className="h-4 w-4 text-emerald-700" />
            <span>Massa Bebas Lemak (LBM): <strong>{lbmVal} kg</strong> • BMI: <strong>{bmiVal}</strong></span>
          </span>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">
            Katch-McArdle Active
          </span>
        </div>
      )}

      {/* Success Notification */}
      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-medium flex items-center gap-2">
          <Check className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Notification */}
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 font-medium flex items-center gap-2">
          <Info className="h-4 w-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Expandable Form */}
      {isOpen && (
        <form onSubmit={handleSubmit} className="pt-2 border-t border-stone-100 space-y-3.5">
          <p className="text-[11px] text-stone-500 leading-relaxed">
            Perbarui data dari hasil timbangan bioimpedansi. Sistem akan secara otomatis mengkalkulasi Fat Mass, LBM, BMI, dan kebutuhan kalori & makronutrisi harian berdasarkan formula sains Katch-McArdle.
          </p>

          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-stone-600 mb-1 flex items-center gap-1">
                <Scale className="h-3 w-3 text-stone-400" /> Berat (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                placeholder="misal 72.7"
                className="w-full bg-stone-50 border border-stone-200 focus:border-emerald-600 text-xs text-stone-900 px-3 py-2 rounded-xl transition focus:outline-none focus:ring-2 focus:ring-emerald-200 placeholder-stone-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                Lemak (%BF)
              </label>
              <input
                type="number"
                step="0.1"
                value={bodyFatPercent}
                onChange={(e) => setBodyFatPercent(e.target.value)}
                placeholder="misal 24.4"
                className="w-full bg-stone-50 border border-stone-200 focus:border-emerald-600 text-xs text-stone-900 px-3 py-2 rounded-xl transition focus:outline-none focus:ring-2 focus:ring-emerald-200 placeholder-stone-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                Massa Otot (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={skeletalMuscleMassKg}
                onChange={(e) => setSkeletalMuscleMassKg(e.target.value)}
                placeholder="misal 31.0"
                className="w-full bg-stone-50 border border-stone-200 focus:border-emerald-600 text-xs text-stone-900 px-3 py-2 rounded-xl transition focus:outline-none focus:ring-2 focus:ring-emerald-200 placeholder-stone-400"
              />
            </div>
          </div>

          {/* Form Live Calculation Preview */}
          {hasFormLiveCalc && (
            <div className="p-3 bg-stone-50 border border-stone-200/80 rounded-2xl space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-stone-700">
                <span>Hasil Kalkulasi Otomatis:</span>
                <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                  Live Preview
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="p-2 bg-white rounded-xl border border-stone-200/80">
                  <div className="text-[10px] text-stone-400 font-semibold uppercase">Fat Mass</div>
                  <div className="text-sm font-bold text-stone-900 mt-0.5">
                    {formFatMass} <span className="text-[10px] font-normal text-stone-500">kg</span>
                  </div>
                </div>
                <div className="p-2 bg-white rounded-xl border border-stone-200/80">
                  <div className="text-[10px] text-stone-400 font-semibold uppercase">LBM</div>
                  <div className="text-sm font-bold text-stone-900 mt-0.5">
                    {formLbm} <span className="text-[10px] font-normal text-stone-500">kg</span>
                  </div>
                </div>
                <div className="p-2 bg-white rounded-xl border border-stone-200/80">
                  <div className="text-[10px] text-stone-400 font-semibold uppercase">BMI</div>
                  <div className="text-sm font-bold text-stone-900 mt-0.5">
                    {formBmi || "-"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Toggle Auto-Recalculate */}
          <label className="flex items-center gap-2 cursor-pointer pt-1 text-xs text-stone-700 select-none">
            <input
              type="checkbox"
              checked={recalculate}
              onChange={(e) => setRecalculate(e.target.checked)}
              className="rounded border-stone-300 text-emerald-800 focus:ring-emerald-200 h-4 w-4"
            />
            <span className="flex items-center gap-1 font-medium text-emerald-950">
              <Sparkles className="h-3.5 w-3.5 text-emerald-700" />
              Otomatis sesuaikan target kalori & makronutrisi harian
            </span>
          </label>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold py-2.5 rounded-xl text-xs transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Simpan Perubahan</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
