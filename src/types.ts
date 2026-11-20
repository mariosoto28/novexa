// Autor: MMSZ (Mario Soto Zea)
// Tipos de ejercicio que soporta la app.

export interface MmszChoiceExercise {
  type: 'choice';
  prompt: string;
  code?: string;
  options: string[];
  answer: number; // índice de la opción correcta
  explain: string;
}

export interface MmszFillExercise {
  type: 'fill';
  prompt: string;
  code: string; // usa ___ para marcar el espacio en blanco
  answers: string[]; // respuestas aceptadas
  explain: string;
}

export interface MmszOrderExercise {
  type: 'order';
  prompt: string;
  lines: string[]; // en el orden correcto
  explain: string;
}

export interface MmszCodeExercise {
  type: 'code'; // se ejecuta dentro de la app y se compara la salida
  prompt: string;
  starter: string;
  expectedOutput: string;
  explain: string;
  solucion?: string; // para las pruebas automáticas del contenido
}

export type MmszExercise = MmszChoiceExercise | MmszFillExercise | MmszOrderExercise | MmszCodeExercise;

/* ---------- Recursos de "Aprende" ---------- */

/** Texto con formato simple: párrafos, listas "- ", **negrita**, `código` y bloques ```. */
export interface MmszLectura {
  tipo: 'lectura' | 'consejo' | 'repaso';
  id: string;
  titulo: string;
  contenido: string;
}

export interface MmszPaso {
  titulo: string;
  instrucciones: string;
  inicio?: string; // código inicial (solo el primer paso; los siguientes continúan tu código)
  pista?: string; // código de ayuda que se muestra al lado
  salida?: string; // salida esperada (si el lenguaje se puede ejecutar)
  requiere?: string[]; // textos que tu código debe contener (por ejemplo "for")
  solucion: string; // código completo que resuelve el paso
}

export interface MmszDesafio {
  tipo: 'desafio' | 'proyecto';
  id: string;
  titulo: string;
  pasos: MmszPaso[];
}

/** Fragmento de un video de YouTube (de un capítulo a otro). */
export interface MmszVideo {
  tipo: 'video';
  id: string;
  titulo: string;
  youtubeId: string;
  inicio: number; // segundo donde empieza el tema
  fin?: number; // segundo donde termina
  canal: string;
  descripcion: string;
}

export type MmszItem = MmszLectura | MmszDesafio | MmszVideo;

export type MmszNivel = 'Básico' | 'Intermedio' | 'Avanzado';

export interface MmszLesson {
  id: string;
  title: string;
  intro: string; // descripción corta del tema
  items: MmszItem[]; // lo que aparece en "Aprende"
  exercises: MmszExercise[]; // las preguntas de "Practica"
}

export interface MmszUnit {
  title: string;
  description: string;
  nivel: MmszNivel;
  lessons: MmszLesson[];
}

export interface MmszCourse {
  id: 'python' | 'javascript' | 'cpp';
  name: string;
  tagline: string;
  color: string;
  icon: string;
  units: MmszUnit[];
}
