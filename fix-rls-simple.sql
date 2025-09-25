-- Script simplificado para corregir políticas RLS
-- Este script es menos restrictivo para evitar problemas de acceso

-- 1. DESHABILITAR RLS TEMPORALMENTE para diagnosticar
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments DISABLE ROW LEVEL SECURITY;

-- 2. ELIMINAR TODAS LAS POLÍTICAS EXISTENTES
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;

DROP POLICY IF EXISTS "Anyone can view published courses" ON public.courses;
DROP POLICY IF EXISTS "Instructors can view own courses" ON public.courses;
DROP POLICY IF EXISTS "Admins can view all courses" ON public.courses;
DROP POLICY IF EXISTS "Admins can create courses" ON public.courses;
DROP POLICY IF EXISTS "Admins can update courses" ON public.courses;
DROP POLICY IF EXISTS "Admins can delete courses" ON public.courses;

DROP POLICY IF EXISTS "Enrolled users can view lessons" ON public.lessons;
DROP POLICY IF EXISTS "Admins can create lessons" ON public.lessons;
DROP POLICY IF EXISTS "Admins can update lessons" ON public.lessons;
DROP POLICY IF EXISTS "Admins can delete lessons" ON public.lessons;

DROP POLICY IF EXISTS "Users can view own enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Users can enroll in courses" ON public.enrollments;
DROP POLICY IF EXISTS "Admins can view all enrollments" ON public.enrollments;

-- 3. VERIFICAR QUE EL USUARIO ADMIN EXISTE Y TIENE EL ROL CORRECTO
SELECT 'Verificando usuario admin...' as status;
SELECT id, email, role, full_name 
FROM public.profiles 
WHERE email = 'maikermicha15@gmail.com';

-- Si no tiene rol admin, actualizarlo
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'maikermicha15@gmail.com';

-- Verificar actualización
SELECT 'Usuario después de actualización...' as status;
SELECT id, email, role, full_name 
FROM public.profiles 
WHERE email = 'maikermicha15@gmail.com';

-- 4. CREAR POLÍTICAS MÁS PERMISIVAS

-- PROFILES: Permitir acceso más amplio
CREATE POLICY "Enable read access for all users" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.profiles
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for users based on id" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- CATEGORIES: Acceso público total
CREATE POLICY "Enable read access for all users" ON public.categories
    FOR SELECT USING (true);

CREATE POLICY "Enable all access for authenticated users" ON public.categories
    FOR ALL USING (auth.role() = 'authenticated');

-- COURSES: Acceso más permisivo
CREATE POLICY "Enable read access for all users" ON public.courses
    FOR SELECT USING (true);

CREATE POLICY "Enable all access for authenticated users" ON public.courses
    FOR ALL USING (auth.role() = 'authenticated');

-- LESSONS: Acceso más permisivo
CREATE POLICY "Enable read access for all users" ON public.lessons
    FOR SELECT USING (true);

CREATE POLICY "Enable all access for authenticated users" ON public.lessons
    FOR ALL USING (auth.role() = 'authenticated');

-- ENROLLMENTS: Acceso básico
CREATE POLICY "Enable read access for all users" ON public.enrollments
    FOR SELECT USING (true);

CREATE POLICY "Enable all access for authenticated users" ON public.enrollments
    FOR ALL USING (auth.role() = 'authenticated');

-- 5. HABILITAR RLS NUEVAMENTE
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- 6. VERIFICAR RESULTADO
SELECT 'Políticas creadas exitosamente' as status;
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename IN ('courses', 'lessons', 'profiles', 'categories', 'enrollments')
AND schemaname = 'public'
ORDER BY tablename, policyname;
