-- Drop the RLS policies first just in case
DROP POLICY IF EXISTS "Cualquier usuario puede ver las recetas" ON public.fitness_recipes;
DROP POLICY IF EXISTS "Cualquier usuario puede insertar recetas" ON public.fitness_recipes;
DROP POLICY IF EXISTS "Solo el creador puede editar" ON public.fitness_recipes;
DROP POLICY IF EXISTS "Solo el creador puede borrar" ON public.fitness_recipes;

-- Disable RLS
ALTER TABLE public.fitness_recipes DISABLE ROW LEVEL SECURITY;

-- Drop foreign key constraint on user_id if exists
ALTER TABLE public.fitness_recipes DROP CONSTRAINT IF EXISTS fitness_recipes_user_id_fkey;

-- Change id and user_id column types to TEXT
ALTER TABLE public.fitness_recipes ALTER COLUMN id TYPE TEXT USING id::text;
ALTER TABLE public.fitness_recipes ALTER COLUMN user_id TYPE TEXT USING user_id::text;

-- Re-add foreign key to profiles instead of auth.users
ALTER TABLE public.fitness_recipes ADD CONSTRAINT fitness_recipes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
