"use client";

import { useEffect, useState } from "react";
import DateFilterBar, { DateFilterState } from "@/components/DateFilterBar";
import EnergyBalanceRing from "@/components/EnergyBalanceRing";
import BmiGauge from "@/components/BmiGauge";
import BodyCompositionCard from "@/components/BodyCompositionCard";
import {
  Flame,
  Apple,
  Scale,
  RefreshCw,
  Clock,
  TrendingUp,
  Activity,
  Check,
  AlertCircle,
  Dumbbell,
  LogOut,
  Calendar,
  X,
  Sparkles,
  User,
  Heart,
  ChevronRight,
  Info,
  Zap,
  Target
} from "lucide-react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from "recharts";

interface Meal {
  id: number;
  foodName: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
  timestamp: string;
}

interface Workout {
  id: number;
  activityName: string;
  durationMinutes: number;
  caloriesBurned: number;
  timestamp: string;
}

interface WeightLog {
  id: number;
  weightKg: number;
  timestamp: string;
}

interface DailySummary {
  user: {
    dailyCalorieTarget: number;
    targetProteinG: number;
    targetCarbsG: number;
    targetFatsG: number;
    fitnessGoal: string;
    email: string;
    whatsappNumber: string;
    currentWeightKg?: number | null;
    heightCm?: number | null;
    age?: number | null;
    gender?: string | null;
    activityLevel?: string | null;
    bodyFatPercent?: number | null;
    skeletalMuscleMassKg?: number | null;
    visceralFatLevel?: number | null;
    inbodyScore?: number | null;
  };
  meals: Meal[];
  workouts: Workout[];
  summary: {
    calories: number;
    proteinG: number;
    carbsG: number;
    fatsG: number;
    workoutCalories: number;
    daysInRange?: number;
    activeDaysCount?: number;
    mode?: string;
    dailyAverages?: {
      calories: number;
      proteinG: number;
      carbsG: number;
      fatsG: number;
      workoutCalories: number;
    };
    scaledTargets?: {
      calories: number;
      proteinG: number;
      carbsG: number;
      fatsG: number;
    };
  };
}

type MainTab = "today" | "progress" | "workout" | "tips" | "profile";

