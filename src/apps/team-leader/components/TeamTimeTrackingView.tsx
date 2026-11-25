import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Clock,
  Play,
  Square,
  Plus,
  Edit3,
  Trash2,
  TrendingUp,
  TrendingDown,
  Coffee,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Info,
  X,
  Briefcase,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { supabase } from '../../../lib/supabase';
import { storageService } from '../../../services/storageService';
import {
  timeTrackingService,
  TimeEntry,
  TimeDayType,
  TimePunch,
  TimePunchType,
  timeToMinutes,
  minutesToTime,
  getDefaultTargetMinutes,
  getEntryPunches,
  getPunchType,
  resolvePunchEnd,
  getOpenPunch,
  getBreakMinutes,
  getWorkedMinutes,
  getClosedWorkedMinutes,
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

type FridayGoalMinutes = 0 | 60 | 120;

const DEFAULT_FRIDAY_GOAL_MINUTES: FridayGoalMinutes = 120;
const FRIDAY_GOAL_STORAGE_PREFIX = 'mecalux_friday_goal_v1_';

const FRIDAY_GOAL_OPTIONS: {
  minutes: FridayGoalMinutes;
  shortLabel: string;
  title: string;
}[] = [
  { minutes: 0, shortLabel: 'Normal', title: 'Viernes normal (8h, sin horas extra requeridas)' },
  { minutes: 60, shortLabel: '16:00', title: 'Salir el viernes a las 16:00 (+1h extra L–J)' },
  { minutes: 120, shortLabel: '15:00', title: 'Salir el viernes a las 15:00 (+2h extra L–J)' },
];

const STANDARD_EXIT_MINUTES = 17 * 60; // 17:00
const STANDARD_EXIT_LABEL = '17:00';

function readWeekFridayGoal(userId: string | undefined, weekStart: string): FridayGoalMinutes {
  try {
    const raw = localStorage.getItem(`${FRIDAY_GOAL_STORAGE_PREFIX}${userId || 'anon'}`);
    if (!raw) return DEFAULT_FRIDAY_GOAL_MINUTES;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const val = parsed[weekStart];
      if (val === 0 || val === 60 || val === 120) return val;
    }
  } catch {
    // Ignorar errores de almacenamiento
  }
  return DEFAULT_FRIDAY_GOAL_MINUTES;
}

function writeWeekFridayGoal(
  userId: string | undefined,
  weekStart: string,
  minutes: FridayGoalMinutes
): void {
  try {
    const key = `${FRIDAY_GOAL_STORAGE_PREFIX}${userId || 'anon'}`;
    const raw = localStorage.getItem(key);
    const existing = raw ? JSON.parse(raw) : {};
    const map =
      existing && typeof existing === 'object' && !Array.isArray(existing) ? existing : {};
    map[weekStart] = minutes;
    localStorage.setItem(key, JSON.stringify(map));
  } catch {
    // Ignorar errores de almacenamiento
  }
}

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

function formatLocalYMD(dt: Date): string {
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
}

function addLocalDays(base: Date, offsetDays: number): string {
  const dt = new Date(base.getFullYear(), base.getMonth(), base.getDate() + offsetDays);
  return formatLocalYMD(dt);
}

interface WeekInfo {
  start: string;
  thursday: string;
  friday: string;
  end: string;
  monToThuDates: string[];
  weekdays: string[];
  dayOfWeek: number;
}

