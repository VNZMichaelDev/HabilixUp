-- HabilixUp Database Schema - Versión corregida para Supabase
-- Script para crear todas las tablas necesarias

-- Tabla de perfiles de usuario (extiende auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'instructor', 'admin')),
  verification_code TEXT UNIQUE,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de categorías de cursos
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de cursos
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  short_description TEXT,
  instructor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  duration TEXT, -- ej: "8 semanas"
  level TEXT CHECK (level IN ('Principiante', 'Intermedio', 'Avanzado')),
  image_url TEXT,
  video_preview_url TEXT,
  is_published BOOLEAN DEFAULT false,
  rating DECIMAL(3,2) DEFAULT 0,
  students_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de lecciones
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  video_url TEXT,
  duration INTEGER, -- duración en minutos
  order_index INTEGER NOT NULL,
  is_free BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de inscripciones (enrollments)
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  progress DECIMAL(5,2) DEFAULT 0, -- porcentaje de progreso
  UNIQUE(user_id, course_id)
);

-- Tabla de progreso de lecciones
CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  watch_time INTEGER DEFAULT 0, -- tiempo visto en segundos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Tabla de reseñas
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_courses_category ON public.courses(category_id);
CREATE INDEX IF NOT EXISTS idx_courses_instructor ON public.courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_courses_published ON public.courses(is_published);
CREATE INDEX IF NOT EXISTS idx_lessons_course ON public.lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_order ON public.lessons(course_id, order_index);
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON public.enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON public.enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user ON public.lesson_progress(user_id);

-- Row Level Security (RLS) Policies

-- Profiles: Los usuarios pueden ver y editar su propio perfil
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Courses: Todos pueden ver cursos publicados
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view published courses" ON public.courses;
CREATE POLICY "Anyone can view published courses" ON public.courses
  FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "Instructors can manage own courses" ON public.courses;
CREATE POLICY "Instructors can manage own courses" ON public.courses
  FOR ALL USING (auth.uid() = instructor_id);

-- Lessons: Visibles según el curso
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view lessons of published courses" ON public.lessons;
CREATE POLICY "Anyone can view lessons of published courses" ON public.lessons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE courses.id = lessons.course_id 
      AND courses.is_published = true
    )
  );

-- Enrollments: Los usuarios pueden ver sus propias inscripciones
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own enrollments" ON public.enrollments;
CREATE POLICY "Users can view own enrollments" ON public.enrollments
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own enrollments" ON public.enrollments;
CREATE POLICY "Users can create own enrollments" ON public.enrollments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Lesson Progress: Los usuarios pueden ver y actualizar su propio progreso
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own lesson progress" ON public.lesson_progress;
CREATE POLICY "Users can view own lesson progress" ON public.lesson_progress
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own lesson progress" ON public.lesson_progress;
CREATE POLICY "Users can update own lesson progress" ON public.lesson_progress
  FOR ALL USING (auth.uid() = user_id);

-- Reviews: Los usuarios pueden ver todas las reseñas y crear/editar las suyas
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;
CREATE POLICY "Anyone can view reviews" ON public.reviews
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage own reviews" ON public.reviews;
CREATE POLICY "Users can manage own reviews" ON public.reviews
  FOR ALL USING (auth.uid() = user_id);

-- Categories: Todos pueden ver categorías
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;
CREATE POLICY "Anyone can view categories" ON public.categories
  FOR SELECT USING (true);

-- Función para crear perfil automáticamente cuando se registra un usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil automáticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Función para actualizar el timestamp updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
DROP TRIGGER IF EXISTS handle_updated_at ON public.profiles;
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at ON public.courses;
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at ON public.lessons;
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.lessons
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at ON public.lesson_progress;
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.lesson_progress
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Insertar categorías iniciales
INSERT INTO public.categories (name, description, slug) VALUES
('Programación', 'Cursos de desarrollo de software y programación', 'programacion'),
('Diseño', 'Cursos de diseño gráfico, UX/UI y creatividad', 'diseno'),
('Marketing', 'Cursos de marketing digital y estrategias de negocio', 'marketing'),
('Data Science', 'Cursos de análisis de datos y machine learning', 'data-science'),
('Negocios', 'Cursos de emprendimiento y gestión empresarial', 'negocios'),
('Arte y Creatividad', 'Cursos de arte, fotografía y expresión creativa', 'arte-creatividad')
ON CONFLICT (slug) DO NOTHING;

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

-- Actualizar usuario existente si ya existe
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'maikermicha15@gmail.com';
