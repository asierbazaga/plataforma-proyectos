-- Migration script to add missing columns 'status' and 'last_login' to 'profiles' table.
-- Ejecuta este script en el SQL Editor de tu proyecto de Supabase.

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'suspended')),
ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;
