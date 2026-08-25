-- ============================================================================
-- PLATAFORMA PROYECTOS - SCRIPT DEFINITIVO DE PRODUCCIÓN SUPABASE
-- ============================================================================
-- INSTRUCCIONES:
-- 1. Abre Supabase: https://supabase.com/dashboard/project/xmxrywztdmjzffgdknpd
-- 2. Entra en "SQL Editor" en el menú de la izquierda.
-- 3. Crea una "New Query", pega TODO este código y dale a "RUN".
-- ============================================================================

-- 1. RESET DEL ESQUEMA PÚBLICO
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 2. TABLAS DEL SISTEMA RBAC (USUARIOS, PERMISOS Y AUDITORÍA)
-- ============================================================================

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

CREATE TABLE public.app_permissions (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
    app_id TEXT NOT NULL CHECK (app_id IN ('fitness', 'gastos', 'libros-juegos', 'lore', 'entrevistas')),
    can_access BOOLEAN DEFAULT TRUE,
    can_edit BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, app_id)
);

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

CREATE TABLE public.category_budgets (
    category TEXT PRIMARY KEY,
    monthly_limit NUMERIC(10, 2) NOT NULL,
    icon TEXT,
    color TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 4. MÓDULO FITNESS & SALUD INTEGRAL
-- ============================================================================

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

CREATE TABLE public.lore_saved_routes (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    name TEXT NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    client_ids JSONB DEFAULT '[]'::jsonb,
    total_distance_km NUMERIC(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

CREATE TABLE public.lore_goals (
    id TEXT PRIMARY KEY,
    objetivo_mensual NUMERIC(10, 2) DEFAULT 15000,
    venta_acumulada NUMERIC(10, 2) DEFAULT 0,
    dias_laborables_restantes INT DEFAULT 21,
    incentive_image TEXT DEFAULT '/tabla-incentivos.png',
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
    seniority TEXT NOT NULL,
    current_company TEXT,
    current_salary_eur NUMERIC(10, 2),
    expected_salary_eur NUMERIC(10, 2),
    notice_period_weeks INT,
    english_level TEXT,
    location TEXT,
    linkedin_url TEXT,
    status TEXT DEFAULT 'pending',
    interview_date DATE DEFAULT CURRENT_DATE,
    duration_minutes INT DEFAULT 60,
    cv_text TEXT,
    cv_file_name TEXT,
    parsed_skills JSONB DEFAULT '[]'::jsonb,
    evaluations JSONB DEFAULT '{}'::jsonb,
    resultado_final JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 8. DESACTIVAR RLS PARA ACCESO DIRECTO SIN BLOQUEOS
-- ============================================================================

ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_config DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_goals DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_budgets DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.fitness_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.fitness_workouts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.fitness_nutrition_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.fitness_body_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.fitness_polar_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_library DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lore_clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lore_saved_routes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lore_crm_pharmacies DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lore_goals DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_candidates DISABLE ROW LEVEL SECURITY;

GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;

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

-- 6. Perfil Fitness Base
INSERT INTO public.fitness_profiles (user_id, age, gender, height_cm, current_weight, target_weight, activity_level, goal, target_calories, target_protein, target_carbs, target_fat, target_water_ml, target_daily_steps, onboarding_completed) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 28, 'male', 178, 95.7, 75.0, 'moderate', 'fat_loss', 2150, 165, 210, 65, 3000, 10000, TRUE);

-- 7. Metas de Ahorro
INSERT INTO public.savings_goals (id, user_id, title, target_amount, current_amount, account, target_date, notes) VALUES
('goal_1', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Viaje / Vacaciones', 2500, 0, 'ing', '2026-11-01', 'Ahorro conjunto para vacaciones'),
('goal_2', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Fondo de Emergencia Personal', 5000, 0, 'abanca', '2026-12-31', 'Colchón de seguridad personal Abanca');

-- 8. Farmacias CRM Base
INSERT INTO public.lore_crm_pharmacies (id, category_type, provincia, ciudad, farmacia_nombre, contacto, telefono, decil, ventas_anuales, frecuencia_visita, ultima_visita, proxima_accion, fecha_proxima_accion, le_interesa, no_le_interesa, marcas_competencia, detalles_competencia, estado_cliente, estado_prospeccion, tendencia_compra, prioridad, accion_completada, notas) VALUES
('c_1', 'cliente', 'Asturias', 'Gijón', 'Farmacia Ateneo', 'Marta', '600 123 456', 'D05', 6712.17, '15 días', '14/08/2026', 'Llamar', '28/08/2026', 'Colágeno marino, Vitamina C', 'Línea infantil', 'Ana M. Lajusticia, Epaplus', 'Expositor Epaplus en mostrador', 'Activo', 'Cliente cerrado', 'En crecimiento', 'Alta', FALSE, 'Interesados en colágeno marino y promociones de otoño.'),
('c_2', 'cliente', 'Asturias', 'Gijón', 'Farmacia La Paz', 'Javier', '600 234 567', 'D03', 4985.20, '15 días', '07/08/2026', 'Visita', '21/08/2026', 'Sportlife, Proteínas', 'Cosmética', 'Aquilea', 'Descuento 15% que hay que igualar', 'Activo', 'Cliente cerrado', 'Dejando de comprar', 'Media', FALSE, 'Potencial Sportlife. Mandar muestras para reenganchar.'),
('c_3', 'cliente', 'Asturias', 'Avilés', 'Farmacia Avilés', 'Ana', '600 345 678', 'D04', 2450.75, '15 días', '10/08/2026', 'Visita', '24/08/2026', 'Magnesio, Complejos B', '', 'Arkopharma', '', 'Activo', 'Cliente cerrado', 'En crecimiento', 'Alta', FALSE, 'Trabaja muy bien magnesio. Ofrecer pack promocional.'),
('p_1', 'prospeccion', 'Asturias', 'Gijón', 'Farmacia San Lorenzo', 'Covadonga', '600 678 901', 'D08', 0, '30 días', '', 'Primera visita', '20/08/2026', 'Fitoterapia general', '', 'Arkopharma, Pranarôm', 'Mucho producto natural en escaparate', 'Pendiente', 'Sin contactar', 'Potencial de subida', 'Alta', FALSE, 'Ubicación premium en paseo marítimo. Muy alto tráfico.'),
('p_2', 'prospeccion', 'Asturias', 'Oviedo', 'Farmacia Uría', 'Pelayo', '600 789 012', 'D10', 0, '15 días', '', 'Llamar para cita', '18/08/2026', 'Todo el catálogo Drasanvi', '', 'Todas las grandes', 'Farmacia nº 1 de Oviedo', 'Pendiente', 'Contactado', 'Potencial de subida', 'Alta', FALSE, 'Cita solicitada. Decil 10. Si entramos aquí, volumen garantizado.');

-- 9. Candidato Sample Mecalux
INSERT INTO public.interview_candidates (id, user_id, full_name, email, phone, role, seniority, current_company, current_salary_eur, expected_salary_eur, notice_period_weeks, english_level, location, linkedin_url, status, interview_date, duration_minutes, parsed_skills, evaluations, resultado_final) VALUES
('cand_sample_1', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'David Martínez Ruiz', 'david.martinez@email.com', '+34 612 345 678', 'Tech Lead / Team Leader Mecalux', 'Lead', 'Indra / Minsait', 48000, 55000, 4, 'B2 / C1 Profesional', 'Gijón / Remoto Híbrido', 'https://linkedin.com/in/davidmartinez-lead', 'evaluated', '2026-08-20', 60, '["Java 17", "Spring Boot", "Microservicios", "Docker", "Kubernetes", "AWS", "Liderazgo Técnico", "Scrum / Agile", "Code Reviews", "1-on-1s"]'::jsonb, '{"liderazgo": {"notas": "Gran experiencia en 1-on-1s y desbloqueo de equipo.", "puntuacion": 4}, "fit_cultural": {"notas": "Alineación perfecta con la cultura de Mecalux.", "puntuacion": 5}, "gestion_equipos": {"notas": "Gestión ágil con métricas de entrega.", "puntuacion": 4.5}, "arquitectura_tecnica": {"notas": "Sólido en microservicios y clean architecture.", "puntuacion": 4.5}, "resolucion_conflictos": {"notas": "Asertivo y comunicativo.", "puntuacion": 4}}'::jsonb, '{"decision": "Aprobado / Contratar", "areasMejora": "Profundizar en la operativa específica de almacenes automáticos.", "puntosFuertes": "Dominio técnico en backend, mentalidad de mentor y comunicación excelente.", "puntuacionGlobal": 95, "recomendacionContratacion": "Candidato ideal para liderar la célula de software logístico."}'::jsonb);

-- 10. Libros & Juegos Base
INSERT INTO public.user_library (id, user_id, title, media_type, genre, status, rating, progress_percentage) VALUES
('lib_1', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Clean Code: A Handbook of Agile Software Craftsmanship', 'book', 'Software & Arquitectura', 'completed', 5, 100),
('lib_2', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'The Witcher 3: Wild Hunt', 'game', 'RPG / Aventura', 'completed', 5, 100);
