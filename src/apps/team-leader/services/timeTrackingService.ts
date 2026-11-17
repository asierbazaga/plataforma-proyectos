import { supabase } from '../../../lib/supabase';

export type TimeDayType = 'normal' | 'holiday' | 'vacation' | 'compensatory';
export type TimePunchType = 'work' | 'pause';

export interface TimePunch {
  id: string;
  start: string; // HH:mm
  end: string | null; // HH:mm o null si sigue abierto
  type?: TimePunchType; // 'work' por defecto (retrocompatible)
  label?: string; // Concepto opcional (ej. 'Comida', 'Café', 'Mañana')
}

export interface TimeEntry {
  id: string;
  user_id: string;
  entry_date: string; // YYYY-MM-DD
  start_time: string | null; // HH:mm (primer fichaje)
  end_time: string | null; // HH:mm (último fichaje)
  lunch_minutes: number;
  punches?: TimePunch[];
  day_type: TimeDayType;
  target_minutes: number;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface UpsertTimeEntryInput {
  user_id: string;
  entry_date: string;
  start_time?: string | null;
  end_time?: string | null;
  lunch_minutes?: number;
  punches?: TimePunch[];
  day_type: TimeDayType;
  target_minutes?: number;
  notes?: string | null;
}

export interface TimeEntryLoadResult {
  entries: TimeEntry[];
  storageMode: 'supabase' | 'local';
}

const LOCAL_KEY_PREFIX = 'mecalux_time_entries_v1_';

function getLocalStorageKey(userId: string): string {
  return `${LOCAL_KEY_PREFIX}${userId}`;
}

function readLocalEntries(userId: string): TimeEntry[] {
  try {
    const raw = localStorage.getItem(getLocalStorageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalEntries(userId: string, entries: TimeEntry[]): void {
  const sorted = [...entries].sort((a, b) => b.entry_date.localeCompare(a.entry_date));
  localStorage.setItem(getLocalStorageKey(userId), JSON.stringify(sorted));
}

function isMissingTableError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const err = error as { code?: string; message?: string; status?: number };
  return (
    err.code === '42P01' ||
    err.code === 'PGRST205' ||
    err.status === 404 ||
    (typeof err.message === 'string' &&
      (err.message.includes('does not exist') || err.message.includes('Could not find the table')))
  );
}

/**
 * Convierte 'HH:mm' a minutos desde las 00:00.
 */
export function timeToMinutes(time: string | null | undefined): number | null {
  if (!time) return null;
  const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const mins = Number(match[2]);
  if (Number.isNaN(hours) || Number.isNaN(mins) || hours < 0 || hours > 23 || mins < 0 || mins > 59) {
    return null;
  }
  return hours * 60 + mins;
}

/**
 * Convierte minutos desde las 00:00 a 'HH:mm'.
 */
export function minutesToTime(totalMinutes: number): string {
  const normalized = ((Math.round(totalMinutes) % 1440) + 1440) % 1440;
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Devuelve true si la fecha (YYYY-MM-DD) es de lunes a viernes.
 */
export function isWeekdayDate(dateStr: string): boolean {
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return true;
  const day = new Date(y, m - 1, d).getDay();
  return day >= 1 && day <= 5;
}

/**
 * Calcula los minutos objetivo por defecto para una fecha y tipo de día.
 * Lunes a viernes jornada normal: 8h (480 min). Resto: 0 min.
 */
export function getDefaultTargetMinutes(dateStr: string, dayType: TimeDayType): number {
  if (dayType !== 'normal') return 0;
  return isWeekdayDate(dateStr) ? 480 : 0;
}

interface MinuteInterval {
  start: number;
  end: number;
}

/**
 * Devuelve el tipo normalizado de un tramo ('work' por defecto para datos antiguos).
 */
export function getPunchType(punch: Pick<TimePunch, 'type'>): TimePunchType {
  return punch.type === 'pause' ? 'pause' : 'work';
}

/**
 * Ordena cronológicamente una lista de tramos por hora de inicio (y fin).
 */
export function sortPunches(punches: TimePunch[]): TimePunch[] {
  return [...punches].sort((a, b) => {
    const aStart = timeToMinutes(a.start) ?? Number.MAX_SAFE_INTEGER;
    const bStart = timeToMinutes(b.start) ?? Number.MAX_SAFE_INTEGER;
    if (aStart !== bStart) return aStart - bStart;
    const aEnd = timeToMinutes(a.end) ?? Number.MAX_SAFE_INTEGER;
    const bEnd = timeToMinutes(b.end) ?? Number.MAX_SAFE_INTEGER;
    return aEnd - bEnd;
  });
}

function mergeIntervals(intervals: MinuteInterval[], mergeZeroLength = true): MinuteInterval[] {
  if (intervals.length === 0) return [];
  const sorted = [...intervals].sort((a, b) => (a.start !== b.start ? a.start - b.start : a.end - b.end));
  const merged: MinuteInterval[] = [{ ...sorted[0] }];
  for (let i = 1; i < sorted.length; i++) {
    const cur = sorted[i];
    const last = merged[merged.length - 1];
    const overlaps = mergeZeroLength ? cur.start <= last.end : cur.start < last.end;
    if (overlaps) {
      last.end = Math.max(last.end, cur.end);
    } else {
      merged.push({ ...cur });
    }
  }
  return merged;
}

function sumIntervals(intervals: MinuteInterval[]): number {
  return intervals.reduce((acc, item) => acc + Math.max(0, item.end - item.start), 0);
}

function subtractIntervals(base: MinuteInterval[], cuts: MinuteInterval[]): MinuteInterval[] {
  if (cuts.length === 0) return base;
  const result: MinuteInterval[] = [];
  for (const b of base) {
    let curStart = b.start;
    for (const c of cuts) {
      if (c.end <= curStart) continue;
      if (c.start >= b.end) break;
      if (c.start > curStart) {
        result.push({ start: curStart, end: c.start });
      }
      curStart = Math.max(curStart, c.end);
      if (curStart >= b.end) break;
    }
    if (curStart < b.end) {
      result.push({ start: curStart, end: b.end });
    }
  }
  return result;
}

function extractIntervals(
  punches: TimePunch[],
  liveNowTime?: string
): {
  workIntervals: MinuteInterval[];
  pauseIntervals: MinuteInterval[];
  openStartAnchors: MinuteInterval[];
} {
  const rawWork: MinuteInterval[] = [];
  const rawPause: MinuteInterval[] = [];
  const openStartAnchors: MinuteInterval[] = [];

  for (const p of punches) {
    const start = timeToMinutes(p.start);
    if (start === null) continue;
    const end = timeToMinutes(p.end ?? liveNowTime ?? null);
    if (end === null) {
      // Ancla de inicio para detectar pausas previas a un tramo aún abierto
      openStartAnchors.push({ start, end: start });
      continue;
    }
    if (end > start) {
      if (getPunchType(p) === 'pause') {
        rawPause.push({ start, end });
      } else {
        rawWork.push({ start, end });
      }
    }
  }

  return {
    workIntervals: mergeIntervals(rawWork),
    pauseIntervals: mergeIntervals(rawPause),
    openStartAnchors,
  };
}

/**
 * Devuelve los tramos normalizados y ordenados de un fichaje.
 * Si el registro antiguo solo tenía start_time/end_time, los convierte en 1 tramo.
 */
export function getEntryPunches(entry: Pick<TimeEntry, 'punches' | 'start_time' | 'end_time'>): TimePunch[] {
  if (Array.isArray(entry.punches) && entry.punches.length > 0) {
    return sortPunches(entry.punches);
  }
  if (entry.start_time) {
    return [
      {
        id: 'legacy-1',
        start: entry.start_time,
        end: entry.end_time || null,
        type: 'work',
      },
    ];
  }
  return [];
}

/**
 * Calcula la pausa total (en minutos): suma los tramos marcados explícitamente como 'pause'
 * más los huecos no trabajados entre tramos consecutivos.
 * Si solo hay 1 tramo de trabajo, devuelve el lunch_minutes manual (para jornadas continuas/legacy).
 */
export function getBreakMinutes(
  entry: Pick<TimeEntry, 'punches' | 'start_time' | 'end_time' | 'lunch_minutes'>,
  liveNowTime?: string
): number {
  const punches = getEntryPunches(entry);
  if (punches.length === 0) {
    return entry.lunch_minutes || 0;
  }
  if (punches.length === 1 && getPunchType(punches[0]) === 'work') {
    return entry.lunch_minutes || 0;
  }

  const { workIntervals, pauseIntervals, openStartAnchors } = extractIntervals(punches, liveNowTime);
  const explicitPauseMins = sumIntervals(pauseIntervals);
  const allSpans = mergeIntervals([...workIntervals, ...pauseIntervals, ...openStartAnchors]);

  let implicitGapMins = 0;
  for (let i = 1; i < allSpans.length; i++) {
    if (allSpans[i].start > allSpans[i - 1].end) {
      implicitGapMins += allSpans[i].start - allSpans[i - 1].end;
    }
  }

  return explicitPauseMins + implicitGapMins;
}

/**
 * Devuelve el tramo abierto actualmente (sin hora de salida), o null si no hay ninguno.
 */
export function getOpenPunch(
  entry: Pick<TimeEntry, 'punches' | 'start_time' | 'end_time'>
): TimePunch | null {
  const punches = getEntryPunches(entry);
  for (let i = punches.length - 1; i >= 0; i--) {
    if (punches[i].start && !punches[i].end) {
      return punches[i];
    }
  }
  return null;
}

/**
 * Indica si el fichaje tiene un tramo abierto actualmente (sin hora de salida).
 */
export function hasOpenPunch(entry: Pick<TimeEntry, 'punches' | 'start_time' | 'end_time'>): boolean {
  return getOpenPunch(entry) !== null;
}

/**
 * Calcula minutos trabajados netos (excluyendo tramos de tipo 'pause' y sus solapes).
 * - Si `liveNowTime` se pasa (ej. para el día de hoy), incluye el tramo abierto hasta `liveNowTime`.
 * - Si no se pasa `liveNowTime` y hay algún tramo abierto, devuelve null (día aún en curso).
 */
export function getWorkedMinutes(
  entry: Pick<TimeEntry, 'punches' | 'start_time' | 'end_time' | 'lunch_minutes' | 'day_type'>,
  liveNowTime?: string
): number | null {
  const punches = getEntryPunches(entry);
  if (punches.length === 0) return null;

  for (const punch of punches) {
    const start = timeToMinutes(punch.start);
    const end = timeToMinutes(punch.end ?? liveNowTime ?? null);
    if (start === null || end === null) return null;
  }

  const { workIntervals, pauseIntervals } = extractIntervals(punches, liveNowTime);
  const effectiveWork = subtractIntervals(workIntervals, pauseIntervals);
  let total = sumIntervals(effectiveWork);

  // Si solo hay 1 tramo de trabajo, descontamos el lunch_minutes manual si lo hubiera
  if (punches.length === 1 && getPunchType(punches[0]) === 'work') {
    total = Math.max(0, total - (entry.lunch_minutes || 0));
  }

  return total;
}

/**
 * Calcula el balance en minutos (+ de más, - de menos) de un fichaje cerrado.
 * Si un fichaje normal tiene algún tramo abierto, devuelve null.
 */
export function getBalanceMinutes(entry: TimeEntry, liveNowTime?: string): number | null {
  if (entry.day_type !== 'normal') {
    const worked = getWorkedMinutes(entry, liveNowTime);
    return worked !== null ? worked : 0;
  }
  const worked = getWorkedMinutes(entry, liveNowTime);
  if (worked === null) return null;
  return worked - entry.target_minutes;
}

/**
 * Formatea una duración en minutos: ej. 90 -> '1h 30m', -45 -> '-45m', 0 -> '0m'.
 */
export function formatDuration(minutes: number, showPlusSign = false): string {
  const rounded = Math.round(minutes);
  const sign = rounded < 0 ? '-' : showPlusSign && rounded > 0 ? '+' : '';
  const abs = Math.abs(rounded);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  if (h === 0) return `${sign}${m}m`;
  if (m === 0) return `${sign}${h}h`;
  return `${sign}${h}h ${String(m).padStart(2, '0')}m`;
}

export const timeTrackingService = {
  async getEntries(userId: string): Promise<TimeEntryLoadResult> {
    const { data, error } = await supabase
      .from('mecalux_time_entries')
      .select('*')
      .eq('user_id', userId)
      .order('entry_date', { ascending: false });

    if (error) {
      console.warn('[timeTrackingService] Error consultando Supabase:', error);
      if (isMissingTableError(error)) {
        return { entries: readLocalEntries(userId), storageMode: 'local' };
      }
      throw error;
    }

    return { entries: (data || []) as TimeEntry[], storageMode: 'supabase' };
  },

  async upsertEntry(
    input: UpsertTimeEntryInput,
    preferLocal = false
  ): Promise<{ entry: TimeEntry; storageMode: 'supabase' | 'local' }> {
    const targetMinutes =
      input.target_minutes ?? getDefaultTargetMinutes(input.entry_date, input.day_type);

    const rawPunches: TimePunch[] =
      input.punches && input.punches.length > 0
        ? input.punches.map((p) => ({
            id: p.id || crypto.randomUUID(),
            start: p.start,
            end: p.end ?? null,
            type: getPunchType(p),
            ...(p.label?.trim() ? { label: p.label.trim() } : {}),
          }))
        : input.start_time
        ? [{ id: crypto.randomUUID(), start: input.start_time, end: input.end_time ?? null, type: 'work' }]
        : [];

    const punches = sortPunches(rawPunches);

    const firstStart = punches.length > 0 ? punches[0].start : input.start_time ?? null;
    const lastEnd = punches.length > 0 ? punches[punches.length - 1].end : input.end_time ?? null;
    const computedLunch =
      punches.length > 1 || (punches.length === 1 && getPunchType(punches[0]) === 'pause')
        ? getBreakMinutes({ punches, start_time: firstStart, end_time: lastEnd, lunch_minutes: 0 })
        : input.lunch_minutes ?? 0;

    const payload = {
      user_id: input.user_id,
      entry_date: input.entry_date,
      start_time: input.day_type === 'normal' ? firstStart : firstStart || null,
      end_time: input.day_type === 'normal' ? lastEnd : lastEnd || null,
      lunch_minutes: input.day_type === 'normal' ? computedLunch : 0,
      punches: input.day_type === 'normal' ? punches : punches,
      day_type: input.day_type,
      target_minutes: targetMinutes,
      notes: input.notes?.trim() || null,
      updated_at: new Date().toISOString(),
    };

    if (!preferLocal) {
      const { data, error } = await supabase
        .from('mecalux_time_entries')
        .upsert(payload, { onConflict: 'user_id,entry_date' })
        .select()
        .single();

      if (!error && data) {
        return { entry: data as TimeEntry, storageMode: 'supabase' };
      }

      // Si la columna 'punches' aún no existe en Supabase, reintentar sin ella y avisar por consola
      const errMsg = (error as { message?: string })?.message || '';
      if (error && errMsg.includes('punches')) {
        const { punches: _omit, ...legacyPayload } = payload;
        const retry = await supabase
          .from('mecalux_time_entries')
          .upsert(legacyPayload, { onConflict: 'user_id,entry_date' })
          .select()
          .single();
        if (!retry.error && retry.data) {
          return {
            entry: { ...(retry.data as TimeEntry), punches },
            storageMode: 'supabase',
          };
        }
      }

      if (error && !isMissingTableError(error)) {
        throw error;
      }
    }

    // Fallback local
    const existing = readLocalEntries(input.user_id);
    const idx = existing.findIndex((e) => e.entry_date === input.entry_date);
    const now = new Date().toISOString();
    const saved: TimeEntry = {
      id: idx >= 0 ? existing[idx].id : crypto.randomUUID(),
      created_at: idx >= 0 ? existing[idx].created_at : now,
      ...payload,
    };
    if (idx >= 0) {
      existing[idx] = saved;
    } else {
      existing.push(saved);
    }
    writeLocalEntries(input.user_id, existing);
    return { entry: saved, storageMode: 'local' };
  },

  async deleteEntry(userId: string, entryId: string, preferLocal = false): Promise<void> {
    if (!preferLocal) {
      const { error } = await supabase
        .from('mecalux_time_entries')
        .delete()
        .eq('id', entryId)
        .eq('user_id', userId);

      if (!error) return;
      if (!isMissingTableError(error)) {
        throw error;
      }
    }

    const existing = readLocalEntries(userId).filter((e) => e.id !== entryId);
    writeLocalEntries(userId, existing);
  },
};
