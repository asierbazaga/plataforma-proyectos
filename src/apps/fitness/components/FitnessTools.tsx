import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Dumbbell,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Layers,
  Calculator,
  Flame,
  CheckCircle2,
  Volume2
} from 'lucide-react';

export const FitnessTools: React.FC = () => {
  const [activeTool, setActiveTool] = useState<'1rm' | 'barbell' | 'hiit'>('1rm');

  // 1RM STATE
  const [oneRmWeight, setOneRmWeight] = useState(85);
  const [oneRmReps, setOneRmReps] = useState(6);

  // Epley Formula: Weight * (1 + Reps / 30)
  const estimated1RM = Math.round(oneRmWeight * (1 + oneRmReps / 30));
  const brzycki1RM = Math.round(oneRmWeight * (36 / (37 - oneRmReps)));

  const percentageTable = [
    { pct: 100, reps: '1', weight: estimated1RM },
    { pct: 95, reps: '2', weight: Math.round(estimated1RM * 0.95) },
    { pct: 90, reps: '3-4', weight: Math.round(estimated1RM * 0.9) },
    { pct: 85, reps: '5-6', weight: Math.round(estimated1RM * 0.85) },
    { pct: 80, reps: '7-8', weight: Math.round(estimated1RM * 0.8) },
    { pct: 75, reps: '9-10', weight: Math.round(estimated1RM * 0.75) },
    { pct: 70, reps: '11-12', weight: Math.round(estimated1RM * 0.7) },
    { pct: 65, reps: '15+', weight: Math.round(estimated1RM * 0.65) }
  ];

  // BARBELL PLATE CALCULATOR
  const [targetBarWeight, setTargetBarWeight] = useState(100);
  const [barWeight, setBarWeight] = useState(20); // 20kg olímpica o 15kg técnica

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

    return { weightPerSide, platesUsed, remainingPerSide: remaining };
  };

  const plateResult = calculatePlates(targetBarWeight, barWeight);

  // HIIT / TABATA TIMER
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
      interval = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (isTimerRunning && timeRemaining === 0) {
      // Switch phase
      if (currentPhase === 'work') {
        if (currentRound < totalRounds) {
          setCurrentPhase('rest');
          setTimeRemaining(restSeconds);
        } else {
          // Finished all rounds
          setIsTimerRunning(false);
          setCurrentRound(1);
          setCurrentPhase('work');
          setTimeRemaining(workSeconds);
        }
      } else {
        // Rest finished, start next round work
        setCurrentRound(prev => prev + 1);
        setCurrentPhase('work');
        setTimeRemaining(workSeconds);
      }
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeRemaining, currentPhase, currentRound, totalRounds, workSeconds, restSeconds]);

  const handleStartTimer = () => {
    setIsTimerRunning(true);
  };

  const handlePauseTimer = () => {
    setIsTimerRunning(false);
  };

  const handleResetTimer = () => {
    setIsTimerRunning(false);
    setCurrentRound(1);
    setCurrentPhase('work');
    setTimeRemaining(workSeconds);
  };

  return (
    <div className="space-y-6">
      {/* Sub-header & Tool Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTool('1rm')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
              activeTool === '1rm'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Calculadora 1RM (Fuerza)
          </button>
          <button
            onClick={() => setActiveTool('barbell')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
              activeTool === 'barbell'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Carga de Discos en Barra
          </button>
          <button
            onClick={() => setActiveTool('hiit')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
              activeTool === 'hiit'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Temporizador HIIT / Tabata
          </button>
        </div>
      </div>

      {/* HERRAMIENTA 1: CALCULADORA 1RM */}
      {activeTool === '1rm' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 glass-panel p-6 rounded-2xl space-y-6 bg-slate-900/70">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
                <Dumbbell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Calculadora de 1RM (Repetición Máxima)</h3>
                <p className="text-xs text-slate-400">Estimación basada en las fórmulas de Epley y Brzycki</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400">Peso Levantado (kg)</label>
                <input
                  type="number"
                  step="0.5"
                  value={oneRmWeight}
                  onChange={e => setOneRmWeight(Number(e.target.value))}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-bold text-base focus:border-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Repeticiones Logradas</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={oneRmReps}
                  onChange={e => setOneRmReps(Number(e.target.value))}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-bold text-base focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Hero 1RM Result */}
            <div className="p-5 rounded-2xl bg-gradient-to-tr from-orange-500/20 via-amber-500/10 to-transparent border border-orange-500/30 text-center space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">1RM Estimado</span>
              <div className="text-4xl font-black text-white tracking-tight">
                {estimated1RM} <span className="text-base font-normal text-amber-400">kg</span>
              </div>
              <p className="text-xs text-slate-400">Brzycki: {brzycki1RM} kg • Epley: {estimated1RM} kg</p>
            </div>
          </div>

          <div className="lg:col-span-6 glass-panel p-6 rounded-2xl space-y-4 bg-slate-900/70">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider text-slate-300">
              Tabla de Porcentajes de Carga para Periodización
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">% 1RM</th>
                    <th className="py-2.5 px-3">Carga Sugerida</th>
                    <th className="py-2.5 px-3">Reps Estimadas</th>
                    <th className="py-2.5 px-3">Zona de Trabajo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {percentageTable.map(row => (
                    <tr key={row.pct} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 font-bold text-amber-400">{row.pct}%</td>
                      <td className="py-2.5 px-3 font-bold text-white">{row.weight} kg</td>
                      <td className="py-2.5 px-3 text-slate-300 font-mono">{row.reps} reps</td>
                      <td className="py-2.5 px-3 text-slate-400">
                        {row.pct >= 85 ? 'Fuerza Máxima' : row.pct >= 75 ? 'Hipertrofia Pesada' : 'Volumen & Resistencia'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* HERRAMIENTA 2: CARGA DE DISCOS EN BARRA */}
      {activeTool === 'barbell' && (
        <div className="glass-panel p-6 rounded-2xl space-y-6 bg-slate-900/70 max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Calculadora de Carga de Discos</h3>
              <p className="text-xs text-slate-400">Distribución exacta por cada lado de la barra olímpica</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400">Peso Total Deseado (kg)</label>
              <input
                type="number"
                step="2.5"
                value={targetBarWeight}
                onChange={e => setTargetBarWeight(Number(e.target.value))}
                className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-bold text-base focus:border-orange-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">Peso de la Barra</label>
              <select
                value={barWeight}
                onChange={e => setBarWeight(Number(e.target.value))}
                className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-bold text-base focus:border-orange-500 focus:outline-none"
              >
                <option value={20}>Barra Olímpica Estándar (20 kg)</option>
                <option value={15}>Barra Olímpica Femenina / Técnica (15 kg)</option>
                <option value={10}>Barra Ligera / Z (10 kg)</option>
              </select>
            </div>
          </div>

          {/* Visual Breakdown */}
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <span className="text-xs text-slate-400">Peso por cada lado:</span>
              <span className="text-xl font-bold text-orange-400">{plateResult.weightPerSide} kg / lado</span>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-white">Discos a colocar en CADA LADO de la barra:</p>
              {plateResult.platesUsed.length === 0 ? (
                <p className="text-xs text-slate-500 italic">Solo necesitas la barra vacía ({barWeight} kg).</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {plateResult.platesUsed.map((p, idx) => (
                    <div
                      key={idx}
                      className="px-3 py-2 rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-300 font-bold text-xs flex items-center gap-1.5"
                    >
                      <span>{p.count}x</span>
                      <span className="text-white text-sm">{p.weight} kg</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* HERRAMIENTA 3: TEMPORIZADOR HIIT & TABATA */}
      {activeTool === 'hiit' && (
        <div className="glass-panel p-6 rounded-2xl space-y-6 bg-slate-900/70 max-w-xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <Timer className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h3 className="text-base font-bold text-white">Temporizador HIIT / Tabata / Polar</h3>
              <p className="text-xs text-slate-400">Intervalos de alta intensidad y descansos activos</p>
            </div>
          </div>

          {/* Big Timer Screen */}
          <div
            className={`p-8 rounded-3xl border-2 transition-all duration-300 space-y-2 ${
              currentPhase === 'work'
                ? 'bg-rose-500/15 border-rose-500 shadow-xl shadow-rose-500/10'
                : 'bg-emerald-500/15 border-emerald-500 shadow-xl shadow-emerald-500/10'
            }`}
          >
            <span
              className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                currentPhase === 'work'
                  ? 'bg-rose-500 text-white'
                  : 'bg-emerald-500 text-white'
              }`}
            >
              {currentPhase === 'work' ? '🔥 ¡TRABAJO / INTENSIDAD!' : '💨 DESCANSO ACTIVO'}
            </span>

            <div className="text-6xl font-black text-white font-mono tracking-tighter py-2">
              {timeRemaining}s
            </div>

            <p className="text-xs text-slate-400 font-semibold">
              Ronda <span className="text-white font-bold">{currentRound}</span> de {totalRounds}
            </p>
          </div>

          {/* Controles del Temporizador */}
          <div className="flex items-center justify-center gap-3">
            {!isTimerRunning ? (
              <button
                onClick={handleStartTimer}
                className="px-6 py-3 bg-gradient-to-r from-rose-500 to-orange-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-rose-500/25 flex items-center gap-2 hover:scale-105 transition-all"
              >
                <Play className="w-4 h-4" /> Iniciar Intervalos
              </button>
            ) : (
              <button
                onClick={handlePauseTimer}
                className="px-6 py-3 bg-amber-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-amber-500/25 flex items-center gap-2"
              >
                <Pause className="w-4 h-4" /> Pausar
              </button>
            )}

            <button
              onClick={handleResetTimer}
              className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
              title="Reiniciar"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>

          {/* Ajustes de Intervalos */}
          <div className="grid grid-cols-3 gap-3 text-xs pt-2">
            <div>
              <label className="text-slate-400">Trabajo (s)</label>
              <input
                type="number"
                disabled={isTimerRunning}
                value={workSeconds}
                onChange={e => {
                  const val = Number(e.target.value);
                  setWorkSeconds(val);
                  if (!isTimerRunning && currentPhase === 'work') setTimeRemaining(val);
                }}
                className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-2 py-1.5 text-center text-white font-bold"
              />
            </div>
            <div>
              <label className="text-slate-400">Descanso (s)</label>
              <input
                type="number"
                disabled={isTimerRunning}
                value={restSeconds}
                onChange={e => setRestSeconds(Number(e.target.value))}
                className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-2 py-1.5 text-center text-white font-bold"
              />
            </div>
            <div>
              <label className="text-slate-400">Rondas Totales</label>
              <input
                type="number"
                disabled={isTimerRunning}
                value={totalRounds}
                onChange={e => setTotalRounds(Number(e.target.value))}
                className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-2 py-1.5 text-center text-white font-bold"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
