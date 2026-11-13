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
  Coffee,
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
  TimePunch,
  timeToMinutes,
  minutesToTime,
  getDefaultTargetMinutes,
  getEntryPunches,
  getBreakMinutes,
  hasOpenPunch,
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
  const day = date.getDay();
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

  // Reloj en vivo (actualiza cada 15s)
  const [nowTime, setNowTime] = useState<string>(getCurrentTimeStr());
  const todayStr = getTodayDateStr();

  // Mes seleccionado para la tabla
  const initialDate = new Date();
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());

  // Modal de registro/edición a posteriori
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formDate, setFormDate] = useState(todayStr);
  const [formDayType, setFormDayType] = useState<TimeDayType>('normal');
  const [formPunches, setFormPunches] = useState<TimePunch[]>([
    { id: '1', start: '08:00', end: '13:00' },
    { id: '2', start: '14:00', end: '17:00' },
  ]);
  const [formSingleLunch, setFormSingleLunch] = useState<number>(0);
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

  const todayPunches = useMemo(
    () => (todayEntry ? getEntryPunches(todayEntry) : []),
    [todayEntry]
  );

  const isTodayOpen = useMemo(
    () => (todayEntry ? hasOpenPunch(todayEntry) : false),
    [todayEntry]
  );

  // Resumen en vivo del día de hoy (incluye tramo abierto hasta `nowTime`)
  const todayLive = useMemo(() => {
    if (!todayEntry) return null;
    const workedSoFar = getWorkedMinutes(todayEntry, nowTime) ?? 0;
    const target = todayEntry.target_minutes;
    const diff = workedSoFar - target;
    const nowMins = timeToMinutes(nowTime);
    const expectedExit =
      isTodayOpen && nowMins !== null && diff < 0
        ? minutesToTime(nowMins + Math.abs(diff))
        : null;
    const breakMins = getBreakMinutes(todayEntry);

    return {
      workedSoFar,
      target,
      diff,
      expectedExit,
      breakMins,
    };
  }, [todayEntry, nowTime, isTodayOpen]);

  // Cálculos globales, semanales y mensuales (sobre días cerrados; hoy se refleja en vivo en su tarjeta)
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

  const upsertAndMerge = async (
    payload: Parameters<typeof timeTrackingService.upsertEntry>[0],
    successMsg: string
  ) => {
    setSaving(true);
    try {
      const res = await timeTrackingService.upsertEntry(payload, false);
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

  // Fichar ENTRADA / VUELTA (abre un nuevo tramo con la hora actual)
  const handlePunchInNow = async () => {
    if (!currentUser?.id) return;
    const now = getCurrentTimeStr();
    const updatedPunches: TimePunch[] = [
      ...todayPunches,
      { id: crypto.randomUUID(), start: now, end: null },
    ];
    await upsertAndMerge(
      {
        user_id: currentUser.id,
        entry_date: todayStr,
        punches: updatedPunches,
        lunch_minutes: 0,
        day_type: todayEntry?.day_type || 'normal',
        target_minutes: todayEntry?.target_minutes,
        notes: todayEntry?.notes,
      },
      todayPunches.length === 0
        ? `Entrada fichada a las ${now}`
        : `Vuelta fichada a las ${now} (Tramo ${updatedPunches.length})`
    );
  };

  // Fichar SALIDA / PAUSA (cierra el tramo abierto con la hora actual)
  const handlePunchOutNow = async () => {
    if (!currentUser?.id || !todayEntry) return;
    const now = getCurrentTimeStr();
    const updatedPunches = todayPunches.map((p, idx) =>
      idx === todayPunches.length - 1 && !p.end ? { ...p, end: now } : p
    );
    await upsertAndMerge(
      {
        user_id: currentUser.id,
        entry_date: todayStr,
        punches: updatedPunches,
        lunch_minutes: updatedPunches.length === 1 ? todayEntry.lunch_minutes : 0,
        day_type: todayEntry.day_type,
        target_minutes: todayEntry.target_minutes,
        notes: todayEntry.notes,
      },
      `Salida / pausa fichada a las ${now}`
    );
  };

  const handleRemoveTodayPunch = async (punchId: string) => {
    if (!currentUser?.id || !todayEntry) return;
    const remaining = todayPunches.filter((p) => p.id !== punchId);
    if (remaining.length === 0) {
      await handleDeleteEntry(todayEntry);
      return;
    }
    await upsertAndMerge(
      {
        user_id: currentUser.id,
        entry_date: todayStr,
        punches: remaining,
        lunch_minutes: remaining.length === 1 ? todayEntry.lunch_minutes : 0,
        day_type: todayEntry.day_type,
        target_minutes: todayEntry.target_minutes,
        notes: todayEntry.notes,
      },
      'Tramo eliminado'
    );
  };

  const openModalForNew = (date = todayStr) => {
    const existing = entries.find((e) => e.entry_date === date);
    if (existing) {
      openModalForEntry(existing);
      return;
    }
    setFormDate(date);
    setFormDayType('normal');
    setFormPunches([
      { id: crypto.randomUUID(), start: '08:00', end: '13:00' },
      { id: crypto.randomUUID(), start: '14:00', end: '17:00' },
    ]);
    setFormSingleLunch(0);
    setFormNotes('');
    setIsModalOpen(true);
  };

  const openModalForEntry = (entry: TimeEntry) => {
    const existingPunches = getEntryPunches(entry);
    setFormDate(entry.entry_date);
    setFormDayType(entry.day_type);
    setFormPunches(
      existingPunches.length > 0
        ? existingPunches.map((p) => ({ ...p }))
        : [{ id: crypto.randomUUID(), start: '08:00', end: '' }]
    );
    setFormSingleLunch(existingPunches.length <= 1 ? entry.lunch_minutes || 0 : 0);
    setFormNotes(entry.notes || '');
    setIsModalOpen(true);
  };

  const handleAddFormPunch = () => {
    const last = formPunches[formPunches.length - 1];
    const nextStart = last?.end || '14:00';
    setFormPunches((prev) => [
      ...prev,
      { id: crypto.randomUUID(), start: nextStart, end: '' },
    ]);
  };

  const handleUpdateFormPunch = (id: string, field: 'start' | 'end', value: string) => {
    setFormPunches((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value || null } : p))
    );
  };

  const handleDeleteFormPunch = (id: string) => {
    setFormPunches((prev) => (prev.length > 1 ? prev.filter((p) => p.id !== id) : prev));
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.id) return;

    const cleanPunches =
      formDayType === 'normal'
        ? formPunches.filter((p) => p.start && p.start.trim() !== '')
        : [];

    if (formDayType === 'normal' && cleanPunches.length === 0) {
      setFeedback({ type: 'error', text: 'Añade al menos una hora de entrada.' });
      return;
    }

    const ok = await upsertAndMerge(
      {
        user_id: currentUser.id,
        entry_date: formDate,
        punches: cleanPunches,
        lunch_minutes: cleanPunches.length <= 1 ? formSingleLunch : 0,
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
      await timeTrackingService.deleteEntry(currentUser.id, entry.id, false);
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
      return { worked: 0, target: 0, balance: 0, breaks: 0 };
    }
    const lunchVal = formPunches.length <= 1 ? formSingleLunch : 0;
    const worked = getWorkedMinutes({
      punches: formPunches,
      start_time: formPunches[0]?.start || null,
      end_time: formPunches[formPunches.length - 1]?.end || null,
      lunch_minutes: lunchVal,
      day_type: formDayType,
    });
    const breaks = getBreakMinutes({
      punches: formPunches,
      start_time: formPunches[0]?.start || null,
      end_time: formPunches[formPunches.length - 1]?.end || null,
      lunch_minutes: lunchVal,
    });
    return {
      worked,
      target,
      breaks,
      balance: worked !== null ? worked - target : null,
    };
  }, [formDate, formDayType, formPunches, formSingleLunch]);

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
            <span className="font-bold">Guardado local activo en este navegador.</span> Ejecuta{' '}
            <code className="px-1.5 py-0.5 rounded bg-amber-500/20 font-mono">
              migration_add_time_entries.sql
            </code>{' '}
            en Supabase para sincronizar entre dispositivos.
          </div>
        </div>
      )}

      {/* Feedback inline */}
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

        {/* Hoy en tiempo real */}
        <div className={`rounded-3xl border p-5 ${cardBg}`}>
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>Hoy (en vivo)</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          {todayEntry && todayLive ? (
            <>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-2xl font-black">{formatDuration(todayLive.workedSoFar)}</span>
                {renderBalanceBadge(todayLive.diff)}
              </div>
              <p className="mt-1 text-xs text-slate-400">
                {todayLive.expectedExit ? (
                  <>
                    Para 8h sales a las <span className="font-bold text-cyan-400">{todayLive.expectedExit}</span>
                  </>
                ) : isTodayOpen ? (
                  <span className="text-emerald-400 font-semibold">Objetivo diario superado</span>
                ) : (
                  <>
                    Pausas hoy: <span className="font-semibold">{formatDuration(todayLive.breakMins)}</span>
                  </>
                )}
              </p>
            </>
          ) : (
            <>
              <div className="mt-2 text-2xl font-black text-slate-400">Sin fichar</div>
              <p className="mt-1 text-xs text-slate-400">Objetivo hoy: 8h (L-V)</p>
            </>
          )}
        </div>
      </div>

      {/* Panel de Fichajes de Hoy (Múltiples tramos: Entrada -> Pausa -> Vuelta -> Salida) */}
      <div className={`rounded-3xl border p-5 space-y-4 ${cardBg}`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg flex-shrink-0 ${
                isTodayOpen
                  ? 'bg-gradient-to-tr from-emerald-500 to-cyan-500 shadow-emerald-500/25'
                  : todayPunches.length > 0
                  ? 'bg-gradient-to-tr from-amber-500 to-orange-500 shadow-amber-500/20'
                  : 'bg-gradient-to-tr from-slate-700 to-slate-600'
              }`}
            >
              {isTodayOpen ? <Clock className="w-6 h-6 animate-pulse" /> : <Coffee className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-base sm:text-lg font-black">Fichajes de hoy</h2>
                <span className="px-2.5 py-0.5 rounded-lg bg-slate-800 text-cyan-300 font-mono text-xs font-bold border border-slate-700">
                  {nowTime}
                </span>
                {isTodayOpen ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
                    Trabajando ahora
                  </span>
                ) : todayPunches.length > 0 ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[11px] font-bold">
                    En pausa / Jornada cerrada
                  </span>
                ) : null}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Marca cada entrada y salida del día (mañana, comida, tarde...). El tiempo de pausa y el balance diario se calculan solos.
              </p>
            </div>
          </div>

          {/* Botones principales de fichaje */}
          <div className="flex flex-wrap items-center gap-2.5">
            {isTodayOpen ? (
              <button
                type="button"
                disabled={saving}
                onClick={handlePunchOutNow}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-rose-500/20 transition-all disabled:opacity-50"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>Fichar Salida / Pausa ({nowTime})</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={saving}
                onClick={handlePunchInNow}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>
                  {todayPunches.length === 0
                    ? `Fichar Entrada (${nowTime})`
                    : `Fichar Vuelta / Entrada (${nowTime})`}
                </span>
              </button>
            )}

            {todayEntry && (
              <button
                type="button"
                onClick={() => openModalForEntry(todayEntry)}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-bold ${subCardBg} hover:border-cyan-500/50`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Ajustar tramos de hoy</span>
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

        {/* Línea temporal de tramos de hoy */}
        {todayPunches.length > 0 && (
          <div className={`p-3.5 rounded-2xl border flex flex-wrap items-center gap-2 ${subCardBg}`}>
            {todayPunches.map((punch, idx) => {
              const segStart = timeToMinutes(punch.start);
              const segEnd = timeToMinutes(punch.end ?? nowTime);
              const segMins =
                segStart !== null && segEnd !== null && segEnd > segStart ? segEnd - segStart : 0;

              // Pausa respecto al tramo anterior
              let gapMins = 0;
              if (idx > 0) {
                const prevEnd = timeToMinutes(todayPunches[idx - 1].end);
                if (prevEnd !== null && segStart !== null && segStart > prevEnd) {
                  gapMins = segStart - prevEnd;
                }
              }

              return (
                <React.Fragment key={punch.id}>
                  {idx > 0 && gapMins > 0 && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px] font-bold">
                      <Coffee className="w-3 h-3" />
                      Pausa {formatDuration(gapMins)}
                    </span>
                  )}
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400">
                      Tramo {idx + 1}
                    </span>
                    <span className="font-mono font-bold text-white">
                      {punch.start} → {punch.end || <span className="text-emerald-400">en curso</span>}
                    </span>
                    <span className="text-[11px] font-bold text-cyan-400">
                      ({formatDuration(segMins)})
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTodayPunch(punch.id)}
                      className="text-slate-500 hover:text-rose-400 transition-colors"
                      title="Eliminar tramo"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>

      {/* Histórico Mensual */}
      <div className={`rounded-3xl border overflow-hidden ${cardBg}`}>
        <div className="p-5 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-black">Registro mensual de fichajes</h3>
            <p className="text-xs text-slate-400">
              Objetivo L-V: 8h/día (40h/semana). Haz clic en cualquier día para ajustar sus tramos.
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
                  <th className="py-3.5 px-4">Tramos / Horario</th>
                  <th className="py-3.5 px-4">Pausas</th>
                  <th className="py-3.5 px-4">Trabajado</th>
                  <th className="py-3.5 px-4">Balance</th>
                  <th className="py-3.5 px-4">Notas</th>
                  <th className="py-3.5 px-5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {monthEntries.map((entry) => {
                  const punches = getEntryPunches(entry);
                  const breakMins = getBreakMinutes(entry);
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

                      <td className="py-3.5 px-4 font-mono text-xs">
                        {entry.day_type !== 'normal' && punches.length === 0 ? (
                          <span className="text-slate-500">—</span>
                        ) : (
                          <div className="flex flex-wrap items-center gap-1.5">
                            {punches.map((p, i) => (
                              <span
                                key={p.id || i}
                                className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/60"
                              >
                                {p.start} → {p.end || 'En curso'}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-400">
                        {entry.day_type === 'normal' ? formatDuration(breakMins) : '—'}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap font-bold">
                        {worked !== null ? formatDuration(worked) : '—'}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">{renderBalanceBadge(balance)}</td>

                      <td className="py-3.5 px-4 text-xs text-slate-400 max-w-[200px] truncate">
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

      {/* Modal de Registro / Edición a Posteriori con Múltiples Tramos */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div
            className={`w-full max-w-lg rounded-3xl border p-6 shadow-2xl space-y-5 my-auto ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black">Registrar / Editar Fichaje</h3>
                <p className="text-xs text-slate-400">
                  Añade los tramos del día (ej. mañana y tarde) o usa una plantilla.
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
                          setFormPunches([
                            { id: crypto.randomUUID(), start: '08:00', end: '13:00' },
                            { id: crypto.randomUUID(), start: '14:00', end: '17:00' },
                          ]);
                          setFormSingleLunch(0);
                        }}
                        className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold ${subCardBg} hover:border-cyan-500/50`}
                      >
                        Estándar (08-13 · 14-17)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFormPunches([
                            { id: crypto.randomUUID(), start: '08:00', end: '13:00' },
                            { id: crypto.randomUUID(), start: '13:30', end: '17:00' },
                          ]);
                          setFormSingleLunch(0);
                        }}
                        className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold ${subCardBg} hover:border-emerald-500/50 text-emerald-400`}
                      >
                        Comida 30m (+30m)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFormPunches([
                            { id: crypto.randomUUID(), start: '08:00', end: '15:00' },
                          ]);
                          setFormSingleLunch(0);
                        }}
                        className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold ${subCardBg} hover:border-indigo-500/50 text-indigo-400`}
                      >
                        Viernes 08-15 (continua)
                      </button>
                    </div>
                  </div>

                  {/* Lista de tramos */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-400">
                        Tramos del día ({formPunches.length})
                      </label>
                      <button
                        type="button"
                        onClick={handleAddFormPunch}
                        className="inline-flex items-center gap-1 text-xs font-bold text-cyan-400 hover:text-cyan-300"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Añadir tramo</span>
                      </button>
                    </div>

                    {formPunches.map((punch, idx) => (
                      <div key={punch.id} className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-500 w-14 flex-shrink-0">
                          Tramo {idx + 1}
                        </span>
                        <input
                          type="time"
                          value={punch.start}
                          onChange={(e) => handleUpdateFormPunch(punch.id, 'start', e.target.value)}
                          className={`flex-1 px-3 py-2 rounded-xl border text-sm font-mono font-bold ${subCardBg}`}
                        />
                        <span className="text-slate-500 text-xs">→</span>
                        <input
                          type="time"
                          value={punch.end || ''}
                          onChange={(e) => handleUpdateFormPunch(punch.id, 'end', e.target.value)}
                          className={`flex-1 px-3 py-2 rounded-xl border text-sm font-mono font-bold ${subCardBg}`}
                        />
                        {formPunches.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteFormPunch(punch.id)}
                            className="p-2 rounded-xl text-slate-500 hover:text-rose-400"
                            title="Quitar tramo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Si solo hay 1 tramo, permitir descuento manual opcional */}
                  {formPunches.length === 1 && (
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1.5">
                        Descuento comida manual (solo si es 1 tramo continuo)
                      </label>
                      <div className="flex items-center gap-2">
                        {[0, 30, 60].map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setFormSingleLunch(m)}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-bold ${
                              formSingleLunch === m
                                ? 'bg-cyan-600 border-cyan-500 text-white'
                                : subCardBg
                            }`}
                          >
                            {m === 0 ? 'Sin pausa (0m)' : `${m}m`}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5">
                  Nota (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej. Comida 30m, médico, salida a las 15:00..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm ${subCardBg}`}
                />
              </div>

              {/* Previsualización */}
              <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${subCardBg}`}>
                <div className="text-xs text-slate-400 space-y-0.5">
                  <div>
                    Trabajado:{' '}
                    <span className="font-bold text-white">
                      {modalPreview.worked !== null ? formatDuration(modalPreview.worked) : 'En curso'}
                    </span>
                  </div>
                  <div>
                    Pausas: <span className="font-semibold">{formatDuration(modalPreview.breaks)}</span> · Objetivo:{' '}
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
