-- Script para corregir acceso de administrador
-- Ejecutar este script en tu base de datos Supabase

-- 1. Verificar si el perfil existe
SELECT 'Verificando perfil existente...' as status;
SELECT id, email, role, full_name, created_at 
FROM public.profiles 
WHERE email = 'maikermicha15@gmail.com';

-- 2. Si el perfil existe, actualizar rol a admin
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'maikermicha15@gmail.com';

-- 3. Si el perfil no existe, necesitamos crearlo cuando te registres
-- Primero, asegurémonos de que la función de trigger existe
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

-- 4. Crear trigger para promover automáticamente al admin
DROP TRIGGER IF EXISTS promote_admin_on_insert ON public.profiles;
CREATE TRIGGER promote_admin_on_insert
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.promote_admin_user();

-- 5. También crear trigger para UPDATE por si el perfil ya existe
DROP TRIGGER IF EXISTS promote_admin_on_update ON public.profiles;
CREATE TRIGGER promote_admin_on_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.promote_admin_user();

-- 6. Verificar resultado final
SELECT 'Verificación final...' as status;
SELECT id, email, role, full_name 
FROM public.profiles 
WHERE email = 'maikermicha15@gmail.com';

-- 7. Si aún no existe el perfil, mostrar instrucciones
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE email = 'maikermicha15@gmail.com') THEN
    RAISE NOTICE 'PERFIL NO ENCONTRADO: Necesitas registrarte primero con el email maikermicha15@gmail.com';
    RAISE NOTICE 'Después de registrarte, el trigger automáticamente te asignará el rol de admin';
  ELSE
    RAISE NOTICE 'PERFIL ENCONTRADO Y ACTUALIZADO: Ahora tienes acceso de administrador';
  END IF;
END $$;
