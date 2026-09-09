import React from "react";

export type KyuMascotMood = "header" | "happy" | "active" | "hungry" | "neutral";

interface KyuMascotProps {
  mood?: KyuMascotMood;
  className?: string;
  size?: number;
}

/**
 * Kyu the Cat — Maskot Vektor Orisinal KyuFit
 * Desain geometris minimalis modern, ramah, dan bebas emoji mentah.
 */
export default function KyuMascot({ mood = "neutral", className = "", size }: KyuMascotProps) {
  // Versi Header: Khusus logo kecil di navbar (sleek, badge terintegrasi)
  if (mood === "header") {
    const s = size || 32;
    return (
      <div 
        style={{ width: s, height: s }} 
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-emerald-700 to-emerald-900 shadow-xs border border-emerald-600/30 group cursor-pointer transition-transform duration-200 active:scale-95 ${className}`}
        title="Kyu — Maskot Kebugaran KyuFit"
      >
        <svg
          viewBox="0 0 32 32"
          width={s - 8}
          height={s - 8}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-300 group-hover:scale-105"
        >
          {/* Telinga Kiri & Kanan */}
          <polygon points="6,15 10,5 14,13" fill="#F59E0B" />
          <polygon points="8,13 10,7 12,12" fill="#FEF3C7" />
          
          <polygon points="18,13 22,5 26,15" fill="#F59E0B" />
          <polygon points="20,12 22,7 24,13" fill="#FEF3C7" />

          {/* Kepala Kucing (Rounded Oval/Hexagon) */}
          <rect x="6" y="10" width="20" height="17" rx="8" fill="#FDE68A" />

          {/* Mata Minimalis */}
          <circle cx="11" cy="17" r="1.5" fill="#064E3B" />
          <circle cx="21" cy="17" r="1.5" fill="#064E3B" />
          {/* Kilau mata */}
          <circle cx="11.5" cy="16.5" r="0.5" fill="#FFFFFF" />
          <circle cx="21.5" cy="16.5" r="0.5" fill="#FFFFFF" />

          {/* Hidung & Mulut Kucing */}
          <polygon points="15.2,19.5 16.8,19.5 16,20.4" fill="#F97316" />
          <path
            d="M14.5 21.2 C15.2 22 16 22 16 21.2 C16 22 16.8 22 17.5 21.2"
            stroke="#064E3B"
            strokeWidth="0.8"
            strokeLinecap="round"
          />

          {/* Pipis Merona Lembut */}
          <circle cx="9" cy="19.5" r="1.2" fill="#F87171" opacity="0.6" />
          <circle cx="23" cy="19.5" r="1.2" fill="#F87171" opacity="0.6" />
        </svg>
      </div>
    );
  }

  // Versi Mood Standar (Untuk Empty State, Banner Prestasi, atau Feedback Interaktif)
  const defaultSize = size || 88;

  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 100 100"
        width={defaultSize}
        height={defaultSize}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="animate-in zoom-in-90 duration-300 drop-shadow-sm"
      >
        {/* Glow / Lingkaran Latar Lembut */}
        <circle cx="50" cy="50" r="46" fill="#F4FBF7" stroke="#D1FAE5" strokeWidth="2" strokeDasharray="4 4" />

        {/* Telinga Kiri */}
        <polygon points="24,46 34,20 44,40" fill="#F59E0B" />
        <polygon points="28,42 34,26 40,38" fill="#FEF3C7" />

        {/* Telinga Kanan */}
        <polygon points="56,40 66,20 76,46" fill="#F59E0B" />
        <polygon points="60,38 66,26 72,42" fill="#FEF3C7" />

        {/* Kepala Kucing */}
        <rect x="22" y="32" width="56" height="46" rx="23" fill="#FDE68A" />

        {/* Pipi Merona */}
        <ellipse cx="31" cy="58" rx="4" ry="2.5" fill="#FCA5A5" opacity="0.7" />
        <ellipse cx="69" cy="58" rx="4" ry="2.5" fill="#FCA5A5" opacity="0.7" />

        {/* Hidung */}
        <polygon points="48,56 52,56 50,58.5" fill="#EA580C" />

        {/* Kumis Minimalis */}
        <line x1="20" y1="53" x2="13" y2="51" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        <line x1="20" y1="57" x2="13" y2="58" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        <line x1="80" y1="53" x2="87" y2="51" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        <line x1="80" y1="57" x2="87" y2="58" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />

        {/* Ekspresi Mata & Mulut Berdasarkan Mood */}
        {mood === "happy" && (
          <>
            {/* Mata Melengkung Senang (^_^) */}
            <path d="M33 50 Q39 43 44 50" stroke="#064E3B" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M56 50 Q61 43 67 50" stroke="#064E3B" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            {/* Mulut Senyum Lebar Terbuka */}
            <path d="M46 60 Q50 67 54 60" fill="#EF4444" stroke="#064E3B" strokeWidth="1.5" strokeLinecap="round" />
            {/* Efek Bintang/Sparkle Kecil */}
            <path d="M78 28 L80 32 L84 34 L80 36 L78 40 L76 36 L72 34 L76 32 Z" fill="#F59E0B" />
          </>
        )}

        {mood === "hungry" && (
          <>
            {/* Mata Penasaran / Berharap Bulat Besar */}
            <circle cx="38" cy="49" r="4.5" fill="#064E3B" />
            <circle cx="62" cy="49" r="4.5" fill="#064E3B" />
            <circle cx="39.5" cy="47.5" r="1.5" fill="#FFFFFF" />
            <circle cx="63.5" cy="47.5" r="1.5" fill="#FFFFFF" />
            {/* Mulut :3 */}
            <path d="M45 60 Q47.5 63 50 60 Q52.5 63 55 60" stroke="#064E3B" strokeWidth="2" strokeLinecap="round" fill="none" />
            {/* Garis mangkuk kecil */}
            <path d="M40 73 Q50 80 60 73" stroke="#10B981" strokeWidth="2" strokeLinecap="round" fill="none" />
          </>
        )}

        {mood === "active" && (
          <>
            {/* Ikat Kepala Gym / Sweatband Oranye */}
            <rect x="23" y="36" width="54" height="6" rx="3" fill="#F97316" />
            {/* Mata Fokus / Penuh Semangat */}
            <circle cx="38" cy="50" r="3.5" fill="#064E3B" />
            <circle cx="62" cy="50" r="3.5" fill="#064E3B" />
            <circle cx="39" cy="49" r="1" fill="#FFFFFF" />
            <circle cx="63" cy="49" r="1" fill="#FFFFFF" />
            {/* Mulut Tegas */}
            <path d="M46 61 Q50 64 54 61" stroke="#064E3B" strokeWidth="2" strokeLinecap="round" fill="none" />
          </>
        )}

        {mood === "neutral" && (
          <>
            {/* Mata Ramah Bersahabat */}
            <circle cx="38" cy="49" r="3.5" fill="#064E3B" />
            <circle cx="62" cy="49" r="3.5" fill="#064E3B" />
            <circle cx="39.5" cy="48" r="1.2" fill="#FFFFFF" />
            <circle cx="63.5" cy="48" r="1.2" fill="#FFFFFF" />
            {/* Mulut Kucing Santai */}
            <path d="M46 60 Q48 62.5 50 60 Q52 62.5 54 60" stroke="#064E3B" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          </>
        )}
      </svg>
    </div>
  );
}
