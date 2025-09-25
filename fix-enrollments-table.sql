-- Script para corregir la tabla enrollments
-- Ejecutar DESPUÉS de fix-rls-simple.sql

-- 1. Verificar estructura actual de enrollments
SELECT 'Estructura actual de enrollments:' as status;
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'enrollments' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Agregar columna created_at si no existe
ALTER TABLE public.enrollments 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 3. Agregar columna updated_at si no existe
ALTER TABLE public.enrollments 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 4. Crear trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. Aplicar trigger a enrollments
DROP TRIGGER IF EXISTS update_enrollments_updated_at ON public.enrollments;
CREATE TRIGGER update_enrollments_updated_at
    BEFORE UPDATE ON public.enrollments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. Actualizar registros existentes que no tengan created_at
UPDATE public.enrollments 
SET created_at = NOW() 
WHERE created_at IS NULL;

-- 7. Verificar resultado
SELECT 'Estructura corregida de enrollments:' as status;
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'enrollments' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 8. Mostrar algunos registros de ejemplo
SELECT 'Registros de ejemplo:' as status;
SELECT id, user_id, course_id, created_at, updated_at 
FROM public.enrollments 
LIMIT 3;
