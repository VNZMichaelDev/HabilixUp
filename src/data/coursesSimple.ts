// ARCHIVO OBSOLETO - Solo para compatibilidad temporal
// El sistema ahora usa completamente la base de datos
// Este archivo se mantiene para evitar errores de importación en archivos obsoletos

export interface SimpleCourse {
  id: string
  title: string
  description: string
  category: string
  instructor: string
  duration: string
  level: 'Principiante' | 'Intermedio' | 'Avanzado'
  rating: number
  students: number
  price: number
  image: string
  lessons: SimpleLesson[]
}

export interface SimpleLesson {
  id: string
  title: string
  description: string
  duration: string
  content: string
}

// Datos de ejemplo para compatibilidad temporal
export const simpleCourses: SimpleCourse[] = [
  {
    id: 'html-css-basico',
    title: 'HTML y CSS Básico',
    description: 'Aprende los fundamentos de HTML y CSS para crear páginas web modernas.',
    category: 'Desarrollo Web',
    instructor: 'HabilixUp Team',
    duration: '4 semanas',
    level: 'Principiante',
    rating: 4.8,
    students: 1250,
    price: 0,
    image: '/courses/html-css.jpg',
    lessons: [
      {
        id: '1-1',
        title: 'Introducción a HTML',
        description: 'Conceptos básicos de HTML y estructura de documentos',
        duration: '30 min',
        content: '<h2>Introducción a HTML</h2><p>HTML (HyperText Markup Language) es el lenguaje estándar para crear páginas web...</p>'
      },
      {
        id: '1-2',
        title: 'Elementos HTML básicos',
        description: 'Aprende los elementos HTML más importantes',
        duration: '45 min',
        content: '<h2>Elementos HTML básicos</h2><p>Los elementos HTML son los bloques de construcción de las páginas web...</p>'
      }
    ]
  }
]
