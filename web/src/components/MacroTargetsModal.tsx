"use client";

import React, { useState } from "react";
import {
  X,
  Sliders,
  Check,
  RefreshCw,
  AlertCircle,
  Flame,
  Dumbbell,
  Wheat,
  Droplet,
  Info
} from "lucide-react";

interface MacroTargetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    dailyCalorieTarget: number;
    targetProteinG: number;
    targetCarbsG: number;
    targetFatsG: number;
  };
  onSuccess: () => void;
}

export default function MacroTargetsModal({
  isOpen,
  onClose,
  user,
  onSuccess,
}: MacroTargetsModalProps) {
  const [dailyCalorieTarget, setDailyCalorieTarget] = useState(user.dailyCalorieTarget.toString());
  const [targetProteinG, setTargetProteinG] = useState(user.targetProteinG.toString());
  const [targetCarbsG, setTargetCarbsG] = useState(user.targetCarbsG.toString());
  const [targetFatsG, setTargetFatsG] = useState(user.targetFatsG.toString());

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

  // Live Math calculations
  const calNum = parseInt(dailyCalorieTarget) || 0;
  const pNum = parseInt(targetProteinG) || 0;
  const cNum = parseInt(targetCarbsG) || 0;
  const fNum = parseInt(targetFatsG) || 0;

  const macroCalories = pNum * 4 + cNum * 4 + fNum * 9;
  const calDiff = macroCalories - calNum;

  const pPct = macroCalories > 0 ? Math.round(((pNum * 4) / macroCalories) * 100) : 0;
  const cPct = macroCalories > 0 ? Math.round(((cNum * 4) / macroCalories) * 100) : 0;
  const fPct = macroCalories > 0 ? Math.round(((fNum * 9) / macroCalories) * 100) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const payload = {
        dailyCalorieTarget: parseInt(dailyCalorieTarget),
        targetProteinG: parseInt(targetProteinG),
        targetCarbsG: parseInt(targetCarbsG),
        targetFatsG: parseInt(targetFatsG),
      };

      const res = await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setSuccessMsg("Target kalori & makronutrisi berhasil disimpan!");
        onSuccess();
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setError(json.error || "Gagal menyimpan target");
      }
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100/80 text-emerald-800 border border-emerald-200/60">
              <Sliders className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-900">Kustomisasi Target Nutrisi</h2>
              <p className="text-[11px] text-stone-500">Atur batas kalori dan gramasi makronutrisi harian</p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-4 space-y-4 text-xs">
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

          {/* Daily Calorie Target */}
          <div>
            <label className="block font-semibold text-stone-700 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Flame className="h-4 w-4 text-amber-500" /> Target Kalori Harian
              </span>
              <span className="text-[10px] text-stone-400 font-normal">kcal/hari</span>
            </label>
            <input
              type="number"
              min="800"
              max="6000"
              value={dailyCalorieTarget}
              onChange={(e) => setDailyCalorieTarget(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600 transition"
            />
          </div>

          {/* Macros Grid */}
          <div className="grid grid-cols-3 gap-2.5">
            {/* Protein */}
            <div className="p-3 rounded-2xl bg-amber-50/50 border border-amber-200/60">
              <div className="flex items-center gap-1 text-[11px] font-bold text-amber-800 mb-1">
                <Dumbbell className="h-3 w-3 text-amber-600" /> Protein
              </div>
              <div className="relative">
                <input
                  type="number"
                  min="20"
                  max="400"
                  value={targetProteinG}
                  onChange={(e) => setTargetProteinG(e.target.value)}
                  className="w-full bg-white border border-stone-200 rounded-xl px-2.5 py-2 text-stone-900 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-amber-300 transition pr-6"
                />
                <span className="absolute right-2 top-2.5 text-[10px] text-stone-400">g</span>
              </div>
              <div className="text-[10px] text-amber-700 mt-1.5 font-medium">
                {pNum * 4} kcal ({pPct}%)
              </div>
            </div>

            {/* Carbs */}
            <div className="p-3 rounded-2xl bg-emerald-50/50 border border-emerald-200/60">
              <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 mb-1">
                <Wheat className="h-3 w-3 text-emerald-600" /> Karbo
              </div>
              <div className="relative">
                <input
                  type="number"
                  min="20"
                  max="700"
                  value={targetCarbsG}
                  onChange={(e) => setTargetCarbsG(e.target.value)}
                  className="w-full bg-white border border-stone-200 rounded-xl px-2.5 py-2 text-stone-900 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-emerald-300 transition pr-6"
                />
                <span className="absolute right-2 top-2.5 text-[10px] text-stone-400">g</span>
              </div>
              <div className="text-[10px] text-emerald-700 mt-1.5 font-medium">
                {cNum * 4} kcal ({cPct}%)
              </div>
            </div>

            {/* Fats */}
            <div className="p-3 rounded-2xl bg-sky-50/50 border border-sky-200/60">
              <div className="flex items-center gap-1 text-[11px] font-bold text-sky-800 mb-1">
                <Droplet className="h-3 w-3 text-sky-600" /> Lemak
              </div>
              <div className="relative">
                <input
                  type="number"
                  min="10"
                  max="200"
                  value={targetFatsG}
                  onChange={(e) => setTargetFatsG(e.target.value)}
                  className="w-full bg-white border border-stone-200 rounded-xl px-2.5 py-2 text-stone-900 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-sky-300 transition pr-6"
                />
                <span className="absolute right-2 top-2.5 text-[10px] text-stone-400">g</span>
              </div>
              <div className="text-[10px] text-sky-700 mt-1.5 font-medium">
                {fNum * 9} kcal ({fPct}%)
              </div>
            </div>
          </div>

          {/* Macro Ratio Bar & Calibration */}
          <div className="p-3.5 bg-stone-50 border border-stone-200/80 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-stone-700">Distribusi Rasio Kalori Makro</span>
              <span className="font-semibold text-stone-500">{macroCalories} kcal total</span>
            </div>

            {/* Visual ratio bar */}
            <div className="h-2 w-full bg-stone-200 rounded-full flex overflow-hidden">
              <div style={{ width: `${pPct}%` }} className="bg-amber-500 transition-all duration-300" title={`Protein: ${pPct}%`} />
              <div style={{ width: `${cPct}%` }} className="bg-emerald-600 transition-all duration-300" title={`Karbo: ${cPct}%`} />
              <div style={{ width: `${fPct}%` }} className="bg-sky-500 transition-all duration-300" title={`Lemak: ${fPct}%`} />
            </div>

            {/* Hint if disparity exists */}
            {Math.abs(calDiff) > 20 ? (
              <div className="flex items-start gap-1.5 text-[10px] text-amber-700 bg-amber-50 p-2 rounded-xl border border-amber-200/60">
                <Info className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Total kalori dari makro ({macroCalories} kcal) berbeda {Math.abs(calDiff)} kcal dari Target Kalori ({calNum} kcal). Sebaiknya diselaraskan agar perhitungan harian presisi.
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 bg-emerald-50/80 p-2 rounded-xl border border-emerald-200/60">
                <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>Rasio makronutrisi sudah selaras dengan target kalori harian.</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold py-2.5 rounded-xl transition text-xs"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-2.5 rounded-xl transition text-xs flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Simpan Target</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
