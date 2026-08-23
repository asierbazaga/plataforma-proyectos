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

  // Ring 1 (Outer - Calories): #FF6B00
  const r1 = (size - strokeWidth) / 2;
  const c1 = 2 * Math.PI * r1;
  const offset1 = c1 - (Math.min(100, Math.max(0, caloriePct)) / 100) * c1;

  // Ring 2 (Middle - Protein): #FF3B30
  const r2 = r1 - strokeWidth - gap;
  const c2 = 2 * Math.PI * r2;
  const offset2 = c2 - (Math.min(100, Math.max(0, proteinPct)) / 100) * c2;

  // Ring 3 (Inner - Carbs): #38BDF8
  const r3 = r2 - strokeWidth - gap;
  const c3 = 2 * Math.PI * r3;
  const offset3 = c3 - (Math.min(100, Math.max(0, carbsPct)) / 100) * c3;

  return (
    <div className="relative flex items-center justify-center select-none" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        <defs>
          <filter id="glow-orange" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#FF6B00" floodOpacity="0.4" />
          </filter>
          <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#FF3B30" floodOpacity="0.4" />
          </filter>
          <filter id="glow-blue" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#38BDF8" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* Background Tracks */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r1}
          fill="none"
          stroke="#FF6B00"
          strokeWidth={strokeWidth}
          className="opacity-15"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r2}
          fill="none"
          stroke="#FF3B30"
          strokeWidth={strokeWidth}
          className="opacity-15"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r3}
          fill="none"
          stroke="#38BDF8"
          strokeWidth={strokeWidth}
          className="opacity-15"
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
          filter="url(#glow-orange)"
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
          filter="url(#glow-red)"
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
          filter="url(#glow-blue)"
          className="transition-all duration-700 ease-out"
        />
      </svg>

      {/* Center Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">KCAL</span>
        <span className="text-2xl font-black text-white tracking-tight font-mono">{caloriePct}%</span>
        <div className="flex items-center gap-1 mt-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00]" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B30]" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]" />
        </div>
      </div>
    </div>
  );
};
