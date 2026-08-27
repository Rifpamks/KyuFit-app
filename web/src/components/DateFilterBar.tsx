'use client';

import React from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

export type FilterMode = 'daily' | 'monthly' | 'yearly' | 'custom';

export interface DateFilterState {
  mode: FilterMode;
  date: string; // YYYY-MM-DD
  month: string; // YYYY-MM
  year: string; // YYYY
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

interface DateFilterBarProps {
  filter: DateFilterState;
  onChange: (newFilter: DateFilterState) => void;
}

export default function DateFilterBar({ filter, onChange }: DateFilterBarProps) {
  // Helper to get 5 recent days (today and 4 days prior)
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

  const getTodayString = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const localDate = new Date(now.getTime() - offset * 60 * 1000);
    return localDate.toISOString().split('T')[0];
  };

  const currentYear = new Date().getFullYear();
  const yearsList = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1];

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-3 shadow-xs space-y-3 mb-4">
      {/* Top Header: Filter Mode Selection Tabs */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center bg-stone-100 p-1 rounded-xl gap-1" role="tablist" aria-label="Date filter mode">
          <button
            type="button"
            role="tab"
            aria-selected={filter.mode === 'daily'}
            onClick={() => onChange({ ...filter, mode: 'daily' })}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filter.mode === 'daily'
                ? 'bg-white text-orange-600 shadow-xs font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Harian
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={filter.mode === 'monthly'}
            onClick={() => onChange({ ...filter, mode: 'monthly' })}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filter.mode === 'monthly'
                ? 'bg-white text-orange-600 shadow-xs font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Bulanan
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={filter.mode === 'yearly'}
            onClick={() => onChange({ ...filter, mode: 'yearly' })}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filter.mode === 'yearly'
                ? 'bg-white text-orange-600 shadow-xs font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Tahunan
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={filter.mode === 'custom'}
            onClick={() => onChange({ ...filter, mode: 'custom' })}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filter.mode === 'custom'
                ? 'bg-white text-orange-600 shadow-xs font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Rentang
          </button>
        </div>

        {/* Calendar Picker for Backdate / Direct Date Selection */}
        {filter.mode === 'daily' && (
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-stone-400 font-medium hidden sm:inline">Pilih Tanggal:</span>
            <div className="relative flex items-center">
              <input
                type="date"
                value={filter.date}
                onChange={(e) => onChange({ ...filter, date: e.target.value })}
                aria-label="Pilih Tanggal Backdate"
                className="bg-stone-50 border border-stone-200 text-stone-800 text-xs font-semibold px-2.5 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>
          </div>
        )}
      </div>

      {/* Mode-Specific Content Area */}

      {/* HARIAN MODE: 5-Day Quick Selector Strip */}
      {filter.mode === 'daily' && (
        <div className="grid grid-cols-5 gap-1.5 text-center pt-1 border-t border-stone-100">
          {getDaysList().map((day) => {
            const dayStr = day.toISOString().split('T')[0];
            const isSelected = dayStr === filter.date;
            const dayNum = day.getDate();
            const dayAbbr = day.toLocaleDateString('id-ID', { weekday: 'short' });
            const isToday = dayStr === getTodayString();

            return (
              <button
                key={dayStr}
                type="button"
                onClick={() => onChange({ ...filter, date: dayStr })}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all ${
                  isSelected
                    ? 'bg-orange-500 text-white font-bold shadow-md shadow-orange-500/20'
                    : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
                }`}
              >
                <span className={`text-[10px] uppercase ${isSelected ? 'text-orange-100' : 'text-stone-400'}`}>
                  {dayAbbr}
                </span>
                <span className="text-base font-extrabold mt-0.5">{dayNum}</span>
                {isToday && !isSelected && (
                  <span className="h-1 w-1 rounded-full bg-orange-500 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* BULANAN MODE */}
      {filter.mode === 'monthly' && (
        <div className="flex items-center justify-between pt-2 border-t border-stone-100">
          <span className="text-xs text-stone-600 font-bold">Pilih Bulan & Tahun:</span>
          <input
            type="month"
            value={filter.month}
            onChange={(e) => onChange({ ...filter, month: e.target.value })}
            aria-label="Pilih Bulan"
            className="bg-stone-50 border border-stone-200 text-stone-800 text-xs font-semibold px-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>
      )}

      {/* TAHUNAN MODE */}
      {filter.mode === 'yearly' && (
        <div className="flex items-center justify-between pt-2 border-t border-stone-100">
          <span className="text-xs text-stone-600 font-bold">Pilih Tahun:</span>
          <select
            value={filter.year}
            onChange={(e) => onChange({ ...filter, year: e.target.value })}
            aria-label="Pilih Tahun"
            className="bg-stone-50 border border-stone-200 text-stone-800 text-xs font-semibold px-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
          >
            {yearsList.map((y) => (
              <option key={y} value={y.toString()}>
                {y}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* RENTANG TANGGAL MODE */}
      {filter.mode === 'custom' && (
        <div className="flex items-center justify-between gap-2 flex-wrap pt-2 border-t border-stone-100">
          <span className="text-xs text-stone-600 font-bold">Rentang Tanggal:</span>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={filter.startDate}
              onChange={(e) => onChange({ ...filter, startDate: e.target.value })}
              aria-label="Tanggal Mulai"
              className="bg-stone-50 border border-stone-200 text-stone-800 text-xs font-semibold px-2.5 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
            <span className="text-xs text-stone-400">s/d</span>
            <input
              type="date"
              value={filter.endDate}
              onChange={(e) => onChange({ ...filter, endDate: e.target.value })}
              aria-label="Tanggal Akhir"
              className="bg-stone-50 border border-stone-200 text-stone-800 text-xs font-semibold px-2.5 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>
        </div>
      )}
    </div>
  );
}
