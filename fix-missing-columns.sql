-- Script para agregar todas las columnas faltantes
-- Ejecutar este script en Supabase SQL Editor

-- 1. VERIFICAR ESTRUCTURA ACTUAL DE PROFILES
SELECT 'Estructura actual de profiles:' as status;
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. AGREGAR COLUMNA is_public A PROFILES
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;

-- Actualizar perfiles existentes para que sean privados por defecto
UPDATE public.profiles 
SET is_public = false 
WHERE is_public IS NULL;

-- 3. VERIFICAR ESTRUCTURA ACTUAL DE ENROLLMENTS
SELECT 'Estructura actual de enrollments:' as status;
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'enrollments' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. AGREGAR COLUMNAS FALTANTES A ENROLLMENTS
ALTER TABLE public.enrollments 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE public.enrollments 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 5. ACTUALIZAR REGISTROS EXISTENTES
UPDATE public.enrollments 
SET created_at = NOW() 
WHERE created_at IS NULL;

UPDATE public.enrollments 
SET updated_at = NOW() 
WHERE updated_at IS NULL;

-- 6. CREAR FUNCIÓN PARA TRIGGER DE updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. APLICAR TRIGGER A ENROLLMENTS
DROP TRIGGER IF EXISTS update_enrollments_updated_at ON public.enrollments;
CREATE TRIGGER update_enrollments_updated_at
    BEFORE UPDATE ON public.enrollments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 8. APLICAR TRIGGER A PROFILES TAMBIÉN
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 9. VERIFICAR RESULTADOS FINALES
SELECT 'Estructura corregida de profiles:' as status;
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'Estructura corregida de enrollments:' as status;
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'enrollments' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 10. MOSTRAR ALGUNOS REGISTROS DE EJEMPLO
SELECT 'Perfil de ejemplo:' as status;
SELECT id, email, full_name, role, is_public, created_at, updated_at 
FROM public.profiles 
WHERE email = 'maikermicha15@gmail.com';

SELECT 'Enrollments de ejemplo:' as status;
SELECT id, user_id, course_id, created_at, updated_at 
FROM public.enrollments 
LIMIT 3;
