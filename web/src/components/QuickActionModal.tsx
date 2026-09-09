"use client";

import React from "react";
import { Utensils, Dumbbell, Scale, MessageSquare, X, ChevronRight } from "lucide-react";

interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (action: "food" | "workout" | "weight" | "whatsapp") => void;
  botWhatsAppNumber?: string;
}

export default function QuickActionModal({
  isOpen,
  onClose,
  onSelectAction,
  botWhatsAppNumber = "6285139362618",
}: QuickActionModalProps) {
  if (!isOpen) return null;

  const actions = [
    {
      id: "food" as const,
      title: "Catat Makanan",
      description: "Input manual kalori dan makronutrisi harian",
      icon: Utensils,
      color: "bg-amber-50 text-amber-600 border-amber-100/80",
      iconColor: "text-amber-600",
    },
    {
      id: "workout" as const,
      title: "Catat Olahraga",
      description: "Catat aktivitas fisik dan kalori terbakar",
      icon: Dumbbell,
      color: "bg-emerald-50 text-emerald-700 border-emerald-100/80",
      iconColor: "text-emerald-700",
    },
    {
      id: "weight" as const,
      title: "Catat Timbangan",
      description: "Update berat badan terkini & pantau tren",
      icon: Scale,
      color: "bg-stone-50 text-stone-700 border-stone-200/80",
      iconColor: "text-stone-700",
    },
    {
      id: "whatsapp" as const,
      title: "Kirim Foto ke KyuBot",
      description: "Kirim foto piring via WhatsApp untuk auto-log",
      icon: MessageSquare,
      color: "bg-emerald-600 text-white border-emerald-600 shadow-xs",
      iconColor: "text-white",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      {/* Backdrop overlay dismiss */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Bottom Sheet Container */}
      <div className="relative z-10 w-full max-w-lg bg-white rounded-t-3xl p-6 shadow-2xl border-t border-stone-200 animate-in slide-in-from-bottom-6 duration-200">
        {/* Handle Bar */}
        <div className="mx-auto w-12 h-1.5 rounded-full bg-stone-200 mb-4" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
          <div>
            <h3 className="text-base font-bold text-stone-900">Tambah Catatan Cepat</h3>
            <p className="text-xs text-stone-500 font-medium">Pilih aktivitas yang ingin kamu catat hari ini</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Action Buttons List */}
        <div className="space-y-2.5">
          {actions.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectAction(item.id);
                  onClose();
                }}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-stone-100 hover:border-emerald-200 hover:bg-emerald-50/40 transition text-left group active:scale-[0.99]"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`p-3 rounded-2xl border ${item.color} shrink-0`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-stone-900 group-hover:text-emerald-800 transition">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-stone-500 font-medium mt-0.5">
                      {item.description}
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-stone-300 group-hover:text-stone-600 group-hover:translate-x-0.5 transition" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
