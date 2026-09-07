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
  const [visceralFatLevel, setVisceralFatLevel] = useState(user.visceralFatLevel?.toString() || "");
  const [bodyScore, setBodyScore] = useState(user.inbodyScore?.toString() || "");
  const [recalculate, setRecalculate] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const hasData = Boolean(
    user.bodyFatPercent !== null &&
    user.bodyFatPercent !== undefined &&
    user.bodyFatPercent > 0
  );

  // Calculate Lean Body Mass (LBM) if weight and body fat are available
  const weightVal = user.currentWeightKg || (weightKg ? parseFloat(weightKg) : 0);
  const bfVal = user.bodyFatPercent || (bodyFatPercent ? parseFloat(bodyFatPercent) : 0);
  const lbmVal = weightVal > 0 && bfVal > 0 ? Number((weightVal * (1 - bfVal / 100)).toFixed(1)) : null;

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
          visceralFatLevel: visceralFatLevel ? parseInt(visceralFatLevel, 10) : undefined,
          bodyScore: bodyScore ? parseInt(bodyScore, 10) : undefined,
          recalculateTargets: recalculate,
        }),
      });

      const json = await res.json();
      if (json.success) {
        if (json.data?.calculation) {
          setSuccessMessage(
            `Data berhasil disimpan! Target kalori: ${json.data.calculation.dailyCalorieTarget} kcal • Protein: ${json.data.calculation.targetProteinG}g`
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
    <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-orange-50 text-orange-600 border border-orange-100">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs uppercase font-bold text-stone-900 tracking-wider">
              Update Komposisi Tubuh
            </h3>
            <p className="text-[11px] text-stone-500">
              {hasData
                ? "Bioimpedansi & Analisis Jaringan Otot / Lemak"
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
              : "bg-orange-500 text-white hover:bg-orange-600 shadow-xs"
          }`}
        >
          <span>{isOpen ? "Tutup" : "Perbarui"}</span>
          {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Snapshot Cards (Always visible or when collapsed) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-0.5">
        <div className="p-3 bg-stone-50/80 border border-stone-200/70 rounded-xl text-center">
          <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">
            Lemak Tubuh
          </span>
          <span className="text-base font-black text-stone-900 mt-0.5 block">
            {user.bodyFatPercent ? `${user.bodyFatPercent}%` : "-"}
          </span>
          <span className="text-[9px] text-stone-500 font-medium">Body Fat (%BF)</span>
        </div>

        <div className="p-3 bg-stone-50/80 border border-stone-200/70 rounded-xl text-center">
          <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">
            Massa Otot
          </span>
          <span className="text-base font-black text-stone-900 mt-0.5 block">
            {user.skeletalMuscleMassKg ? `${user.skeletalMuscleMassKg} kg` : "-"}
          </span>
          <span className="text-[9px] text-stone-500 font-medium">Skeletal Muscle</span>
        </div>

        <div className="p-3 bg-stone-50/80 border border-stone-200/70 rounded-xl text-center">
          <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">
            Lemak Viseral
          </span>
          <span className="text-base font-black text-stone-900 mt-0.5 block">
            {user.visceralFatLevel ? `Lvl ${user.visceralFatLevel}` : "-"}
          </span>
          <span className="text-[9px] text-stone-500 font-medium">Visceral Level</span>
        </div>

        <div className="p-3 bg-stone-50/80 border border-stone-200/70 rounded-xl text-center">
          <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">
            Skor Tubuh
          </span>
          <span className="text-base font-black text-orange-600 mt-0.5 block">
            {user.inbodyScore ? `${user.inbodyScore}` : "-"}
          </span>
          <span className="text-[9px] text-stone-500 font-medium">Body Score</span>
        </div>
      </div>

      {/* Lean Body Mass Callout if available */}
      {lbmVal && (
        <div className="flex items-center justify-between px-3.5 py-2 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-900">
          <span className="flex items-center gap-1.5 font-semibold">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Massa Bebas Lemak (LBM): <strong>{lbmVal} kg</strong></span>
          </span>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">
            Katch-McArdle Active
          </span>
        </div>
      )}

      {/* Success Notification */}
      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium flex items-center gap-2">
          <Check className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Notification */}
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-medium flex items-center gap-2">
          <Info className="h-4 w-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Expandable Form */}
      {isOpen && (
        <form onSubmit={handleSubmit} className="pt-2 border-t border-stone-100 space-y-3.5">
          <p className="text-[11px] text-stone-500 leading-relaxed">
            Perbarui data dari hasil timbangan pintar gym atau klinik. Sistem akan secara otomatis mengkalkulasi ulang kebutuhan kalori & makro berdasarkan formula sains Katch-McArdle.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-stone-600 mb-1 flex items-center gap-1">
                <Scale className="h-3 w-3 text-stone-400" /> Berat Badan (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                placeholder="misal 72.7"
                className="w-full bg-stone-50 border border-stone-200 focus:border-orange-400 text-xs text-stone-900 px-3 py-2 rounded-xl transition focus:outline-none focus:ring-2 focus:ring-orange-100 placeholder-stone-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                Persentase Lemak (%BF)
              </label>
              <input
                type="number"
                step="0.1"
                value={bodyFatPercent}
                onChange={(e) => setBodyFatPercent(e.target.value)}
                placeholder="misal 24.4"
                className="w-full bg-stone-50 border border-stone-200 focus:border-orange-400 text-xs text-stone-900 px-3 py-2 rounded-xl transition focus:outline-none focus:ring-2 focus:ring-orange-100 placeholder-stone-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                Massa Otot Rangka / SMM (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={skeletalMuscleMassKg}
                onChange={(e) => setSkeletalMuscleMassKg(e.target.value)}
                placeholder="misal 31.0"
                className="w-full bg-stone-50 border border-stone-200 focus:border-orange-400 text-xs text-stone-900 px-3 py-2 rounded-xl transition focus:outline-none focus:ring-2 focus:ring-orange-100 placeholder-stone-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                Lemak Viseral (Level)
              </label>
              <input
                type="number"
                value={visceralFatLevel}
                onChange={(e) => setVisceralFatLevel(e.target.value)}
                placeholder="misal 7"
                className="w-full bg-stone-50 border border-stone-200 focus:border-orange-400 text-xs text-stone-900 px-3 py-2 rounded-xl transition focus:outline-none focus:ring-2 focus:ring-orange-100 placeholder-stone-400"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                Skor Komposisi Tubuh (1-100)
              </label>
              <input
                type="number"
                value={bodyScore}
                onChange={(e) => setBodyScore(e.target.value)}
                placeholder="misal 73"
                className="w-full bg-stone-50 border border-stone-200 focus:border-orange-400 text-xs text-stone-900 px-3 py-2 rounded-xl transition focus:outline-none focus:ring-2 focus:ring-orange-100 placeholder-stone-400"
              />
            </div>
          </div>

          {/* Toggle Auto-Recalculate */}
          <label className="flex items-center gap-2 cursor-pointer pt-1 text-xs text-stone-700 select-none">
            <input
              type="checkbox"
              checked={recalculate}
              onChange={(e) => setRecalculate(e.target.checked)}
              className="rounded border-stone-300 text-orange-500 focus:ring-orange-200 h-4 w-4"
            />
            <span className="flex items-center gap-1 font-medium">
              <Sparkles className="h-3.5 w-3.5 text-orange-500" />
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
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
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
