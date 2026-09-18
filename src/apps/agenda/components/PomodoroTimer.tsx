import React, { useState, useEffect } from 'react';
import { Timer, Play, Pause, RotateCcw, Coffee } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

export const PomodoroTimer: React.FC = () => {
  const { isDark } = useTheme();
  
  const POMODORO_MINUTES = 25;
  const BREAK_MINUTES = 5;
  
  const [timeLeft, setTimeLeft] = useState(POMODORO_MINUTES * 60);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Switch modes when timer hits 0
      setIsActive(false);
      if (!isBreak) {
        setIsBreak(true);
        setTimeLeft(BREAK_MINUTES * 60);
      } else {
        setIsBreak(false);
        setTimeLeft(POMODORO_MINUTES * 60);
      }
      
      // Play a sound or notification here ideally
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, isBreak]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(isBreak ? BREAK_MINUTES * 60 : POMODORO_MINUTES * 60);
  };
  
  const switchMode = (breakMode: boolean) => {
    setIsActive(false);
    setIsBreak(breakMode);
    setTimeLeft(breakMode ? BREAK_MINUTES * 60 : POMODORO_MINUTES * 60);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPct = isBreak 
    ? ((BREAK_MINUTES * 60 - timeLeft) / (BREAK_MINUTES * 60)) * 100
    : ((POMODORO_MINUTES * 60 - timeLeft) / (POMODORO_MINUTES * 60)) * 100;

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          {isBreak ? (
            <><Coffee className="w-6 h-6 text-emerald-400" /> <span className="text-emerald-400">Descanso</span></>
          ) : (
            <><Timer className="w-6 h-6 text-rose-500" /> <span className="text-rose-500">Pomodoro</span></>
          )}
        </h2>
        <p className="text-sm text-slate-400">
          {isBreak ? 'Tómate un respiro de 5 minutos.' : 'Concéntrate al máximo durante 25 minutos.'}
        </p>
      </div>

      <div className="flex bg-slate-800/50 p-1.5 rounded-xl">
        <button
          onClick={() => switchMode(false)}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
            !isBreak ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Pomodoro
        </button>
        <button
          onClick={() => switchMode(true)}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
            isBreak ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Descanso
        </button>
      </div>

      <div className="relative w-64 h-64 flex items-center justify-center">
        {/* Progress Ring Background */}
        <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50" cy="50" r="45"
            fill="none"
            stroke={isDark ? '#1E293B' : '#E2E8F0'}
            strokeWidth="4"
          />
          {/* Progress Ring Foreground */}
          <circle
            cx="50" cy="50" r="45"
            fill="none"
            stroke={isBreak ? '#10B981' : '#F43F5E'}
            strokeWidth="4"
            strokeDasharray="283" // 2 * PI * 45
            strokeDashoffset={283 - (283 * progressPct) / 100}
            className="transition-all duration-1000 ease-linear"
          />
        </svg>

        <div className="relative z-10 text-6xl font-black tabular-nums tracking-tighter">
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleTimer}
          className={`w-14 h-14 rounded-full flex items-center justify-center text-white transition-transform hover:scale-105 shadow-lg ${
            isBreak ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20' : 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20'
          }`}
        >
          {isActive ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
        </button>
        
        <button
          onClick={resetTimer}
          className={`p-3 rounded-xl transition-colors ${
            isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-400' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
          }`}
          title="Reiniciar temporizador"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