const getTodayString = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const localDate = new Date(now.getTime() - offset * 60 * 1000);
  return localDate.toISOString().split("T")[0];
};

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Active Navigation Tab State (5 Tabs)
  const [activeTab, setActiveTab] = useState<MainTab>("today");

  // Date State with Flexible Modes (Daily, Monthly, Yearly, Custom)
  const [dateFilter, setDateFilter] = useState<DateFilterState>({
    mode: "daily",
    date: getTodayString(),
    month: getTodayString().slice(0, 7),
    year: new Date().getFullYear().toString(),
    startDate: getTodayString(),
    endDate: getTodayString()
  });

  // Data States
  const [summaryData, setSummaryData] = useState<DailySummary | null>(null);
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [insightsData, setInsightsData] = useState<{
    projection: {
      targetWeightKg: number;
      currentWeightKg: number;
      weightDiffKg: number;
      avgDailyDeficitOrSurplus: number;
      estimatedDaysRemaining: number | null;
      estimatedTargetDate: string | null;
      paceCategory: string;
    };
    insights: {
      id: string;
      iconType: "flame" | "trophy" | "alert" | "pie" | "activity" | "scale";
      title: string;
      description: string;
      sentiment: "positive" | "neutral" | "warning";
    }[];
    mealSuggestions: {
      id: string;
      title: string;
      calories: number;
      proteinG: number;
      carbsG: number;
      fatsG: number;
      category: string;
      note: string;
    }[];
  } | null>(null);

  // Form States - Meal
  const [foodName, setFoodName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fats, setFats] = useState("");
  
  // Form States - Workout
  const [activityName, setActivityName] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [workoutCalories, setWorkoutCalories] = useState("");

  // Form States - Weight
  const [weightKg, setWeightKg] = useState("");

  // Submitting States
  const [isSubmittingMeal, setIsSubmittingMeal] = useState(false);
  const [isSubmittingWorkout, setIsSubmittingWorkout] = useState(false);
  const [isSubmittingWeight, setIsSubmittingWeight] = useState(false);

  // Success Indicators
  const [showMealSuccess, setShowMealSuccess] = useState(false);
  const [showWorkoutSuccess, setShowWorkoutSuccess] = useState(false);
  const [showWeightSuccess, setShowWeightSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchData();
    }
  }, [dateFilter, mounted]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      let queryUrl = "/api/logs/daily?";
      if (dateFilter.mode === "daily") {
        queryUrl += `date=${dateFilter.date}`;
      } else if (dateFilter.mode === "monthly") {
        queryUrl += `month=${dateFilter.month}`;
      } else if (dateFilter.mode === "yearly") {
        queryUrl += `year=${dateFilter.year}`;
      } else if (dateFilter.mode === "custom") {
        queryUrl += `startDate=${dateFilter.startDate}&endDate=${dateFilter.endDate}`;
      }

      // Fetch User & Daily Log for selected date/mode
      const dailyRes = await fetch(queryUrl);
      const dailyJson = await dailyRes.json();
      if (!dailyJson.success) {
        throw new Error(dailyJson.error || "Gagal mengambil data catatan harian");
      }
      setSummaryData(dailyJson.data);

      // Fetch Weight History for selected date range
      const weightUrl = queryUrl.replace("/api/logs/daily?", "/api/weight/history?");
      const weightRes = await fetch(weightUrl);
      const weightJson = await weightRes.json();
      if (!weightJson.success) {
        throw new Error(weightJson.error || "Gagal mengambil riwayat timbangan");
      }
      setWeightLogs(weightJson.data);

      // Fetch User Insights & Target Projection for selected date range
      const insightsUrl = queryUrl.replace("/api/logs/daily?", "/api/user/insights?");
      const insightsRes = await fetch(insightsUrl);
      const insightsJson = await insightsRes.json();
      if (insightsJson.success) {
        setInsightsData(insightsJson);
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat memuat data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName || !calories) return;

    try {
      setIsSubmittingMeal(true);
      const res = await fetch("/api/logs/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          foodName,
          calories: parseFloat(calories),
          proteinG: protein ? parseFloat(protein) : 0,
          carbsG: carbs ? parseFloat(carbs) : 0,
          fatsG: fats ? parseFloat(fats) : 0,
          date: dateFilter.date
        }),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      setFoodName("");
      setCalories("");
      setProtein("");
      setCarbs("");
      setFats("");

      setShowMealSuccess(true);
      setTimeout(() => setShowMealSuccess(false), 3000);
      
      fetchData();
    } catch (err: any) {
      alert("Gagal menambahkan makanan: " + err.message);
    } finally {
      setIsSubmittingMeal(false);
    }
  };

  const handleAddWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityName || !durationMinutes || !workoutCalories) return;

    try {
      setIsSubmittingWorkout(true);
      const res = await fetch("/api/workout/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activityName,
          durationMinutes: parseInt(durationMinutes),
          caloriesBurned: parseFloat(workoutCalories),
          date: dateFilter.date
        }),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      setActivityName("");
      setDurationMinutes("");
      setWorkoutCalories("");

      setShowWorkoutSuccess(true);
      setTimeout(() => setShowWorkoutSuccess(false), 3000);

      fetchData();
    } catch (err: any) {
      alert("Gagal menambahkan olahraga: " + err.message);
    } finally {
      setIsSubmittingWorkout(false);
    }
  };

  const handleEstimateCalories = () => {
    const mins = parseFloat(durationMinutes);
    if (!mins || mins <= 0) return;
    const lower = activityName.toLowerCase();
    let rate = 6.5;
    if (lower.includes("beban") || lower.includes("gym") || lower.includes("angkat") || lower.includes("weight") || lower.includes("dumbbell")) {
      rate = 6.0;
    } else if (lower.includes("lari") || lower.includes("run") || lower.includes("treadmill")) {
      rate = 9.5;
    } else if (lower.includes("sepeda") || lower.includes("bike") || lower.includes("cycle")) {
      rate = 7.2;
    } else if (lower.includes("jalan") || lower.includes("walk")) {
      rate = 4.0;
    } else if (lower.includes("hiit") || lower.includes("boxing") || lower.includes("tabata")) {
      rate = 10.0;
    }
    setWorkoutCalories(Math.round(mins * rate).toString());
  };

  const handleSelectWorkoutPreset = (preset: { name: string; duration: string; cal: string }) => {
    setActivityName(preset.name);
    setDurationMinutes(preset.duration);
    setWorkoutCalories(preset.cal);
  };

  const handleAddWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weightKg) return;

    try {
      setIsSubmittingWeight(true);
      const res = await fetch("/api/weight/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weightKg: parseFloat(weightKg),
        }),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      setWeightKg("");
      setShowWeightSuccess(true);
      setTimeout(() => setShowWeightSuccess(false), 3000);

      fetchData();
    } catch (err: any) {
      alert("Gagal mencatat berat badan: " + err.message);
    } finally {
      setIsSubmittingWeight(false);
    }
  };

  const handleDeleteMeal = async (id: number) => {
    try {
      const res = await fetch(`/api/logs/delete?id=${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      fetchData();
    } catch (err: any) {
      alert("Gagal menghapus log makanan: " + err.message);
    }
  };

  const handleDeleteWorkout = async (id: number) => {
    try {
      const res = await fetch(`/api/workout/delete?id=${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      fetchData();
    } catch (err: any) {
      alert("Gagal menghapus log olahraga: " + err.message);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    } catch (err) {
      alert("Gagal melakukan logout.");
    }
  };

  const getDaysList = () => {
    const days = [];
    const today = new Date();
    for (let i = 4; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      days.push(d);
    }
    return days;
  };

  if (!mounted) return null;

  const user = summaryData?.user || {
    dailyCalorieTarget: 1779,
    targetProteinG: 98,
    targetCarbsG: 237,
    targetFatsG: 49,
    fitnessGoal: "Cut",
    email: "rifaldiadi88@gmail.com",
    whatsappNumber: "085693553908",
    currentWeightKg: 68.5,
    heightCm: 170
  };

  const daysInRange = summaryData?.summary.daysInRange || 1;
  const isMultiDay = dateFilter.mode !== "daily" && daysInRange > 1;
  const activeDaysCount = summaryData?.summary.activeDaysCount ?? (isMultiDay ? 1 : 1);

  const consumedCalories = summaryData?.summary.calories || 0;
  const burnedCalories = summaryData?.summary.workoutCalories || 0;
  const targetCalories = user.dailyCalorieTarget;
  
  const dailyAvg = summaryData?.summary.dailyAverages || {
    calories: Math.round(consumedCalories / (activeDaysCount || 1)),
    proteinG: Math.round((summaryData?.summary.proteinG || 0) / (activeDaysCount || 1)),
    carbsG: Math.round((summaryData?.summary.carbsG || 0) / (activeDaysCount || 1)),
    fatsG: Math.round((summaryData?.summary.fatsG || 0) / (activeDaysCount || 1)),
    workoutCalories: Math.round(burnedCalories / (activeDaysCount || 1)),
  };

  const scaledTargets = summaryData?.summary.scaledTargets || {
    calories: user.dailyCalorieTarget * daysInRange,
    proteinG: user.targetProteinG * daysInRange,
    carbsG: user.targetCarbsG * daysInRange,
    fatsG: user.targetFatsG * daysInRange,
  };

  // For multi-day mode, evaluate percentages & remaining calories using daily averages
  const activeCalories = isMultiDay ? dailyAvg.calories : consumedCalories;
  const activeBurned = isMultiDay ? dailyAvg.workoutCalories : burnedCalories;
  const activeTarget = targetCalories;

  const remainingCalories = activeTarget - activeCalories + activeBurned;
  const isOverBudget = remainingCalories < 0;
  const displayRemaining = Math.abs(remainingCalories);
  const caloriePercent = Math.min(100, Math.round((activeCalories / activeTarget) * 100));

  const consumedProtein = summaryData?.summary.proteinG || 0;
  const consumedCarbs = summaryData?.summary.carbsG || 0;
  const consumedFats = summaryData?.summary.fatsG || 0;

  const activeProtein = isMultiDay ? dailyAvg.proteinG : consumedProtein;
  const activeCarbs = isMultiDay ? dailyAvg.carbsG : consumedCarbs;
  const activeFats = isMultiDay ? dailyAvg.fatsG : consumedFats;

  const latestWeight = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].weightKg : null;

  // Group same-day weight logs (keep latest per day) and sort chronologically
  const weightByDateMap: Record<string, { timestamp: Date; weightKg: number }> = {};
  for (const log of weightLogs) {
    const d = new Date(log.timestamp);
    const dateStr = d.toISOString().split("T")[0];
    if (!weightByDateMap[dateStr] || new Date(log.timestamp).getTime() > new Date(weightByDateMap[dateStr].timestamp).getTime()) {
      weightByDateMap[dateStr] = {
        timestamp: new Date(log.timestamp),
        weightKg: log.weightKg
      };
    }
  }

  const sortedWeightLogs = Object.values(weightByDateMap).sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
  );

  const chartData = sortedWeightLogs.map((log) => ({
    date: log.timestamp.toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
    weight: log.weightKg,
  }));

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans antialiased pb-24">
      
      {/* Centered Mobile Wrapper Container (576px max width) */}
      <div className="mx-auto max-w-xl px-4 pt-5 space-y-4">
        
        {/* App Header */}
        <header className="flex items-center justify-between bg-white px-5 py-3.5 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-orange-500 flex items-center justify-center text-white text-lg font-black shadow-sm">
              🐱
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold text-stone-900 tracking-tight">KyuFit</span>
                <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                  v2.0
                </span>
              </div>
              <p className="text-[11px] text-stone-500 font-medium">Asisten Nutrisi WhatsApp</p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab("profile")}
            className="flex items-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-700 px-3 py-1.5 rounded-xl text-xs font-semibold transition"
          >
            <User className="h-4 w-4 text-orange-500" />
            <span className="hidden sm:inline">Profil</span>
          </button>
        </header>

        {/* Global Error Banner */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 flex items-start gap-3 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Kendala Sistem: </span>
              {error}
              <button 
                onClick={fetchData} 
                className="block mt-1 font-bold underline hover:text-red-900"
              >
                Coba Muat Ulang
              </button>
            </div>
          </div>
        )}

        {/* TAB 1: TODAY (Dashboard & Log Makanan) */}
        {activeTab === "today" && (
          <main className="space-y-4">
            
            {/* Filter Date Bar for Today Menu */}
            <DateFilterBar filter={dateFilter} onChange={setDateFilter} />

            {/* Dynamic Concentric Dual-Arc Energy Balance Ring */}
            <EnergyBalanceRing
              targetCalories={activeTarget}
              consumedCalories={activeCalories}
              burnedCalories={activeBurned}
              isMultiDay={isMultiDay}
              daysInRange={daysInRange}
              activeDaysCount={activeDaysCount}
              totalConsumedCalories={consumedCalories}
              fitnessGoal={user.fitnessGoal}
            />

            {/* WhatsApp Bot Gateway Live Card */}
            <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-white rounded-2xl border border-emerald-200/80 p-4 shadow-xs">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white text-xl shadow-xs shrink-0">
                    🐱
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-stone-900">KyuBot WhatsApp Assistant</span>
                      <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Aktif 24/7
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-600 mt-0.5">
                      Kirim foto makanan ke <strong>KyuBot</strong> via WhatsApp untuk analisis nutrisi & pencatatan kalori otomatis!
                    </p>
                  </div>
                </div>
                <a
                  href={`https://wa.me/${(process.env.NEXT_PUBLIC_BOT_WHATSAPP_NUMBER || '6285139362618').replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Halo Kyu! 🐱')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition shadow-xs flex items-center gap-1"
                >
                  <span>Chat KyuBot</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            {/* Kalg.ai Style Macro Breakdown (4 Pill Cards) */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs uppercase font-bold text-stone-400 tracking-wider">Rincian Makronutrisi</h3>
                {isMultiDay && (
                  <span className="text-[10px] font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                    {activeDaysCount > 0 ? `Rata-rata (${activeDaysCount} hari aktif)` : 'Belum ada data'}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                
                {/* Protein */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 border border-stone-100">
                  <div className="h-9 w-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm shrink-0">
                    💪
                  </div>
                  <div>
                    <div className="text-xs font-bold text-stone-900">{activeProtein} / {user.targetProteinG}g</div>
                    <div className="text-[10px] font-medium text-stone-400">
                      {isMultiDay ? `Protein (${activeProtein}g/hr • Total ${consumedProtein}g)` : "Protein"}
                    </div>
                  </div>
                </div>

                {/* Karbohidrat */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 border border-stone-100">
                  <div className="h-9 w-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-sm shrink-0">
                    🌾
                  </div>
                  <div>
                    <div className="text-xs font-bold text-stone-900">{activeCarbs} / {user.targetCarbsG}g</div>
                    <div className="text-[10px] font-medium text-stone-400">
                      {isMultiDay ? `Karbo (${activeCarbs}g/hr • Total ${consumedCarbs}g)` : "Karbohidrat"}
                    </div>
                  </div>
                </div>

                {/* Lemak */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 border border-stone-100">
                  <div className="h-9 w-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold text-sm shrink-0">
                    🥑
                  </div>
                  <div>
                    <div className="text-xs font-bold text-stone-900">{activeFats} / {user.targetFatsG}g</div>
                    <div className="text-[10px] font-medium text-stone-400">
                      {isMultiDay ? `Lemak (${activeFats}g/hr • Total ${consumedFats}g)` : "Lemak"}
                    </div>
                  </div>
                </div>

                {/* Energi Total */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 border border-stone-100">
                  <div className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-sm shrink-0">
                    ⚡
                  </div>
                  <div>
                    <div className="text-xs font-bold text-stone-900">{activeProtein * 4 + activeCarbs * 4 + activeFats * 9} kcal</div>
                    <div className="text-[10px] font-medium text-stone-400">{isMultiDay ? `Avg Makro (${activeDaysCount} hr)` : "Total Makro"}</div>
                  </div>
                </div>

              </div>
            </div>

            {/* Form Input Catat Makanan */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
              <h3 className="text-xs uppercase font-bold text-stone-400 tracking-wider mb-3 flex items-center gap-1.5">
                <Apple className="h-4 w-4 text-orange-500" />
                Catat Makanan Harian
              </h3>
              
              <form onSubmit={handleAddMeal} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">Nama Makanan</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dada Ayam Bakar + Nasi Merah"
                    value={foodName}
                    onChange={(e) => setFoodName(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">Kalori (kcal)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 450"
                      value={calories}
                      onChange={(e) => setCalories(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">Protein (g)</label>
                    <input
                      type="number"
                      placeholder="e.g. 35"
                      value={protein}
                      onChange={(e) => setProtein(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">Karbo (g)</label>
                    <input
                      type="number"
                      placeholder="e.g. 40"
                      value={carbs}
                      onChange={(e) => setCarbs(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">Lemak (g)</label>
                    <input
                      type="number"
                      placeholder="e.g. 8"
                      value={fats}
                      onChange={(e) => setFats(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingMeal}
                  className="w-full mt-2 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  {isSubmittingMeal ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : showMealSuccess ? (
                    <>
                      <Check className="h-4 w-4" />
                      Berhasil Dicatat!
                    </>
                  ) : (
                    "Tambah Makanan"
                  )}
                </button>
              </form>
            </div>

            {/* List Catatan Makanan Harian */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3 border-b border-stone-100 pb-2">
                <h3 className="text-xs uppercase font-bold text-stone-400 tracking-wider">
                  Catatan Makanan ({summaryData?.meals.length || 0})
                </h3>
                <span className="text-[10px] text-stone-400 font-medium">WhatsApp / Web</span>
              </div>

              {summaryData?.meals && summaryData.meals.length > 0 ? (
                <div className="space-y-2.5">
                  {summaryData.meals.map((meal) => {
                    const time = new Date(meal.timestamp).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit"
                    });
                    return (
                      <div 
                        key={meal.id} 
                        className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 flex flex-col justify-between"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-xs font-bold text-stone-900">
                              {meal.foodName}
                            </div>
                            <div className="text-[10px] text-stone-400 flex items-center gap-1 mt-0.5">
                              <Clock className="h-3 w-3" /> {time} WIB
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold text-orange-600">
                              {meal.calories} <span className="text-[10px] text-stone-400 font-medium">kcal</span>
                            </span>
                            <button
                              onClick={() => handleDeleteMeal(meal.id)}
                              title="Hapus log makanan"
                              className="p-1 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="mt-2 pt-2 border-t border-stone-200/60 flex gap-3 text-[10px] text-stone-500 font-medium">
                          <span>P: {meal.proteinG}g</span>
                          <span>K: {meal.carbsG}g</span>
                          <span>L: {meal.fatsG}g</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-stone-400">
                  <div className="text-2xl mb-1">🍽️</div>
                  <p className="text-xs font-semibold text-stone-600">Belum ada makanan pada tanggal ini</p>
                  <p className="text-[11px] text-stone-400 mt-0.5">Kirim foto makanan ke WhatsApp atau gunakan form di atas!</p>
                </div>
              )}
            </div>

          </main>
        )}

        {/* TAB 2: PROGRESS (Grafik Berat Badan & Target Projection) */}
        {activeTab === "progress" && (
          <main className="space-y-4">
            
            {/* Quick Weight Input Form */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-3">
              <h3 className="text-xs uppercase font-bold text-stone-400 tracking-wider flex items-center gap-1.5">
                <Scale className="h-4 w-4 text-orange-500" />
                Catat Penimbangan Berat Badan
              </h3>
              <form onSubmit={handleAddWeight} className="flex gap-2">
                <input
                  type="number"
                  step="0.1"
                  required
                  placeholder="Berat (kg e.g. 68.5)"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
                />
                <button
                  type="submit"
                  disabled={isSubmittingWeight}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded-xl text-xs transition flex items-center justify-center shrink-0 shadow-sm"
                >
                  {isSubmittingWeight ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : showWeightSuccess ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    "Timbang"
                  )}
                </button>
              </form>
              {latestWeight && (
                <div className="text-[11px] text-stone-400 font-medium">
                  Timbangan Terakhir: <span className="font-bold text-stone-800">{latestWeight} kg</span>
                </div>
              )}
            </div>

            {/* Body Composition Card */}
            <BodyCompositionCard user={user} onSuccess={fetchData} />

            {/* Weight Quick Stats Bar */}
            {sortedWeightLogs.length > 0 && (
              <div className="grid grid-cols-3 gap-2 text-center bg-white rounded-2xl border border-stone-200 p-3 shadow-xs">
                <div className="p-1">
                  <div className="text-[10px] uppercase font-bold text-stone-400">Awal Periode</div>
                  <div className="text-sm font-black text-stone-800 mt-0.5">
                    {sortedWeightLogs[0].weightKg} <span className="text-[10px] font-normal text-stone-400">kg</span>
                  </div>
                </div>
                <div className="p-1 border-x border-stone-100">
                  <div className="text-[10px] uppercase font-bold text-stone-400">Terakhir</div>
                  <div className="text-sm font-black text-orange-600 mt-0.5">
                    {latestWeight || user.currentWeightKg} <span className="text-[10px] font-normal text-stone-400">kg</span>
                  </div>
                </div>
                <div className="p-1">
                  <div className="text-[10px] uppercase font-bold text-stone-400">Perubahan</div>
                  {sortedWeightLogs.length >= 2 ? (
                    (() => {
                      const delta = Number(((latestWeight || sortedWeightLogs[sortedWeightLogs.length - 1].weightKg) - sortedWeightLogs[0].weightKg).toFixed(1));
                      const isMinus = delta < 0;
                      return (
                        <div className={`text-sm font-black mt-0.5 ${isMinus ? 'text-emerald-600' : delta === 0 ? 'text-stone-700' : 'text-amber-600'}`}>
                          {delta > 0 ? `+${delta}` : delta} <span className="text-[10px] font-normal text-stone-400">kg</span>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="text-xs text-stone-400 mt-1 font-semibold">-</div>
                  )}
                </div>
              </div>
            )}

            {/* Weight Progress Chart (Recharts Enhanced) */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs uppercase font-bold text-stone-400 tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4 text-orange-500" />
                    Grafik Tren Berat Badan
                  </h3>
                  <p className="text-[11px] text-stone-400 mt-0.5 font-medium">
                    Periode: {dateFilter.mode === "monthly" ? `Bulan ${dateFilter.month}` : dateFilter.mode === "yearly" ? `Tahun ${dateFilter.year}` : dateFilter.mode === "custom" ? `${dateFilter.startDate} s/d ${dateFilter.endDate}` : "30 Hari Terdekat"}
                  </p>
                </div>
                <button
                  onClick={fetchData}
                  className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="h-64 w-full bg-stone-50 rounded-xl border border-stone-100 p-2">
                {mounted && chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 12, right: 12, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="weightAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
                      <XAxis 
                        dataKey="date" 
                        stroke="#a8a29e" 
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        stroke="#a8a29e" 
                        fontSize={10} 
                        domain={["dataMin - 1", "dataMax + 1"]}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          borderColor: "#e7e5e4",
                          borderRadius: "12px",
                          color: "#1c1917",
                          fontSize: "12px",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)"
                        }}
                        labelClassName="font-bold text-stone-500 mb-1"
                        formatter={(value: any) => [`${value} kg`, "Berat"]}
                      />
                      {insightsData?.projection?.targetWeightKg && (
                        <ReferenceLine
                          y={insightsData.projection.targetWeightKg}
                          stroke="#10b981"
                          strokeDasharray="4 4"
                          strokeWidth={1.5}
                          label={{
                            value: `Target: ${insightsData.projection.targetWeightKg}kg`,
                            position: "insideTopRight",
                            fill: "#059669",
                            fontSize: 10,
                            fontWeight: "bold"
                          }}
                        />
                      )}
                      <Area
                        type="monotone"
                        dataKey="weight"
                        stroke="#f97316"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#weightAreaGrad)"
                        dot={{ r: 4, stroke: "#ffffff", strokeWidth: 2, fill: "#f97316" }}
                        activeDot={{ r: 6, stroke: "#ffffff", strokeWidth: 2, fill: "#f97316" }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-stone-400 text-xs">
                    <Scale className="h-8 w-8 text-stone-300 mb-2" />
                    <p className="font-semibold text-stone-600">Belum ada history berat badan</p>
                    <p className="text-[10px] text-stone-400 mt-0.5">Catat timbangan pertama Anda di atas!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Interactive BMI Gauge Component */}
            <BmiGauge
              weightKg={latestWeight || user.currentWeightKg || 0}
              heightCm={user.heightCm || 170}
            />

          </main>
        )}

        {/* TAB 3: WORKOUT (Catatan Olahraga & Latihan) */}
        {activeTab === "workout" && (
          <main className="space-y-4">
            
            {/* Workout Summary Box */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="text-xs uppercase font-bold text-stone-400 tracking-wider">Kalori Terbakar Hari Ini</h3>
                <div className="text-2xl font-black text-green-600 mt-0.5">
                  -{burnedCalories} <span className="text-xs font-normal text-stone-500">kcal</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center text-green-600 text-xl font-black">
                🏋️
              </div>
            </div>

            {/* Form Catat Olahraga */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-3">
              <h3 className="text-xs uppercase font-bold text-stone-400 tracking-wider flex items-center gap-1.5">
                <Dumbbell className="h-4 w-4 text-green-600" />
                Catat Aktivitas Latihan
              </h3>

              {/* Quick Workout Presets Strip */}
              <div>
                <div className="text-[11px] font-semibold text-stone-500 mb-1.5 flex items-center justify-between">
                  <span>Preset Latihan Cepat:</span>
                  <span className="text-[10px] text-stone-400">Klik untuk isi otomatis</span>
                </div>
                <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {[
                    { label: "🏋️ Gym / Beban", name: "Latihan Beban (Gym Push/Pull)", duration: "60", cal: "360" },
                    { label: "🏃 Treadmill", name: "Lari Treadmill / Jogging", duration: "30", cal: "280" },
                    { label: "🚴 Sepeda", name: "Sepeda Statis / Spinning", duration: "45", cal: "320" },
                    { label: "🥊 HIIT", name: "Kardio HIIT & Sirkuit", duration: "25", cal: "250" },
                    { label: "🚶 Jalan Kaki", name: "Jalan Cepat / Brisk Walk", duration: "40", cal: "160" }
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handleSelectWorkoutPreset(preset)}
                      className="shrink-0 bg-stone-100 hover:bg-green-50 hover:text-green-700 hover:border-green-300 border border-stone-200 text-stone-700 px-2.5 py-1 rounded-xl text-[11px] font-semibold transition"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <form onSubmit={handleAddWorkout} className="space-y-3 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">Jenis Olahraga / Aktivitas</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lari Treadmill, Angkat Beban, Sepeda"
                    value={activityName}
                    onChange={(e) => setActivityName(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">Durasi (Menit)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 45"
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-semibold text-stone-600">Kalori (kcal)</label>
                      {durationMinutes && activityName && (
                        <button
                          type="button"
                          onClick={handleEstimateCalories}
                          className="text-[10px] text-green-700 hover:text-green-800 font-bold bg-green-50 hover:bg-green-100 px-1.5 py-0.5 rounded transition"
                        >
                          ⚡ Estimasi
                        </button>
                      )}
                    </div>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 320"
                      value={workoutCalories}
                      onChange={(e) => setWorkoutCalories(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingWorkout}
                  className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  {isSubmittingWorkout ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : showWorkoutSuccess ? (
                    <>
                      <Check className="h-4 w-4" />
                      Berhasil Dicatat!
                    </>
                  ) : (
                    "Tambah Olahraga"
                  )}
                </button>
              </form>
            </div>

            {/* List Log Olahraga */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
              <h3 className="text-xs uppercase font-bold text-stone-400 tracking-wider mb-3 border-b border-stone-100 pb-2">
                Riwayat Olahraga ({summaryData?.workouts.length || 0})
              </h3>

              {summaryData?.workouts && summaryData.workouts.length > 0 ? (
                <div className="space-y-2.5">
                  {summaryData.workouts.map((workout) => {
                    const time = new Date(workout.timestamp).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit"
                    });
                    const isStrength = /beban|gym|angkat|weight|push|pull|squat|bench|deadlift|dumbbell/i.test(workout.activityName);
                    return (
                      <div 
                        key={workout.id} 
                        className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 flex justify-between items-center"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-stone-900">{workout.activityName}</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${
                              isStrength ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}>
                              {isStrength ? '🏋️ Beban' : '🏃 Kardio'}
                            </span>
                          </div>
                          <div className="text-[10px] text-stone-400 flex items-center gap-1 mt-0.5">
                            <Clock className="h-3 w-3" /> {time} WIB • {workout.durationMinutes} menit
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-green-600">
                            -{workout.caloriesBurned} kcal
                          </span>
                          <button
                            onClick={() => handleDeleteWorkout(workout.id)}
                            title="Hapus log olahraga"
                            className="p-1 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-stone-400">
                  <div className="text-2xl mb-1">🏃</div>
                  <p className="text-xs font-semibold text-stone-600">Belum ada aktivitas olahraga hari ini</p>
                  <p className="text-[11px] text-stone-400 mt-0.5">Pilih preset di atas atau catat latihan untuk membakar kalori!</p>
                </div>
              )}
            </div>

            {/* Program Latihan Preview Banner */}
            <div className="bg-orange-50 rounded-2xl border border-orange-200 p-4 text-orange-900 text-xs flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-orange-500 shrink-0" />
              <div>
                <span className="font-bold">KyuFit Training Programs (Coming Soon): </span>
                Fitur otomatis penyedia rekomendasi program latihan beban & cardio yang dipersonalisasi!
              </div>
            </div>

          </main>
        )}

        {/* TAB 4: AI TIPS (Dynamic Deep AI Health Analysis) */}
        {activeTab === "tips" && (
          <main className="space-y-4">

            {/* Target Projection Summary Card */}
            {insightsData?.projection && (
              <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl p-5 text-white shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-amber-200 animate-pulse" />
                    <h3 className="text-xs uppercase font-bold tracking-wider text-orange-100">
                      Analisa Proyeksi AI KyuFit
                    </h3>
                  </div>
                  <span className="text-[10px] bg-white/20 px-2.5 py-0.5 rounded-full font-extrabold uppercase">
                    Pace: {insightsData.projection.paceCategory}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs">
                    <div className="text-[10px] text-orange-100 font-semibold">Berat Badan Sekarang</div>
                    <div className="text-xl font-black mt-0.5">{insightsData.projection.currentWeightKg} <span className="text-xs font-normal">kg</span></div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs">
                    <div className="text-[10px] text-orange-100 font-semibold">Target Berat Badan</div>
                    <div className="text-xl font-black mt-0.5">{insightsData.projection.targetWeightKg} <span className="text-xs font-normal">kg</span></div>
                  </div>
                </div>

                {insightsData.projection.estimatedTargetDate && (
                  <div className="text-xs text-orange-100 flex items-center gap-1.5 pt-1">
                    <Calendar className="h-4 w-4 text-amber-200" />
                    <span>Estimasi mencapai target: <strong>{insightsData.projection.estimatedTargetDate}</strong> ({insightsData.projection.estimatedDaysRemaining} hari lagi)</span>
                  </div>
                )}
              </div>
            )}

            {/* Weekly Deep AI Health Insights */}
            {insightsData && (
              <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <h3 className="text-xs uppercase font-bold text-stone-400 tracking-wider flex items-center gap-1.5">
                    <Activity className="h-4 w-4 text-orange-500" />
                    Dynamic Multi-Metric Insights (Meal + Workout + Weight)
                  </h3>
                  <span className="text-[10px] text-stone-400">Analisa Real-Time</span>
                </div>

                <div className="space-y-2.5">
                  {insightsData.insights.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 text-xs p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 transition hover:border-orange-200">
                      <span className="mt-0.5 shrink-0 text-base">
                        {item.sentiment === "positive" ? "🟢" : item.sentiment === "warning" ? "🔴" : "🟡"}
                      </span>
                      <div>
                        <div className="font-bold text-stone-900 text-xs">{item.title}</div>
                        <div className="text-stone-600 mt-0.5 leading-relaxed">{item.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rekomendasi Menu Sisa Kalori */}
            {insightsData && (
              <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-3">
                <h3 className="text-xs uppercase font-bold text-stone-400 tracking-wider flex items-center gap-1.5">
                  <Apple className="h-4 w-4 text-orange-500" />
                  Rekomendasi Makanan Pasca-Workout & Makro
                </h3>

                <div className="space-y-2.5">
                  {insightsData.mealSuggestions.map((meal) => (
                    <div key={meal.id} className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 text-xs">
                      <div className="flex justify-between font-bold text-stone-900">
                        <span>{meal.title}</span>
                        <span className="text-orange-600 font-extrabold">{meal.calories} kcal</span>
                      </div>
                      <div className="text-[11px] text-stone-600 mt-1">
                        P: {meal.proteinG}g | K: {meal.carbsG}g | L: {meal.fatsG}g — <span className="text-stone-500 italic">{meal.note}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Metodologi Sains & FAQ */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-3">
              <h3 className="text-xs uppercase font-bold text-stone-400 tracking-wider flex items-center gap-1.5">
                <Info className="h-4 w-4 text-stone-400" />
                Metodologi Berbasis Sains KyuFit
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                KyuFit menggunakan formula **Mifflin-St Jeor** untuk menghitung RMR dan TDEE secara tepat. Target defisit kalori diatur aman berkisar 15-20% dari TDEE agar penurunan berat badan berkelanjutan tanpa mengorbankan massa otot.
              </p>
            </div>

          </main>
        )}

        {/* TAB 5: PROFILE (Setting & Profil User) */}
        {activeTab === "profile" && (
          <main className="space-y-4">
            
            {/* Profile Header Box */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm text-center space-y-2">
              <div className="h-16 w-16 rounded-full bg-orange-100 border-2 border-orange-500 mx-auto flex items-center justify-center text-3xl shadow-sm">
                🐱
              </div>
              <div>
                <h2 className="text-base font-bold text-stone-900">{user.email.split("@")[0]}</h2>
                <div className="text-xs text-stone-500 font-medium">WhatsApp: +{user.whatsappNumber}</div>
              </div>
              <div className="inline-block bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold px-3 py-1 rounded-full mt-1">
                Goal: {user.fitnessGoal} ({user.dailyCalorieTarget} kcal/hari)
              </div>
            </div>

            {/* Target Nutrisi & Breakdown */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-3">
              <h3 className="text-xs uppercase font-bold text-stone-400 tracking-wider">Target Nutrisi Harian Anda</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-2 border-b border-stone-100">
                  <span className="text-stone-600 font-medium">Target Kalori:</span>
                  <span className="font-bold text-stone-900">{user.dailyCalorieTarget} kcal</span>
                </div>
                <div className="flex justify-between py-2 border-b border-stone-100">
                  <span className="text-stone-600 font-medium">Target Protein:</span>
                  <span className="font-bold text-orange-600">{user.targetProteinG} g</span>
                </div>
                <div className="flex justify-between py-2 border-b border-stone-100">
                  <span className="text-stone-600 font-medium">Target Karbohidrat:</span>
                  <span className="font-bold text-purple-600">{user.targetCarbsG} g</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-stone-600 font-medium">Target Lemak:</span>
                  <span className="font-bold text-amber-600">{user.targetFatsG} g</span>
                </div>
              </div>
            </div>

            {/* Body Composition Management Card in Profile */}
            <BodyCompositionCard user={user} onSuccess={fetchData} />

            {/* Quick Actions & Logout */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-2">
              <button
                onClick={handleLogout}
                className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3 rounded-xl text-xs transition flex items-center justify-center gap-2 border border-red-100"
              >
                <LogOut className="h-4 w-4" />
                <span>Keluar (Logout)</span>
              </button>
            </div>

          </main>
        )}

      </div>

      {/* FIXED BOTTOM NAVIGATION BAR (5 Tabs) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 border-t border-stone-200 backdrop-blur-sm shadow-lg">
        <div className="mx-auto max-w-xl grid grid-cols-5 py-2 px-1 text-center">
          
          {/* Tab 1: Today */}
          <button
            onClick={() => setActiveTab("today")}
            className={`flex flex-col items-center justify-center py-1 transition ${
              activeTab === "today" ? "text-orange-500 font-bold" : "text-stone-400 hover:text-stone-600"
            }`}
          >
            <Calendar className="h-5 w-5 mb-0.5" />
            <span className="text-[10px]">Today</span>
          </button>

          {/* Tab 2: Progress */}
          <button
            onClick={() => setActiveTab("progress")}
            className={`flex flex-col items-center justify-center py-1 transition ${
              activeTab === "progress" ? "text-orange-500 font-bold" : "text-stone-400 hover:text-stone-600"
            }`}
          >
            <TrendingUp className="h-5 w-5 mb-0.5" />
            <span className="text-[10px]">Progress</span>
          </button>

          {/* Tab 3: Workout */}
          <button
            onClick={() => setActiveTab("workout")}
            className={`flex flex-col items-center justify-center py-1 transition ${
              activeTab === "workout" ? "text-orange-500 font-bold" : "text-stone-400 hover:text-stone-600"
            }`}
          >
            <Dumbbell className="h-5 w-5 mb-0.5" />
            <span className="text-[10px]">Workout</span>
          </button>

          {/* Tab 4: AI Tips */}
          <button
            onClick={() => setActiveTab("tips")}
            className={`flex flex-col items-center justify-center py-1 transition ${
              activeTab === "tips" ? "text-orange-500 font-bold" : "text-stone-400 hover:text-stone-600"
            }`}
          >
            <Sparkles className="h-5 w-5 mb-0.5" />
            <span className="text-[10px]">AI Tips</span>
          </button>

          {/* Tab 5: Profile */}
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex flex-col items-center justify-center py-1 transition ${
              activeTab === "profile" ? "text-orange-500 font-bold" : "text-stone-400 hover:text-stone-600"
            }`}
          >
            <User className="h-5 w-5 mb-0.5" />
            <span className="text-[10px]">Profil</span>
          </button>

        </div>
      </nav>

    </div>
  );
}
