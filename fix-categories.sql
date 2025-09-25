-- Script para crear categorías básicas si no existen
-- Ejecutar este script en tu base de datos Supabase

-- Verificar si existen categorías
SELECT 'Verificando categorías existentes...' as status;
SELECT id, name, slug, description FROM public.categories;

-- Insertar categorías básicas si no existen
INSERT INTO public.categories (name, slug, description) 
VALUES 
  ('Desarrollo Web', 'desarrollo-web', 'Aprende a crear sitios web y aplicaciones'),
  ('Diseño', 'diseno', 'Diseño gráfico, UX/UI y creatividad digital'),
  ('Marketing Digital', 'marketing-digital', 'Estrategias de marketing online y redes sociales'),
  ('Programación', 'programacion', 'Lenguajes de programación y desarrollo de software'),
  ('Negocios', 'negocios', 'Emprendimiento, gestión y estrategia empresarial'),
  ('Tecnología', 'tecnologia', 'Tecnologías emergentes y herramientas digitales')
ON CONFLICT (slug) DO NOTHING;

-- Verificar resultado
SELECT 'Categorías después de la inserción...' as status;
SELECT id, name, slug, description FROM public.categories ORDER BY name;
