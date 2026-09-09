"use client";

import React, { useState } from "react";
import {
  ChevronLeft,
  Scale,
  Ruler,
  Target,
  Sparkles,
  Check,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  Activity,
  UtensilsCrossed
} from "lucide-react";

interface MedicalInfoViewProps {
  user: {
    heightCm?: number | null;
    currentWeightKg?: number | null;
    targetWeightKg?: number | null;
    dietaryRestrictions?: string | null;
    bodyFatPercent?: number | null;
    skeletalMuscleMassKg?: number | null;
    gender?: string | null;
    dailyCalorieTarget?: number;
    targetProteinG?: number;
  };
  onBack: () => void;
  onSuccess: () => void;
}

export default function MedicalInfoView({
  user,
  onBack,
  onSuccess,
}: MedicalInfoViewProps) {
  const [heightCm, setHeightCm] = useState(user.heightCm?.toString() || "166");
  const [weightKg, setWeightKg] = useState(user.currentWeightKg?.toString() || "62");
  const [targetWeightKg, setTargetWeightKg] = useState(user.targetWeightKg?.toString() || "55");
  const [dietaryRestrictions, setDietaryRestrictions] = useState(user.dietaryRestrictions || "Tidak ada pantangan");
  
  // Bioimpedance / Body Composition fields
  const [bodyFatPercent, setBodyFatPercent] = useState(user.bodyFatPercent?.toString() || "");
  const [skeletalMuscleMassKg, setSkeletalMuscleMassKg] = useState(user.skeletalMuscleMassKg?.toString() || "");
  const [showBioimpedanceEdit, setShowBioimpedanceEdit] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Auto-calculated body metrics
  const wNum = parseFloat(weightKg) || 0;
  const hNum = parseFloat(heightCm) || 170;
  const bfNum = parseFloat(bodyFatPercent) || (user.bodyFatPercent || 0);
  
  const fatMass = wNum > 0 && bfNum > 0 ? Number((wNum * (bfNum / 100)).toFixed(1)) : null;
  const lbm = wNum > 0 && bfNum > 0 ? Number((wNum * (1 - bfNum / 100)).toFixed(1)) : null;
  const bmi = wNum > 0 && hNum > 0 ? Number((wNum / Math.pow(hNum / 100, 2)).toFixed(1)) : null;

  // Body Fat Category
  const getBfCategory = (bf: number, gender?: string | null) => {
    const isFemale = gender === "female";
    if (isFemale) {
      if (bf < 18) return { label: "Rendah", color: "text-amber-800 bg-amber-100/80" };
      if (bf <= 24) return { label: "Fit / Atletis", color: "text-emerald-800 bg-emerald-100/80" };
      if (bf <= 31) return { label: "Ideal", color: "text-teal-800 bg-teal-100/80" };
      return { label: "Overfat", color: "text-rose-800 bg-rose-100/80" };
    } else {
      if (bf < 10) return { label: "Rendah", color: "text-amber-800 bg-amber-100/80" };
      if (bf <= 17) return { label: "Fit / Atletis", color: "text-emerald-800 bg-emerald-100/80" };
      if (bf <= 24) return { label: "Ideal", color: "text-teal-800 bg-teal-100/80" };
      return { label: "Overfat", color: "text-rose-800 bg-rose-100/80" };
    }
  };

  const bfCategory = bfNum > 0 ? getBfCategory(bfNum, user.gender) : null;

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
          heightCm: heightCm ? parseFloat(heightCm) : undefined,
          currentWeightKg: weightKg ? parseFloat(weightKg) : undefined,
          targetWeightKg: targetWeightKg ? parseFloat(targetWeightKg) : undefined,
          dietaryRestrictions: dietaryRestrictions.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || "Gagal menyimpan informasi medis");
      }

      // If bioimpedance values were edited, save to body composition endpoint
      if (bodyFatPercent || skeletalMuscleMassKg) {
        await fetch("/api/user/body-composition", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            weightKg: weightKg ? parseFloat(weightKg) : undefined,
            bodyFatPercent: bodyFatPercent ? parseFloat(bodyFatPercent) : undefined,
            skeletalMuscleMassKg: skeletalMuscleMassKg ? parseFloat(skeletalMuscleMassKg) : undefined,
            recalculateTargets: true,
          }),
        });
      }

      setSuccessMsg("Informasi medis & komposisi tubuh berhasil disimpan!");
      onSuccess();
      setTimeout(() => {
        onBack();
      }, 900);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat menyimpan data");
    } finally {
      setLoading(false);
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
        <h1 className="text-base font-bold text-stone-900 tracking-tight">Informasi Medis</h1>
        <div className="w-10" />
      </div>

      {/* Main Card */}
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

          {/* Tinggi (cm) */}
          <div>
            <label className="block font-semibold text-stone-700 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Ruler className="h-3.5 w-3.5 text-stone-400" /> Tinggi (cm)
              </span>
              <span className="text-[10px] text-stone-400">cm</span>
            </label>
            <input
              type="number"
              step="0.5"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              placeholder="166"
              className="w-full bg-stone-50/80 border border-stone-200 rounded-2xl px-4 py-3 text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600 transition"
              required
            />
          </div>

          {/* Berat (kg) */}
          <div>
            <label className="block font-semibold text-stone-700 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Scale className="h-3.5 w-3.5 text-stone-400" /> Berat (kg)
              </span>
              <span className="text-[10px] text-stone-400">kg</span>
            </label>
            <input
              type="number"
              step="0.1"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              placeholder="62"
              className="w-full bg-stone-50/80 border border-stone-200 rounded-2xl px-4 py-3 text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600 transition"
              required
            />
          </div>

          {/* Berat Tujuan (kg) */}
          <div>
            <label className="block font-semibold text-stone-700 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-emerald-600" /> Berat Tujuan (kg)
              </span>
              <span className="text-[10px] text-stone-400">kg</span>
            </label>
            <input
              type="number"
              step="0.1"
              value={targetWeightKg}
              onChange={(e) => setTargetWeightKg(e.target.value)}
              placeholder="55"
              className="w-full bg-stone-50/80 border border-stone-200 rounded-2xl px-4 py-3 text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600 transition"
            />
          </div>

          {/* Pantangan Makan */}
          <div>
            <label className="block font-semibold text-stone-700 mb-1.5 flex items-center gap-1.5">
              <UtensilsCrossed className="h-3.5 w-3.5 text-stone-400" /> Pantangan Makan / Alergi
            </label>
            <input
              type="text"
              value={dietaryRestrictions}
              onChange={(e) => setDietaryRestrictions(e.target.value)}
              placeholder="Misal: Vegan, Intoleransi Laktosa, Rendah Gula, Tidak Ada"
              className="w-full bg-stone-50/80 border border-stone-200 rounded-2xl px-4 py-3 text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600 transition"
            />
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {["Tidak ada", "Vegan", "Vegetarian", "Halal", "Gluten Free", "Lactose Intolerant"].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setDietaryRestrictions(tag)}
                  className="text-[10px] px-2.5 py-1 rounded-full bg-stone-100 hover:bg-stone-200/80 text-stone-600 font-medium transition"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Snapshot Komposisi Tubuh Saat Ini */}
          <div className="pt-2 border-t border-stone-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-700" />
                <span className="font-bold text-stone-900 text-xs">Komposisi Tubuh Saat Ini</span>
              </div>
              <button
                type="button"
                onClick={() => setShowBioimpedanceEdit(!showBioimpedanceEdit)}
                className="text-[11px] font-bold text-emerald-800 hover:underline"
              >
                {showBioimpedanceEdit ? "Sembunyikan" : "Perbarui Bioimpedansi"}
              </button>
            </div>

            {/* Quick 4 Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="p-2.5 bg-stone-50/80 rounded-2xl border border-stone-100">
                <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">Lemak Tubuh</span>
                <span className="text-sm font-black text-stone-900 mt-0.5 block">
                  {bfNum > 0 ? `${bfNum}%` : "-"}
                </span>
                {bfCategory && (
                  <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded mt-0.5 inline-block ${bfCategory.color}`}>
                    {bfCategory.label}
                  </span>
                )}
              </div>

              <div className="p-2.5 bg-stone-50/80 rounded-2xl border border-stone-100">
                <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">Fat Mass</span>
                <span className="text-sm font-black text-stone-900 mt-0.5 block">
                  {fatMass ? `${fatMass} kg` : "-"}
                </span>
                <span className="text-[8px] text-stone-400 font-medium">Massa Lemak</span>
              </div>

              <div className="p-2.5 bg-stone-50/80 rounded-2xl border border-stone-100">
                <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">LBM</span>
                <span className="text-sm font-black text-stone-900 mt-0.5 block">
                  {lbm ? `${lbm} kg` : "-"}
                </span>
                <span className="text-[8px] text-stone-400 font-medium">Bebas Lemak</span>
              </div>

              <div className="p-2.5 bg-stone-50/80 rounded-2xl border border-stone-100">
                <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">Massa Otot (SMM)</span>
                <span className="text-sm font-black text-stone-900 mt-0.5 block">
                  {user.skeletalMuscleMassKg ? `${user.skeletalMuscleMassKg} kg` : "-"}
                </span>
                <span className="text-[8px] text-stone-400 font-medium">Skeletal Muscle</span>
              </div>
            </div>

            {/* LBM & BMI Bar */}
            {lbm && (
              <div className="flex items-center justify-between px-3 py-2 bg-emerald-50/70 border border-emerald-200/60 rounded-xl text-[11px] text-emerald-950">
                <span className="flex items-center gap-1.5 font-semibold">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
                  <span>BMI: <strong>{bmi}</strong> • LBM: <strong>{lbm} kg</strong></span>
                </span>
                <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">
                  Katch-McArdle Active
                </span>
              </div>
            )}

            {/* Expandable bioimpedance inputs */}
            {showBioimpedanceEdit && (
              <div className="p-3.5 bg-stone-50/90 border border-stone-200/70 rounded-2xl space-y-3 pt-3 animate-in fade-in duration-200">
                <div className="text-[11px] text-stone-600 leading-relaxed">
                  Masukkan data dari timbangan pintar bioimpedansi (smart scale).
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-semibold text-stone-600 mb-1">
                      Lemak Tubuh (%BF)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={bodyFatPercent}
                      onChange={(e) => setBodyFatPercent(e.target.value)}
                      placeholder="misal 24.4"
                      className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-stone-600 mb-1">
                      Massa Otot (SMM kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={skeletalMuscleMassKg}
                      onChange={(e) => setSkeletalMuscleMassKg(e.target.value)}
                      placeholder="misal 31.0"
                      className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-200"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
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
                <span>Simpan</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
