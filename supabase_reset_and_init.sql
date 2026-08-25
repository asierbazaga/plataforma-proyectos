-- ============================================================================
-- PLATAFORMA PROYECTOS - SCRIPT DE PRODUCCIÓN TOTAL PARA SUPABASE
-- SINCRONIZACIÓN BIDIRECCIONAL EN TIEMPO REAL (PC <-> MÓVIL)
-- ============================================================================
-- INSTRUCCIONES:
-- 1. Ve a tu proyecto de Supabase: https://supabase.com/dashboard/project/xmxrywztdmjzffgdknpd
-- 2. Entra en "SQL Editor" en el menú lateral izquierdo.
-- 3. Crea una "New Query", pega TODO este contenido y dale a "RUN".
-- ============================================================================

-- 1. RESET TOTAL DEL ESQUEMA PÚBLICO
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

-- Conceder permisos de acceso a todos los roles
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;

-- Extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 2. TABLAS DEL SISTEMA RBAC (USUARIOS, PERMISOS Y AUDITORÍA)
-- ============================================================================

-- Perfiles de usuario (con contraseñas sincronizadas)
CREATE TABLE public.profiles (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'user', 'guest')),
    password TEXT DEFAULT '123456',
    department TEXT DEFAULT 'General',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Matriz de permisos para las 5 aplicaciones
CREATE TABLE public.app_permissions (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
    app_id TEXT NOT NULL CHECK (app_id IN ('fitness', 'gastos', 'libros-juegos', 'lore', 'entrevistas')),
    can_access BOOLEAN DEFAULT TRUE,
    can_edit BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, app_id)
);

