"use client";

import React, { useState } from "react";
import {
  X,
  User,
  Sparkles,
  Check,
  RefreshCw,
  AlertCircle,
  Scale,
  Ruler,
  Calendar,
  Activity,
  Target
} from "lucide-react";

interface ProfileBiometricsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    name?: string | null;
    age?: number | null;
    gender?: string | null;
    heightCm?: number | null;
    currentWeightKg?: number | null;
    activityLevel?: string | null;
    fitnessGoal?: string | null;
  };
  onSuccess: () => void;
}

export default function ProfileBiometricsModal({
  isOpen,
  onClose,
  user,
  onSuccess,
}: ProfileBiometricsModalProps) {
  const [name, setName] = useState(user.name || "");
  const [age, setAge] = useState(user.age?.toString() || "");
  const [gender, setGender] = useState(user.gender || "male");
  const [heightCm, setHeightCm] = useState(user.heightCm?.toString() || "");
  const [currentWeightKg, setCurrentWeightKg] = useState(user.currentWeightKg?.toString() || "");
  const [activityLevel, setActivityLevel] = useState(user.activityLevel || "moderate");
  const [fitnessGoal, setFitnessGoal] = useState(user.fitnessGoal || "cut");
  const [recalculateTdee, setRecalculateTdee] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const payload = {
        name: name.trim() || undefined,
        age: age ? parseInt(age) : undefined,
        gender,
        heightCm: heightCm ? parseFloat(heightCm) : undefined,
        currentWeightKg: currentWeightKg ? parseFloat(currentWeightKg) : undefined,
        activityLevel,
        fitnessGoal,
        recalculateTdee,
      };

      const res = await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setSuccessMsg(
          recalculateTdee && json.data?.calculation
            ? `Profil diperbarui & TDEE dihitung ulang: ${json.data.calculation.dailyCalorieTarget} kcal/hari!`
            : "Data profil berhasil diperbarui!"
        );
        onSuccess();
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setError(json.error || "Gagal memperbarui profil");
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
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100/80 text-emerald-800 border border-emerald-200/60">
              <User className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-900">Edit Profil & Biometrik</h2>
              <p className="text-[11px] text-stone-500">Parameter fisik untuk kalkulasi kebutuhan energi</p>
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

        {/* Modal Body */}
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

          {/* Name Field */}
          <div>
            <label className="block font-semibold text-stone-700 mb-1">Nama Panggilan</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Rifaldi"
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600 transition text-xs"
            />
          </div>

          {/* Age & Gender */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1 flex items-center gap-1">
                <Calendar className="h-3 w-3 text-stone-400" /> Usia (tahun)
              </label>
              <input
                type="number"
                min="10"
                max="100"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="25"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600 transition text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Jenis Kelamin</label>
              <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                <button
                  type="button"
                  onClick={() => setGender("male")}
                  className={`py-2 rounded-xl font-bold border transition text-center text-xs ${
                    gender === "male"
                      ? "bg-emerald-800 text-white border-emerald-800 shadow-xs"
                      : "bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100"
                  }`}
                >
                  Pria
                </button>
                <button
                  type="button"
                  onClick={() => setGender("female")}
                  className={`py-2 rounded-xl font-bold border transition text-center text-xs ${
                    gender === "female"
                      ? "bg-emerald-800 text-white border-emerald-800 shadow-xs"
                      : "bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100"
                  }`}
                >
                  Wanita
                </button>
              </div>
            </div>
          </div>

          {/* Height & Weight */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1 flex items-center gap-1">
                <Ruler className="h-3 w-3 text-stone-400" /> Tinggi Badan (cm)
              </label>
              <input
                type="number"
                step="0.5"
                min="100"
                max="250"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                placeholder="170"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600 transition text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1 flex items-center gap-1">
                <Scale className="h-3 w-3 text-stone-400" /> Berat Badan (kg)
              </label>
              <input
                type="number"
                step="0.1"
                min="30"
                max="250"
                value={currentWeightKg}
                onChange={(e) => setCurrentWeightKg(e.target.value)}
                placeholder="70"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600 transition text-xs"
              />
            </div>
          </div>

          {/* Activity Level */}
          <div>
            <label className="block font-semibold text-stone-700 mb-1 flex items-center gap-1">
              <Activity className="h-3 w-3 text-stone-400" /> Tingkat Aktivitas Harian
            </label>
            <select
              value={activityLevel}
              onChange={(e) => setActivityLevel(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600 transition text-xs"
            >
              <option value="sedentary">Sedenter — Jarang bergerak / sebagian besar duduk</option>
              <option value="light">Ringan — Olahraga ringan 1-3 hari / minggu</option>
              <option value="moderate">Moderat — Olahraga sedang 3-5 hari / minggu</option>
              <option value="very_active">Aktif — Olahraga intensif 6-7 hari / minggu</option>
              <option value="extra_active">Sangat Aktif — Latihan berat 2x sehari / kerja fisik</option>
            </select>
          </div>

          {/* Fitness Goal */}
          <div>
            <label className="block font-semibold text-stone-700 mb-1 flex items-center gap-1">
              <Target className="h-3 w-3 text-stone-400" /> Target Kebugaran
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "cut", label: "CUT (Fat Loss)", desc: "Defisit Kalori" },
                { id: "maintain", label: "MAINTAIN", desc: "Rekomposisi" },
                { id: "bulk", label: "BULK (Gain)", desc: "Surplus Bersih" },
              ].map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setFitnessGoal(g.id)}
                  className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center ${
                    fitnessGoal === g.id
                      ? "bg-emerald-800 text-white border-emerald-800 shadow-xs"
                      : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100"
                  }`}
                >
                  <span className="font-bold text-[11px]">{g.label}</span>
                  <span className={`text-[9px] mt-0.5 ${fitnessGoal === g.id ? "text-emerald-200" : "text-stone-400"}`}>
                    {g.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* TDEE Auto-Recalculate Checkbox */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={recalculateTdee}
                onChange={(e) => setRecalculateTdee(e.target.checked)}
                className="mt-0.5 rounded border-stone-300 text-emerald-700 focus:ring-emerald-200 h-4 w-4"
              />
              <div className="text-[11px] leading-snug">
                <span className="font-bold text-emerald-950 flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                  Kalkulasi Ulang TDEE & Target Makronutrisi Otomatis
                </span>
                <p className="text-stone-600 mt-0.5 text-[10px]">
                  Menggunakan formula sains Mifflin-St Jeor atau Katch-McArdle (jika % lemak tubuh ada) untuk menentukan target kalori dan gramasi protein, karbohidrat, serta lemak baru.
                </p>
              </div>
            </label>
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
                  <span>Simpan Perubahan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
