"use client";

import { useEffect, useState } from "react";
import DateFilterBar, { DateFilterState } from "@/components/DateFilterBar";
import DateStrip from "@/components/DateStrip";
import HeroCalorieCard from "@/components/HeroCalorieCard";
import QuickActionModal from "@/components/QuickActionModal";
import KyuMascot from "@/components/KyuMascot";
import EnergyBalanceRing from "@/components/EnergyBalanceRing";
import BmiGauge from "@/components/BmiGauge";
import BodyCompositionCard from "@/components/BodyCompositionCard";
import ProfileBiometricsModal from "@/components/ProfileBiometricsModal";
import MacroTargetsModal from "@/components/MacroTargetsModal";
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
  Target,
  Plus,
  Utensils,
  MessageSquare,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Sliders,
  Edit3
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
    name?: string | null;
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

  // Quick Action Modal State (Center + FAB)
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [isTargetDetailsOpen, setIsTargetDetailsOpen] = useState(false);
  const [showMealForm, setShowMealForm] = useState(false);
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [isBiometricsModalOpen, setIsBiometricsModalOpen] = useState(false);
  const [isMacroModalOpen, setIsMacroModalOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

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

  const handleQuickActionSelect = (action: "food" | "workout" | "weight" | "whatsapp") => {
    if (action === "food") {
      setActiveTab("today");
      setShowMealForm(true);
    } else if (action === "workout") {
      setActiveTab("workout");
    } else if (action === "weight") {
      setActiveTab("progress");
    } else if (action === "whatsapp") {
      const botNumber = (process.env.NEXT_PUBLIC_BOT_WHATSAPP_NUMBER || "6285139362618").replace(/[^0-9]/g, "");
      const waUrl = `https://wa.me/${botNumber}?text=${encodeURIComponent("Halo KyuFit!")}`;
      window.open(waUrl, "_blank");
    }
  };

  if (!mounted) return null;

  const user = summaryData?.user || {
    name: "Rifaldi",
    dailyCalorieTarget: 1779,
    targetProteinG: 98,
    targetCarbsG: 237,
    targetFatsG: 49,
    fitnessGoal: "cut",
    email: "rifaldiadi88@gmail.com",
    whatsappNumber: "085693553908",
    currentWeightKg: 68.5,
    heightCm: 170,
    age: 25,
    gender: "male",
    activityLevel: "moderate"
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

  // For multi-day mode, evaluate percentages & remaining calories using daily averages
  const activeCalories = isMultiDay ? dailyAvg.calories : consumedCalories;
  const activeBurned = isMultiDay ? dailyAvg.workoutCalories : burnedCalories;
  const activeTarget = targetCalories;

  const remainingCalories = activeTarget - activeCalories + activeBurned;

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
    <div className="min-h-screen bg-[#FAFAF9] text-stone-900 font-sans antialiased pb-28">
      
      {/* Centered Mobile-First Container (Max 448px width, perfectly matching iOS/Android app reference) */}
      <div className="mx-auto max-w-md px-4 pt-4 space-y-3.5">
        
        {/* App Header with Original Kyu Vector Mascot & Brand Name */}
        <header className="flex items-center justify-between py-1.5 px-1">
          <div className="flex items-center gap-2.5">
            <KyuMascot mood="header" size={36} />
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-emerald-950 leading-none">
                kyu<span className="text-amber-500">fit</span>
              </span>
              <span className="text-[9px] font-bold tracking-wider text-stone-400 uppercase leading-tight mt-0.5">
                Nutrition & Body Tracker
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className="h-10 w-10 rounded-full bg-white border border-stone-200/80 shadow-2xs flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition active:scale-95"
            title="Profil Pengguna"
          >
            <User className="h-5 w-5" />
          </button>
        </header>

        {/* Global Error Banner */}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 flex items-start gap-3 text-xs">
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
          <main key="today" className="space-y-3.5 animate-tab-enter">

            {/* 7-Day Horizontal Date Strip (Scoped strictly to Today tab) */}
            <div className="bg-white rounded-3xl p-2 border border-stone-100 shadow-xs">
              <DateStrip
                selectedDate={dateFilter.date}
                onSelectDate={(date) => {
                  setDateFilter((prev) => ({
                    ...prev,
                    mode: "daily",
                    date,
                    month: date.slice(0, 7),
                    year: date.slice(0, 4),
                    startDate: date,
                    endDate: date
                  }));
                }}
              />

              {/* Optional Filter Toggle for Advanced Multi-Day / Monthly Analytics */}
              <div className="px-2 pt-1 pb-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
                  className="text-[10px] font-semibold text-stone-400 hover:text-stone-600 flex items-center gap-1 transition"
                >
                  <SlidersHorizontal className="h-3 w-3" />
                  <span>{showAdvancedFilter ? "Tutup Filter Rentang" : "Filter Rentang Waktu"}</span>
                </button>
              </div>

              {showAdvancedFilter && (
                <div className="pt-2 border-t border-stone-100 mt-1 animate-in fade-in duration-150">
                  <DateFilterBar filter={dateFilter} onChange={setDateFilter} />
                </div>
              )}
            </div>
            
            {/* Hero Calorie Card with Flame Progress Ring and 2x2 MacroMiniRings */}
            <HeroCalorieCard
              consumedCalories={activeCalories}
              targetCalories={activeTarget}
              remainingCalories={remainingCalories}
              burnedCalories={activeBurned}
              protein={{
                current: activeProtein,
                target: user.targetProteinG,
              }}
              carbs={{
                current: activeCarbs,
                target: user.targetCarbsG,
              }}
              fat={{
                current: activeFats,
                target: user.targetFatsG,
              }}
              isMultiDay={isMultiDay}
              activeDaysCount={activeDaysCount}
              onOpenDetails={() => setIsTargetDetailsOpen(!isTargetDetailsOpen)}
            />

            {/* Target Details Collapsible Section */}
            {isTargetDetailsOpen && (
              <div className="bg-white rounded-3xl p-5 border border-stone-100 shadow-xs space-y-3 animate-in slide-in-from-top-3 duration-200">
                <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-emerald-600" />
                    <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                      Detail Rincian Energi & Goals
                    </h4>
                  </div>
                  <button
                    onClick={() => setIsTargetDetailsOpen(false)}
                    className="text-stone-400 hover:text-stone-600 p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                    <span className="text-[10px] text-stone-400 font-semibold block">Goal Nutrisi</span>
                    <span className="font-extrabold text-stone-800 capitalize">{user.fitnessGoal}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                    <span className="text-[10px] text-stone-400 font-semibold block">Budget Harian</span>
                    <span className="font-extrabold text-stone-800">{user.dailyCalorieTarget} kcal</span>
                  </div>
                </div>

                <div className="text-[11px] text-stone-500 leading-relaxed bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                  Target kalori ini dikalibrasi secara ilmiah berdasarkan estimasi TDEE dan profil berat badan Anda untuk mencapai hasil berkelanjutan.
                </div>
              </div>
            )}

            {/* KyuBot WhatsApp Gateway Banner */}
            <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-white rounded-3xl border border-emerald-200/70 p-4 shadow-2xs">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-emerald-700 flex items-center justify-center text-white shadow-xs shrink-0">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-stone-900">KyuBot Assistant</span>
                      <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        WhatsApp
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-600 mt-0.5">
                      Kirim foto piring untuk kalkulasi kalori & pencatatan otomatis!
                    </p>
                  </div>
                </div>
                <a
                  href={`https://wa.me/${(process.env.NEXT_PUBLIC_BOT_WHATSAPP_NUMBER || '6285139362618').replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Halo KyuFit!')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition shadow-xs flex items-center gap-1"
                >
                  <span>Chat</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            {/* Daily Log Section (Matching reference app layout & typography) */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between px-1">
                <div>
                  <h3 className="text-base font-bold text-stone-900 tracking-tight">Daily Log</h3>
                  <p className="text-xs text-stone-400 font-medium">
                    {summaryData?.meals.length || 0} meals logged
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowMealForm(!showMealForm)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100/80 px-3 py-1.5 rounded-xl transition active:scale-95"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>{showMealForm ? "Tutup Form" : "Tambah Manual"}</span>
                </button>
              </div>

              {/* Form Input Catat Makanan (Collapsible) */}
              {showMealForm && (
                <div className="bg-white rounded-3xl border border-stone-200/80 p-5 shadow-xs space-y-3 animate-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs uppercase font-bold text-stone-400 tracking-wider flex items-center gap-1.5">
                      <Utensils className="h-3.5 w-3.5 text-orange-500" />
                      Input Makanan Manual
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowMealForm(false)}
                      className="text-stone-400 hover:text-stone-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  
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
                        <label className="block text-[11px] font-semibold text-stone-600 mb-1">Net Carbs (g)</label>
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
                      className="w-full mt-2 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      {isSubmittingMeal ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : showMealSuccess ? (
                        <>
                          <Check className="h-4 w-4" />
                          Berhasil Dicatat!
                        </>
                      ) : (
                        "Simpan Makanan"
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* List Catatan Makanan */}
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
                        className="p-3.5 rounded-2xl bg-white border border-stone-100 shadow-2xs flex flex-col justify-between transition hover:border-stone-200"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-2xl bg-orange-50 border border-orange-100/80 flex items-center justify-center text-orange-600 shrink-0">
                              <Utensils className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-stone-900">
                                {meal.foodName}
                              </div>
                              <div className="text-[10px] text-stone-400 flex items-center gap-1 mt-0.5">
                                <Clock className="h-3 w-3" /> {time} WIB
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold text-stone-900">
                              {meal.calories} <span className="text-[10px] text-stone-400 font-medium">kcal</span>
                            </span>
                            <button
                              onClick={() => handleDeleteMeal(meal.id)}
                              title="Hapus log makanan"
                              className="p-1 rounded-lg text-stone-300 hover:text-red-500 hover:bg-red-50 transition"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-stone-100/80 flex gap-3 text-[10px] text-stone-500 font-medium">
                          <span>P: {meal.proteinG}g</span>
                          <span>K: {meal.carbsG}g</span>
                          <span>L: {meal.fatsG}g</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 px-4 text-stone-400 bg-white rounded-3xl border border-stone-100 shadow-2xs flex flex-col items-center justify-center">
                  <KyuMascot mood="hungry" size={82} className="mb-2" />
                  <p className="text-xs font-bold text-stone-800">Belum ada makanan pada tanggal ini</p>
                  <p className="text-[11px] text-stone-400 mt-0.5">Kirim foto ke WhatsApp atau gunakan tombol (+) untuk catat cepat!</p>
                </div>
              )}
            </div>

          </main>
        )}

        {/* TAB 2: PROGRESS (Grafik Berat Badan & Target Projection) */}
        {activeTab === "progress" && (
          <main key="progress" className="space-y-4 animate-tab-enter">
            
            {/* Quick Weight Input Form */}
            <div className="bg-white rounded-3xl border border-stone-100 p-5 shadow-xs space-y-3">
              <h3 className="text-xs uppercase font-bold text-stone-400 tracking-wider flex items-center gap-1.5">
                <Scale className="h-4 w-4 text-emerald-600" />
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
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition"
                />
                <button
                  type="submit"
                  disabled={isSubmittingWeight}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2 rounded-xl text-xs transition flex items-center justify-center shrink-0 shadow-xs"
                >
                  {isSubmittingWeight ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : showWeightSuccess ? (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Tersimpan!
                    </>
                  ) : (
                    "Catat"
                  )}
                </button>
              </form>
            </div>

            {/* Smart BMI Gauge Component */}
            {latestWeight && (
              <BmiGauge 
                weightKg={latestWeight} 
                heightCm={user.heightCm} 
              />
            )}

            {/* Smart Target Weight Projection Card */}
            {insightsData?.projection && (
              <div className="bg-gradient-to-br from-emerald-700 via-teal-800 to-stone-900 text-white rounded-3xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Proyeksi Pencapaian Target
                  </span>
                  <span className="bg-emerald-600/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-400/30">
                    {insightsData.projection.paceCategory}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <div className="text-[11px] text-emerald-200">Berat Terkini</div>
                    <div className="text-xl font-black">{insightsData.projection.currentWeightKg} kg</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-emerald-200">Target Akhir</div>
                    <div className="text-xl font-black">{insightsData.projection.targetWeightKg} kg</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/15 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-stone-300">Estimasi Capai: </span>
                    <span className="font-bold text-white">
                      {insightsData.projection.estimatedTargetDate 
                        ? new Date(insightsData.projection.estimatedTargetDate).toLocaleDateString("id-ID", { month: "short", day: "numeric", year: "numeric" })
                        : "Konsistensi log dibutuhkan"}
                    </span>
                  </div>
                  {insightsData.projection.estimatedDaysRemaining !== null && (
                    <span className="bg-white/20 text-white px-2 py-0.5 rounded-md text-[10px] font-bold">
                      ~{insightsData.projection.estimatedDaysRemaining} hari lagi
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Weight Progress Chart */}
            <div className="bg-white rounded-3xl border border-stone-100 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                <h3 className="text-xs uppercase font-bold text-stone-400 tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  Grafik Tren Timbangan
                </h3>
                <span className="text-[10px] text-stone-400 font-medium">
                  {chartData.length} Entri Tercatat
                </span>
              </div>

              {chartData.length > 0 ? (
                <div className="h-56 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#78716c" }} tickLine={false} axisLine={false} />
                      <YAxis domain={['dataMin - 1', 'dataMax + 1']} tick={{ fontSize: 10, fill: "#78716c" }} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#1c1917", borderRadius: "12px", border: "none", color: "#fff", fontSize: "11px" }}
                        formatter={(val: any) => [`${val} kg`, "Berat Badan"]}
                      />
                      <Area type="monotone" dataKey="weight" stroke="#059669" strokeWidth={2.5} fillOpacity={1} fill="url(#weightGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-10 text-stone-400">
                  <Scale className="h-8 w-8 text-stone-300 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-stone-600">Belum ada data timbangan tercatat</p>
                  <p className="text-[11px] text-stone-400 mt-0.5">Catat berat badan harian pada form di atas!</p>
                </div>
              )}
            </div>

            {/* Riwayat Timbangan Table */}
            <div className="bg-white rounded-3xl border border-stone-100 p-5 shadow-xs space-y-3">
              <h3 className="text-xs uppercase font-bold text-stone-400 tracking-wider">
                Log Riwayat Timbangan ({sortedWeightLogs.length})
              </h3>
              {sortedWeightLogs.length > 0 ? (
                <div className="divide-y divide-stone-100 max-h-52 overflow-y-auto">
                  {sortedWeightLogs.slice().reverse().map((log, i) => (
                    <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                      <span className="text-stone-500 font-medium">
                        {new Date(log.timestamp).toLocaleDateString("id-ID", {
                          weekday: "short",
                          day: "numeric",
                          month: "short"
                        })}
                      </span>
                      <span className="font-bold text-stone-900">{log.weightKg} kg</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-stone-400 py-2">Belum ada riwayat tercatat.</div>
              )}
            </div>

          </main>
        )}

        {/* TAB 3: WORKOUT (Catat Olahraga & Latihan Fisik) */}
        {activeTab === "workout" && (
          <main key="workout" className="space-y-4 animate-tab-enter">
            
            {/* Kalori Terbakar Summary Card */}
            <div className="bg-white rounded-3xl border border-stone-100 p-5 shadow-xs flex items-center justify-between">
              <div>
                <h3 className="text-xs uppercase font-bold text-stone-400 tracking-wider">Kalori Terbakar Hari Ini</h3>
                <div className="text-2xl font-black text-emerald-700 mt-0.5">
                  -{burnedCalories} <span className="text-xs font-normal text-stone-500">kcal</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shadow-2xs">
                <Dumbbell className="h-6 w-6" />
              </div>
            </div>

            {/* Form Catat Olahraga */}
            <div className="bg-white rounded-3xl border border-stone-100 p-5 shadow-xs space-y-3">
              <h3 className="text-xs uppercase font-bold text-stone-400 tracking-wider flex items-center gap-1.5">
                <Dumbbell className="h-4 w-4 text-emerald-700" />
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
                    { label: "Gym Beban", name: "Latihan Beban (Gym Push/Pull)", duration: "60", cal: "360" },
                    { label: "Treadmill", name: "Lari Treadmill / Jogging", duration: "30", cal: "280" },
                    { label: "Sepeda", name: "Sepeda Statis / Spinning", duration: "45", cal: "320" },
                    { label: "HIIT", name: "Kardio HIIT & Sirkuit", duration: "25", cal: "250" },
                    { label: "Jalan Kaki", name: "Jalan Cepat / Brisk Walk", duration: "40", cal: "160" }
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handleSelectWorkoutPreset(preset)}
                      className="shrink-0 bg-stone-50 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 border border-stone-200 text-stone-700 px-2.5 py-1 rounded-xl text-[11px] font-semibold transition"
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
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition"
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
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-semibold text-stone-600">Kalori (kcal)</label>
                      {durationMinutes && activityName && (
                        <button
                          type="button"
                          onClick={handleEstimateCalories}
                          className="text-[10px] text-emerald-700 hover:text-emerald-800 font-bold bg-emerald-50 hover:bg-emerald-100 px-1.5 py-0.5 rounded transition flex items-center gap-1"
                        >
                          <Zap className="h-3 w-3" />
                          <span>Estimasi</span>
                        </button>
                      )}
                    </div>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 320"
                      value={workoutCalories}
                      onChange={(e) => setWorkoutCalories(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingWorkout}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-xs"
                >
                  {isSubmittingWorkout ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : showWorkoutSuccess ? (
                    <>
                      <Check className="h-4 w-4" />
                      Berhasil Dicatat!
                    </>
                  ) : (
                    "Simpan Olahraga"
                  )}
                </button>
              </form>
            </div>

            {/* List Workout Hari Ini */}
            <div className="bg-white rounded-3xl border border-stone-100 p-5 shadow-xs space-y-3">
              <h3 className="text-xs uppercase font-bold text-stone-400 tracking-wider">
                Riwayat Latihan Hari Ini ({summaryData?.workouts.length || 0})
              </h3>

              {summaryData?.workouts && summaryData.workouts.length > 0 ? (
                <div className="space-y-2.5">
                  {summaryData.workouts.map((workout) => {
                    const time = new Date(workout.timestamp).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit"
                    });
                    const isStrength = workout.activityName.toLowerCase().includes("beban") || workout.activityName.toLowerCase().includes("gym");
                    return (
                      <div 
                        key={workout.id}
                        className="p-3.5 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 text-sm font-bold shrink-0">
                            {isStrength ? <Dumbbell className="h-4 w-4" /> : <Activity className="h-4 w-4" />}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-stone-900">{workout.activityName}</div>
                            <div className="text-[10px] text-stone-400 mt-0.5 flex items-center gap-2">
                              <span>{workout.durationMinutes} menit</span>
                              <span>•</span>
                              <span>{time} WIB</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <span className="text-xs font-black text-emerald-700">
                            -{workout.caloriesBurned} <span className="text-[10px] font-normal text-stone-400">kcal</span>
                          </span>
                          <button
                            onClick={() => handleDeleteWorkout(workout.id)}
                            title="Hapus log olahraga"
                            className="p-1 rounded-lg text-stone-300 hover:text-red-500 hover:bg-red-50 transition"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-stone-400 bg-stone-50/50 rounded-2xl border border-dashed border-stone-200">
                  <div className="h-10 w-10 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-2">
                    <Dumbbell className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-semibold text-stone-700">Belum ada olahraga pada tanggal ini</p>
                  <p className="text-[11px] text-stone-400 mt-0.5">Latihan Anda akan menambah budget kalori harian!</p>
                </div>
              )}
            </div>

          </main>
        )}

        {/* TAB 4: AI TIPS (Rekomendasi & Analisis Nutrisi) */}
        {activeTab === "tips" && (
          <main key="tips" className="space-y-4 animate-tab-enter">
            
            {/* Quick Summary AI Card */}
            <div className="bg-gradient-to-br from-stone-900 to-stone-800 text-white rounded-3xl p-5 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <Sparkles className="h-4 w-4" />
                <span>KyuFit AI Coach</span>
              </div>
              <h2 className="text-base font-bold">Evaluasi Kebugaran Harian</h2>
              <p className="text-xs text-stone-300 leading-relaxed">
                KyuBot memonitor defisit kalori, rasio makronutrisi, dan intensitas olahraga harian Anda secara holistik.
              </p>
            </div>

            {/* Weekly Deep AI Health Insights */}
            {insightsData && (
              <div className="bg-white rounded-3xl border border-stone-100 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <h3 className="text-xs uppercase font-bold text-stone-400 tracking-wider flex items-center gap-1.5">
                    <Activity className="h-4 w-4 text-emerald-600" />
                    Dynamic Multi-Metric Insights
                  </h3>
                  <span className="text-[10px] text-stone-400">Analisa Real-Time</span>
                </div>

                <div className="space-y-2.5">
                  {insightsData.insights.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 text-xs p-3.5 rounded-2xl bg-stone-50 border border-stone-100 transition hover:border-emerald-200">
                      <span className={`h-2.5 w-2.5 rounded-full mt-1.5 shrink-0 ${
                        item.sentiment === "positive" 
                          ? "bg-emerald-500 ring-4 ring-emerald-100" 
                          : item.sentiment === "warning" 
                          ? "bg-red-500 ring-4 ring-red-100" 
                          : "bg-amber-500 ring-4 ring-amber-100"
                      }`} />
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
              <div className="bg-white rounded-3xl border border-stone-100 p-5 shadow-xs space-y-3">
                <h3 className="text-xs uppercase font-bold text-stone-400 tracking-wider flex items-center gap-1.5">
                  <Apple className="h-4 w-4 text-emerald-600" />
                  Rekomendasi Makanan Pasca-Workout & Makro
                </h3>

                <div className="space-y-2.5">
                  {insightsData.mealSuggestions.map((meal) => (
                    <div key={meal.id} className="p-3.5 rounded-2xl bg-stone-50 border border-stone-100 text-xs">
                      <div className="flex justify-between font-bold text-stone-900">
                        <span>{meal.title}</span>
                        <span className="text-emerald-700 font-extrabold">{meal.calories} kcal</span>
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
            <div className="bg-white rounded-3xl border border-stone-100 p-5 shadow-xs space-y-3">
              <h3 className="text-xs uppercase font-bold text-stone-400 tracking-wider flex items-center gap-1.5">
                <Info className="h-4 w-4 text-stone-400" />
                Metodologi Berbasis Sains KyuFit
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                KyuFit menggunakan formula <strong>Mifflin-St Jeor</strong> & <strong>Katch-McArdle</strong> untuk menghitung RMR dan TDEE secara tepat. Target defisit kalori diatur berkisar 15-20% dari TDEE agar penurunan berat badan berkelanjutan tanpa mengorbankan massa otot aktif.
              </p>
            </div>

          </main>
        )}

        {/* TAB 5: PROFILE (Personal Fitness & Nutrition Command Center) */}
        {activeTab === "profile" && (
          <main key="profile" className="space-y-4 animate-tab-enter">
            
            {/* Profile Identity Card with Quick Biometrics Snapshot */}
            <div className="bg-white rounded-3xl border border-stone-200/80 p-5 shadow-xs space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="relative">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 shadow-xs">
                      <User className="h-8 w-8" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-xs">
                      <span className="flex h-3 w-3 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
                      </span>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-base font-extrabold text-stone-900 leading-tight">
                      {user.name || user.email.split("@")[0]}
                    </h2>
                    <p className="text-xs text-stone-500 mt-0.5">{user.email}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                        <Target className="h-3 w-3 text-emerald-600" />
                        Goal: {user.fitnessGoal.toUpperCase()}
                      </span>
                      <span className="inline-flex items-center gap-1 bg-stone-100 text-stone-600 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        WA: +{user.whatsappNumber}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsBiometricsModalOpen(true)}
                  className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200/80 text-stone-700 transition active:scale-95"
                  title="Edit Profil & Biometrik"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
              </div>

              {/* Quick Biometrics Snapshot Pill Grid */}
              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-stone-100">
                <div className="p-2 bg-stone-50/70 border border-stone-100 rounded-xl text-center">
                  <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">Usia</span>
                  <span className="text-xs font-black text-stone-800 mt-0.5 block">{user.age || "-"} th</span>
                </div>
                <div className="p-2 bg-stone-50/70 border border-stone-100 rounded-xl text-center">
                  <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">Gender</span>
                  <span className="text-xs font-black text-stone-800 mt-0.5 block capitalize">
                    {user.gender === "female" ? "Wanita" : "Pria"}
                  </span>
                </div>
                <div className="p-2 bg-stone-50/70 border border-stone-100 rounded-xl text-center">
                  <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">Tinggi</span>
                  <span className="text-xs font-black text-stone-800 mt-0.5 block">{user.heightCm || "-"} cm</span>
                </div>
                <div className="p-2 bg-stone-50/70 border border-stone-100 rounded-xl text-center">
                  <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">Berat</span>
                  <span className="text-xs font-black text-stone-800 mt-0.5 block">{user.currentWeightKg || "-"} kg</span>
                </div>
              </div>

              {/* Edit Biometrics Button */}
              <button
                type="button"
                onClick={() => setIsBiometricsModalOpen(true)}
                className="w-full bg-emerald-50/80 hover:bg-emerald-100/80 text-emerald-800 border border-emerald-200/70 font-bold py-2.5 rounded-2xl text-xs transition flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                <Edit3 className="h-3.5 w-3.5 text-emerald-700" />
                <span>Edit Profil & Biometrik Fisik</span>
              </button>
            </div>

            {/* Body Composition Card */}
            <BodyCompositionCard
              user={{
                gender: user.gender,
                currentWeightKg: user.currentWeightKg,
                heightCm: user.heightCm,
                bodyFatPercent: user.bodyFatPercent,
                skeletalMuscleMassKg: user.skeletalMuscleMassKg,
                visceralFatLevel: user.visceralFatLevel,
                inbodyScore: user.inbodyScore,
                dailyCalorieTarget: user.dailyCalorieTarget,
                targetProteinG: user.targetProteinG,
              }}
              onSuccess={fetchData}
            />

            {/* Target Settings Summary with Customization Trigger */}
            <div className="bg-white rounded-3xl border border-stone-200/80 p-5 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs uppercase font-bold text-stone-900 tracking-wider">
                    Parameter Nutrisi & Makro
                  </h3>
                  <p className="text-[11px] text-stone-500">Target konsumsi harian saat ini</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMacroModalOpen(true)}
                  className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition active:scale-95"
                >
                  <Sliders className="h-3.5 w-3.5" />
                  <span>Ubah Target</span>
                </button>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/50 text-center sm:text-left">
                  <div className="text-[10px] text-amber-700 font-semibold uppercase tracking-wider">Kalori</div>
                  <div className="text-base font-black text-amber-950 mt-0.5">{user.dailyCalorieTarget} <span className="text-[10px] font-normal text-amber-800">kcal</span></div>
                  <div className="text-[9px] text-amber-700/80 mt-0.5 font-medium">Batas Harian</div>
                </div>

                <div className="p-3 rounded-2xl bg-stone-50/80 border border-stone-200/70 text-center sm:text-left">
                  <div className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider">Protein</div>
                  <div className="text-base font-black text-stone-900 mt-0.5">{user.targetProteinG} <span className="text-[10px] font-normal text-stone-500">g</span></div>
                  <div className="text-[9px] text-stone-400 mt-0.5">{user.targetProteinG * 4} kcal</div>
                </div>

                <div className="p-3 rounded-2xl bg-stone-50/80 border border-stone-200/70 text-center sm:text-left">
                  <div className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider">Karbohidrat</div>
                  <div className="text-base font-black text-stone-900 mt-0.5">{user.targetCarbsG} <span className="text-[10px] font-normal text-stone-500">g</span></div>
                  <div className="text-[9px] text-stone-400 mt-0.5">{user.targetCarbsG * 4} kcal</div>
                </div>

                <div className="p-3 rounded-2xl bg-stone-50/80 border border-stone-200/70 text-center sm:text-left">
                  <div className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider">Lemak</div>
                  <div className="text-base font-black text-stone-900 mt-0.5">{user.targetFatsG} <span className="text-[10px] font-normal text-stone-500">g</span></div>
                  <div className="text-[9px] text-stone-400 mt-0.5">{user.targetFatsG * 9} kcal</div>
                </div>
              </div>

              {/* Macro Distribution Visual Progress Bar */}
              {(() => {
                const totalMacroKcal = user.targetProteinG * 4 + user.targetCarbsG * 4 + user.targetFatsG * 9;
                const pPct = totalMacroKcal > 0 ? Math.round(((user.targetProteinG * 4) / totalMacroKcal) * 100) : 0;
                const cPct = totalMacroKcal > 0 ? Math.round(((user.targetCarbsG * 4) / totalMacroKcal) * 100) : 0;
                const fPct = totalMacroKcal > 0 ? Math.round(((user.targetFatsG * 9) / totalMacroKcal) * 100) : 0;
                return (
                  <div className="p-3 bg-stone-50 border border-stone-200/60 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-stone-600">Rasio Makro:</span>
                      <span className="text-[10px] text-stone-500">
                        <strong className="text-amber-700">{pPct}% P</strong> •{" "}
                        <strong className="text-emerald-700">{cPct}% K</strong> •{" "}
                        <strong className="text-sky-700">{fPct}% L</strong>
                      </span>
                    </div>
                    <div className="h-2 w-full bg-stone-200 rounded-full flex overflow-hidden">
                      <div style={{ width: `${pPct}%` }} className="bg-amber-500" title={`Protein: ${pPct}%`} />
                      <div style={{ width: `${cPct}%` }} className="bg-emerald-600" title={`Karbo: ${cPct}%`} />
                      <div style={{ width: `${fPct}%` }} className="bg-sky-500" title={`Lemak: ${fPct}%`} />
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Kyu Coach & Integration Card */}
            <div className="bg-gradient-to-br from-emerald-900 to-emerald-950 rounded-3xl p-5 text-white shadow-xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="bg-white/10 p-2 rounded-2xl border border-white/10 shrink-0">
                  <KyuMascot mood="happy" size={32} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Kyu AI Coach & WhatsApp Sync
                  </h4>
                  <p className="text-[11px] text-emerald-200/80 leading-relaxed mt-0.5">
                    Data profil dan target kalori ini tersinkronisasi langsung saat Anda mencatat makanan & olahraga via chat WhatsApp.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  const botNumber = (process.env.NEXT_PUBLIC_BOT_WHATSAPP_NUMBER || "6285139362618").replace(/[^0-9]/g, "");
                  window.open(`https://wa.me/${botNumber}?text=${encodeURIComponent("Halo KyuFit!")}`, "_blank");
                }}
                className="w-full bg-white text-emerald-950 hover:bg-emerald-50 font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-2 active:scale-[0.99] shadow-xs"
              >
                <MessageSquare className="h-3.5 w-3.5 text-emerald-800" />
                <span>Buka Chat WhatsApp Kyu</span>
              </button>
            </div>

            {/* Logout Action Button */}
            <div className="bg-white rounded-3xl border border-stone-200/80 p-5 shadow-xs">
              <button
                type="button"
                onClick={() => setIsLogoutConfirmOpen(true)}
                className="w-full bg-rose-50 hover:bg-rose-100/80 text-rose-600 font-bold py-3 rounded-2xl text-xs transition flex items-center justify-center gap-2 border border-rose-200/60 active:scale-[0.99]"
              >
                <LogOut className="h-4 w-4" />
                <span>Keluar (Logout)</span>
              </button>
            </div>

          </main>
        )}

      </div>

      {/* FIXED BOTTOM NAVIGATION BAR WITH ELEVATED CENTER (+) FLOATING ACTION BUTTON */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 border-t border-stone-200/80 backdrop-blur-md shadow-lg">
        <div className="mx-auto max-w-md relative flex items-center justify-around py-2 px-2 text-center">
          
          {/* Tab 1: Today */}
          <button
            type="button"
            onClick={() => setActiveTab("today")}
            className={`flex flex-col items-center justify-center py-1 flex-1 transition active:scale-95 ${
              activeTab === "today" ? "text-emerald-700 font-bold" : "text-stone-400 hover:text-stone-600"
            }`}
          >
            <Calendar className="h-5 w-5 mb-0.5" />
            <span className="text-[10px]">Today</span>
          </button>

          {/* Tab 2: Insight / Progress */}
          <button
            type="button"
            onClick={() => setActiveTab("progress")}
            className={`flex flex-col items-center justify-center py-1 flex-1 transition active:scale-95 ${
              activeTab === "progress" ? "text-emerald-700 font-bold" : "text-stone-400 hover:text-stone-600"
            }`}
          >
            <TrendingUp className="h-5 w-5 mb-0.5" />
            <span className="text-[10px]">Insight</span>
          </button>

          {/* Center Elevated Floating Action Button (+) */}
          <div className="relative -top-5 flex items-center justify-center flex-1">
            <button
              type="button"
              onClick={() => setIsQuickActionOpen(true)}
              className="h-13 w-13 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center shadow-lg ring-4 ring-[#FAFAF9] transition-transform active:scale-90"
              title="Catat Cepat"
            >
              <Plus className="h-6 w-6 stroke-[2.5]" />
            </button>
          </div>

          {/* Tab 4: AI Tips */}
          <button
            type="button"
            onClick={() => setActiveTab("tips")}
            className={`flex flex-col items-center justify-center py-1 flex-1 transition active:scale-95 ${
              activeTab === "tips" ? "text-emerald-700 font-bold" : "text-stone-400 hover:text-stone-600"
            }`}
          >
            <Sparkles className="h-5 w-5 mb-0.5" />
            <span className="text-[10px]">Tips</span>
          </button>

          {/* Tab 5: Profile */}
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`flex flex-col items-center justify-center py-1 flex-1 transition active:scale-95 ${
              activeTab === "profile" ? "text-emerald-700 font-bold" : "text-stone-400 hover:text-stone-600"
            }`}
          >
            <User className="h-5 w-5 mb-0.5" />
            <span className="text-[10px]">Profil</span>
          </button>

        </div>
      </nav>

      {/* Quick Action Bottom Sheet Modal */}
      <QuickActionModal
        isOpen={isQuickActionOpen}
        onClose={() => setIsQuickActionOpen(false)}
        onSelectAction={handleQuickActionSelect}
        botWhatsAppNumber={process.env.NEXT_PUBLIC_BOT_WHATSAPP_NUMBER}
      />

      {/* Profile & Biometrics Modal */}
      <ProfileBiometricsModal
        isOpen={isBiometricsModalOpen}
        onClose={() => setIsBiometricsModalOpen(false)}
        user={{
          name: user.name,
          age: user.age,
          gender: user.gender,
          heightCm: user.heightCm,
          currentWeightKg: user.currentWeightKg,
          activityLevel: user.activityLevel,
          fitnessGoal: user.fitnessGoal,
        }}
        onSuccess={fetchData}
      />

      {/* Custom Macro Targets Modal */}
      <MacroTargetsModal
        isOpen={isMacroModalOpen}
        onClose={() => setIsMacroModalOpen(false)}
        user={{
          dailyCalorieTarget: user.dailyCalorieTarget,
          targetProteinG: user.targetProteinG,
          targetCarbsG: user.targetCarbsG,
          targetFatsG: user.targetFatsG,
        }}
        onSuccess={fetchData}
      />

      {/* Safe Logout Confirmation Dialog */}
      {isLogoutConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl border border-stone-200 shadow-2xl p-6 text-center space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-rose-50 border border-rose-200/60 mx-auto flex items-center justify-center text-rose-600">
              <LogOut className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-stone-900">Konfirmasi Keluar</h3>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Apakah Anda yakin ingin keluar dari akun KyuFit? Anda dapat masuk kembali kapan saja dengan nomor WhatsApp atau email Anda.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsLogoutConfirmOpen(false)}
                className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold py-2.5 rounded-xl text-xs transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-sm"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
