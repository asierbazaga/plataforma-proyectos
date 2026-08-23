import React, { useState, useEffect } from 'react';
import { Dumbbell, Timer, Layers, Play, Pause, RotateCcw } from 'lucide-react';

export const FitnessTools: React.FC = () => {
  const [activeTool, setActiveTool] = useState<'1rm' | 'barbell' | 'hiit'>('1rm');

  // 1RM
  const [oneRmWeight, setOneRmWeight] = useState(85);
  const [oneRmReps, setOneRmReps] = useState(6);
  const estimated1RM = Math.round(oneRmWeight * (1 + oneRmReps / 30));

  const percentageTable = [
    { pct: 100, reps: '1', weight: estimated1RM },
    { pct: 95, reps: '2', weight: Math.round(estimated1RM * 0.95) },
    { pct: 90, reps: '3-4', weight: Math.round(estimated1RM * 0.9) },
    { pct: 85, reps: '5-6', weight: Math.round(estimated1RM * 0.85) },
    { pct: 80, reps: '7-8', weight: Math.round(estimated1RM * 0.8) },
    { pct: 75, reps: '9-10', weight: Math.round(estimated1RM * 0.75) },
    { pct: 70, reps: '11-12', weight: Math.round(estimated1RM * 0.7) }
  ];

  // Discos
  const [targetBarWeight, setTargetBarWeight] = useState(100);
  const [barWeight, setBarWeight] = useState(20);

  const calculatePlates = (target: number, bar: number) => {
    const weightPerSide = Math.max(0, (target - bar) / 2);
    const availablePlates = [25, 20, 15, 10, 5, 2.5, 1.25];
    const platesUsed: { weight: number; count: number }[] = [];
    let remaining = weightPerSide;
    for (const plate of availablePlates) {
      if (remaining >= plate) {
        const count = Math.floor(remaining / plate);
        platesUsed.push({ weight: plate, count });
        remaining -= count * plate;
      }
    }
    return { weightPerSide, platesUsed };
  };

  const plateResult = calculatePlates(targetBarWeight, barWeight);

  // HIIT
  const [workSeconds, setWorkSeconds] = useState(30);
  const [restSeconds, setRestSeconds] = useState(15);
  const [totalRounds, setTotalRounds] = useState(8);
  const [currentRound, setCurrentRound] = useState(1);
  const [currentPhase, setCurrentPhase] = useState<'work' | 'rest'>('work');
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timeRemaining > 0) {
      interval = setInterval(() => setTimeRemaining(prev => prev - 1), 1000);
    } else if (isTimerRunning && timeRemaining === 0) {
      if (currentPhase === 'work') {
        if (currentRound < totalRounds) {
          setCurrentPhase('rest');
          setTimeRemaining(restSeconds);
        } else {
          setIsTimerRunning(false);
          setCurrentRound(1);
          setCurrentPhase('work');
          setTimeRemaining(workSeconds);
        }
      } else {
        setCurrentRound(prev => prev + 1);
        setCurrentPhase('work');
        setTimeRemaining(workSeconds);
      }
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeRemaining, currentPhase, currentRound, totalRounds, workSeconds, restSeconds]);

  return (
    <div className="space-y-7 max-w-4xl mx-auto">
      {/* Selector */}
      <div className="flex items-center gap-2 bg-[#111622] p-1.5 rounded-2xl border border-white/5 text-xs w-fit">
        <button
          onClick={() => setActiveTool('1rm')}
          className={`px-4 py-2 rounded-xl font-bold transition-all ${
            activeTool === '1rm' ? 'bg-[#FF6B00] text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          Calculadora 1RM
        </button>
        <button
          onClick={() => setActiveTool('barbell')}
          className={`px-4 py-2 rounded-xl font-bold transition-all ${
            activeTool === 'barbell' ? 'bg-[#FF6B00] text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          Discos en Barra
        </button>
        <button
          onClick={() => setActiveTool('hiit')}
          className={`px-4 py-2 rounded-xl font-bold transition-all ${
            activeTool === 'hiit' ? 'bg-[#FF6B00] text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          Temporizador HIIT
        </button>
      </div>

      {activeTool === '1rm' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-7 rounded-3xl bg-[#111622] border border-white/5 space-y-5 shadow-xl">
            <h4 className="text-sm font-bold text-white">Calculadora 1RM (Fuerza)</h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-400">Peso Levantado (kg)</label>
                <input
                  type="number"
                  step="0.5"
                  value={oneRmWeight}
                  onChange={e => setOneRmWeight(Number(e.target.value))}
                  className="w-full mt-1 bg-[#090C15] border border-white/5 rounded-xl px-3 py-2 text-white font-bold"
                />
              </div>
              <div>
                <label className="text-slate-400">Repeticiones</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={oneRmReps}
                  onChange={e => setOneRmReps(Number(e.target.value))}
                  className="w-full mt-1 bg-[#090C15] border border-white/5 rounded-xl px-3 py-2 text-white font-bold"
                />
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#090C15] border border-white/5 text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500">1RM Estimado</span>
              <div className="text-4xl font-black text-[#FF6B00] font-mono">{estimated1RM} kg</div>
            </div>
          </div>

          <div className="p-7 rounded-3xl bg-[#111622] border border-white/5 space-y-3 shadow-xl">
            <h4 className="text-sm font-bold text-white">Porcentajes de Entrenamiento</h4>
            <div className="space-y-1.5 text-xs font-mono">
              {percentageTable.map(r => (
                <div key={r.pct} className="flex justify-between py-1.5 px-3 rounded-xl bg-[#090C15]">
                  <span className="text-[#FF6B00] font-bold">{r.pct}%</span>
                  <span className="text-white">{r.weight} kg</span>
                  <span className="text-slate-400">{r.reps} reps</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTool === 'barbell' && (
        <div className="p-7 rounded-3xl bg-[#111622] border border-white/5 space-y-6 shadow-xl max-w-lg mx-auto">
          <h4 className="text-sm font-bold text-white">Discos por Lado</h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-slate-400">Peso Total (kg)</label>
              <input
                type="number"
                step="2.5"
                value={targetBarWeight}
                onChange={e => setTargetBarWeight(Number(e.target.value))}
                className="w-full mt-1 bg-[#090C15] border border-white/5 rounded-xl px-3 py-2 text-white font-bold"
              />
            </div>
            <div>
              <label className="text-slate-400">Peso de Barra</label>
              <select
                value={barWeight}
                onChange={e => setBarWeight(Number(e.target.value))}
                className="w-full mt-1 bg-[#090C15] border border-white/5 rounded-xl px-3 py-2 text-white"
              >
                <option value={20}>20 kg (Olímpica)</option>
                <option value={15}>15 kg</option>
                <option value={10}>10 kg</option>
              </select>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#090C15] border border-white/5 space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-slate-400">Por lado:</span>
              <span className="text-2xl font-black text-[#FF6B00] font-mono">{plateResult.weightPerSide} kg</span>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {plateResult.platesUsed.map((p, idx) => (
                <span key={idx} className="px-3 py-1.5 rounded-xl bg-white/5 text-white text-xs font-bold font-mono">
                  {p.count}x {p.weight}kg
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTool === 'hiit' && (
        <div className="p-8 rounded-3xl bg-[#111622] border border-white/5 space-y-6 shadow-xl max-w-md mx-auto text-center">
          <div className="space-y-2">
            <span className={`text-xs font-black uppercase px-3 py-1 rounded-full ${
              currentPhase === 'work' ? 'bg-[#FF3B30] text-white' : 'bg-[#30D158] text-black font-bold'
            }`}>
              {currentPhase === 'work' ? '🔥 TRABAJO' : '💨 DESCANSO'}
            </span>
            <div className="text-7xl font-black text-white font-mono">{timeRemaining}s</div>
            <p className="text-xs text-slate-400 font-bold">Ronda {currentRound} de {totalRounds}</p>
          </div>

          <div className="flex justify-center gap-3">
            {!isTimerRunning ? (
              <button
                onClick={() => setIsTimerRunning(true)}
                className="px-6 py-2.5 bg-[#FF6B00] text-white font-bold text-xs rounded-xl"
              >
                <Play className="w-4 h-4 inline mr-1" /> Iniciar
              </button>
            ) : (
              <button
                onClick={() => setIsTimerRunning(false)}
                className="px-6 py-2.5 bg-amber-500 text-white font-bold text-xs rounded-xl"
              >
                <Pause className="w-4 h-4 inline mr-1" /> Pausar
              </button>
            )}
            <button
              onClick={() => {
                setIsTimerRunning(false);
                setCurrentRound(1);
                setCurrentPhase('work');
                setTimeRemaining(workSeconds);
              }}
              className="p-2.5 bg-white/10 text-white rounded-xl"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
