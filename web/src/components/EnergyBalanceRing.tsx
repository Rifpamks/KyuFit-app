'use client';

import React from 'react';
import { Flame, Dumbbell, Zap, CheckCircle2, AlertTriangle } from 'lucide-react';

interface EnergyBalanceRingProps {
  targetCalories: number;
  consumedCalories: number;
  burnedCalories: number;
  isMultiDay?: boolean;
  daysInRange?: number;
  activeDaysCount?: number;
  totalConsumedCalories?: number;
  fitnessGoal?: string;
}

export default function EnergyBalanceRing({
  targetCalories,
  consumedCalories,
  burnedCalories,
  isMultiDay = false,
  daysInRange = 1,
  activeDaysCount = 1,
  totalConsumedCalories,
  fitnessGoal = 'cut'
}: EnergyBalanceRingProps) {
  // Effective budget equation: Remaining = Target - Consumed + Burned
  const remainingCalories = targetCalories - consumedCalories + burnedCalories;
  const isOverBudget = remainingCalories < 0;
  const absRemaining = Math.abs(remainingCalories);

  // Intake Progress relative to target (capped at 100 for primary ring, with overflow indicator)
  const intakePercent = targetCalories > 0 ? (consumedCalories / targetCalories) * 100 : 0;
  const clampedIntakePercent = Math.min(100, Math.max(0, intakePercent));

  // Burned Progress relative to consumed or standard active budget (e.g. up to 500 kcal baseline)
  const burnedTargetBenchmark = Math.max(300, Math.round(targetCalories * 0.2));
  const burnedPercent = Math.min(100, Math.max(0, (burnedCalories / burnedTargetBenchmark) * 100));

  // SVG Geometry Constants
  const size = 220;
  const strokeWidth = 12;
  const center = size / 2;

  // Outer ring (Intake)
  const outerRadius = center - strokeWidth;
  const outerCircumference = 2 * Math.PI * outerRadius;
  const outerOffset = outerCircumference * (1 - clampedIntakePercent / 100);

  // Inner ring (Workout / Burned)
  const innerRadius = outerRadius - strokeWidth - 6;
  const innerCircumference = 2 * Math.PI * innerRadius;
  const innerOffset = innerCircumference * (1 - burnedPercent / 100);

  // Status computation
  let statusText = 'Defisit Sehat';
  let statusColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let statusIcon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline mr-1" />;

  const normalizedGoal = (fitnessGoal || 'cut').toLowerCase();

  if (isOverBudget) {
    statusText = 'Kelebihan Kalori';
    statusColor = 'bg-rose-50 text-rose-700 border-rose-200';
    statusIcon = <AlertTriangle className="w-3.5 h-3.5 text-rose-600 inline mr-1" />;
  } else if (remainingCalories <= 150) {
    statusText = 'Hampir Habis';
    statusColor = 'bg-amber-50 text-amber-700 border-amber-200';
    statusIcon = <Zap className="w-3.5 h-3.5 text-amber-600 inline mr-1" />;
  } else if (normalizedGoal === 'bulk') {
    statusText = 'Fase Surplus';
    statusColor = 'bg-blue-50 text-blue-700 border-blue-200';
    statusIcon = <Flame className="w-3.5 h-3.5 text-blue-600 inline mr-1" />;
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs transition-all hover:shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400">
            {isMultiDay ? `Energy Balance Rata-Rata (${activeDaysCount} Hari Aktif)` : 'Energy Balance Harian'}
          </span>
          <h2 className="text-base font-bold text-stone-900 mt-0.5">Dual-Progress Energy Ring</h2>
        </div>
        <div className={`px-2.5 py-1 rounded-full text-[11px] font-bold border flex items-center ${statusColor}`}>
          {statusIcon}
          <span>{statusText}</span>
        </div>
      </div>

      {/* Circular Visualization */}
      <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
        <div className="relative shrink-0 flex items-center justify-center">
          <svg width={size} height={size} className="-rotate-90 drop-shadow-xs">
            {/* Gradients */}
            <defs>
              <linearGradient id="intakeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#ea580c" />
              </linearGradient>
              <linearGradient id="overBudgetGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="100%" stopColor="#e11d48" />
              </linearGradient>
              <linearGradient id="burnedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
            </defs>

            {/* Outer Track (Intake Background) */}
            <circle
              cx={center}
              cy={center}
              r={outerRadius}
              fill="transparent"
              stroke="#f5f5f4"
              strokeWidth={strokeWidth}
            />

            {/* Outer Progress (Intake Bar) */}
            <circle
              cx={center}
              cy={center}
              r={outerRadius}
              fill="transparent"
              stroke={isOverBudget ? 'url(#overBudgetGradient)' : 'url(#intakeGradient)'}
              strokeWidth={strokeWidth}
              strokeDasharray={outerCircumference}
              strokeDashoffset={outerOffset}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />

            {/* Inner Track (Workout Background) */}
            <circle
              cx={center}
              cy={center}
              r={innerRadius}
              fill="transparent"
              stroke="#f5f5f4"
              strokeWidth={strokeWidth - 2}
            />

            {/* Inner Progress (Workout Bar) */}
            <circle
              cx={center}
              cy={center}
              r={innerRadius}
              fill="transparent"
              stroke="url(#burnedGradient)"
              strokeWidth={strokeWidth - 2}
              strokeDasharray={innerCircumference}
              strokeDashoffset={innerOffset}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
          </svg>

          {/* Central Hub Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              {isOverBudget ? 'Kelebihan' : 'Sisa Budget'}
            </span>
            <div className={`text-3xl font-black tracking-tight ${isOverBudget ? 'text-rose-600' : 'text-stone-900'}`}>
              {absRemaining}
            </div>
            <span className="text-[11px] font-semibold text-stone-500 -mt-1">
              kcal {isMultiDay ? '/hari' : ''}
            </span>
            <div className="flex items-center gap-1 text-[10px] font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full mt-1.5">
              <span>{Math.round(intakePercent)}% Target</span>
            </div>
          </div>
        </div>

        {/* Legend & Breakdown Stats */}
        <div className="w-full sm:w-auto flex-1 space-y-2.5">
          {/* Target Base */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-100 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-stone-300" />
              <span className="font-semibold text-stone-600">Target Harian:</span>
            </div>
            <span className="font-extrabold text-stone-900">{targetCalories} kcal</span>
          </div>

          {/* Intake */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-orange-50/60 border border-orange-100 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <div className="flex items-center gap-1 text-orange-900 font-semibold">
                <Flame className="w-3.5 h-3.5 text-orange-600" />
                <span>{isMultiDay ? 'Rata-rata Intake:' : 'Makanan (Intake):'}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="font-extrabold text-orange-700">{consumedCalories} kcal{isMultiDay ? '/hari' : ''}</span>
              {isMultiDay && totalConsumedCalories !== undefined && (
                <div className="text-[10px] text-stone-400 font-medium">Total: {totalConsumedCalories} kcal</div>
              )}
            </div>
          </div>

          {/* Workout Burned */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <div className="flex items-center gap-1 text-emerald-900 font-semibold">
                <Dumbbell className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isMultiDay ? 'Rata-rata Olahraga:' : 'Olahraga (Burned):'}</span>
              </div>
            </div>
            <span className="font-extrabold text-emerald-700">-{burnedCalories} kcal{isMultiDay ? '/hari' : ''}</span>
          </div>

          {/* Micro calculation formula indicator */}
          <p className="text-[10px] text-stone-400 text-center sm:text-left pt-1">
            Rumus: <strong>{targetCalories}</strong> (Target) − <strong>{consumedCalories}</strong> (Intake) + <strong>{burnedCalories}</strong> (Burned) = <strong className={isOverBudget ? 'text-rose-600' : 'text-stone-700'}>{remainingCalories} kcal{isMultiDay ? '/hari' : ''}</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
