ALTER TABLE public.app_permissions DROP CONSTRAINT IF EXISTS app_permissions_app_id_check;

ALTER TABLE public.app_permissions ADD CONSTRAINT app_permissions_app_id_check 
CHECK (app_id IN ('fitness', 'gastos', 'libros-juegos', 'lore', 'entrevistas', 'inversiones', 'agenda', 'recetas'));
