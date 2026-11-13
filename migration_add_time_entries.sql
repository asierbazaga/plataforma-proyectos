-- Tabla para el control de fichajes diarios en Mecalux Ops
CREATE TABLE IF NOT EXISTS public.mecalux_time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  start_time TEXT, -- Formato HH:mm (ej. '08:00')
  end_time TEXT,   -- Formato HH:mm (ej. '17:00'), NULL si aún está en jornada
  lunch_minutes INTEGER NOT NULL DEFAULT 60,
  day_type TEXT NOT NULL DEFAULT 'normal' CHECK (day_type IN ('normal', 'holiday', 'vacation', 'compensatory')),
  target_minutes INTEGER NOT NULL DEFAULT 480,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, entry_date)
);

-- Índice para consultas por usuario y fecha
CREATE INDEX IF NOT EXISTS idx_mecalux_time_entries_user_date
  ON public.mecalux_time_entries (user_id, entry_date DESC);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.mecalux_time_entries ENABLE ROW LEVEL SECURITY;

-- Políticas: cada usuario gestiona únicamente sus propios fichajes
CREATE POLICY "Users can view own time entries"
  ON public.mecalux_time_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own time entries"
  ON public.mecalux_time_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own time entries"
  ON public.mecalux_time_entries FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own time entries"
  ON public.mecalux_time_entries FOR DELETE
  USING (auth.uid() = user_id);
