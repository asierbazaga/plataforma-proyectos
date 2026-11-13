import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  Play,
  Square,
  Plus,
  Edit3,
  Trash2,
  Calendar,
  TrendingUp,
  TrendingDown,
  Utensils,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Info,
  X,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import {
  timeTrackingService,
  TimeEntry,
  TimeDayType,
  timeToMinutes,
  minutesToTime,
  getDefaultTargetMinutes,
  getWorkedMinutes,
  getBalanceMinutes,
  formatDuration,
} from '../services/timeTrackingService';

const DAY_TYPE_LABELS: Record<TimeDayType, string> = {
  normal: 'Jornada normal',
  holiday: 'Festivo / Libre',
  vacation: 'Vacaciones',
  compensatory: 'Compensatorio',
};

const DAY_TYPE_STYLES: Record<TimeDayType, string> = {
  normal: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
  holiday: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  vacation: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  compensatory: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
};

function getTodayDateStr(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getCurrentTimeStr(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

function getWeekBounds(dateStr: string): { start: string; end: string } {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const day = date.getDay(); // 0=Sun, 1=Mon...
  const diffToMon = day === 0 ? -6 : 1 - day;
  const monday = new Date(date);
  monday.setDate(date.getDate() + diffToMon);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const fmt = (dt: Date) =>
    `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
  return { start: fmt(monday), end: fmt(sunday) };
}

function formatDisplayDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('es-ES', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });
}

function formatMonthYear(year: number, monthIndex: number): string {
  const date = new Date(year, monthIndex, 1);
  const label = date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export const TeamTimeTrackingView: React.FC = () => {
  const { currentUser } = useAuth();
  const { isDark } = useTheme();

  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [storageMode, setStorageMode] = useState<'supabase' | 'local'>('supabase');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Reloj en vivo para el panel de hoy
  const [nowTime, setNowTime] = useState<string>(getCurrentTimeStr());
  const todayStr = getTodayDateStr();

  // Mes seleccionado para la tabla
  const initialDate = new Date();
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth()); // 0-11

  // Pausa rápida por defecto para el botón de fichar hoy
  const [quickLunchMinutes, setQuickLunchMinutes] = useState<number>(60);

  // Modal de registro/edición a posteriori
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formDate, setFormDate] = useState(todayStr);
  const [formDayType, setFormDayType] = useState<TimeDayType>('normal');
  const [formStart, setFormStart] = useState('08:00');
  const [formEnd, setFormEnd] = useState('17:00');
  const [formLunch, setFormLunch] = useState<number>(60);
  const [formNotes, setFormNotes] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setNowTime(getCurrentTimeStr());
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!currentUser?.id) return;
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await timeTrackingService.getEntries(currentUser.id);
        if (!active) return;
        setEntries(res.entries);
        setStorageMode(res.storageMode);
      } catch (err) {
        console.error('Error cargando fichajes:', err);
        if (active) {
          setFeedback({ type: 'error', text: 'No se pudieron cargar los fichajes.' });
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [currentUser?.id]);

  useEffect(() => {
    if (!feedback) return;
    const t = setTimeout(() => setFeedback(null), 4000);
    return () => clearTimeout(t);
  }, [feedback]);

  const todayEntry = useMemo(
    () => entries.find((e) => e.entry_date === todayStr) || null,
    [entries, todayStr]
  );

  // Sincronizar selector rápido de comida con el fichaje de hoy si existe
  useEffect(() => {
    if (todayEntry) {
      setQuickLunchMinutes(todayEntry.lunch_minutes);
    }
  }, [todayEntry?.id, todayEntry?.lunch_minutes]);

  // Cálculos globales, semanales y mensuales
  const stats = useMemo(() => {
    let totalBalance = 0;
    let totalClosedDays = 0;

    const { start: weekStart, end: weekEnd } = getWeekBounds(todayStr);
    let weekBalance = 0;
    let weekWorked = 0;

    const monthPrefix = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`;
    let monthBalance = 0;
    let monthWorked = 0;

    for (const entry of entries) {
      const bal = getBalanceMinutes(entry);
      const worked = getWorkedMinutes(entry);

      if (bal !== null) {
        totalBalance += bal;
        totalClosedDays += 1;

        if (entry.entry_date >= weekStart && entry.entry_date <= weekEnd) {
          weekBalance += bal;
          if (worked !== null) weekWorked += worked;
        }

        if (entry.entry_date.startsWith(monthPrefix)) {
          monthBalance += bal;
          if (worked !== null) monthWorked += worked;
        }
      }
    }

    return {
      totalBalance,
      totalClosedDays,
      weekBalance,
      weekWorked,
      monthBalance,
      monthWorked,
    };
  }, [entries, todayStr, viewYear, viewMonth]);

  const monthEntries = useMemo(() => {
    const monthPrefix = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`;
    return entries
      .filter((e) => e.entry_date.startsWith(monthPrefix))
      .sort((a, b) => b.entry_date.localeCompare(a.entry_date));
  }, [entries, viewYear, viewMonth]);

  // Cálculo en vivo si hoy está abierto (fichada entrada pero no salida)
  const liveTodayInfo = useMemo(() => {
    if (!todayEntry || todayEntry.day_type !== 'normal' || !todayEntry.start_time || todayEntry.end_time) {
      return null;
    }
    const startMins = timeToMinutes(todayEntry.start_time);
    const nowMins = timeToMinutes(nowTime);
    if (startMins === null || nowMins === null) return null;

    const targetExitMins = startMins + todayEntry.target_minutes + quickLunchMinutes;
    const elapsedGross = Math.max(0, nowMins - startMins);
    const elapsedNet = Math.max(0, elapsedGross - quickLunchMinutes);

    return {
      expectedExit: minutesToTime(targetExitMins),
      elapsedNet,
      remainingToTarget: todayEntry.target_minutes - elapsedNet,
    };
  }, [todayEntry, nowTime, quickLunchMinutes]);

  const upsertAndMerge = async (
    payload: Parameters<typeof timeTrackingService.upsertEntry>[0],
    successMsg: string
  ) => {
    setSaving(true);
    try {
      const res = await timeTrackingService.upsertEntry(payload, storageMode === 'local');
      setStorageMode(res.storageMode);
      setEntries((prev) => {
        const filtered = prev.filter((e) => e.entry_date !== res.entry.entry_date);
        return [res.entry, ...filtered].sort((a, b) => b.entry_date.localeCompare(a.entry_date));
      });
      setFeedback({ type: 'success', text: successMsg });
      return true;
    } catch (err) {
      console.error('Error guardando fichaje:', err);
      setFeedback({ type: 'error', text: 'Error al guardar el fichaje.' });
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Acciones rápidas de hoy
  const handleClockInNow = async () => {
    if (!currentUser?.id) return;
    const now = getCurrentTimeStr();
    await upsertAndMerge(
      {
        user_id: currentUser.id,
        entry_date: todayStr,
        start_time: now,
        end_time: null,
        lunch_minutes: quickLunchMinutes,
        day_type: 'normal',
      },
      `Entrada fichada a las ${now}`
    );
  };

  const handleClockOutNow = async () => {
    if (!currentUser?.id || !todayEntry) return;
    const now = getCurrentTimeStr();
    await upsertAndMerge(
      {
        user_id: currentUser.id,
        entry_date: todayStr,
        start_time: todayEntry.start_time,
        end_time: now,
        lunch_minutes: quickLunchMinutes,
        day_type: todayEntry.day_type,
        target_minutes: todayEntry.target_minutes,
        notes: todayEntry.notes,
      },
      `Salida fichada a las ${now}`
    );
  };

  const handleQuickStandardToday = async () => {
    if (!currentUser?.id) return;
    await upsertAndMerge(
      {
        user_id: currentUser.id,
        entry_date: todayStr,
        start_time: '08:00',
        end_time: '17:00',
        lunch_minutes: quickLunchMinutes,
        day_type: 'normal',
      },
      'Jornada de hoy registrada (08:00 - 17:00)'
    );
  };

  const handleChangeQuickLunch = async (mins: number) => {
    setQuickLunchMinutes(mins);
    if (todayEntry && currentUser?.id) {
      await upsertAndMerge(
        {
          user_id: currentUser.id,
          entry_date: todayStr,
          start_time: todayEntry.start_time,
          end_time: todayEntry.end_time,
          lunch_minutes: mins,
          day_type: todayEntry.day_type,
          target_minutes: todayEntry.target_minutes,
          notes: todayEntry.notes,
        },
        `Pausa de comida actualizada a ${mins} min`
      );
    }
  };

  const openModalForNew = (date = todayStr) => {
    const existing = entries.find((e) => e.entry_date === date);
    if (existing) {
      openModalForEntry(existing);
      return;
    }
    setFormDate(date);
    setFormDayType('normal');
    setFormStart('08:00');
    setFormEnd('17:00');
    setFormLunch(60);
    setFormNotes('');
    setIsModalOpen(true);
  };

  const openModalForEntry = (entry: TimeEntry) => {
    setFormDate(entry.entry_date);
    setFormDayType(entry.day_type);
    setFormStart(entry.start_time || '08:00');
    setFormEnd(entry.end_time || '');
    setFormLunch(entry.lunch_minutes ?? 60);
    setFormNotes(entry.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.id) return;

    if (formDayType === 'normal' && !formStart) {
      setFeedback({ type: 'error', text: 'Indica al menos la hora de entrada.' });
      return;
    }

    const ok = await upsertAndMerge(
      {
        user_id: currentUser.id,
        entry_date: formDate,
        start_time: formDayType === 'normal' ? formStart || null : null,
        end_time: formDayType === 'normal' ? formEnd || null : null,
        lunch_minutes: formDayType === 'normal' ? formLunch : 0,
        day_type: formDayType,
        notes: formNotes,
      },
      `Fichaje del ${formatDisplayDate(formDate)} guardado`
    );

    if (ok) {
      setIsModalOpen(false);
    }
  };

  const handleDeleteEntry = async (entry: TimeEntry) => {
    if (!currentUser?.id) return;
    try {
      await timeTrackingService.deleteEntry(currentUser.id, entry.id, storageMode === 'local');
      setEntries((prev) => prev.filter((e) => e.id !== entry.id));
      setFeedback({ type: 'success', text: `Fichaje del ${formatDisplayDate(entry.entry_date)} eliminado` });
    } catch (err) {
      console.error('Error eliminando fichaje:', err);
      setFeedback({ type: 'error', text: 'No se pudo eliminar el fichaje.' });
    }
  };

  // Previsualización en vivo dentro del modal
  const modalPreview = useMemo(() => {
    const target = getDefaultTargetMinutes(formDate, formDayType);
    if (formDayType !== 'normal') {
      return { worked: 0, target: 0, balance: 0 };
    }
    const worked = getWorkedMinutes({
      start_time: formStart || null,
      end_time: formEnd || null,
      lunch_minutes: formLunch,
      day_type: formDayType,
    });
    return {
      worked,
      target,
      balance: worked !== null ? worked - target : null,
    };
  }, [formDate, formDayType, formStart, formEnd, formLunch]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const cardBg = isDark
    ? 'bg-slate-900/80 border-slate-800 text-white'
    : 'bg-white border-slate-200 text-slate-900 shadow-sm';

  const subCardBg = isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200';

  const weekTargetMinutes = 2400; // 40h
  const weekProgressPct = Math.min(100, Math.round((stats.weekWorked / weekTargetMinutes) * 100));

  const renderBalanceBadge = (balance: number | null, large = false) => {
    if (balance === null) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
          En curso
        </span>
      );
    }
    const isPositive = balance > 0;
    const isNegative = balance < 0;
    const colorClass = isPositive
      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
      : isNegative
      ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
      : 'bg-slate-500/15 text-slate-400 border-slate-500/30';

    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full border font-extrabold ${colorClass} ${
          large ? 'px-3 py-1 text-sm' : 'px-2.5 py-0.5 text-xs'
        }`}
      >
        {isPositive && <TrendingUp className="w-3.5 h-3.5" />}
        {isNegative && <TrendingDown className="w-3.5 h-3.5" />}
        {formatDuration(balance, true)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Aviso de modo local si aún no se ha creado la tabla en Supabase */}
      {storageMode === 'local' && (
        <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Guardado local activo en este navegador.</span> Tus fichajes ya
            funcionan y se guardan automáticamente; si quieres sincronizarlos entre dispositivos en
            Supabase, ejecuta el archivo{' '}
            <code className="px-1.5 py-0.5 rounded bg-amber-500/20 font-mono">
              migration_add_time_entries.sql
            </code>{' '}
            en tu SQL Editor de Supabase.
          </div>
        </div>
      )}

      {/* Feedback toast inline */}
      {feedback && (
        <div
          className={`flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border text-xs font-bold ${
            feedback.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="opacity-70 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 4 Tarjetas KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Saldo acumulado total */}
        <div className={`rounded-3xl border p-5 ${cardBg}`}>
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>Saldo Acumulado</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div
            className={`mt-2 text-3xl font-black tracking-tight ${
              stats.totalBalance > 0
                ? 'text-emerald-400'
                : stats.totalBalance < 0
                ? 'text-rose-400'
                : isDark
                ? 'text-white'
                : 'text-slate-900'
            }`}
          >
            {formatDuration(stats.totalBalance, true)}
          </div>
          <p className="mt-1 text-xs text-slate-400">
            En {stats.totalClosedDays} {stats.totalClosedDays === 1 ? 'día cerrado' : 'días cerrados'}
          </p>
        </div>

        {/* Saldo esta semana */}
        <div className={`rounded-3xl border p-5 ${cardBg}`}>
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>Esta Semana (L-V)</span>
            {renderBalanceBadge(stats.weekBalance)}
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black">{formatDuration(stats.weekWorked)}</span>
            <span className="text-xs text-slate-400 font-semibold">/ 40h objetivo</span>
          </div>
          <div className="mt-3 h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-500"
              style={{ width: `${weekProgressPct}%` }}
            />
          </div>
        </div>

        {/* Saldo del mes */}
        <div className={`rounded-3xl border p-5 ${cardBg}`}>
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>Balance {formatMonthYear(viewYear, viewMonth).split(' ')[0]}</span>
            <Calendar className="w-4 h-4 text-indigo-400" />
          </div>
          <div
            className={`mt-2 text-3xl font-black tracking-tight ${
              stats.monthBalance > 0
                ? 'text-emerald-400'
                : stats.monthBalance < 0
                ? 'text-rose-400'
                : isDark
                ? 'text-white'
                : 'text-slate-900'
            }`}
          >
            {formatDuration(stats.monthBalance, true)}
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Total trabajado: <span className="font-bold text-slate-300">{formatDuration(stats.monthWorked)}</span>
          </p>
        </div>

        {/* Estado de hoy / Hora salida estimada */}
        <div className={`rounded-3xl border p-5 ${cardBg}`}>
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>Hoy</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          {liveTodayInfo ? (
            <>
              <div className="mt-2 text-2xl font-black text-cyan-400">
                Salida 8h: {liveTodayInfo.expectedExit}
              </div>
              <p className="mt-1 text-xs text-slate-400">
                Llevas <span className="font-bold text-slate-200">{formatDuration(liveTodayInfo.elapsedNet)}</span> netos (pausa {quickLunchMinutes}m)
              </p>
            </>
          ) : todayEntry ? (
            <>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-2xl font-black">
                  {todayEntry.day_type === 'normal'
                    ? formatDuration(getWorkedMinutes(todayEntry) ?? 0)
                    : DAY_TYPE_LABELS[todayEntry.day_type]}
                </span>
                {renderBalanceBadge(getBalanceMinutes(todayEntry))}
              </div>
              <p className="mt-1 text-xs text-slate-400">
                {todayEntry.start_time && todayEntry.end_time
                  ? `${todayEntry.start_time} → ${todayEntry.end_time} (${todayEntry.lunch_minutes}m comida)`
                  : 'Día registrado'}
              </p>
            </>
          ) : (
            <>
              <div className="mt-2 text-2xl font-black text-slate-400">Sin fichar</div>
              <p className="mt-1 text-xs text-slate-400">Horario base: 08:00 - 17:00 (1h comida)</p>
            </>
          )}
        </div>
      </div>

      {/* Panel de Fichaje Rápido de Hoy + Botón A Posteriori */}
      <div className={`rounded-3xl border p-5 ${cardBg}`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-cyan-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 flex-shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-base sm:text-lg font-black">Fichaje rápido de hoy</h2>
                <span className="px-2.5 py-0.5 rounded-lg bg-slate-800 text-cyan-300 font-mono text-xs font-bold border border-slate-700">
                  {nowTime}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {todayEntry?.start_time && !todayEntry?.end_time
                  ? `Jornada iniciada a las ${todayEntry.start_time}. Elige tu pausa de comida y ficha la salida al terminar.`
                  : 'Registra tu entrada en un clic o añade cualquier día a posteriori.'}
              </p>
            </div>
          </div>

          {/* Selector rápido de comida + Botones */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className={`flex items-center gap-1 p-1 rounded-xl border ${subCardBg}`}>
              <Utensils className="w-3.5 h-3.5 text-slate-400 ml-2 mr-1" />
              {[0, 30, 60].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  disabled={saving}
                  onClick={() => handleChangeQuickLunch(mins)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    quickLunchMinutes === mins
                      ? 'bg-cyan-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title={
                    mins === 30
                      ? 'Comer en 30m (genera +30m/día)'
                      : mins === 60
                      ? 'Comida estándar 1h'
                      : 'Sin parada de comida'
                  }
                >
                  {mins === 0 ? 'Sin comida' : mins === 30 ? '30m' : '1h'}
                </button>
              ))}
            </div>

            {!todayEntry && (
              <>
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleClockInNow}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Fichar Entrada ({nowTime})</span>
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleQuickStandardToday}
                  className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all ${subCardBg} hover:border-cyan-500/50`}
                  title="Rellenar jornada completa 08:00 a 17:00"
                >
                  08:00 - 17:00
                </button>
              </>
            )}

            {todayEntry && todayEntry.start_time && !todayEntry.end_time && (
              <button
                type="button"
                disabled={saving}
                onClick={handleClockOutNow}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-rose-500/20 transition-all disabled:opacity-50"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>Fichar Salida ({nowTime})</span>
              </button>
            )}

            {todayEntry && todayEntry.end_time && (
              <button
                type="button"
                onClick={() => openModalForEntry(todayEntry)}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-bold ${subCardBg} hover:border-cyan-500/50`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editar hoy</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => openModalForNew(todayStr)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir / Editar fecha</span>
            </button>
          </div>
        </div>
      </div>

      {/* Histórico Mensual */}
      <div className={`rounded-3xl border overflow-hidden ${cardBg}`}>
        <div className="p-5 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-black">Registro mensual de fichajes</h3>
            <p className="text-xs text-slate-400">
              Objetivo L-V: 8h/día (40h/semana). Haz clic en cualquier día para ajustarlo.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className={`p-2 rounded-xl border ${subCardBg} hover:border-slate-600`}
              title="Mes anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="min-w-[145px] text-center text-sm font-bold">
              {formatMonthYear(viewYear, viewMonth)}
            </span>
            <button
              onClick={handleNextMonth}
              className={`p-2 rounded-xl border ${subCardBg} hover:border-slate-600`}
              title="Mes siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-slate-400">Cargando fichajes...</div>
        ) : monthEntries.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <p className="text-sm text-slate-400">
              No hay fichajes registrados en {formatMonthYear(viewYear, viewMonth)}.
            </p>
            <button
              onClick={() => openModalForNew(todayStr)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar primer fichaje</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-5">Fecha</th>
                  <th className="py-3.5 px-4">Horario</th>
                  <th className="py-3.5 px-4">Comida</th>
                  <th className="py-3.5 px-4">Trabajado</th>
                  <th className="py-3.5 px-4">Balance</th>
                  <th className="py-3.5 px-4">Notas</th>
                  <th className="py-3.5 px-5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {monthEntries.map((entry) => {
                  const worked = getWorkedMinutes(entry);
                  const balance = getBalanceMinutes(entry);
                  const isToday = entry.entry_date === todayStr;

                  return (
                    <tr
                      key={entry.id}
                      className={`transition-colors ${
                        isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-bold capitalize">
                            {formatDisplayDate(entry.entry_date)}
                          </span>
                          {isToday && (
                            <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 text-[10px] font-extrabold uppercase">
                              Hoy
                            </span>
                          )}
                          {entry.day_type !== 'normal' && (
                            <span
                              className={`px-2 py-0.5 rounded-md border text-[10px] font-bold ${
                                DAY_TYPE_STYLES[entry.day_type]
                              }`}
                            >
                              {DAY_TYPE_LABELS[entry.day_type]}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-xs">
                        {entry.day_type !== 'normal' && !entry.start_time ? (
                          <span className="text-slate-500">—</span>
                        ) : (
                          <span>
                            {entry.start_time || '--:--'} → {entry.end_time || 'En curso'}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-400">
                        {entry.day_type === 'normal' ? `${entry.lunch_minutes}m` : '—'}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap font-bold">
                        {worked !== null ? formatDuration(worked) : '—'}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">{renderBalanceBadge(balance)}</td>

                      <td className="py-3.5 px-4 text-xs text-slate-400 max-w-[220px] truncate">
                        {entry.notes || '—'}
                      </td>

                      <td className="py-3.5 px-5 whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => openModalForEntry(entry)}
                            className="p-2 rounded-xl text-slate-400 hover:text-cyan-400 hover:bg-slate-800/70 transition-colors"
                            title="Editar"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteEntry(entry)}
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800/70 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Registro / Edición a Posteriori */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div
            className={`w-full max-w-lg rounded-3xl border p-6 shadow-2xl space-y-5 ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black">Registrar / Editar Fichaje</h3>
                <p className="text-xs text-slate-400">
                  Apunta tu horario real o usa una plantilla rápida.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4">
              {/* Fecha y Tipo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5">Fecha</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    required
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold ${subCardBg}`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5">Tipo de día</label>
                  <select
                    value={formDayType}
                    onChange={(e) => setFormDayType(e.target.value as TimeDayType)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold ${subCardBg}`}
                  >
                    <option value="normal">Jornada normal (8h)</option>
                    <option value="holiday">Festivo / Libre (0h)</option>
                    <option value="vacation">Vacaciones (0h)</option>
                    <option value="compensatory">Compensatorio (0h)</option>
                  </select>
                </div>
              </div>

              {formDayType === 'normal' && (
                <>
                  {/* Plantillas rápidas */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5">
                      Atajos rápidos
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setFormStart('08:00');
                          setFormEnd('17:00');
                          setFormLunch(60);
                        }}
                        className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold ${subCardBg} hover:border-cyan-500/50`}
                      >
                        Estándar (08-17 · 1h)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFormStart('08:00');
                          setFormEnd('17:00');
                          setFormLunch(30);
                        }}
                        className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold ${subCardBg} hover:border-emerald-500/50 text-emerald-400`}
                      >
                        Comida 30m (+30m)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFormStart('08:00');
                          setFormEnd('15:00');
                          setFormLunch(0);
                        }}
                        className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold ${subCardBg} hover:border-indigo-500/50 text-indigo-400`}
                      >
                        Viernes 08-15 (sin comida)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFormStart('08:00');
                          setFormEnd('15:00');
                          setFormLunch(60);
                        }}
                        className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold ${subCardBg} hover:border-indigo-500/50`}
                      >
                        Viernes 08-15 (1h comida)
                      </button>
                    </div>
                  </div>

                  {/* Horas y pausa */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1.5">Entrada</label>
                      <input
                        type="time"
                        value={formStart}
                        onChange={(e) => setFormStart(e.target.value)}
                        className={`w-full px-3 py-2.5 rounded-xl border text-sm font-mono font-bold ${subCardBg}`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1.5">Salida</label>
                      <input
                        type="time"
                        value={formEnd}
                        onChange={(e) => setFormEnd(e.target.value)}
                        className={`w-full px-3 py-2.5 rounded-xl border text-sm font-mono font-bold ${subCardBg}`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1.5">
                        Comida (min)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={240}
                        step={5}
                        value={formLunch}
                        onChange={(e) => setFormLunch(Math.max(0, Number(e.target.value) || 0))}
                        className={`w-full px-3 py-2.5 rounded-xl border text-sm font-mono font-bold ${subCardBg}`}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Notas */}
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5">
                  Nota (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej. Comida rápida 30m, médico, salida a las 15:00..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm ${subCardBg}`}
                />
              </div>

              {/* Previsualización del cálculo */}
              <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${subCardBg}`}>
                <div className="text-xs text-slate-400">
                  <div>
                    Trabajado:{' '}
                    <span className="font-bold text-white">
                      {modalPreview.worked !== null ? formatDuration(modalPreview.worked) : 'En curso'}
                    </span>
                  </div>
                  <div>
                    Objetivo del día:{' '}
                    <span className="font-semibold">{formatDuration(modalPreview.target)}</span>
                  </div>
                </div>
                <div>{renderBalanceBadge(modalPreview.balance, true)}</div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold shadow-lg disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar fichaje'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
