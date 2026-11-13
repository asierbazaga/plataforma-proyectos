import { supabase } from '../../../lib/supabase';

export type TimeDayType = 'normal' | 'holiday' | 'vacation' | 'compensatory';

export interface TimePunch {
  id: string;
  start: string; // HH:mm
  end: string | null; // HH:mm o null si sigue abierto
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
      (err.message.includes('mecalux_time_entries') || err.message.includes('does not exist')))
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

/**
 * Devuelve los tramos normalizados de un fichaje.
 * Si el registro antiguo solo tenía start_time/end_time, los convierte en 1 tramo.
 */
export function getEntryPunches(entry: Pick<TimeEntry, 'punches' | 'start_time' | 'end_time'>): TimePunch[] {
  if (Array.isArray(entry.punches) && entry.punches.length > 0) {
    return entry.punches;
  }
  if (entry.start_time) {
    return [
      {
        id: 'legacy-1',
        start: entry.start_time,
        end: entry.end_time || null,
      },
    ];
  }
  return [];
}

/**
 * Calcula la pausa total entre tramos (en minutos).
 * Si solo hay 1 tramo, devuelve el lunch_minutes manual (para jornadas continuas/legacy).
 */
export function getBreakMinutes(entry: Pick<TimeEntry, 'punches' | 'start_time' | 'end_time' | 'lunch_minutes'>): number {
  const punches = getEntryPunches(entry);
  if (punches.length <= 1) {
    return entry.lunch_minutes || 0;
  }
  let gapTotal = 0;
  for (let i = 0; i < punches.length - 1; i++) {
    const prevEnd = timeToMinutes(punches[i].end);
    const nextStart = timeToMinutes(punches[i + 1].start);
    if (prevEnd !== null && nextStart !== null && nextStart > prevEnd) {
      gapTotal += nextStart - prevEnd;
    }
  }
  return gapTotal;
}

/**
 * Indica si el fichaje tiene un tramo abierto actualmente (sin hora de salida).
 */
export function hasOpenPunch(entry: Pick<TimeEntry, 'punches' | 'start_time' | 'end_time'>): boolean {
  const punches = getEntryPunches(entry);
  return punches.some((p) => p.start && !p.end);
}

/**
 * Calcula minutos trabajados netos.
 * - Si `liveNowTime` se pasa (ej. para el día de hoy), incluye el tramo abierto hasta `liveNowTime`.
 * - Si no se pasa `liveNowTime` y hay algún tramo abierto, devuelve null (día aún en curso).
 */
export function getWorkedMinutes(
  entry: Pick<TimeEntry, 'punches' | 'start_time' | 'end_time' | 'lunch_minutes' | 'day_type'>,
  liveNowTime?: string
): number | null {
  const punches = getEntryPunches(entry);
  if (punches.length === 0) return null;

  let total = 0;
  for (const punch of punches) {
    const start = timeToMinutes(punch.start);
    const end = timeToMinutes(punch.end ?? liveNowTime ?? null);
    if (start === null || end === null) return null;
    if (end > start) {
      total += end - start;
    }
  }

  // Si solo hay 1 tramo, descontamos el lunch_minutes manual si lo hubiera
  if (punches.length === 1) {
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

    const punches: TimePunch[] =
      input.punches && input.punches.length > 0
        ? input.punches
        : input.start_time
        ? [{ id: crypto.randomUUID(), start: input.start_time, end: input.end_time ?? null }]
        : [];

    const firstStart = punches.length > 0 ? punches[0].start : input.start_time ?? null;
    const lastEnd = punches.length > 0 ? punches[punches.length - 1].end : input.end_time ?? null;
    const computedLunch =
      punches.length > 1
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
