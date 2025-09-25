-- Script para corregir las políticas RLS (Row Level Security) de Supabase
-- Ejecutar este script en tu base de datos Supabase

-- 1. Verificar el estado actual de RLS
SELECT 'Verificando estado de RLS...' as status;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('courses', 'lessons', 'profiles', 'categories', 'enrollments')
AND schemaname = 'public';

-- 2. Verificar políticas existentes
SELECT 'Políticas existentes...' as status;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('courses', 'lessons', 'profiles', 'categories', 'enrollments')
AND schemaname = 'public';

-- 3. POLÍTICAS PARA LA TABLA PROFILES
-- Permitir que los usuarios vean y actualicen su propio perfil
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Permitir que los admins vean todos los perfiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 4. POLÍTICAS PARA LA TABLA CATEGORIES
-- Permitir que todos vean las categorías
DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;
CREATE POLICY "Anyone can view categories" ON public.categories
    FOR SELECT USING (true);

-- Solo admins pueden crear/actualizar/eliminar categorías
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
CREATE POLICY "Admins can manage categories" ON public.categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 5. POLÍTICAS PARA LA TABLA COURSES
-- Permitir que todos vean cursos publicados
DROP POLICY IF EXISTS "Anyone can view published courses" ON public.courses;
CREATE POLICY "Anyone can view published courses" ON public.courses
    FOR SELECT USING (is_published = true OR auth.uid() = instructor_id);

-- Los instructores pueden ver sus propios cursos
DROP POLICY IF EXISTS "Instructors can view own courses" ON public.courses;
CREATE POLICY "Instructors can view own courses" ON public.courses
    FOR SELECT USING (auth.uid() = instructor_id);

-- Los admins pueden ver todos los cursos
DROP POLICY IF EXISTS "Admins can view all courses" ON public.courses;
CREATE POLICY "Admins can view all courses" ON public.courses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Solo admins pueden crear cursos
DROP POLICY IF EXISTS "Admins can create courses" ON public.courses;
CREATE POLICY "Admins can create courses" ON public.courses
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Solo admins pueden actualizar cursos
DROP POLICY IF EXISTS "Admins can update courses" ON public.courses;
CREATE POLICY "Admins can update courses" ON public.courses
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Solo admins pueden eliminar cursos
DROP POLICY IF EXISTS "Admins can delete courses" ON public.courses;
CREATE POLICY "Admins can delete courses" ON public.courses
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 6. POLÍTICAS PARA LA TABLA LESSONS (¡AQUÍ ESTÁ EL PROBLEMA!)
-- Permitir que usuarios inscritos vean lecciones
DROP POLICY IF EXISTS "Enrolled users can view lessons" ON public.lessons;
CREATE POLICY "Enrolled users can view lessons" ON public.lessons
    FOR SELECT USING (
        is_free = true OR 
        EXISTS (
            SELECT 1 FROM public.enrollments 
            WHERE user_id = auth.uid() AND course_id = lessons.course_id
        ) OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Solo admins pueden crear lecciones
DROP POLICY IF EXISTS "Admins can create lessons" ON public.lessons;
CREATE POLICY "Admins can create lessons" ON public.lessons
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Solo admins pueden actualizar lecciones
DROP POLICY IF EXISTS "Admins can update lessons" ON public.lessons;
CREATE POLICY "Admins can update lessons" ON public.lessons
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Solo admins pueden eliminar lecciones
DROP POLICY IF EXISTS "Admins can delete lessons" ON public.lessons;
CREATE POLICY "Admins can delete lessons" ON public.lessons
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 7. POLÍTICAS PARA LA TABLA ENROLLMENTS
-- Los usuarios pueden ver sus propias inscripciones
DROP POLICY IF EXISTS "Users can view own enrollments" ON public.enrollments;
CREATE POLICY "Users can view own enrollments" ON public.enrollments
    FOR SELECT USING (auth.uid() = user_id);

-- Los usuarios pueden inscribirse en cursos
DROP POLICY IF EXISTS "Users can enroll in courses" ON public.enrollments;
CREATE POLICY "Users can enroll in courses" ON public.enrollments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Los admins pueden ver todas las inscripciones
DROP POLICY IF EXISTS "Admins can view all enrollments" ON public.enrollments;
CREATE POLICY "Admins can view all enrollments" ON public.enrollments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 8. Habilitar RLS en todas las tablas si no está habilitado
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- 9. Verificar el resultado final
SELECT 'Verificación final...' as status;
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename IN ('courses', 'lessons', 'profiles', 'categories', 'enrollments')
AND schemaname = 'public'
ORDER BY tablename, policyname;

SELECT 'RLS habilitado en todas las tablas:' as status;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('courses', 'lessons', 'profiles', 'categories', 'enrollments')
AND schemaname = 'public';
