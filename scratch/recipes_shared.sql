-- Tabla para Recetas (Compartida por todos los usuarios)
CREATE TABLE IF NOT EXISTS public.fitness_recipes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Autor de la receta (opcional si queremos saber quién la creó)
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    calories INTEGER NOT NULL DEFAULT 0,
    protein INTEGER NOT NULL DEFAULT 0,
    carbs INTEGER NOT NULL DEFAULT 0,
    fat INTEGER NOT NULL DEFAULT 0,
    prep_time_minutes INTEGER NOT NULL DEFAULT 0,
    difficulty TEXT,
    ingredients JSONB NOT NULL DEFAULT '[]'::jsonb,
    instructions JSONB NOT NULL DEFAULT '[]'::jsonb,
    tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Políticas de Seguridad (RLS) para hacerla compartida
ALTER TABLE public.fitness_recipes ENABLE ROW LEVEL SECURITY;

-- Todos los usuarios autenticados pueden leer TODAS las recetas
CREATE POLICY "Cualquier usuario puede ver las recetas" 
    ON public.fitness_recipes 
    FOR SELECT 
    USING (auth.role() = 'authenticated');

-- Todos los usuarios autenticados pueden insertar nuevas recetas
CREATE POLICY "Cualquier usuario puede insertar recetas" 
    ON public.fitness_recipes 
    FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

-- (Opcional) Si quieres que solo el creador pueda editar/borrar su receta, o dejarlo abierto
-- CREATE POLICY "Solo el creador puede editar" ON public.fitness_recipes FOR UPDATE USING (auth.uid() = user_id);
-- CREATE POLICY "Solo el creador puede borrar" ON public.fitness_recipes FOR DELETE USING (auth.uid() = user_id);
