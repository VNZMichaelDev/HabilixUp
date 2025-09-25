-- Script para actualizar el rol de admin
-- Ejecutar este script en tu base de datos Supabase

-- Primero, actualizar el usuario existente si ya existe
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'maikermicha15@gmail.com';

-- Función para promover usuario a admin basado en email
CREATE OR REPLACE FUNCTION public.promote_admin_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Si el email es el del administrador, asignar rol admin
  IF NEW.email = 'maikermicha15@gmail.com' THEN
    NEW.role = 'admin';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para promover automáticamente al admin
DROP TRIGGER IF EXISTS promote_admin_on_insert ON public.profiles;
CREATE TRIGGER promote_admin_on_insert
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.promote_admin_user();

-- Verificar que el usuario tiene rol admin
SELECT id, email, role, full_name 
FROM public.profiles 
WHERE email = 'maikermicha15@gmail.com';
