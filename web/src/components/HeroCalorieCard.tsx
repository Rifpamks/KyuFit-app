"use client";

import React from "react";
import { Flame, ChevronRight, Zap } from "lucide-react";
import MacroMiniRing from "./MacroMiniRing";

interface HeroCalorieCardProps {
  consumedCalories: number;
  targetCalories: number;
  remainingCalories: number;
  burnedCalories: number;
  protein: {
    current: number;
    target: number;
  };
  carbs: {
    current: number;
    target: number;
  };
  fat: {
    current: number;
    target: number;
  };
  isMultiDay?: boolean;
  activeDaysCount?: number;
  onOpenDetails?: () => void;
}

export default function HeroCalorieCard({
  consumedCalories,
  targetCalories,
  remainingCalories,
  burnedCalories,
  protein,
  carbs,
  fat,
  isMultiDay = false,
  activeDaysCount = 1,
  onOpenDetails,
}: HeroCalorieCardProps) {
  // Calorie ring progress
  const percent = targetCalories > 0 ? Math.min(Math.round((consumedCalories / targetCalories) * 100), 100) : 0;
  const isOverBudget = remainingCalories < 0;

  // SVG circular ring params
  const ringSize = 64;
  const strokeWidth = 6;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div className="bg-white rounded-3xl p-5 border border-stone-100/80 shadow-xs transition hover:shadow-sm">
      {/* Top Section: Calories consumed and Total Circular Ring */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-stone-100">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
              {Math.round(consumedCalories)}
            </span>
            <span className="text-xs font-semibold text-stone-400">kcal</span>
          </div>
          <p className="text-xs text-stone-500 font-medium mt-0.5">
            dari <span className="font-bold text-stone-700">{Math.round(targetCalories)}</span> yang dikonsumsi
            {isMultiDay && activeDaysCount > 0 && (
              <span className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200/60 px-1.5 py-0.5 rounded-md block sm:inline sm:ml-1 font-bold">
                (Rata-rata {activeDaysCount} hari)
              </span>
            )}
          </p>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] font-medium">
            {isOverBudget ? (
              <span className="text-red-500 font-semibold">
                Surplus +{Math.abs(Math.round(remainingCalories))} kcal
              </span>
            ) : (
              <span className="text-emerald-600 font-semibold">
                Sisa {Math.round(remainingCalories)} kcal lagi
              </span>
            )}
            {burnedCalories > 0 && (
              <span className="text-stone-400">
                • {Math.round(burnedCalories)} kcal terbakar
              </span>
            )}
          </div>
        </div>

        {/* Right: Circular SVG Ring with Flame Icon */}
        <div className="relative flex items-center justify-center shrink-0" style={{ width: ringSize, height: ringSize }}>
          <svg width={ringSize} height={ringSize} className="transform -rotate-90">
            <circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={radius}
              stroke="#f5f5f4"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            <circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={radius}
              stroke={isOverBudget ? "#ef4444" : "#16a34a"}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`p-2 rounded-full ${isOverBudget ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-600"}`}>
              <Flame className="h-5 w-5 fill-current" />
            </div>
          </div>
        </div>
      </div>

      {/* 2x2 Grid: Macro Mini Rings (Matching reference app layout) */}
      <div className="grid grid-cols-2 gap-2.5 pt-4">
        {/* Protein (Egg icon) */}
        <MacroMiniRing
          type="protein"
          current={protein.current}
          target={protein.target}
          unit="g"
          label="Protein"
        />

        {/* Net Carbs (Wheat icon) */}
        <MacroMiniRing
          type="carbs"
          current={carbs.current}
          target={carbs.target}
          unit="g"
          label="Net Carbs"
        />

        {/* Fat (Droplet icon) */}
        <MacroMiniRing
          type="fat"
          current={fat.current}
          target={fat.target}
          unit="g"
          label="Fat"
        />

        {/* Active Burn (Flame icon) */}
        <MacroMiniRing
          type="burn"
          current={burnedCalories}
          target={300}
          unit=" kcal"
          label="Aktifitas"
        />
      </div>

      {/* Bottom Button / Link: See Details */}
      {onOpenDetails && (
        <div className="mt-3 pt-3 border-t border-stone-100/60 text-center">
          <button
            type="button"
            onClick={onOpenDetails}
            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition py-1 px-2 rounded-lg hover:bg-emerald-50/60"
          >
            <span>Lihat Rincian Target</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
