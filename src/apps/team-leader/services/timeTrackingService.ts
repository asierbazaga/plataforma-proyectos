import { supabase } from '../../../lib/supabase';

export type TimeDayType = 'normal' | 'holiday' | 'vacation' | 'compensatory';

export interface TimeEntry {
  id: string;
  user_id: string;
  entry_date: string; // YYYY-MM-DD
  start_time: string | null; // HH:mm
  end_time: string | null; // HH:mm
  lunch_minutes: number;
  day_type: TimeDayType;
  target_minutes: number;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface UpsertTimeEntryInput {
  user_id: string;
  entry_date: string;
  start_time: string | null;
  end_time: string | null;
  lunch_minutes: number;
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
 * Calcula minutos trabajados netos (descontando comida) para un fichaje cerrado.
 * Si falta entrada o salida, devuelve null.
 */
export function getWorkedMinutes(entry: Pick<TimeEntry, 'start_time' | 'end_time' | 'lunch_minutes' | 'day_type'>): number | null {
  const start = timeToMinutes(entry.start_time);
  const end = timeToMinutes(entry.end_time);
  if (start === null || end === null) return null;
  const raw = end - start - (entry.lunch_minutes || 0);
  return Math.max(0, raw);
}

/**
 * Calcula el balance en minutos (+ de más, - de menos) de un fichaje.
 * Para días libres/festivos/vacaciones sin horas trabajadas, el balance es 0.
 * Si un fichaje normal está abierto (sin hora de salida), devuelve null.
 */
export function getBalanceMinutes(entry: TimeEntry): number | null {
  if (entry.day_type !== 'normal') {
    const worked = getWorkedMinutes(entry);
    // Si por ejemplo se trabaja en festivo, suma todo como extra; si no, 0.
    return worked !== null ? worked : 0;
  }
  const worked = getWorkedMinutes(entry);
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

    const payload = {
      user_id: input.user_id,
      entry_date: input.entry_date,
      start_time: input.day_type === 'normal' ? input.start_time : input.start_time || null,
      end_time: input.day_type === 'normal' ? input.end_time : input.end_time || null,
      lunch_minutes: input.day_type === 'normal' ? input.lunch_minutes : 0,
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
