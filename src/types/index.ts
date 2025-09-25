export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  level: 'Principiante' | 'Intermedio' | 'Avanzado';
  price: number;
  image: string;
  category: string;
  rating: number;
  studentsCount: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  videoUrl?: string;
  content: string;
  richContent?: {
    sections: LessonSection[];
    codeExamples?: CodeExample[];
    objectives?: string[];
    resources?: Resource[];
  };
  order: number;
  completed?: boolean;
}

export interface LessonSection {
  type: 'text' | 'code' | 'list' | 'heading' | 'note' | 'example' | 'exercise' | 'quiz';
  title?: string;
  content: string;
  language?: string; // para bloques de código
  items?: string[]; // para listas
  exercise?: Exercise; // para ejercicios
  quiz?: Quiz; // para cuestionarios
}

export interface Exercise {
  id: string;
  title: string;
  description: string;
  type: 'code' | 'multiple-choice' | 'fill-blank' | 'drag-drop';
  initialCode?: string;
  expectedOutput?: string;
  hints?: string[];
  solution?: string;
  options?: string[]; // para multiple choice
  correctAnswer?: string | number;
}

export interface Quiz {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface CodeExample {
  title: string;
  language: string;
  code: string;
  description?: string;
}

export interface Resource {
  title: string;
  url: string;
  type: 'link' | 'download' | 'video';
}

export interface User {
  id: string;
  name: string;
  email: string;
  enrolledCourses: string[];
  completedLessons: string[];
}
