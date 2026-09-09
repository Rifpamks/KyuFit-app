"use client";

import React, { useState } from "react";
import {
  ChevronLeft,
  Scale,
  Target,
  TrendingDown,
  TrendingUp,
  Plus,
  Calendar,
  Check,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface WeightLog {
  id: number;
  weightKg: number;
  timestamp: string;
}

interface WeightHistoryViewProps {
  currentWeightKg: number;
  targetWeightKg?: number | null;
  heightCm?: number | null;
  weightLogs: WeightLog[];
  onBack: () => void;
  onSuccess: () => void;
}

export default function WeightHistoryView({
  currentWeightKg,
  targetWeightKg,
  heightCm = 170,
  weightLogs,
  onBack,
  onSuccess,
}: WeightHistoryViewProps) {
  const [newWeight, setNewWeight] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // Group same-day logs, latest log per day
  const weightByDateMap: Record<string, { timestamp: Date; weightKg: number }> = {};
  for (const log of weightLogs) {
    const d = new Date(log.timestamp);
    const dateStr = d.toISOString().split("T")[0];
    if (
      !weightByDateMap[dateStr] ||
      new Date(log.timestamp).getTime() > new Date(weightByDateMap[dateStr].timestamp).getTime()
    ) {
      weightByDateMap[dateStr] = {
        timestamp: new Date(log.timestamp),
        weightKg: log.weightKg,
      };
    }
  }

  const sortedLogs = Object.values(weightByDateMap).sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
  );

  const chartData = sortedLogs.map((log) => ({
    date: log.timestamp.toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
    weight: log.weightKg,
  }));

  // Target diff
  const weightDiff = targetWeightKg ? (currentWeightKg - targetWeightKg).toFixed(1) : null;
  const isLossGoal = weightDiff && parseFloat(weightDiff) > 0;

  // BMI calculation
  const bmi = heightCm && heightCm > 0
    ? (currentWeightKg / Math.pow(heightCm / 100, 2)).toFixed(1)
    : null;

  const handleAddWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeight) return;

    setIsSubmitting(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/weight/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weightKg: parseFloat(newWeight) }),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Gagal mencatat berat badan");

      setNewWeight("");
      setSuccessMsg("Catatan timbangan berhasil ditambahkan!");
      setShowAddForm(false);
      onSuccess();
      setTimeout(() => setSuccessMsg(""), 2500);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
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
        <h1 className="text-base font-bold text-stone-900 tracking-tight">Riwayat Berat Badan</h1>
        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="h-10 w-10 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 shadow-2xs flex items-center justify-center transition active:scale-95"
          title="Tambah Timbangan"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2 font-medium">
          <Check className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Quick Add Form Inline if toggled */}
      {showAddForm && (
        <form onSubmit={handleAddWeight} className="bg-white rounded-3xl border border-stone-200/80 p-5 shadow-xs space-y-3 animate-in fade-in duration-150">
          <h3 className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
            <Scale className="h-4 w-4 text-emerald-700" />
            Catat Timbangan Hari Ini
          </h3>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.1"
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              placeholder="Berat (kg), misal 61.5"
              className="flex-1 bg-stone-50 border border-stone-200 rounded-2xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              required
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold px-4 py-2.5 rounded-2xl text-xs transition flex items-center gap-1.5 shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              <span>Simpan</span>
            </button>
          </div>
        </form>
      )}

      {/* Current Weight & Goals Card */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-5 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-stone-400 tracking-wider block">
              Berat Saat Ini
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-black text-stone-900 tracking-tight">{currentWeightKg}</span>
              <span className="text-xs font-bold text-stone-400">kg</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold uppercase text-stone-400 tracking-wider block">
              Target Berat
            </span>
            <div className="flex items-baseline gap-1 mt-0.5 justify-end">
              <span className="text-2xl font-black text-emerald-800 tracking-tight">
                {targetWeightKg || "-"}
              </span>
              <span className="text-xs font-bold text-stone-400">kg</span>
            </div>
          </div>
        </div>

        {/* BMI & Distance to Goal */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100 text-xs">
          <div className="p-2.5 bg-stone-50/80 rounded-2xl border border-stone-100 flex items-center gap-2">
            <Scale className="h-4 w-4 text-stone-400" />
            <div>
              <span className="text-[10px] text-stone-400 block font-semibold">BMI Saat Ini</span>
              <span className="font-bold text-stone-800">{bmi || "-"}</span>
            </div>
          </div>

          <div className="p-2.5 bg-emerald-50/70 rounded-2xl border border-emerald-100 flex items-center gap-2">
            {isLossGoal ? (
              <TrendingDown className="h-4 w-4 text-emerald-700" />
            ) : (
              <TrendingUp className="h-4 w-4 text-emerald-700" />
            )}
            <div>
              <span className="text-[10px] text-emerald-800 block font-semibold">Selisih Target</span>
              <span className="font-bold text-emerald-950">
                {weightDiff ? `${Math.abs(parseFloat(weightDiff))} kg lagi` : "-"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Trend Chart */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-5 shadow-xs space-y-2">
        <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
          Grafik Progres Timbangan
        </h3>

        {chartData.length > 1 ? (
          <div className="h-48 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#065F46" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#065F46" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#78716C" }} />
                <YAxis domain={["dataMin - 1", "dataMax + 1"]} tick={{ fontSize: 10, fill: "#78716C" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1C1917",
                    borderRadius: "12px",
                    color: "#FAFAF9",
                    fontSize: "11px",
                    border: "none",
                  }}
                  formatter={(val: any) => [`${val} kg`, "Berat"]}
                />
                <Area
                  type="monotone"
                  dataKey="weight"
                  stroke="#065F46"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#weightGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-stone-400">
            Belum cukup data riwayat untuk membuat kurva grafik (minimal 2 catatan).
          </div>
        )}
      </div>

      {/* Log History List */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-5 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
          Catatan Timbangan Terbaru
        </h3>

        <div className="divide-y divide-stone-100">
          {sortedLogs.length > 0 ? (
            [...sortedLogs].reverse().map((log, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-stone-400" />
                  <span className="font-semibold text-stone-700">
                    {log.timestamp.toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-stone-900">{log.weightKg} kg</span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-4 text-center text-xs text-stone-400">
              Belum ada riwayat timbangan yang tercatat.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
