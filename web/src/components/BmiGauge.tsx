'use client';

import React from 'react';
import { Scale, Heart, Sparkles } from 'lucide-react';

interface BmiGaugeProps {
  weightKg: number;
  heightCm?: number | null;
}

export default function BmiGauge({ weightKg, heightCm }: BmiGaugeProps) {
  if (!weightKg || !heightCm || heightCm <= 0) {
    return null;
  }

  const heightM = heightCm / 100;
  const bmi = Number((weightKg / (heightM * heightM)).toFixed(1));

  // Ideal weight range based on BMI 18.5 - 24.9
  const minIdealWeight = Number((18.5 * heightM * heightM).toFixed(1));
  const maxIdealWeight = Number((24.9 * heightM * heightM).toFixed(1));

  // Category determination
  let category = 'Normal';
  let badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let tipText = 'Pertahankan pola makan bergizi seimbang dan latihan teratur.';

  if (bmi < 18.5) {
    category = 'Underweight';
    badgeColor = 'bg-sky-50 text-sky-700 border-sky-200';
    tipText = 'Disarankan meningkatkan asupan nutrisi padat energi & latihan kekuatan otot.';
  } else if (bmi >= 25 && bmi < 30) {
    category = 'Overweight';
    badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
    tipText = 'Defisit kalori moderat (15-20%) dengan latihan angkat beban akan membakar lemak optimal.';
  } else if (bmi >= 30) {
    category = 'Obesitas';
    badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
    tipText = 'Prioritaskan konsistensi defisit kalori harian dan kardio ringan berkelanjutan.';
  }

  // Calculate gauge needle position (15 to 35 BMI range)
  const minRange = 15;
  const maxRange = 35;
  const clampedBmi = Math.min(maxRange, Math.max(minRange, bmi));
  const pointerPercent = ((clampedBmi - minRange) / (maxRange - minRange)) * 100;

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Scale className="h-4 w-4 text-orange-500" />
          <h3 className="text-xs uppercase font-bold text-stone-400 tracking-wider">
            Indeks Massa Tubuh (BMI)
          </h3>
        </div>
        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${badgeColor}`}>
          {bmi} — {category}
        </span>
      </div>

      {/* Progress Bar with 4 Color Segments */}
      <div className="relative pt-3 pb-1">
        {/* Needle / Pointer */}
        <div
          className="absolute top-0 transition-all duration-700 ease-out flex flex-col items-center -translate-x-1/2"
          style={{ left: `${pointerPercent}%` }}
        >
          <div className="w-2.5 h-2.5 bg-stone-900 rotate-45 rounded-xs shadow-xs" />
          <div className="w-0.5 h-1.5 bg-stone-900" />
        </div>

        {/* 4 Multi-color segments */}
        <div className="h-2.5 w-full rounded-full overflow-hidden flex shadow-inner">
          <div className="bg-sky-400 h-full" style={{ width: '17.5%' }} title="Underweight (<18.5)" />
          <div className="bg-emerald-500 h-full" style={{ width: '32%' }} title="Normal (18.5 - 24.9)" />
          <div className="bg-amber-400 h-full" style={{ width: '25%' }} title="Overweight (25 - 29.9)" />
          <div className="bg-rose-500 h-full" style={{ width: '25.5%' }} title="Obesitas (>=30)" />
        </div>

        {/* Scale Numbers */}
        <div className="flex justify-between text-[10px] text-stone-400 font-semibold mt-1.5 px-0.5">
          <span>15</span>
          <span>18.5</span>
          <span>25</span>
          <span>30</span>
          <span>35+</span>
        </div>
      </div>

      {/* Summary Box & Ideal Weight Range */}
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-stone-100 text-xs">
        <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
          <div className="text-[10px] text-stone-400 font-semibold">Rentang Berat Ideal (BMI Normal)</div>
          <div className="text-sm font-black text-stone-800 mt-0.5">
            {minIdealWeight} - {maxIdealWeight} <span className="text-[10px] font-normal text-stone-500">kg</span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
          <div className="text-[10px] text-stone-400 font-semibold">Tinggi Badan Pengguna</div>
          <div className="text-sm font-black text-stone-800 mt-0.5">
            {heightCm} <span className="text-[10px] font-normal text-stone-500">cm</span>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-stone-500 leading-relaxed pt-0.5 flex items-start gap-1.5">
        <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
        <span><strong>Saran KyuFit:</strong> {tipText}</span>
      </p>
    </div>
  );
}
