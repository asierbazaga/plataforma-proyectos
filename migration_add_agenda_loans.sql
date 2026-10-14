-- Migration script to create 'agenda_loans' table with payments history support
-- Ejecuta este script en el SQL Editor de tu proyecto de Supabase si deseas sincronizar en la nube.

CREATE TABLE IF NOT EXISTS public.agenda_loans (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  name TEXT NOT NULL,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  paid_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  installment_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  start_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  payments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.agenda_loans ADD COLUMN IF NOT EXISTS payments JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.agenda_loans DISABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.agenda_loans TO anon, authenticated, service_role;