-- Historial de actividad (Audit Trail)
CREATE TABLE public.audit_logs (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_email TEXT NOT NULL,
    action TEXT NOT NULL,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 3. MÓDULO GASTOS & FINANZAS
-- ============================================================================

-- Configuración de cuentas y saldos de cartera
CREATE TABLE public.wallet_config (
    user_id TEXT PRIMARY KEY,
    account_1_name TEXT DEFAULT 'Abanca Personal',
    account_1_initial_balance NUMERIC(12, 2) DEFAULT 0,
    account_2_name TEXT DEFAULT 'ING Conjunta',
    account_2_initial_balance NUMERIC(12, 2) DEFAULT 0,
    has_account_2 BOOLEAN DEFAULT TRUE,
    onboarding_completed BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transacciones e ingresos/gastos
CREATE TABLE public.expenses (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_id TEXT,
    description TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('expense', 'income')),
    category TEXT NOT NULL,
    account TEXT DEFAULT 'abanca',
    transaction_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Metas de ahorro
CREATE TABLE public.savings_goals (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_id TEXT,
    title TEXT NOT NULL,
    target_amount NUMERIC(10, 2) NOT NULL,
    current_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    account TEXT DEFAULT 'ing',
    target_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Presupuestos mensuales por categoría
CREATE TABLE public.category_budgets (
    category TEXT PRIMARY KEY,
    monthly_limit NUMERIC(10, 2) NOT NULL,
    icon TEXT,
    color TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 4. MÓDULO FITNESS & SALUD INTEGRAL (CON POLAR GRIT X PRO)
-- ============================================================================

-- Perfil metabólico y objetivos físicos
CREATE TABLE public.fitness_profiles (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_id TEXT UNIQUE,
    age INT DEFAULT 28,
    gender TEXT DEFAULT 'male',
    height_cm NUMERIC(5, 1) DEFAULT 178,
    current_weight NUMERIC(5, 2) DEFAULT 95.7,
    target_weight NUMERIC(5, 2) DEFAULT 75.0,
    activity_level TEXT DEFAULT 'moderate',
    goal TEXT DEFAULT 'fat_loss',
    deficit_surplus_pct INT DEFAULT -20,
    target_calories INT DEFAULT 2150,
    target_protein INT DEFAULT 165,
    target_carbs INT DEFAULT 210,
    target_fat INT DEFAULT 65,
    target_water_ml INT DEFAULT 3000,
    target_daily_steps INT DEFAULT 10000,
    carb_cycling_enabled BOOLEAN DEFAULT FALSE,
    training_day_carbs INT,
    rest_day_carbs INT,
    onboarding_completed BOOLEAN DEFAULT TRUE,
    preferred_split TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Entrenamientos y sesiones de fuerza / cardio
CREATE TABLE public.fitness_workouts (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_id TEXT,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 45,
    calories_burned INT NOT NULL DEFAULT 350,
    workout_date DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    exercises JSONB DEFAULT '[]'::jsonb,
    heart_rate_avg INT,
    heart_rate_max INT,
    cardio_zone TEXT,
    polar_training_load TEXT,
    polar_energy_carbs_pct INT,
    polar_energy_fat_pct INT,
    polar_energy_protein_pct INT,
    perceived_exertion INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Registro diario de comidas, macros y agua
CREATE TABLE public.fitness_nutrition_logs (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_id TEXT,
    date DATE NOT NULL,
    water_ml INT DEFAULT 0,
    meals JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Historial de pesaje corporal y medidas
CREATE TABLE public.fitness_body_progress (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_id TEXT,
    date DATE NOT NULL,
    weight NUMERIC(5, 2) NOT NULL,
    body_fat_percentage NUMERIC(4, 1),
    waist_cm NUMERIC(5, 1),
    neck_cm NUMERIC(5, 1),
    chest_cm NUMERIC(5, 1),
    arm_cm NUMERIC(4, 1),
    thigh_cm NUMERIC(4, 1),
    hips_cm NUMERIC(5, 1),
    notes TEXT,
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Métricas Polar Grit X Pro (recuperación, sueño, carga)
CREATE TABLE public.fitness_polar_metrics (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_id TEXT,
    date DATE NOT NULL,
    nightly_recharge_status TEXT,
    ans_charge NUMERIC(4, 1),
    sleep_score INT,
    resting_hr INT,
    max_hr INT,
    vo2_max_running_index INT,
    cardio_load_status TEXT,
    cardio_load_ratio NUMERIC(4, 2),
    cardio_z1_z2_min INT,
    cardio_z3_min INT,
    cardio_z4_z5_min INT,
    daily_steps INT,
    polar_calories INT,
    fitspark_recommendation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- ============================================================================
-- 5. MÓDULO LIBROS & JUEGOS
-- ============================================================================

CREATE TABLE public.user_library (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_id TEXT,
    title TEXT NOT NULL,
    media_type TEXT NOT NULL CHECK (media_type IN ('book', 'game')),
    genre TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('in_progress', 'completed', 'wishlist')),
    rating INT CHECK (rating >= 1 AND rating <= 5),
    progress_percentage INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 6. MÓDULO LORE COMERCIAL & DRASANVI CRM
-- ============================================================================

-- Clientes del mapa y deciles
CREATE TABLE public.lore_clients (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    nombre TEXT NOT NULL,
    tipo TEXT DEFAULT 'Farmacia',
    contacto_nombre TEXT,
    direccion TEXT,
    latitud NUMERIC(10, 6),
    longitud NUMERIC(10, 6),
    ultima_visita_at DATE,
    codigo TEXT,
    decil TEXT,
    total_2025 NUMERIC(10, 2) DEFAULT 0,
    total_2026 NUMERIC(10, 2) DEFAULT 0,
    telefono TEXT,
    email TEXT,
    provincia TEXT,
    ciudad TEXT,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rutas comerciales optimizadas
CREATE TABLE public.lore_saved_routes (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    name TEXT NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    client_ids JSONB DEFAULT '[]'::jsonb,
    total_distance_km NUMERIC(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Farmacias CRM detalladas y prospección
CREATE TABLE public.lore_crm_pharmacies (
    id TEXT PRIMARY KEY,
    category_type TEXT DEFAULT 'cliente',
    provincia TEXT,
    ciudad TEXT,
    farmacia_nombre TEXT NOT NULL,
    contacto TEXT,
    telefono TEXT,
    decil TEXT,
    ventas_anuales NUMERIC(10, 2) DEFAULT 0,
    frecuencia_visita TEXT,
    ultima_visita TEXT,
    proxima_accion TEXT,
    fecha_proxima_accion TEXT,
    le_interesa TEXT,
    no_le_interesa TEXT,
    marcas_competencia TEXT,
    detalles_competencia TEXT,
    estado_cliente TEXT DEFAULT 'Activo',
    estado_prospeccion TEXT DEFAULT 'Sin contactar',
    tendencia_compra TEXT DEFAULT 'Estable',
    prioridad TEXT DEFAULT 'Media',
    accion_completada BOOLEAN DEFAULT FALSE,
    notas TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Objetivos comerciales y ventas Drasanvi
CREATE TABLE public.lore_goals (
    id TEXT PRIMARY KEY DEFAULT 'current_goals',
    objetivo_mensual NUMERIC(10, 2) DEFAULT 15000,
    venta_acumulada NUMERIC(10, 2) DEFAULT 0,
    dias_laborables_restantes INT DEFAULT 21,
    incentive_image TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 7. MÓDULO MECALUX TALENT & ENTREVISTAS
-- ============================================================================

CREATE TABLE public.interview_candidates (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_id TEXT,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    role TEXT NOT NULL,
    seniority TEXT DEFAULT 'Mid',
    current_company TEXT,
    current_salary_eur NUMERIC(10, 2),
    expected_salary_eur NUMERIC(10, 2),
    notice_period_weeks INT DEFAULT 2,
    english_level TEXT,
    location TEXT,
    linkedin_url TEXT,
    status TEXT DEFAULT 'scheduled',
    interview_date DATE DEFAULT CURRENT_DATE,
    duration_minutes INT,
    cv_text TEXT,
    cv_file_name TEXT,
    parsed_skills JSONB DEFAULT '[]'::jsonb,
    evaluations JSONB DEFAULT '{}'::jsonb,
    resultado_final JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 8. POLÍTICAS RLS (SIN BLOQUEOS ENTRE PC Y MÓVIL)
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fitness_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fitness_workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fitness_nutrition_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fitness_body_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fitness_polar_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lore_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lore_saved_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lore_crm_pharmacies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lore_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_candidates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public all profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all permissions" ON public.app_permissions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all audit_logs" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all wallet_config" ON public.wallet_config FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all expenses" ON public.expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all savings_goals" ON public.savings_goals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all category_budgets" ON public.category_budgets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all fitness_profiles" ON public.fitness_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all fitness_workouts" ON public.fitness_workouts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all fitness_nutrition_logs" ON public.fitness_nutrition_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all fitness_body_progress" ON public.fitness_body_progress FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all fitness_polar_metrics" ON public.fitness_polar_metrics FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all user_library" ON public.user_library FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all lore_clients" ON public.lore_clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all lore_saved_routes" ON public.lore_saved_routes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all lore_crm_pharmacies" ON public.lore_crm_pharmacies FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all lore_goals" ON public.lore_goals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all interview_candidates" ON public.interview_candidates FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- 9. ACTIVACIÓN DE REALTIME EN TODAS LAS TABLAS
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE 
            public.profiles,
            public.app_permissions,
            public.audit_logs,
            public.wallet_config,
            public.expenses,
            public.savings_goals,
            public.category_budgets,
            public.fitness_profiles,
            public.fitness_workouts,
            public.fitness_nutrition_logs,
            public.fitness_body_progress,
            public.fitness_polar_metrics,
            public.user_library,
            public.lore_clients,
            public.lore_saved_routes,
            public.lore_crm_pharmacies,
            public.lore_goals,
            public.interview_candidates;
    END IF;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;

-- ============================================================================
-- 10. DATOS SEMILLA LIMPIOS DE PRODUCCIÓN
-- ============================================================================

-- 1. Usuarios Principales
INSERT INTO public.profiles (id, email, full_name, role, password, department, avatar_url) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'asier.bazaga@plataforma.com', 'Asier Bazaga', 'admin', 'admin', 'Dirección IT & Super Admin', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'lore@plataforma.com', 'Lore', 'user', 'lore', 'Operaciones & Gestión', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'invitado@plataforma.com', 'Invitado Demo', 'guest', 'demo', 'Consultoría Externa', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150');

-- 2. Permisos
INSERT INTO public.app_permissions (user_id, app_id, can_access, can_edit) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'fitness', TRUE, TRUE),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'gastos', TRUE, TRUE),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'libros-juegos', TRUE, TRUE),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'lore', TRUE, TRUE),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'entrevistas', TRUE, TRUE),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'fitness', TRUE, TRUE),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'gastos', TRUE, TRUE),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'libros-juegos', TRUE, TRUE),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'lore', TRUE, TRUE),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'entrevistas', FALSE, FALSE),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'fitness', FALSE, FALSE),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'gastos', FALSE, FALSE),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'libros-juegos', TRUE, FALSE),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'lore', FALSE, FALSE),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'entrevistas', FALSE, FALSE);