function getWeekInfo(dateStr: string): WeekInfo {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const dayOfWeek = date.getDay();
  const diffToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(y, m - 1, d + diffToMon);

  const monToThuDates = [0, 1, 2, 3].map((offset) => addLocalDays(monday, offset));
  const friday = addLocalDays(monday, 4);
  const weekdays = [...monToThuDates, friday];

  return {
    start: monToThuDates[0],
    thursday: monToThuDates[3],
    friday,
    end: addLocalDays(monday, 6),
    monToThuDates,
    weekdays,
    dayOfWeek,
  };
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
  const [syncing, setSyncing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Reloj en vivo (actualiza cada 15s) y fecha reactiva
  const [nowTime, setNowTime] = useState<string>(getCurrentTimeStr());
  const [todayStr, setTodayStr] = useState<string>(getTodayDateStr());

  // Objetivo semanal de salida del viernes (por semana, sin acumular entre semanas)
  const currentWeekStart = useMemo(() => getWeekInfo(todayStr).start, [todayStr]);
  const [fridayGoalMinutes, setFridayGoalMinutes] = useState<FridayGoalMinutes>(() =>
    readWeekFridayGoal(currentUser?.id, getWeekInfo(getTodayDateStr()).start)
  );

  useEffect(() => {
    setFridayGoalMinutes(readWeekFridayGoal(currentUser?.id, currentWeekStart));
  }, [currentUser?.id, currentWeekStart]);

  const handleSelectFridayGoal = (minutes: FridayGoalMinutes) => {
    setFridayGoalMinutes(minutes);
    writeWeekFridayGoal(currentUser?.id, currentWeekStart, minutes);
  };

  // Mes seleccionado para la tabla
  const initialDate = new Date();
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());

  // Modal de registro/edición a posteriori
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formDate, setFormDate] = useState(todayStr);
  const [formDayType, setFormDayType] = useState<TimeDayType>('normal');
  const [formPunches, setFormPunches] = useState<TimePunch[]>([
    { id: '1', start: '08:00', end: '13:00', type: 'work' },
    { id: '2', start: '14:00', end: '17:00', type: 'work' },
  ]);
  const [formSingleLunch, setFormSingleLunch] = useState<number>(0);
  const [formNotes, setFormNotes] = useState('');

  const refreshEntries = useCallback(
    async (silent = false) => {
      if (!currentUser?.id) return;
      if (silent) {
        setSyncing(true);
      } else {
        setLoading(true);
      }
      try {
        const res = await timeTrackingService.getEntries(currentUser.id);
        setEntries(res.entries);
        setStorageMode(res.storageMode);
      } catch (err) {
        console.error('Error cargando fichajes:', err);
        if (!silent) {
          setFeedback({ type: 'error', text: 'No se pudieron cargar los fichajes.' });
        }
      } finally {
        setLoading(false);
        setSyncing(false);
      }
    },
    [currentUser?.id]
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setNowTime(getCurrentTimeStr());
      const nextToday = getTodayDateStr();
      setTodayStr((prev) => {
        if (prev !== nextToday) {
          refreshEntries(true);
        }
        return nextToday;
      });
    }, 15000);
    return () => clearInterval(timer);
  }, [refreshEntries]);

  useEffect(() => {
    if (!currentUser?.id) return;
    refreshEntries(false);

    // Sincronización automática multidispositivo al volver a la pestaña, recuperar red o recibir eventos
    const handleFocusOrOnline = () => {
      refreshEntries(true);
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshEntries(true);
      }
    };

    window.addEventListener('focus', handleFocusOrOnline);
    window.addEventListener('online', handleFocusOrOnline);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const unsubscribeStorageSync = storageService.onSync(() => {
      refreshEntries(true);
    });

    let channel: ReturnType<NonNullable<typeof supabase>['channel']> | null = null;
    if (supabase) {
      try {
        channel = supabase
          .channel(`mecalux-time-entries-${currentUser.id}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'mecalux_time_entries',
              filter: `user_id=eq.${currentUser.id}`,
            },
            () => {
              refreshEntries(true);
            }
          )
          .subscribe();
      } catch (e) {
        console.warn('Error suscribiendo realtime de fichajes:', e);
      }
    }

    return () => {
      window.removeEventListener('focus', handleFocusOrOnline);
      window.removeEventListener('online', handleFocusOrOnline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      unsubscribeStorageSync();
      if (channel && supabase) {
        try {
          supabase.removeChannel(channel);
        } catch {
          // ignore
        }
      }
    };
  }, [currentUser?.id, refreshEntries]);

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

  const openPunch = useMemo(
    () => (todayEntry ? getOpenPunch(todayEntry) : null),
    [todayEntry]
  );

  const isTodayOpen = Boolean(openPunch);
  const isTodayOnPause = openPunch ? getPunchType(openPunch) === 'pause' : false;
  const isTodayWorking = isTodayOpen && !isTodayOnPause;

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
    const breakMins = getBreakMinutes(todayEntry, nowTime);
    const isBeforeStandardExit = nowMins !== null && nowMins < STANDARD_EXIT_MINUTES;
    const projectedBalanceAt17 =
      isTodayOpen &&
      todayEntry.day_type === 'normal' &&
      target > 0 &&
      nowMins !== null &&
      isBeforeStandardExit
        ? workedSoFar + (STANDARD_EXIT_MINUTES - nowMins) - target
        : null;

    return {
      workedSoFar,
      target,
      diff,
      expectedExit,
      breakMins,
      isBeforeStandardExit,
      projectedBalanceAt17,
    };
  }, [todayEntry, nowTime, isTodayOpen]);

  // Cálculos semanales y objetivo de salida anticipada del viernes (sin acumular entre semanas)
  const stats = useMemo(() => {
    const entriesByDate = new Map<string, TimeEntry>();
    for (const entry of entries) {
      entriesByDate.set(entry.entry_date, entry);
    }

    const weekInfo = getWeekInfo(todayStr);
    const isTodayClosed = todayEntry ? getBalanceMinutes(todayEntry) !== null : false;

    let weekBalance = 0;
    let monThuClosedBalance = 0;

    for (const entry of entries) {
      const bal = getBalanceMinutes(entry);
      if (bal !== null) {
        if (entry.entry_date >= weekInfo.start && entry.entry_date <= weekInfo.end) {
          weekBalance += bal;
        }
        if (entry.entry_date >= weekInfo.start && entry.entry_date <= weekInfo.thursday) {
          monThuClosedBalance += bal;
        }
      }
    }

    const todayIsMonToThu = weekInfo.dayOfWeek >= 1 && weekInfo.dayOfWeek <= 4;
    const todayIsFriday = weekInfo.dayOfWeek === 5;
    const isFridayEarlyGoalActive = fridayGoalMinutes > 0;
    const todayLivePositiveBonus =
      todayEntry && !isTodayClosed && todayLive && todayLive.diff > 0 ? todayLive.diff : 0;
    const todayLiveExtraBonus = todayIsMonToThu ? todayLivePositiveBonus : 0;
    const fridayGoalExtra = monThuClosedBalance + todayLiveExtraBonus;
    const weekExtraDisplay = isFridayEarlyGoalActive
      ? fridayGoalExtra
      : weekBalance + todayLivePositiveBonus;

    const remainingForFridayGoal = isFridayEarlyGoalActive
      ? Math.max(0, fridayGoalMinutes - fridayGoalExtra)
      : 0;
    const surplusOverFridayGoal = isFridayEarlyGoalActive
      ? Math.max(0, fridayGoalExtra - fridayGoalMinutes)
      : 0;
    const isFridayGoalMet = isFridayEarlyGoalActive && fridayGoalExtra >= fridayGoalMinutes;
    const fridayGoalPct = isFridayEarlyGoalActive
      ? Math.max(0, Math.min(100, Math.round((fridayGoalExtra / fridayGoalMinutes) * 100)))
      : 0;

    const remainingMonThuDays = weekInfo.monToThuDates.filter((d) => {
      if (d < todayStr) return false;
      const e = entriesByDate.get(d);
      if (!e) return true;
      if (e.day_type !== 'normal') return false;
      if (getBalanceMinutes(e) !== null) return false;
      return true;
    }).length;

    const dailyPaceForFridayGoal =
      isFridayEarlyGoalActive && remainingForFridayGoal > 0 && remainingMonThuDays > 0
        ? Math.ceil(remainingForFridayGoal / remainingMonThuDays)
        : 0;

    const nowMins = timeToMinutes(nowTime);
    let todayExitForFridayGoal: string | null = null;
    if (
      isFridayEarlyGoalActive &&
      todayIsMonToThu &&
      isTodayWorking &&
      todayLive &&
      !isTodayClosed &&
      remainingForFridayGoal > 0 &&
      remainingMonThuDays === 1 &&
      nowMins !== null
    ) {
      const neededTodayWorked =
        todayLive.target + (fridayGoalMinutes - monThuClosedBalance);
      const minsLeft = neededTodayWorked - todayLive.workedSoFar;
      if (minsLeft > 0) {
        todayExitForFridayGoal = minutesToTime(nowMins + minsLeft);
      }
    }

    const fridayEntry = entriesByDate.get(weekInfo.friday) || null;
    const isFridayClosed = fridayEntry ? getBalanceMinutes(fridayEntry) !== null : false;
    const fridayTarget = fridayEntry ? fridayEntry.target_minutes : 480;
    const fridayNeededMinutes = isFridayEarlyGoalActive
      ? Math.max(0, fridayTarget - monThuClosedBalance)
      : fridayTarget;
    const fridayRemainingToday =
      todayIsFriday && todayLive && !isFridayClosed
        ? Math.max(0, fridayNeededMinutes - todayLive.workedSoFar)
        : fridayNeededMinutes;
    const fridayExitFor40h =
      isFridayEarlyGoalActive &&
      todayIsFriday &&
      isTodayOpen &&
      todayLive &&
      !isFridayClosed &&
      fridayRemainingToday > 0 &&
      nowMins !== null
        ? minutesToTime(nowMins + fridayRemainingToday)
        : null;

    return {
      weekBalance,
      monThuClosedBalance,
      todayIsMonToThu,
      todayIsFriday,
      todayLiveExtraBonus,
      isFridayEarlyGoalActive,
      fridayGoalMinutes,
      fridayGoalExtra,
      weekExtraDisplay,
      remainingForFridayGoal,
      surplusOverFridayGoal,
      isFridayGoalMet,
      fridayGoalPct,
      remainingMonThuDays,
      dailyPaceForFridayGoal,
      todayExitForFridayGoal,
      isFridayClosed,
      fridayNeededMinutes,
      fridayRemainingToday,
      fridayExitFor40h,
    };
  }, [entries, todayStr, todayEntry, todayLive, isTodayOpen, nowTime, fridayGoalMinutes]);

  const showProjectedAt17 = Boolean(
    todayLive &&
      todayLive.projectedBalanceAt17 !== null &&
      !(stats.todayIsFriday && stats.isFridayEarlyGoalActive)
  );

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
      storageService.syncFromCloud().catch(() => {});
      setFeedback({
        type: 'success',
        text:
          res.storageMode === 'local'
            ? `${successMsg} (guardado en móvil/local, se subirá al reconectar)`
            : successMsg,
      });
      return true;
    } catch (err) {
      console.error('Error guardando fichaje:', err);
      setFeedback({ type: 'error', text: 'Error al guardar el fichaje.' });
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Obtiene la versión más reciente del día de hoy desde Supabase antes de mutar tramos (evita pisar cambios de otro dispositivo)
  const resolveLatestTodayBase = async (): Promise<{
    baseEntry: TimeEntry | null;
    basePunches: TimePunch[];
  }> => {
    if (!currentUser?.id) return { baseEntry: todayEntry, basePunches: todayPunches };
    try {
      const remoteToday = await timeTrackingService.getEntryByDate(currentUser.id, todayStr);
      if (remoteToday) {
        return { baseEntry: remoteToday, basePunches: getEntryPunches(remoteToday) };
      }
    } catch {
      // Fallback al estado en memoria si no hay red
    }
    return { baseEntry: todayEntry, basePunches: todayPunches };
  };

  const saveTodayPunches = async (
    updatedPunches: TimePunch[],
    message: string,
    baseEntryOverride?: TimeEntry | null
  ) => {
    if (!currentUser?.id) return;
    const refEntry = baseEntryOverride !== undefined ? baseEntryOverride : todayEntry;
    await upsertAndMerge(
      {
        user_id: currentUser.id,
        entry_date: todayStr,
        punches: updatedPunches,
        lunch_minutes:
          updatedPunches.length === 1 && getPunchType(updatedPunches[0]) === 'work'
            ? refEntry?.lunch_minutes ?? 0
            : 0,
        day_type: refEntry?.day_type || 'normal',
        target_minutes: refEntry?.target_minutes,
        notes: refEntry?.notes,
      },
      message
    );
  };

  // Fichar ENTRADA / REANUDAR TRABAJO (si había una pausa abierta, la cierra y abre trabajo)
  const handleStartWorkNow = async () => {
    if (!currentUser?.id) return;
    const now = getCurrentTimeStr();
    const { baseEntry, basePunches } = await resolveLatestTodayBase();
    const wasOnPause = baseEntry ? getPunchType(getOpenPunch(baseEntry) || {}) === 'pause' : false;
    const closedPrev = basePunches.flatMap((p) => {
      if (resolvePunchEnd(p.end)) return [p];
      // Si se abre trabajo en el mismo minuto que una pausa recién creada, descartamos la pausa 0m
      if (getPunchType(p) === 'pause' && p.start === now) return [];
      return [{ ...p, end: now }];
    });
    const updatedPunches: TimePunch[] = [
      ...closedPrev,
      { id: crypto.randomUUID(), start: now, end: null, type: 'work' },
    ];
    await saveTodayPunches(
      updatedPunches,
      basePunches.length === 0
        ? `Entrada fichada a las ${now}`
        : wasOnPause
        ? `Trabajo reanudado a las ${now}`
        : `Vuelta al trabajo fichada a las ${now}`,
      baseEntry
    );
  };

  // Iniciar PAUSA (si había trabajo abierto, lo cierra y abre un tramo de pausa)
  const handleStartPauseNow = async () => {
    if (!currentUser?.id) return;
    const now = getCurrentTimeStr();
    const { baseEntry, basePunches } = await resolveLatestTodayBase();
    const closedPrev = basePunches.flatMap((p) => {
      if (resolvePunchEnd(p.end)) return [p];
      if (getPunchType(p) === 'work' && p.start === now) return [];
      return [{ ...p, end: now }];
    });
    const updatedPunches: TimePunch[] = [
      ...closedPrev,
      { id: crypto.randomUUID(), start: now, end: null, type: 'pause' },
    ];
    await saveTodayPunches(updatedPunches, `Pausa iniciada a las ${now}`, baseEntry);
  };

  // Finalizar tramo abierto (cierra jornada sin abrir otro tramo)
  const handleFinishPunchNow = async () => {
    if (!currentUser?.id) return;
    const now = getCurrentTimeStr();
    const { baseEntry, basePunches } = await resolveLatestTodayBase();
    if (!baseEntry && basePunches.length === 0) return;
    const updatedPunches = basePunches.flatMap((p) => {
      if (resolvePunchEnd(p.end)) return [p];
      if (getPunchType(p) === 'pause' && p.start === now) return [];
      return [{ ...p, end: now }];
    });
    if (updatedPunches.length === 0 && baseEntry) {
      await handleDeleteEntry(baseEntry);
      return;
    }
    await saveTodayPunches(updatedPunches, `Jornada cerrada a las ${now}`, baseEntry);
  };

  // Cambiar rápido un tramo de hoy entre Trabajo y Pausa
  const handleToggleTodayPunchType = async (punchId: string) => {
    if (!currentUser?.id) return;
    const { baseEntry, basePunches } = await resolveLatestTodayBase();
    if (!baseEntry && basePunches.length === 0) return;
    const updated = basePunches.map((p) =>
      p.id === punchId
        ? { ...p, type: (getPunchType(p) === 'pause' ? 'work' : 'pause') as TimePunchType }
        : p
    );
    const target = updated.find((p) => p.id === punchId);
    const newLabel = target && getPunchType(target) === 'pause' ? 'Pausa' : 'Trabajo';
    await saveTodayPunches(updated, `Tramo cambiado a ${newLabel}`, baseEntry);
  };

  const handleRemoveTodayPunch = async (punchId: string) => {
    if (!currentUser?.id) return;
    const { baseEntry, basePunches } = await resolveLatestTodayBase();
    if (!baseEntry && basePunches.length === 0) return;
    const remaining = basePunches.filter((p) => p.id !== punchId);
    if (remaining.length === 0 && baseEntry) {
      await handleDeleteEntry(baseEntry);
      return;
    }
    await saveTodayPunches(remaining, 'Tramo eliminado', baseEntry);
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
      { id: crypto.randomUUID(), start: '08:00', end: '13:00', type: 'work' },
      { id: crypto.randomUUID(), start: '14:00', end: '17:00', type: 'work' },
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
        ? existingPunches.map((p) => ({
            ...p,
            end: resolvePunchEnd(p.end),
            type: getPunchType(p),
            label: p.label || '',
          }))
        : [{ id: crypto.randomUUID(), start: '08:00', end: null, type: 'work', label: '' }]
    );
    const singleWork =
      existingPunches.length === 1 && getPunchType(existingPunches[0]) === 'work';
    setFormSingleLunch(singleWork ? entry.lunch_minutes || 0 : 0);
    setFormNotes(entry.notes || '');
    setIsModalOpen(true);
  };

  const handleAddFormPunch = (type: TimePunchType = 'work') => {
    const last = formPunches[formPunches.length - 1];
    const nextStart = resolvePunchEnd(last?.end) || (type === 'pause' ? '13:00' : '14:00');
    setFormPunches((prev) => [
      ...prev,
      { id: crypto.randomUUID(), start: nextStart, end: null, type, label: '' },
    ]);
  };

  const handleUpdateFormPunch = (
    id: string,
    field: 'start' | 'end' | 'type' | 'label',
    value: string
  ) => {
    setFormPunches((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        if (field === 'end') return { ...p, end: value || null };
        if (field === 'type') return { ...p, type: value as TimePunchType };
        return { ...p, [field]: value };
      })
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
        ? formPunches
            .filter((p) => p.start && p.start.trim() !== '')
            .map((p) => ({
              ...p,
              type: getPunchType(p),
              label: p.label?.trim() || undefined,
            }))
        : [];

    if (formDayType === 'normal' && cleanPunches.length === 0) {
      setFeedback({ type: 'error', text: 'Añade al menos una hora de entrada.' });
      return;
    }

    const isSingleWork = cleanPunches.length === 1 && getPunchType(cleanPunches[0]) === 'work';

    const ok = await upsertAndMerge(
      {
        user_id: currentUser.id,
        entry_date: formDate,
        punches: cleanPunches,
        lunch_minutes: isSingleWork ? formSingleLunch : 0,
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
      setEntries((prev) => prev.filter((e) => e.id !== entry.id && e.entry_date !== entry.entry_date));
      storageService.syncFromCloud().catch(() => {});
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
      return { worked: 0, indicativeWorked: null as number | null, target: 0, balance: 0, breaks: 0 };
    }
    const isSingleWork = formPunches.length === 1 && getPunchType(formPunches[0]) === 'work';
    const lunchVal = isSingleWork ? formSingleLunch : 0;
    const baseEntry = {
      punches: formPunches,
      start_time: formPunches[0]?.start || null,
      end_time: formPunches[formPunches.length - 1]?.end || null,
      lunch_minutes: lunchVal,
      day_type: formDayType,
    };
    const worked = getWorkedMinutes(baseEntry);
    const indicativeWorked =
      worked === null
        ? formDate === todayStr
          ? getWorkedMinutes(baseEntry, nowTime) ?? getClosedWorkedMinutes(baseEntry)
          : getClosedWorkedMinutes(baseEntry)
        : null;
    const breaks = getBreakMinutes(baseEntry, formDate === todayStr ? nowTime : undefined);
    return {
      worked,
      indicativeWorked,
      target,
      breaks,
      balance: worked !== null ? worked - target : null,
    };
  }, [formDate, formDayType, formPunches, formSingleLunch, todayStr, nowTime]);

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

  const cardSurface = isDark
    ? 'bg-slate-900/80 text-white'
    : 'bg-white text-slate-900 shadow-sm';
  const defaultCardBorder = isDark ? 'border-slate-800' : 'border-slate-200';
  const cardBg = `${cardSurface} ${defaultCardBorder}`;

  const subCardBg = isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200';

  const activeFridayOption =
    FRIDAY_GOAL_OPTIONS.find((o) => o.minutes === fridayGoalMinutes) || FRIDAY_GOAL_OPTIONS[2];

  const renderBalanceBadge = (
    balance: number | null,
    large = false,
    liveState?: 'working' | 'pause'
  ) => {
    if (balance === null) {
      if (liveState === 'working') {
        return (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border font-extrabold ${
              isDark
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35'
                : 'bg-emerald-100 text-emerald-700 border-emerald-300'
            } ${large ? 'px-3 py-1 text-sm' : 'px-2.5 py-0.5 text-xs'}`}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            En curso
          </span>
        );
      }
      if (liveState === 'pause') {
        return (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border font-extrabold ${
              isDark
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/35'
                : 'bg-amber-100 text-amber-800 border-amber-300'
            } ${large ? 'px-3 py-1 text-sm' : 'px-2.5 py-0.5 text-xs'}`}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
            En pausa
          </span>
        );
      }
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-full border font-bold ${
            isDark
              ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
              : 'bg-amber-100 text-amber-800 border-amber-300'
          } ${large ? 'px-3 py-1 text-sm' : 'px-2.5 py-0.5 text-xs'}`}
        >
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

      {/* Tarjeta principal: Objetivo Viernes (Normal / 16:00 / 15:00) y Saldo Extra Semanal */}
      <div
        className={`rounded-3xl border p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          stats.isFridayEarlyGoalActive && stats.isFridayGoalMet
            ? isDark
              ? 'bg-emerald-950/20 border-emerald-500/40 text-white'
              : 'bg-emerald-50/60 border-emerald-300 text-slate-900 shadow-sm'
            : stats.isFridayEarlyGoalActive
            ? `${cardSurface} ${isDark ? 'border-cyan-500/35' : 'border-cyan-300'}`
            : cardBg
        }`}
      >
        <div className="flex-1 min-w-0 space-y-2.5">
          <div className="flex flex-wrap items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>
              {stats.isFridayEarlyGoalActive
                ? `Viernes ${activeFridayOption.shortLabel} · Extra`
                : 'Saldo Extra Semana'}
            </span>
            {!stats.isFridayEarlyGoalActive ? (
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-extrabold normal-case ${
                  isDark
                    ? 'bg-slate-800 text-slate-300 border-slate-700'
                    : 'bg-slate-100 text-slate-700 border-slate-300'
                }`}
              >
                Viernes 8h
              </span>
            ) : stats.isFridayGoalMet ? (
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-extrabold normal-case ${
                  isDark
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : 'bg-emerald-100 text-emerald-700 border-emerald-300'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {stats.surplusOverFridayGoal > 0
                  ? `+${formatDuration(stats.surplusOverFridayGoal)} margen`
                  : 'Cubierto'}
              </span>
            ) : (
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-extrabold normal-case ${
                  stats.weekExtraDisplay < 0
                    ? isDark
                      ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                      : 'bg-rose-100 text-rose-700 border-rose-300'
                    : isDark
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    : 'bg-amber-100 text-amber-800 border-amber-300'
                }`}
              >
                Faltan {formatDuration(stats.remainingForFridayGoal)}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <div className="flex items-baseline gap-2">
              <span
                className={`text-3xl font-black tracking-tight ${
                  stats.isFridayEarlyGoalActive
                    ? stats.isFridayGoalMet
                      ? isDark
                        ? 'text-emerald-400'
                        : 'text-emerald-600'
                      : stats.weekExtraDisplay > 0
                      ? isDark
                        ? 'text-cyan-400'
                        : 'text-cyan-600'
                      : stats.weekExtraDisplay < 0
                      ? isDark
                        ? 'text-rose-400'
                        : 'text-rose-600'
                      : isDark
                      ? 'text-white'
                      : 'text-slate-900'
                    : stats.weekExtraDisplay > 0
                    ? isDark
                      ? 'text-emerald-400'
                      : 'text-emerald-600'
                    : stats.weekExtraDisplay < 0
                    ? isDark
                      ? 'text-rose-400'
                      : 'text-rose-600'
                    : isDark
                    ? 'text-white'
                    : 'text-slate-900'
                }`}
              >
                {formatDuration(stats.weekExtraDisplay, true)}
              </span>
              {stats.isFridayEarlyGoalActive && (
                <span className="text-xs text-slate-400 font-semibold">
                  / +{formatDuration(fridayGoalMinutes)}
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400">
              {!stats.isFridayEarlyGoalActive ? (
                stats.weekExtraDisplay < 0 ? (
                  <>Viernes normal (8h) · déficit actual esta semana</>
                ) : (
                  <>Viernes normal (8h) · el extra semanal no se acumula entre semanas</>
                )
              ) : stats.todayIsFriday ? (
                stats.isFridayClosed ? (
                  <>
                    Semana cerrada ({formatDuration(stats.weekBalance, true)}) · Extra L–J:{' '}
                    <span className="font-semibold">
                      {formatDuration(stats.monThuClosedBalance, true)}
                    </span>
                  </>
                ) : stats.fridayExitFor40h ? (
                  <>
                    Hoy necesitas{' '}
                    <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                      {formatDuration(stats.fridayNeededMinutes)}
                    </span>{' '}
                    · 40h a las{' '}
                    <span className={`font-bold ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>
                      {stats.fridayExitFor40h}
                    </span>
                  </>
                ) : todayEntry && stats.fridayRemainingToday <= 0 ? (
                  <span
                    className={
                      isDark ? 'text-emerald-400 font-semibold' : 'text-emerald-600 font-semibold'
                    }
                  >
                    ¡Semana completada hoy! Ya puedes salir
                  </span>
                ) : (
                  <>
                    Hoy necesitas{' '}
                    <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                      {formatDuration(stats.fridayNeededMinutes)}
                    </span>{' '}
                    para cuadrar la semana
                  </>
                )
              ) : stats.todayIsMonToThu ? (
                stats.isFridayGoalMet ? (
                  <>
                    {stats.surplusOverFridayGoal > 0 ? (
                      <>
                        Objetivo +{formatDuration(fridayGoalMinutes)} cubierto (+
                        {formatDuration(stats.surplusOverFridayGoal)} de margen)
                      </>
                    ) : (
                      <>
                        ¡Objetivo +{formatDuration(fridayGoalMinutes)} cubierto! Viernes salida a las{' '}
                        {activeFridayOption.shortLabel}
                      </>
                    )}
                    {stats.todayLiveExtraBonus > 0
                      ? ` · incl. +${formatDuration(stats.todayLiveExtraBonus)} hoy`
                      : ''}
                  </>
                ) : stats.remainingMonThuDays === 1 ? (
                  stats.todayExitForFridayGoal ? (
                    <>
                      Con +{formatDuration(stats.remainingForFridayGoal)} hoy (hasta las{' '}
                      <span className={`font-bold ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>
                        {stats.todayExitForFridayGoal}
                      </span>
                      ) lo completas
                    </>
                  ) : (
                    <>
                      Te faltan {formatDuration(stats.remainingForFridayGoal)} hoy para completarlo
                    </>
                  )
                ) : stats.remainingMonThuDays > 1 ? (
                  <>
                    Ritmo sugerido:{' '}
                    <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                      +{formatDuration(stats.dailyPaceForFridayGoal)}/día
                    </span>{' '}
                    ({stats.remainingMonThuDays} días L–J)
                  </>
                ) : (
                  <>
                    Faltaron {formatDuration(stats.remainingForFridayGoal)} en L–J · Viernes:{' '}
                    <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                      {formatDuration(stats.fridayNeededMinutes)}
                    </span>
                  </>
                )
              ) : (
                <>
                  Extra L–J · Balance semana:{' '}
                  <span className="font-semibold">{formatDuration(stats.weekBalance, true)}</span>
                </>
              )}
            </p>
          </div>

          {stats.isFridayEarlyGoalActive && (
            <div
              className={`max-w-md h-2 rounded-full overflow-hidden ${
                isDark ? 'bg-slate-800' : 'bg-slate-200'
              }`}
            >
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  stats.isFridayGoalMet
                    ? 'bg-emerald-500'
                    : 'bg-gradient-to-r from-cyan-500 to-emerald-500'
                }`}
                style={{ width: `${stats.fridayGoalPct}%` }}
              />
            </div>
          )}
        </div>

        <div className="flex-shrink-0 flex items-center gap-2.5 self-start md:self-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Viernes:
          </span>
          <div
            className={`inline-flex items-center gap-0.5 p-1 rounded-xl border ${
              isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}
            role="group"
            aria-label="Objetivo de salida del viernes"
          >
            {FRIDAY_GOAL_OPTIONS.map((opt) => {
              const isSelected = fridayGoalMinutes === opt.minutes;
              const activeClass =
                opt.minutes === 0
                  ? isDark
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'bg-white text-slate-900 shadow-sm'
                  : stats.isFridayGoalMet
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-sm';
              const idleClass = isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-600 hover:text-slate-900';

              return (
                <button
                  key={opt.minutes}
                  type="button"
                  title={opt.title}
                  aria-pressed={isSelected}
                  onClick={() => handleSelectFridayGoal(opt.minutes)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isSelected ? activeClass : idleClass
                  }`}
                >
                  {opt.shortLabel}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Panel de Fichajes de Hoy (Múltiples tramos: Trabajo y Pausa) */}
      <div className={`rounded-3xl border p-5 space-y-4 ${cardBg}`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg flex-shrink-0 ${
                isTodayWorking
                  ? 'bg-gradient-to-tr from-emerald-500 to-cyan-500 shadow-emerald-500/25'
                  : isTodayOnPause
                  ? 'bg-gradient-to-tr from-amber-500 to-orange-500 shadow-amber-500/25'
                  : todayPunches.length > 0
                  ? 'bg-gradient-to-tr from-slate-600 to-slate-500'
                  : 'bg-gradient-to-tr from-slate-700 to-slate-600'
              }`}
            >
              {isTodayWorking ? (
                <Clock className="w-6 h-6 animate-pulse" />
              ) : (
                <Coffee className={`w-6 h-6 ${isTodayOnPause ? 'animate-pulse' : ''}`} />
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-base sm:text-lg font-black">Fichajes de hoy</h2>
                <span className="px-2.5 py-0.5 rounded-lg bg-slate-800 text-cyan-300 font-mono text-xs font-bold border border-slate-700">
                  {nowTime}
                </span>
                {isTodayWorking ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
                    Trabajando ahora
                  </span>
                ) : isTodayOnPause ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[11px] font-bold">
                    En pausa ahora
                  </span>
                ) : todayPunches.length > 0 ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-500/15 text-slate-300 border border-slate-500/30 text-[11px] font-bold">
                    Jornada cerrada
                  </span>
                ) : null}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Registra cada tramo como <strong>Trabajo</strong> o <strong>Pausa</strong> (también puedes pulsar su etiqueta abajo para cambiarlo).
              </p>
            </div>
          </div>

          {/* Botones principales de fichaje */}
          <div className="flex flex-wrap items-center gap-2.5">
            {todayPunches.length === 0 ? (
              <button
                type="button"
                disabled={saving}
                onClick={handleStartWorkNow}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Fichar Entrada ({nowTime})</span>
              </button>
            ) : isTodayWorking ? (
              <>
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleStartPauseNow}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
                >
                  <Coffee className="w-4 h-4" />
                  <span>Iniciar Pausa ({nowTime})</span>
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleFinishPunchNow}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-rose-500/20 transition-all disabled:opacity-50"
                >
                  <Square className="w-4 h-4 fill-current" />
                  <span>Finalizar Jornada ({nowTime})</span>
                </button>
              </>
            ) : isTodayOnPause ? (
              <>
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleStartWorkNow}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Reanudar Trabajo ({nowTime})</span>
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleFinishPunchNow}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-rose-500/20 transition-all disabled:opacity-50"
                >
                  <Square className="w-4 h-4 fill-current" />
                  <span>Finalizar Jornada ({nowTime})</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleStartWorkNow}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Fichar Vuelta / Entrada ({nowTime})</span>
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleStartPauseNow}
                  className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-amber-600/90 hover:bg-amber-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-amber-500/15 transition-all disabled:opacity-50"
                >
                  <Coffee className="w-4 h-4" />
                  <span>Iniciar Pausa ({nowTime})</span>
                </button>
              </>
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
          <div className={`p-3.5 rounded-2xl border space-y-2.5 ${subCardBg}`}>
            <div className="flex flex-wrap items-center gap-2">
              {todayPunches.map((punch, idx) => {
                const segStart = timeToMinutes(punch.start);
                const resolvedEnd = resolvePunchEnd(punch.end);
                const segEnd = timeToMinutes(resolvedEnd ?? nowTime);
                const segMins =
                  segStart !== null && segEnd !== null && segEnd > segStart ? segEnd - segStart : 0;
                const isPause = getPunchType(punch) === 'pause';

                // Hueco sin fichar respecto al tramo anterior
                let gapMins = 0;
                if (idx > 0) {
                  const prevEnd = timeToMinutes(resolvePunchEnd(todayPunches[idx - 1].end));
                  if (prevEnd !== null && segStart !== null && segStart > prevEnd) {
                    gapMins = segStart - prevEnd;
                  }
                }

                return (
                  <React.Fragment key={punch.id}>
                    {idx > 0 && gapMins > 0 && (
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px] font-bold"
                        title="Tiempo sin fichar entre tramos (se suma a Pausas)"
                      >
                        <Coffee className="w-3 h-3" />
                        Pausa {formatDuration(gapMins)}
                      </span>
                    )}
                    <div
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs ${
                        isPause
                          ? 'bg-amber-950/30 border-amber-500/35'
                          : 'bg-slate-900/90 border-slate-700/80'
                      }`}
                    >
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => handleToggleTodayPunchType(punch.id)}
                        title="Haz clic para cambiar entre Trabajo y Pausa"
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-extrabold uppercase transition-colors ${
                          isPause
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                            : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/25'
                        }`}
                      >
                        {isPause ? <Coffee className="w-3 h-3" /> : <Briefcase className="w-3 h-3" />}
                        <span>{isPause ? 'Pausa' : 'Trabajo'}</span>
                        {punch.label ? <span className="normal-case opacity-85">· {punch.label}</span> : null}
                      </button>
                      <span className="font-mono font-bold text-white">
                        {punch.start} →{' '}
                        {punch.end || (
                          <span className={isPause ? 'text-amber-400' : 'text-emerald-400'}>en curso</span>
                        )}
                      </span>
                      <span className={`text-[11px] font-bold ${isPause ? 'text-amber-400' : 'text-cyan-400'}`}>
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

            {todayLive && (
              <div
                className={`flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-2 border-t text-[11px] text-slate-400 ${
                  isDark ? 'border-slate-800/70' : 'border-slate-200'
                }`}
              >
                <span>
                  Trabajado hoy:{' '}
                  <strong className="text-emerald-400">{formatDuration(todayLive.workedSoFar)}</strong>
                </span>
                <span>
                  Tiempo total en pausas / sin trabajar:{' '}
                  <strong className="text-amber-400">{formatDuration(todayLive.breakMins)}</strong>
                </span>
                {isTodayOpen && (
                  <span className="inline-flex flex-wrap items-center gap-x-2.5 gap-y-1">
                    {stats.isFridayEarlyGoalActive &&
                    stats.todayIsFriday &&
                    !stats.isFridayClosed ? (
                      stats.fridayExitFor40h && stats.monThuClosedBalance !== 0 ? (
                        <>
                          {isTodayOnPause
                            ? `Si vuelves ahora, cierras semana (${formatDuration(stats.fridayNeededMinutes)}) a las`
                            : `Para cerrar semana (${formatDuration(stats.fridayNeededMinutes)}) sales a las`}{' '}
                          <strong className={isDark ? 'text-cyan-400' : 'text-cyan-600'}>
                            {stats.fridayExitFor40h}
                          </strong>
                        </>
                      ) : stats.fridayRemainingToday <= 0 ? (
                        <strong className={isDark ? 'text-emerald-400' : 'text-emerald-600'}>
                          ¡Objetivo semanal completado!
                        </strong>
                      ) : todayLive.expectedExit ? (
                        <>
                          {isTodayOnPause
                            ? 'Si vuelves ahora, 8h a las'
                            : 'Para 8h sales a las'}{' '}
                          <strong className={isDark ? 'text-cyan-400' : 'text-cyan-600'}>
                            {todayLive.expectedExit}
                          </strong>
                        </>
                      ) : (
                        <strong className={isDark ? 'text-emerald-400' : 'text-emerald-600'}>
                          Objetivo 8h superado ({formatDuration(todayLive.diff, true)})
                        </strong>
                      )
                    ) : showProjectedAt17 && todayLive.projectedBalanceAt17 !== null ? (
                      <>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border font-bold ${
                            todayLive.projectedBalanceAt17 > 0
                              ? isDark
                                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : todayLive.projectedBalanceAt17 < 0
                              ? isDark
                                ? 'bg-rose-500/15 text-rose-300 border-rose-500/35'
                                : 'bg-rose-50 text-rose-700 border-rose-300'
                              : isDark
                              ? 'bg-slate-800/80 text-slate-200 border-slate-700'
                              : 'bg-slate-100 text-slate-700 border-slate-300'
                          }`}
                        >
                          <span>
                            {isTodayOnPause
                              ? `Si vuelves ahora (${STANDARD_EXIT_LABEL}):`
                              : `Si sales a las ${STANDARD_EXIT_LABEL}:`}
                          </span>
                          <strong className="font-extrabold">
                            {formatDuration(todayLive.projectedBalanceAt17, true)}
                          </strong>
                        </span>
                        {todayLive.expectedExit ? (
                          <span>
                            8h a las{' '}
                            <strong className={isDark ? 'text-cyan-400' : 'text-cyan-600'}>
                              {todayLive.expectedExit}
                            </strong>
                          </span>
                        ) : (
                          <strong className={isDark ? 'text-emerald-400' : 'text-emerald-600'}>
                            8h superadas ({formatDuration(todayLive.diff, true)} ahora)
                          </strong>
                        )}
                      </>
                    ) : todayLive.expectedExit ? (
                      <>
                        {isTodayOnPause
                          ? 'Si vuelves ahora, 8h a las'
                          : 'Para 8h sales a las'}{' '}
                        <strong className={isDark ? 'text-cyan-400' : 'text-cyan-600'}>
                          {todayLive.expectedExit}
                        </strong>
                      </>
                    ) : (
                      <strong className={isDark ? 'text-emerald-400' : 'text-emerald-600'}>
                        Objetivo 8h superado ({formatDuration(todayLive.diff, true)})
                      </strong>
                    )}
                  </span>
                )}
              </div>
            )}
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
              type="button"
              onClick={() => refreshEntries(true)}
              disabled={syncing || loading}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold ${subCardBg} hover:border-cyan-500/50 transition-colors disabled:opacity-50`}
              title="Sincronizar fichajes con la nube"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin text-cyan-400' : ''}`} />
              <span>{syncing ? 'Sincronizando...' : 'Sincronizar'}</span>
            </button>
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
                  const isToday = entry.entry_date === todayStr;
                  const rowOpenPunch = getOpenPunch(entry);
                  const isRowOpen = Boolean(rowOpenPunch);
                  const isRowOnPause = rowOpenPunch ? getPunchType(rowOpenPunch) === 'pause' : false;
                  const isRowWorking = isRowOpen && !isRowOnPause;
                  const breakMins = getBreakMinutes(entry, isToday ? nowTime : undefined);
                  const worked = getWorkedMinutes(entry);
                  const balance = getBalanceMinutes(entry);
                  const indicativeWorked =
                    worked === null && entry.day_type === 'normal'
                      ? isToday
                        ? getWorkedMinutes(entry, nowTime) ?? getClosedWorkedMinutes(entry)
                        : getClosedWorkedMinutes(entry)
                      : null;
                  const indicativeBalance =
                    balance === null && isToday && indicativeWorked !== null
                      ? indicativeWorked - entry.target_minutes
                      : null;

                  return (
                    <tr
                      key={entry.id}
                      className={`transition-colors ${
                        isToday && isRowWorking
                          ? 'today-row-working'
                          : isToday && isRowOnPause
                          ? 'today-row-paused'
                          : isToday
                          ? isDark
                            ? 'bg-cyan-500/[0.05] hover:bg-cyan-500/[0.09]'
                            : 'bg-cyan-50/70 hover:bg-cyan-50'
                          : isDark
                          ? 'hover:bg-slate-800/40'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <td
                        className={`py-3.5 px-5 whitespace-nowrap ${
                          isToday
                            ? `border-l-4 ${
                                isRowWorking
                                  ? 'border-l-emerald-400'
                                  : isRowOnPause
                                  ? 'border-l-amber-400'
                                  : 'border-l-cyan-500/60'
                              }`
                            : ''
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold capitalize">
                            {formatDisplayDate(entry.entry_date)}
                          </span>
                          {isToday && (
                            <span
                              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] font-extrabold uppercase ${
                                isRowWorking
                                  ? isDark
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                    : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                  : isRowOnPause
                                  ? isDark
                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                    : 'bg-amber-100 text-amber-800 border-amber-300'
                                  : isDark
                                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                                  : 'bg-cyan-100 text-cyan-800 border-cyan-300'
                              }`}
                            >
                              {isRowOpen && (
                                <span className="relative flex h-1.5 w-1.5">
                                  <span
                                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                                      isRowWorking ? 'bg-emerald-400' : 'bg-amber-400'
                                    }`}
                                  />
                                  <span
                                    className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
                                      isRowWorking ? 'bg-emerald-500' : 'bg-amber-500'
                                    }`}
                                  />
                                </span>
                              )}
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

                      <td
                        className="py-3.5 px-4 font-mono text-xs cursor-pointer"
                        onClick={() => openModalForEntry(entry)}
                        title="Haz clic para editar los tramos de este día"
                      >
                        {entry.day_type !== 'normal' && punches.length === 0 ? (
                          <span className="text-slate-500">—</span>
                        ) : (
                          <div className="flex flex-wrap items-center gap-1.5">
                            {punches.map((p, i) => {
                              const isPause = getPunchType(p) === 'pause';
                              const isPunchOpen = !resolvePunchEnd(p.end);
                              const punchStyle = isPunchOpen
                                ? isPause
                                  ? isDark
                                    ? 'bg-amber-500/20 border-amber-400/60 text-amber-200 shadow-sm shadow-amber-500/10'
                                    : 'bg-amber-100 border-amber-400 text-amber-900'
                                  : isDark
                                  ? 'bg-emerald-500/15 border-emerald-400/55 text-emerald-200 shadow-sm shadow-emerald-500/10'
                                  : 'bg-emerald-100 border-emerald-400 text-emerald-900'
                                : isPause
                                ? isDark
                                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                                  : 'bg-amber-50 border-amber-300 text-amber-800'
                                : isDark
                                ? 'bg-slate-800/80 border-slate-700/60'
                                : 'bg-slate-100 border-slate-300 text-slate-800';
                              return (
                                <span
                                  key={p.id || i}
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border ${punchStyle}`}
                                >
                                  {isPause && <Coffee className="w-3 h-3 flex-shrink-0" />}
                                  {isPause ? (
                                    <span className="font-sans text-[10px] font-bold uppercase tracking-wide">
                                      {p.label || 'Pausa'}:
                                    </span>
                                  ) : p.label ? (
                                    <span className="font-sans text-[10px] font-bold text-cyan-400">
                                      {p.label}:
                                    </span>
                                  ) : null}
                                  <span>
                                    {p.start} → {p.end || 'En curso'}
                                  </span>
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-400">
                        {entry.day_type === 'normal' ? formatDuration(breakMins) : '—'}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap font-bold">
                        {worked !== null ? (
                          formatDuration(worked)
                        ) : indicativeWorked !== null ? (
                          <div className="leading-tight" title="Tiempo acumulado indicativo hasta ahora">
                            <span className="text-cyan-400">~{formatDuration(indicativeWorked)}</span>
                            <span className="block text-[10px] font-semibold text-slate-400">
                              {isToday ? 'en curso' : 'sin cerrar'}
                            </span>
                          </div>
                        ) : (
                          '—'
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex flex-col items-start gap-0.5">
                          {renderBalanceBadge(
                            balance,
                            false,
                            isToday && isRowWorking
                              ? 'working'
                              : isToday && isRowOnPause
                              ? 'pause'
                              : undefined
                          )}
                          {isToday && isRowOpen && entry.day_type === 'normal' ? (
                            showProjectedAt17 && todayLive?.projectedBalanceAt17 !== null ? (
                              <span
                                className={`text-[10px] font-bold ${
                                  todayLive.projectedBalanceAt17 > 0
                                    ? isDark
                                      ? 'text-emerald-400'
                                      : 'text-emerald-600'
                                    : todayLive.projectedBalanceAt17 < 0
                                    ? isDark
                                      ? 'text-rose-400'
                                      : 'text-rose-600'
                                    : isDark
                                    ? 'text-slate-400'
                                    : 'text-slate-500'
                                }`}
                                title={`Saldo estimado si sales a las ${STANDARD_EXIT_LABEL} según los fichajes actuales`}
                              >
                                a las {STANDARD_EXIT_LABEL}:{' '}
                                {formatDuration(todayLive.projectedBalanceAt17, true)}
                              </span>
                            ) : stats.isFridayEarlyGoalActive &&
                              stats.todayIsFriday &&
                              !stats.isFridayClosed ? (
                              stats.fridayExitFor40h ? (
                                <span
                                  className={`text-[10px] font-bold ${
                                    isDark ? 'text-cyan-400' : 'text-cyan-600'
                                  }`}
                                >
                                  40h a las {stats.fridayExitFor40h}
                                </span>
                              ) : stats.fridayRemainingToday <= 0 ? (
                                <span
                                  className={`text-[10px] font-bold ${
                                    isDark ? 'text-emerald-400' : 'text-emerald-600'
                                  }`}
                                >
                                  40h cumplidas
                                </span>
                              ) : indicativeBalance !== null ? (
                                <span
                                  className={`text-[10px] font-bold ${
                                    indicativeBalance > 0
                                      ? isDark
                                        ? 'text-emerald-400'
                                        : 'text-emerald-600'
                                      : indicativeBalance < 0
                                      ? isDark
                                        ? 'text-rose-400'
                                        : 'text-rose-600'
                                      : isDark
                                      ? 'text-slate-400'
                                      : 'text-slate-500'
                                  }`}
                                >
                                  ahora: {formatDuration(indicativeBalance, true)}
                                </span>
                              ) : null
                            ) : indicativeBalance !== null ? (
                              <span
                                className={`text-[10px] font-bold ${
                                  indicativeBalance > 0
                                    ? isDark
                                      ? 'text-emerald-400'
                                      : 'text-emerald-600'
                                    : indicativeBalance < 0
                                    ? isDark
                                      ? 'text-rose-400'
                                      : 'text-rose-600'
                                    : isDark
                                    ? 'text-slate-400'
                                    : 'text-slate-500'
                                }`}
                              >
                                ahora: {formatDuration(indicativeBalance, true)}
                              </span>
                            ) : null
                          ) : (
                            indicativeBalance !== null && (
                              <span
                                className={`text-[10px] font-bold ${
                                  indicativeBalance >= 0 ? 'text-emerald-400' : 'text-slate-400'
                                }`}
                              >
                                indicativo: {formatDuration(indicativeBalance, true)}
                              </span>
                            )
                          )}
                        </div>
                      </td>

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
            className={`w-full max-w-2xl rounded-3xl border p-6 shadow-2xl space-y-5 my-auto ${
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
                            { id: crypto.randomUUID(), start: '08:00', end: '13:00', type: 'work', label: 'Mañana' },
                            { id: crypto.randomUUID(), start: '13:00', end: '14:00', type: 'pause', label: 'Comida' },
                            { id: crypto.randomUUID(), start: '14:00', end: '17:00', type: 'work', label: 'Tarde' },
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
                            { id: crypto.randomUUID(), start: '08:00', end: '13:00', type: 'work', label: 'Mañana' },
                            { id: crypto.randomUUID(), start: '13:00', end: '13:30', type: 'pause', label: 'Comida' },
                            { id: crypto.randomUUID(), start: '13:30', end: '17:00', type: 'work', label: 'Tarde' },
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
                            { id: crypto.randomUUID(), start: '08:00', end: '15:00', type: 'work' },
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
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label className="text-xs font-bold text-slate-400">
                        Tramos del día ({formPunches.length})
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleAddFormPunch('work')}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-xs font-bold text-cyan-400 hover:bg-cyan-500/20"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Añadir trabajo</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddFormPunch('pause')}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs font-bold text-amber-400 hover:bg-amber-500/20"
                        >
                          <Coffee className="w-3.5 h-3.5" />
                          <span>Añadir pausa</span>
                        </button>
                      </div>
                    </div>

                    {formPunches.map((punch, idx) => {
                      const isPause = getPunchType(punch) === 'pause';
                      return (
                        <div
                          key={punch.id}
                          className={`p-2.5 rounded-2xl border space-y-2 ${
                            isPause
                              ? 'bg-amber-500/5 border-amber-500/30'
                              : isDark
                              ? 'bg-slate-950/50 border-slate-800'
                              : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[11px] font-bold text-slate-500 w-14 flex-shrink-0">
                              Tramo {idx + 1}
                            </span>

                            {/* Selector Trabajo / Pausa */}
                            <div className="inline-flex rounded-xl border border-slate-700/70 overflow-hidden flex-shrink-0">
                              <button
                                type="button"
                                onClick={() => handleUpdateFormPunch(punch.id, 'type', 'work')}
                                className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold transition-colors ${
                                  !isPause
                                    ? 'bg-cyan-600 text-white'
                                    : 'text-slate-400 hover:text-white'
                                }`}
                              >
                                <Briefcase className="w-3 h-3" />
                                <span>Trabajo</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateFormPunch(punch.id, 'type', 'pause')}
                                className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold transition-colors ${
                                  isPause
                                    ? 'bg-amber-600 text-white'
                                    : 'text-slate-400 hover:text-white'
                                }`}
                              >
                                <Coffee className="w-3 h-3" />
                                <span>Pausa</span>
                              </button>
                            </div>

                            <input
                              type="time"
                              value={punch.start}
                              onChange={(e) => handleUpdateFormPunch(punch.id, 'start', e.target.value)}
                              className={`w-28 px-2.5 py-1.5 rounded-xl border text-sm font-mono font-bold ${subCardBg}`}
                            />
                            <span className="text-slate-500 text-xs">→</span>
                            <input
                              type="time"
                              value={punch.end || ''}
                              onChange={(e) => handleUpdateFormPunch(punch.id, 'end', e.target.value)}
                              className={`w-28 px-2.5 py-1.5 rounded-xl border text-sm font-mono font-bold ${subCardBg}`}
                            />

                            <input
                              type="text"
                              value={punch.label || ''}
                              onChange={(e) => handleUpdateFormPunch(punch.id, 'label', e.target.value)}
                              placeholder={isPause ? 'Motivo (Comida, Café...)' : 'Etiqueta (opcional)'}
                              className={`flex-1 min-w-[120px] px-2.5 py-1.5 rounded-xl border text-xs ${subCardBg}`}
                            />

                            {formPunches.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleDeleteFormPunch(punch.id)}
                                className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400"
                                title="Quitar tramo"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Si solo hay 1 tramo de trabajo, permitir descuento manual opcional */}
                  {formPunches.length === 1 && getPunchType(formPunches[0]) === 'work' && (
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
                      {modalPreview.worked !== null ? (
                        formatDuration(modalPreview.worked)
                      ) : modalPreview.indicativeWorked !== null ? (
                        <span className="text-cyan-400">
                          ~{formatDuration(modalPreview.indicativeWorked)} (en curso)
                        </span>
                      ) : (
                        'En curso'
                      )}
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
