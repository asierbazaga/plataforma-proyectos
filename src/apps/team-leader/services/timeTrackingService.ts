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
  pending_sync?: boolean;
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
 * Normaliza la hora de fin de un tramo (convierte '' o espacios en null o fallback).
 */
export function resolvePunchEnd(
  end: string | null | undefined,
  liveNowTime?: string
): string | null {
  const trimmed = typeof end === 'string' ? end.trim() : '';
  if (trimmed !== '') return trimmed;
  return liveNowTime ?? null;
}

/**
 * Ordena cronológicamente una lista de tramos por hora de inicio (y fin).
 */
export function sortPunches(punches: TimePunch[]): TimePunch[] {
  return [...punches].sort((a, b) => {
    const aStart = timeToMinutes(a.start) ?? Number.MAX_SAFE_INTEGER;
    const bStart = timeToMinutes(b.start) ?? Number.MAX_SAFE_INTEGER;
    if (aStart !== bStart) return aStart - bStart;
    const aEnd = timeToMinutes(resolvePunchEnd(a.end)) ?? Number.MAX_SAFE_INTEGER;
    const bEnd = timeToMinutes(resolvePunchEnd(b.end)) ?? Number.MAX_SAFE_INTEGER;
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
    const end = timeToMinutes(resolvePunchEnd(p.end, liveNowTime));
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
    return sortPunches(
      entry.punches.map((p) => ({
        ...p,
        end: resolvePunchEnd(p.end),
      }))
    );
  }
  if (entry.start_time) {
    return [
      {
        id: 'legacy-1',
        start: entry.start_time,
        end: resolvePunchEnd(entry.end_time),
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
    if (punches[i].start && !resolvePunchEnd(punches[i].end)) {
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
    const end = timeToMinutes(resolvePunchEnd(punch.end, liveNowTime));
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
 * Calcula minutos trabajados de los tramos ya cerrados (indicativo cuando un día quedó abierto).
 */
export function getClosedWorkedMinutes(
  entry: Pick<TimeEntry, 'punches' | 'start_time' | 'end_time' | 'lunch_minutes' | 'day_type'>
): number {
  const punches = getEntryPunches(entry).filter((p) => resolvePunchEnd(p.end) !== null);
  if (punches.length === 0) return 0;

  const { workIntervals, pauseIntervals } = extractIntervals(punches);
  let total = sumIntervals(subtractIntervals(workIntervals, pauseIntervals));

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

const PUNCHES_TAG_REGEX = /\s*\[PUNCHES:(.*?)\]\s*$/;

function encodeNotesWithPunchesFallback(notes: string | null, punches: TimePunch[]): string | null {
  const clean = (notes || '').replace(PUNCHES_TAG_REGEX, '').trim();
  if (!punches || punches.length === 0) return clean || null;
  const tag = `[PUNCHES:${JSON.stringify(punches)}]`;
  return clean ? `${clean} ${tag}` : tag;
}

function normalizeEntryFromDb(raw: TimeEntry): TimeEntry {
  let notes = raw.notes ?? null;
  let punches = Array.isArray(raw.punches) ? raw.punches : [];

  if ( typeof notes === 'string' && PUNCHES_TAG_REGEX.test(notes)) {
    const match = notes.match(PUNCHES_TAG_REGEX);
    if (match && match[1] && punches.length === 0) {
      try {
        const parsed = JSON.parse(match[1]);
        if (Array.isArray(parsed)) {
          punches = parsed;
        }
      } catch {
        // Ignorar JSON malformado en fallback
      }
    }
    const stripped = notes.replace(PUNCHES_TAG_REGEX, '').trim();
    notes = stripped || null;
  }

  return {
    ...raw,
    notes,
    punches: sortPunches(
      punches.map((p) => ({
        ...p,
        end: resolvePunchEnd(p.end),
        type: getPunchType(p),
      }))
    ),
    pending_sync: Boolean(raw.pending_sync),
  };
}

function upsertLocalMirror(userId: string, entry: TimeEntry, pendingSync: boolean): TimeEntry {
  const existing = readLocalEntries(userId);
  const idx = existing.findIndex((e) => e.entry_date === entry.entry_date);
  const now = new Date().toISOString();
  const saved: TimeEntry = normalizeEntryFromDb({
    ...entry,
    id: entry.id || (idx >= 0 ? existing[idx].id : crypto.randomUUID()),
    created_at: entry.created_at || (idx >= 0 ? existing[idx].created_at : now),
    updated_at: entry.updated_at || now,
    pending_sync: pendingSync,
  });

  if (idx >= 0) {
    existing[idx] = saved;
  } else {
    existing.push(saved);
  }
  writeLocalEntries(userId, existing);
  return saved;
}

export const timeTrackingService = {
  async getEntryByDate(userId: string, entryDate: string): Promise<TimeEntry | null> {
    const localMatch =
      readLocalEntries(userId).find((e) => e.entry_date === entryDate) || null;

    if (!supabase) {
      return localMatch ? normalizeEntryFromDb(localMatch) : null;
    }

    try {
      const { data, error } = await supabase
        .from('mecalux_time_entries')
        .select('*')
        .eq('user_id', userId)
        .eq('entry_date', entryDate)
        .maybeSingle();

      if (error || !data) {
        return localMatch ? normalizeEntryFromDb(localMatch) : null;
      }

      const remote = normalizeEntryFromDb(data as TimeEntry);
      if (
        localMatch?.pending_sync &&
        localMatch.updated_at &&
        remote.updated_at &&
        localMatch.updated_at > remote.updated_at
      ) {
        return normalizeEntryFromDb(localMatch);
      }

      upsertLocalMirror(userId, remote, false);
      return remote;
    } catch {
      return localMatch ? normalizeEntryFromDb(localMatch) : null;
    }
  },

  async getEntries(userId: string): Promise<TimeEntryLoadResult> {
    const localEntries = readLocalEntries(userId).map(normalizeEntryFromDb);

    if (!supabase) {
      return { entries: localEntries, storageMode: 'local' };
    }

    // 1. Si hay fichajes guardados localmente pendientes de subir (ej. fallo de red en el móvil), sincronizarlos primero
    const pendingEntries = localEntries.filter((e) => e.pending_sync);
    for (const pending of pendingEntries) {
      try {
        await this.upsertEntry(
          {
            user_id: userId,
            entry_date: pending.entry_date,
            start_time: pending.start_time,
            end_time: pending.end_time,
            lunch_minutes: pending.lunch_minutes,
            punches: pending.punches,
            day_type: pending.day_type,
            target_minutes: pending.target_minutes,
            notes: pending.notes,
          },
          false
        );
      } catch {
        // Si sigue sin red, se mantendrá con pending_sync: true
      }
    }

    try {
      const { data, error } = await supabase
        .from('mecalux_time_entries')
        .select('*')
        .eq('user_id', userId)
        .order('entry_date', { ascending: false });

      if (error) {
        console.warn('[timeTrackingService] Error consultando Supabase:', error);
        if (isMissingTableError(error)) {
          return { entries: readLocalEntries(userId).map(normalizeEntryFromDb), storageMode: 'local' };
        }
        return { entries: readLocalEntries(userId).map(normalizeEntryFromDb), storageMode: 'local' };
      }

      const remoteEntries = ((data || []) as TimeEntry[]).map(normalizeEntryFromDb);
      const refreshedLocal = readLocalEntries(userId).map(normalizeEntryFromDb);
      const stillPending = refreshedLocal.filter((e) => e.pending_sync);

      // Combinar dando prioridad a entradas locales aún pendientes que sean más recientes
      const mergedMap = new Map<string, TimeEntry>();
      for (const r of remoteEntries) {
        mergedMap.set(r.entry_date, r);
      }
      for (const p of stillPending) {
        const existingRemote = mergedMap.get(p.entry_date);
        if (
          !existingRemote ||
          !existingRemote.updated_at ||
          (p.updated_at && p.updated_at >= existingRemote.updated_at)
        ) {
          mergedMap.set(p.entry_date, p);
        }
      }

      const merged = Array.from(mergedMap.values()).sort((a, b) =>
        b.entry_date.localeCompare(a.entry_date)
      );
      writeLocalEntries(userId, merged);

      return { entries: merged, storageMode: 'supabase' };
    } catch (err) {
      console.warn('[timeTrackingService] Fallo de red consultando Supabase, usando caché local:', err);
      return { entries: readLocalEntries(userId).map(normalizeEntryFromDb), storageMode: 'local' };
    }
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
            end: resolvePunchEnd(p.end),
            type: getPunchType(p),
            ...(p.label?.trim() ? { label: p.label.trim() } : {}),
          }))
        : input.start_time
        ? [{ id: crypto.randomUUID(), start: input.start_time, end: resolvePunchEnd(input.end_time), type: 'work' }]
        : [];

    const punches = sortPunches(rawPunches);

    const firstStart = punches.length > 0 ? punches[0].start : input.start_time ?? null;
    const lastEnd = punches.length > 0 ? punches[punches.length - 1].end : input.end_time ?? null;
    const computedLunch =
      punches.length > 1 || (punches.length === 1 && getPunchType(punches[0]) === 'pause')
        ? getBreakMinutes({ punches, start_time: firstStart, end_time: lastEnd, lunch_minutes: 0 })
        : input.lunch_minutes ?? 0;

    const cleanNotes = (input.notes || '').replace(PUNCHES_TAG_REGEX, '').trim() || null;

    const payload = {
      user_id: input.user_id,
      entry_date: input.entry_date,
      start_time: input.day_type === 'normal' ? firstStart : firstStart || null,
      end_time: input.day_type === 'normal' ? lastEnd : lastEnd || null,
      lunch_minutes: input.day_type === 'normal' ? computedLunch : 0,
      punches: input.day_type === 'normal' ? punches : punches,
      day_type: input.day_type,
      target_minutes: targetMinutes,
      notes: cleanNotes,
      updated_at: new Date().toISOString(),
    };

    if (!preferLocal && supabase) {
      try {
        const { data, error } = await supabase
          .from('mecalux_time_entries')
          .upsert(payload, { onConflict: 'user_id,entry_date' })
          .select()
          .single();

        if (!error && data) {
          const saved = upsertLocalMirror(input.user_id, data as TimeEntry, false);
          return { entry: saved, storageMode: 'supabase' };
        }

        // Si la columna 'punches' aún no existe en Supabase, embeber punches en notes y reintentar
        const errMsg = (error as { message?: string })?.message || '';
        if (error && errMsg.includes('punches')) {
          const { punches: _omit, ...legacyPayload } = payload;
          const retryPayload = {
            ...legacyPayload,
            notes: encodeNotesWithPunchesFallback(cleanNotes, punches),
          };
          const retry = await supabase
            .from('mecalux_time_entries')
            .upsert(retryPayload, { onConflict: 'user_id,entry_date' })
            .select()
            .single();
          if (!retry.error && retry.data) {
            const saved = upsertLocalMirror(
              input.user_id,
              { ...(retry.data as TimeEntry), punches },
              false
            );
            return { entry: saved, storageMode: 'supabase' };
          }
        }

        console.warn('[timeTrackingService] Error guardando en Supabase, guardando en cola local:', error);
      } catch (err) {
        console.warn('[timeTrackingService] Fallo de red al guardar en Supabase, guardando en cola local:', err);
      }
    }

    // Fallback local con marca pending_sync para subir en cuanto vuelva la conexión
    const savedLocal = upsertLocalMirror(
      input.user_id,
      {
        id: crypto.randomUUID(),
        ...payload,
      },
      !preferLocal
    );
    return { entry: savedLocal, storageMode: 'local' };
  },

  async deleteEntry(userId: string, entryId: string, preferLocal = false): Promise<void> {
    const existing = readLocalEntries(userId);
    const target = existing.find((e) => e.id === entryId);

    if (!preferLocal && supabase) {
      let query = supabase
        .from('mecalux_time_entries')
        .delete()
        .eq('user_id', userId);

      if (target?.entry_date) {
        query = query.eq('entry_date', target.entry_date);
      } else {
        query = query.eq('id', entryId);
      }

      const { error } = await query;
      if (error && !isMissingTableError(error)) {
        console.warn('[timeTrackingService] Error eliminando en Supabase:', error);
      }
    }

    const filtered = existing.filter(
      (e) => e.id !== entryId && (!target || e.entry_date !== target.entry_date)
    );
    writeLocalEntries(userId, filtered);
  },
};
