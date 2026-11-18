-- Tabla para el control de fichajes diarios en Mecalux Ops
CREATE TABLE IF NOT EXISTS public.mecalux_time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  entry_date DATE NOT NULL,
  start_time TEXT, -- Formato HH:mm (ej. '08:00')
  end_time TEXT,   -- Formato HH:mm (ej. '17:00'), NULL si aún está en jornada
  lunch_minutes INTEGER NOT NULL DEFAULT 60,
  punches JSONB NOT NULL DEFAULT '[]'::jsonb,
  day_type TEXT NOT NULL DEFAULT 'normal' CHECK (day_type IN ('normal', 'holiday', 'vacation', 'compensatory')),
  target_minutes INTEGER NOT NULL DEFAULT 480,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, entry_date)
);

-- Asegurar que la columna punches existe aunque la tabla se hubiera creado en una versión previa
ALTER TABLE public.mecalux_time_entries
  ADD COLUMN IF NOT EXISTS punches JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Índice para consultas por usuario y fecha
CREATE INDEX IF NOT EXISTS idx_mecalux_time_entries_user_date
  ON public.mecalux_time_entries (user_id, entry_date DESC);

-- La app usa autenticación propia con persistSession: false, por lo que seguimos el mismo patrón que agenda_loans
ALTER TABLE public.mecalux_time_entries DISABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.mecalux_time_entries TO anon, authenticated, service_role;
NOTIFY pgrst, 'reload schema';
