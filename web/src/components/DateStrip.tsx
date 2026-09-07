"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DateStripProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
}

const DAY_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export default function DateStrip({ selectedDate, onSelectDate }: DateStripProps) {
  // Center week offset based on selectedDate
  const [weekOffset, setWeekOffset] = useState(0);

  // Helper to format Date to YYYY-MM-DD in local time
  const formatDateStr = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const todayStr = formatDateStr(new Date());

  // Generate 7 days for the current week window
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() + weekOffset * 7);

  // Get Sunday (or Monday) as week start
  const currentDayOfWeek = baseDate.getDay(); // 0 = Sun, 1 = Mon ...
  const startOfWeek = new Date(baseDate);
  // Start on Monday (or Sunday if currentDayOfWeek is 0)
  const diffToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
  startOfWeek.setDate(baseDate.getDate() + diffToMonday);

  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    const dateStr = formatDateStr(d);
    return {
      dateStr,
      dayName: DAY_NAMES[d.getDay()],
      dayNum: d.getDate(),
      isToday: dateStr === todayStr,
      isSelected: dateStr === selectedDate,
    };
  });

  return (
    <div className="flex items-center justify-between gap-1 py-2 px-1">
      <button
        type="button"
        onClick={() => setWeekOffset((prev) => prev - 1)}
        className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition active:scale-90"
        title="Minggu Sebelumnya"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <div className="flex-1 grid grid-cols-7 gap-1.5 text-center">
        {days.map((item) => (
          <button
            key={item.dateStr}
            type="button"
            onClick={() => onSelectDate(item.dateStr)}
            className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl transition-all select-none active:scale-95 ${
              item.isSelected
                ? "bg-orange-500 text-white font-bold shadow-sm ring-2 ring-orange-200"
                : item.isToday
                ? "bg-orange-50 text-orange-700 font-semibold border border-orange-200"
                : "bg-transparent text-stone-500 hover:bg-stone-100"
            }`}
          >
            <span
              className={`text-[10px] tracking-wider uppercase ${
                item.isSelected ? "text-orange-100" : "text-stone-400"
              }`}
            >
              {item.dayName}
            </span>
            <span
              className={`text-sm mt-0.5 ${
                item.isSelected ? "font-black text-white" : "font-bold text-stone-800"
              }`}
            >
              {item.dayNum}
            </span>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setWeekOffset((prev) => prev + 1)}
        className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition active:scale-90"
        title="Minggu Berikutnya"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
