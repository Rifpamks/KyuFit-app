"use client";

import React from "react";
import { Egg, Wheat, Droplet, Flame, LucideIcon } from "lucide-react";

export type MacroType = "protein" | "carbs" | "fat" | "burn";

interface MacroMiniRingProps {
  type: MacroType;
  current: number;
  target: number;
  unit?: string;
  label?: string;
  customIcon?: LucideIcon;
}

const MACRO_CONFIG: Record<
  MacroType,
  {
    icon: LucideIcon;
    color: string;
    bgColor: string;
    strokeColor: string;
    defaultLabel: string;
  }
> = {
  protein: {
    icon: Egg,
    color: "text-orange-500",
    bgColor: "bg-orange-50",
    strokeColor: "#f97316", // orange-500
    defaultLabel: "Protein",
  },
  carbs: {
    icon: Wheat,
    color: "text-amber-500",
    bgColor: "bg-amber-50",
    strokeColor: "#f59e0b", // amber-500
    defaultLabel: "Net Carbs",
  },
  fat: {
    icon: Droplet,
    color: "text-purple-500",
    bgColor: "bg-purple-50",
    strokeColor: "#8b5cf6", // purple-500
    defaultLabel: "Fat",
  },
  burn: {
    icon: Flame,
    color: "text-emerald-500",
    bgColor: "bg-emerald-50",
    strokeColor: "#10b981", // emerald-500
    defaultLabel: "Burned",
  },
};

export default function MacroMiniRing({
  type,
  current,
  target,
  unit = "g",
  label,
  customIcon,
}: MacroMiniRingProps) {
  const [animated, setAnimated] = React.useState(false);

  React.useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 40);
    return () => clearTimeout(t);
  }, []);

  const config = MACRO_CONFIG[type];
  const IconComponent = customIcon || config.icon;
  const displayLabel = label || config.defaultLabel;

  // Percentage capped or uncapped
  const percent = target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0;

  // SVG circular progress parameters
  const size = 52;
  const strokeWidth = 4.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const targetOffset = circumference - (percent / 100) * circumference;
  const strokeDashoffset = animated ? targetOffset : circumference;

  return (
    <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white transition hover:bg-stone-50/80">
      {/* Mini Progress Ring with Centered Vector Icon */}
      <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#f5f5f4"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Active Progress Stroke */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={config.strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Vector Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <IconComponent className={`h-4 w-4 ${config.color}`} />
        </div>
      </div>

      {/* Values & Label */}
      <div className="flex flex-col min-w-0">
        <div className="text-xs font-bold text-stone-900 leading-tight">
          <span>{Math.round(current)}</span>
          <span className="text-stone-400 font-medium">/{Math.round(target)}{unit}</span>
        </div>
        <div className="text-[11px] text-stone-500 font-medium capitalize mt-0.5 truncate">
          {displayLabel}
        </div>
      </div>
    </div>
  );
}