-- 3. Cartera Inicial
INSERT INTO public.wallet_config (user_id, account_1_name, account_1_initial_balance, account_2_name, account_2_initial_balance, has_account_2, onboarding_completed) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Abanca Personal', 0, 'ING Conjunta', 0, TRUE, TRUE);

-- 4. Presupuestos Base
INSERT INTO public.category_budgets (category, monthly_limit, icon, color) VALUES
('Alimentación', 400, '🛒', '#10B981'),
('Hogar / Alquiler', 750, '🏠', '#6366F1'),
('Transporte / Gasolina', 150, '🚗', '#F59E0B'),
('Ocio & Restaurantes', 200, '🍿', '#EC4899'),
('Servicios / Suministros', 120, '⚡', '#06B6D4'),
('Tecnología', 100, '💻', '#8B5CF6'),
('Salud & Bienestar', 80, '💊', '#14B8A6'),
('Otros', 100, '📦', '#64748B');

-- 5. Objetivos de Lore Iniciales
INSERT INTO public.lore_goals (id, objetivo_mensual, venta_acumulada, dias_laborables_restantes, incentive_image) VALUES
('current_goals', 15000, 0, 21, '/tabla-incentivos.png');

-- 6. Perfil Fitness Base para Asier
INSERT INTO public.fitness_profiles (user_id, age, gender, height_cm, current_weight, target_weight, activity_level, goal, target_calories, target_protein, target_carbs, target_fat, target_water_ml, target_daily_steps, onboarding_completed) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 28, 'male', 178, 95.7, 75.0, 'moderate', 'fat_loss', 2150, 165, 210, 65, 3000, 10000, TRUE);

-- 7. Metas de Ahorro
INSERT INTO public.savings_goals (id, user_id, title, target_amount, current_amount, account, target_date, notes) VALUES
('goal_1', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Viaje / Vacaciones', 2500, 0, 'ing', '2026-11-01', 'Ahorro conjunto para vacaciones'),
('goal_2', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Fondo de Emergencia Personal', 5000, 0, 'abanca', '2026-12-31', 'Colchón de seguridad personal Abanca');
