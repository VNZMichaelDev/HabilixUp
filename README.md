# HabilixUp - Plataforma de Cursos Online

HabilixUp es una plataforma moderna de aprendizaje en línea construida con Next.js, TypeScript y Tailwind CSS. Permite a los usuarios explorar cursos, ver lecciones y gestionar su progreso de aprendizaje.

## 🚀 Características

- **Catálogo de Cursos**: Explora una amplia variedad de cursos organizados por categorías
- **Sistema de Lecciones**: Navegación fluida entre lecciones con seguimiento de progreso
- **Diseño Responsivo**: Optimizado para dispositivos móviles y desktop
- **Interfaz Moderna**: UI/UX atractiva con Tailwind CSS
- **TypeScript**: Código tipado para mejor mantenibilidad
- **SEO Optimizado**: Configurado para motores de búsqueda

## 🛠️ Tecnologías Utilizadas

- **Frontend**: Next.js 15.5.3 con App Router
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Imágenes**: Next.js Image Optimization
- **Routing**: Next.js Dynamic Routes

## 📁 Estructura del Proyecto

```
HabilixUp/
├── src/
│   ├── app/                    # App Router pages
│   │   ├── cursos/            # Páginas de cursos
│   │   │   ├── [id]/          # Página individual de curso
│   │   │   │   └── leccion/   # Páginas de lecciones
│   │   │   │       └── [leccionId]/
│   │   │   └── page.tsx       # Lista de cursos
│   │   ├── login/             # Página de inicio de sesión
│   │   ├── registro/          # Página de registro
│   │   ├── globals.css        # Estilos globales
│   │   ├── layout.tsx         # Layout principal
│   │   └── page.tsx           # Página de inicio
│   ├── data/
│   │   └── courses.ts         # Datos de cursos y lecciones
│   └── types/
│       └── index.ts           # Definiciones de tipos TypeScript
├── public/
│   ├── logo.png              # Logo de HabilixUp
│   └── Aprende.png           # Imagen de ejemplo
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## 🎯 Páginas Disponibles

### Páginas Principales
- `/` - Página de inicio con hero section y características
- `/cursos` - Catálogo completo de cursos con filtros
- `/login` - Formulario de inicio de sesión
- `/registro` - Formulario de registro de usuarios

### Páginas Dinámicas
- `/cursos/[id]` - Página individual de curso con lista de lecciones
- `/cursos/[id]/leccion/[leccionId]` - Página de lección individual con contenido

### Ejemplos de URLs
- `/cursos/1` - Curso de Desarrollo Web Full Stack
- `/cursos/1/leccion/1-1` - Primera lección del curso
- `/cursos/2` - Curso de Diseño UX/UI
- `/cursos/3/leccion/3-1` - Lección de Marketing Digital

## 🏃‍♂️ Instalación y Uso

### Prerrequisitos
- Node.js 18+ 
- npm o yarn
- Cuenta de Supabase (gratuita)

### Configuración de Supabase

1. **Crear proyecto en Supabase**:
   - Ve a [supabase.com](https://supabase.com)
   - Crea una nueva cuenta y proyecto
   - Anota la URL del proyecto y la clave anónima

2. **Ejecutar el script SQL**:
   - En el dashboard de Supabase, ve a SQL Editor
   - Copia y pega el contenido de `database.sql`
   - Ejecuta el script para crear todas las tablas

3. **Configurar variables de entorno**:
   - Copia `.env.local.example` a `.env.local`
   - Completa con tus credenciales de Supabase:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima
   ```

### Instalación

1. **Instalar dependencias**:
```bash
npm install
```

2. **Ejecutar en modo desarrollo**:
```bash
npm run dev
```

3. **Abrir en el navegador**:
```
http://localhost:3000
```

### Scripts Disponibles

```bash
npm run dev      # Ejecutar en modo desarrollo
npm run build    # Construir para producción
npm run start    # Ejecutar versión de producción
npm run lint     # Ejecutar ESLint
```

## 📊 Datos de Ejemplo

El proyecto incluye 6 cursos de ejemplo en diferentes categorías:

1. **Desarrollo Web Full Stack** - React y Node.js (Intermedio)
2. **Diseño UX/UI Profesional** - Experiencia de usuario (Principiante)
3. **Marketing Digital y SEO** - Estrategias digitales (Intermedio)
4. **Python para Data Science** - Análisis de datos (Principiante)
5. **Emprendimiento y Startups** - Gestión de negocios (Principiante)
6. **Fotografía Digital** - Arte y creatividad (Intermedio)

Cada curso incluye múltiples lecciones con:
- Título y descripción
- Duración estimada
- Contenido de la lección
- Orden secuencial

## 🎨 Diseño y UI

### Paleta de Colores
- **Primario**: Azul (#3B82F6, #2563EB)
- **Secundario**: Índigo (#6366F1)
- **Éxito**: Verde (#10B981)
- **Advertencia**: Amarillo (#F59E0B)
- **Error**: Rojo (#EF4444)

### Componentes Principales
- Header con navegación responsiva
- Cards de cursos con información detallada
- Sistema de progreso visual
- Formularios estilizados
- Footer informativo

## 🔧 Personalización

### Agregar Nuevos Cursos
Edita el archivo `src/data/courses.ts` para agregar nuevos cursos:

```typescript
{
  id: 'nuevo-id',
  title: 'Título del Curso',
  description: 'Descripción del curso...',
  instructor: 'Nombre del Instructor',
  duration: 'X semanas',
  level: 'Principiante' | 'Intermedio' | 'Avanzado',
  price: 299,
  image: '/ruta-imagen.png',
  category: 'Categoría',
  rating: 4.8,
  studentsCount: 1000,
  lessons: [
    // Array de lecciones...
  ]
}
```

### Modificar Estilos
Los estilos están configurados en:
- `tailwind.config.ts` - Configuración de Tailwind
- `src/app/globals.css` - Estilos globales
- Clases de Tailwind en componentes

## 🚀 Despliegue

### Vercel (Recomendado)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm run build
# Subir carpeta .next a Netlify
```

### Otros Proveedores
El proyecto es compatible con cualquier proveedor que soporte Next.js.

## 🔮 Próximas Características

- [ ] Sistema de autenticación real
- [ ] Base de datos para persistencia
- [ ] Reproductor de video integrado
- [ ] Sistema de comentarios
- [ ] Certificados de finalización
- [ ] Pagos integrados
- [ ] Dashboard de instructor
- [ ] Notificaciones push
- [ ] Modo offline
- [ ] API REST completa

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-caracteristica`)
3. Commit tus cambios (`git commit -m 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Si tienes preguntas o necesitas ayuda:

- 📧 Email: soporte@habilixup.com
- 🌐 Website: https://habilixup.com
- 📱 Discord: [Servidor de la comunidad]

---

**HabilixUp** - Desarrolla tus habilidades con la mejor plataforma de aprendizaje online 🚀
