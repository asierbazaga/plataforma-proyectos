import React from 'react';

interface MacroRingsProps {
  caloriePct: number;
  proteinPct: number;
  carbsPct: number;
  fatPct: number;
  size?: number;
}

export const MacroRings: React.FC<MacroRingsProps> = ({
  caloriePct,
  proteinPct,
  carbsPct,
  fatPct,
  size = 180
}) => {
  const strokeWidth = 10;
  const gap = 4;

  // Ring 1 (Outer - Calories): Orange
  const r1 = (size - strokeWidth) / 2;
  const c1 = 2 * Math.PI * r1;
  const offset1 = c1 - (Math.min(100, caloriePct) / 100) * c1;

  // Ring 2 (Middle - Protein): Rose / Red
  const r2 = r1 - strokeWidth - gap;
  const c2 = 2 * Math.PI * r2;
  const offset2 = c2 - (Math.min(100, proteinPct) / 100) * c2;

  // Ring 3 (Inner - Carbs/Fat balance): Sky Blue
  const r3 = r2 - strokeWidth - gap;
  const c3 = 2 * Math.PI * r3;
  const offset3 = c3 - (Math.min(100, carbsPct) / 100) * c3;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        {/* Background Tracks */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r1}
          fill="none"
          stroke="#261E14"
          strokeWidth={strokeWidth}
          className="opacity-40"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r2}
          fill="none"
          stroke="#2D1518"
          strokeWidth={strokeWidth}
          className="opacity-40"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r3}
          fill="none"
          stroke="#102538"
          strokeWidth={strokeWidth}
          className="opacity-40"
        />

        {/* Animated Progress Rings */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r1}
          fill="none"
          stroke="#FF6B00"
          strokeWidth={strokeWidth}
          strokeDasharray={c1}
          strokeDashoffset={offset1}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r2}
          fill="none"
          stroke="#FF3B30"
          strokeWidth={strokeWidth}
          strokeDasharray={c2}
          strokeDashoffset={offset2}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r3}
          fill="none"
          stroke="#38BDF8"
          strokeWidth={strokeWidth}
          strokeDasharray={c3}
          strokeDashoffset={offset3}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>

      {/* Center Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
        <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Hoy</span>
        <span className="text-2xl font-black text-white tracking-tight">{caloriePct}%</span>
        <span className="text-[10px] font-semibold text-[#FF6B00]">Calorías</span>
      </div>
    </div>
  );
};
