-- Script para corregir completamente el sistema de certificados
-- Ejecutar este script en Supabase SQL Editor

-- 1. VERIFICAR ESTRUCTURA ACTUAL DE ENROLLMENTS
SELECT 'Estructura actual de enrollments:' as status;
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'enrollments' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. AGREGAR TODAS LAS COLUMNAS NECESARIAS PARA CERTIFICADOS
ALTER TABLE public.enrollments 
ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0;

ALTER TABLE public.enrollments 
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.enrollments 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE public.enrollments 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 3. ACTUALIZAR REGISTROS EXISTENTES
-- Asumir que enrollments existentes están completados al 100%
UPDATE public.enrollments 
SET progress = 100 
WHERE progress IS NULL OR progress = 0;

UPDATE public.enrollments 
SET completed_at = created_at 
WHERE completed_at IS NULL AND progress = 100;

UPDATE public.enrollments 
SET created_at = NOW() 
WHERE created_at IS NULL;

UPDATE public.enrollments 
SET updated_at = NOW() 
WHERE updated_at IS NULL;

-- 4. VERIFICAR DATOS DE ENROLLMENTS
SELECT 'Datos actuales de enrollments:' as status;
SELECT id, user_id, course_id, progress, completed_at, created_at 
FROM public.enrollments 
LIMIT 5;

-- 5. VERIFICAR ESTRUCTURA DE COURSES
SELECT 'Estructura de courses:' as status;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'courses' AND table_schema = 'public'
AND column_name IN ('id', 'title', 'instructor_id')
ORDER BY ordinal_position;

-- 6. VERIFICAR ESTRUCTURA DE PROFILES
SELECT 'Estructura de profiles:' as status;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public'
AND column_name IN ('id', 'full_name', 'email')
ORDER BY ordinal_position;

-- 7. PROBAR LA CONSULTA QUE USA EL CERTIFICADO
SELECT 'Probando consulta de certificado:' as status;
SELECT 
    e.id,
    e.progress,
    e.created_at,
    c.id as course_id,
    c.title as course_title,
    p.full_name as instructor_name
FROM public.enrollments e
LEFT JOIN public.courses c ON e.course_id = c.id
LEFT JOIN public.profiles p ON c.instructor_id = p.id
WHERE e.progress = 100
LIMIT 3;

-- 8. CREAR FUNCIÓN PARA MARCAR CURSO COMO COMPLETADO
CREATE OR REPLACE FUNCTION complete_course(
    p_user_id UUID,
    p_course_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
    -- Actualizar o insertar enrollment con progreso 100%
    INSERT INTO public.enrollments (user_id, course_id, progress, completed_at, created_at, updated_at)
    VALUES (p_user_id, p_course_id, 100, NOW(), NOW(), NOW())
    ON CONFLICT (user_id, course_id) 
    DO UPDATE SET 
        progress = 100,
        completed_at = NOW(),
        updated_at = NOW();
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- 9. CREAR FUNCIÓN PARA VERIFICAR SI UN CURSO ESTÁ COMPLETADO
CREATE OR REPLACE FUNCTION is_course_completed(
    p_user_id UUID,
    p_course_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    enrollment_progress INTEGER;
BEGIN
    SELECT progress INTO enrollment_progress
    FROM public.enrollments
    WHERE user_id = p_user_id AND course_id = p_course_id;
    
    RETURN COALESCE(enrollment_progress, 0) = 100;
END;
$$ LANGUAGE plpgsql;

-- 10. EJEMPLO DE CÓMO COMPLETAR UN CURSO (para testing)
-- Descomenta las siguientes líneas si quieres marcar un curso como completado para testing
/*
-- Obtener el primer usuario y curso para testing
DO $$
DECLARE
    test_user_id UUID;
    test_course_id UUID;
BEGIN
    -- Obtener primer usuario
    SELECT id INTO test_user_id FROM public.profiles LIMIT 1;
    
    -- Obtener primer curso
    SELECT id INTO test_course_id FROM public.courses LIMIT 1;
    
    -- Marcar como completado
    IF test_user_id IS NOT NULL AND test_course_id IS NOT NULL THEN
        PERFORM complete_course(test_user_id, test_course_id);
        RAISE NOTICE 'Curso marcado como completado para testing: user_id=%, course_id=%', test_user_id, test_course_id;
    END IF;
END $$;
*/

-- 11. VERIFICAR RESULTADO FINAL
SELECT 'Verificación final - Enrollments con progreso 100%:' as status;
SELECT 
    e.id,
    e.user_id,
    e.course_id,
    e.progress,
    e.completed_at,
    c.title as course_title,
    p.full_name as instructor_name
FROM public.enrollments e
LEFT JOIN public.courses c ON e.course_id = c.id
LEFT JOIN public.profiles p ON c.instructor_id = p.id
WHERE e.progress = 100;

SELECT 'Total de enrollments completados:' as status;
SELECT COUNT(*) as total_completed
FROM public.enrollments 
WHERE progress = 100;
