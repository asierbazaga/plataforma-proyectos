-- ============================================================================
-- PLATAFORMA PROYECTOS - GUÍA Y SCRIPT DE ENDURECIMIENTO DE SEGURIDAD (RLS)
-- ============================================================================
-- NOTA IMPORTANTE:
-- Actualmente la plataforma utiliza un cliente Supabase en modo anónimo (anon key)
-- y maneja la sesión de usuario en frontend/localStorage a través de public.profiles.
--
-- Si en el futuro activas Supabase Auth (auth.users con login por correo/contraseña nativo),
-- ejecuta este script para blindar completamente la base de datos contra accesos no autorizados.
-- ============================================================================

-- 1. Habilitar RLS en todas las tablas sensibles
-- ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.app_permissions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.fitness_profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.fitness_workouts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.user_library ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.agenda_tasks ENABLE ROW LEVEL SECURITY;

-- 2. Ejemplo de política estricta de aislamiento por usuario:
-- CREATE POLICY "Users can only read and write their own profile"
-- ON public.profiles
-- FOR ALL
-- USING (auth.uid()::text = id);

-- CREATE POLICY "Users can only see and manage their own expenses"
-- ON public.expenses
-- FOR ALL
-- USING (auth.uid()::text = user_id);

-- 3. Prevenir modificación de roles administrativos desde el cliente anon
-- REVOKE UPDATE (role) ON public.profiles FROM anon;
