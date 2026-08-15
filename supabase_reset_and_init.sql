-- ============================================================================
-- SCRIPT DE RESET Y LIMPIEZA COMPLETA PARA SUPABASE
-- PLATAFORMA UNIFICADA DE PROYECTOS (FITNESS, GASTOS, LIBROS-JUEGOS, LORE)
-- ============================================================================

-- 1. ELIMINAR CUALQUIER TABLA / ESQUEMA ANTERIOR (LIMPIEZA TOTAL)
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 2. TABLAS DEL SISTEMA RBAC (GESTIÓN DE USUARIOS Y PERMISOS)
-- ============================================================================

-- Tabla de Perfiles de Usuario
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'user', 'guest')),
    department TEXT DEFAULT 'General',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Matriz de Permisos por Aplicación
CREATE TABLE public.app_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    app_id TEXT NOT NULL CHECK (app_id IN ('fitness', 'gastos', 'libros-juegos', 'lore')),
    can_access BOOLEAN DEFAULT TRUE,
    can_edit BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, app_id)
);

-- Tabla de Registros de Actividad (Audit Trail)
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_email TEXT NOT NULL,
    action TEXT NOT NULL,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 3. TABLAS DE MÓDULOS UNIFICADOS
-- ============================================================================

-- 🏋️‍♂️ Módulo Fitness
CREATE TABLE public.fitness_workouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL, -- Cardio, Fuerza, Flexibilidad, etc.
    duration_minutes INT NOT NULL DEFAULT 30,
    calories_burned INT NOT NULL DEFAULT 150,
    workout_date DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 💰 Módulo Gastos
CREATE TABLE public.expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('expense', 'income')),
    category TEXT NOT NULL, -- Alimentación, Transporte, Ocio, Servicios, etc.
    transaction_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 📚 Módulo Libros y Juegos
CREATE TABLE public.user_library (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    media_type TEXT NOT NULL CHECK (media_type IN ('book', 'game')),
    genre TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('in_progress', 'completed', 'wishlist')),
    rating INT CHECK (rating >= 1 AND rating <= 5),
    progress_percentage INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 🗺️ Módulo Lore (Gestión de Conocimiento y Notas)
CREATE TABLE public.lore_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL, -- Clientes, Guías, Procedimientos, Arquitectura
    content TEXT NOT NULL,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 4. INSERTAR DATOS INICIALES DE PRUEBA (SEMILLA REQUERIDA)
-- ============================================================================

-- Insertar Usuarios Semilla
INSERT INTO public.profiles (id, email, full_name, role, department, avatar_url) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'asier.bazaga@plataforma.com', 'Asier Bazaga', 'admin', 'Dirección IT & Super Admin', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'lore@plataforma.com', 'Lore', 'user', 'Operaciones & Gestión', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'invitado@plataforma.com', 'Invitado Demo', 'guest', 'Consultoría Externa', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150');

-- Matriz de Permisos por Defecto
-- Asier Bazaga (Admin): Acceso y Edición Total a las 4 Apps + Matriz RBAC y Logs
INSERT INTO public.app_permissions (user_id, app_id, can_access, can_edit) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'fitness', TRUE, TRUE),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'gastos', TRUE, TRUE),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'libros-juegos', TRUE, TRUE),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'lore', TRUE, TRUE);

-- Lore (Usuario): Acceso Total a las 4 Apps (Sin rol admin para gestión RBAC ni Logs)
INSERT INTO public.app_permissions (user_id, app_id, can_access, can_edit) VALUES
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'fitness', TRUE, TRUE),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'gastos', TRUE, TRUE),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'libros-juegos', TRUE, TRUE),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'lore', TRUE, TRUE);

-- Invitado: Solo lectura a Libros-Juegos
INSERT INTO public.app_permissions (user_id, app_id, can_access, can_edit) VALUES
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'fitness', FALSE, FALSE),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'gastos', FALSE, FALSE),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'libros-juegos', TRUE, FALSE),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'lore', FALSE, FALSE);

-- Insertar Datos Ejemplo en los 4 Módulos
INSERT INTO public.fitness_workouts (user_id, title, category, duration_minutes, calories_burned, notes) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Entrenamiento Hipertrofia Pecho y Tríceps', 'Fuerza', 50, 420, '4 series de Press Banca y fondos'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Carrera Continua 7K', 'Cardio', 35, 380, 'Ritmo promedio 5:00 min/km');

INSERT INTO public.expenses (user_id, description, amount, type, category) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Suscripción Servidores Cloud Vercel/Supabase', 45.00, 'expense', 'Tecnología'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Compra Supermercado Semanal', 128.50, 'expense', 'Alimentación'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Cobro Proyecto Freelance', 1200.00, 'income', 'Ingresos');

INSERT INTO public.user_library (user_id, title, media_type, genre, status, rating, progress_percentage) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Clean Code (Robert C. Martin)', 'book', 'Software Architecture', 'in_progress', 5, 65),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'The Witcher 3: Wild Hunt', 'game', 'RPG / Fantasía', 'completed', 5, 100);

INSERT INTO public.lore_entries (user_id, title, category, content, tags) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Procedimiento de Despliegue Vercel & Supabase', 'Procedimientos', 'Pasos para enlazar el repositorio unificado con las variables VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.', ARRAY['vercel', 'supabase', 'deploy']),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Arquitectura del Sistema de Permisos RBAC', 'Arquitectura', 'La matriz de permisos permite activar o desactivar accesos en tiempo real mediante Supabase app_permissions.', ARRAY['rbac', 'security', 'db']);

-- Fin del script
