'use client';

import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

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
  const [isOpen, setIsOpen] = useState(false);

  // Helper date manipulators
  const handlePrevDay = () => {
    const d = new Date(filter.date);
    d.setDate(d.getDate() - 1);
    const newDate = d.toISOString().split('T')[0];
    onChange({ ...filter, date: newDate });
  };

  const handleNextDay = () => {
    const d = new Date(filter.date);
    d.setDate(d.getDate() + 1);
    const newDate = d.toISOString().split('T')[0];
    onChange({ ...filter, date: newDate });
  };

  const currentYear = new Date().getFullYear();
  const yearsList = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1];

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-3 shadow-xs mb-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Mode Tabs */}
        <div className="flex items-center bg-stone-100 p-1 rounded-xl gap-1" role="tablist" aria-label="Date filter mode">
          <button
            role="tab"
            aria-selected={filter.mode === 'daily'}
            onClick={() => onChange({ ...filter, mode: 'daily' })}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filter.mode === 'daily'
                ? 'bg-white text-orange-600 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Harian
          </button>

          <button
            role="tab"
            aria-selected={filter.mode === 'monthly'}
            onClick={() => onChange({ ...filter, mode: 'monthly' })}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filter.mode === 'monthly'
                ? 'bg-white text-orange-600 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Bulanan
          </button>

          <button
            role="tab"
            aria-selected={filter.mode === 'yearly'}
            onClick={() => onChange({ ...filter, mode: 'yearly' })}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filter.mode === 'yearly'
                ? 'bg-white text-orange-600 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Tahunan
          </button>

          <button
            role="tab"
            aria-selected={filter.mode === 'custom'}
            onClick={() => onChange({ ...filter, mode: 'custom' })}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filter.mode === 'custom'
                ? 'bg-white text-orange-600 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Rentang
          </button>
        </div>

        {/* Inputs depending on Mode */}
        <div className="flex items-center gap-2">
          {filter.mode === 'daily' && (
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevDay}
                aria-label="Hari Sebelumnya"
                className="p-1.5 text-stone-600 hover:bg-stone-100 rounded-lg transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="relative">
                <input
                  type="date"
                  value={filter.date}
                  onChange={(e) => onChange({ ...filter, date: e.target.value })}
                  aria-label="Pilih Tanggal Harian"
                  className="bg-stone-50 border border-stone-200 text-stone-800 text-xs font-semibold px-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
              </div>
              <button
                onClick={handleNextDay}
                aria-label="Hari Berikutnya"
                className="p-1.5 text-stone-600 hover:bg-stone-100 rounded-lg transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {filter.mode === 'monthly' && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500 font-medium">Bulan:</span>
              <input
                type="month"
                value={filter.month}
                onChange={(e) => onChange({ ...filter, month: e.target.value })}
                aria-label="Pilih Bulan"
                className="bg-stone-50 border border-stone-200 text-stone-800 text-xs font-semibold px-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>
          )}

          {filter.mode === 'yearly' && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500 font-medium">Tahun:</span>
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

          {filter.mode === 'custom' && (
            <div className="flex items-center gap-2 flex-wrap">
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
          )}
        </div>
      </div>
    </div>
  );
}
