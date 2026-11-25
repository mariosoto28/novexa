export interface MmszChoiceExercise {
  mmszType: 'choice';
  mmszPrompt: string;
  mmszCode?: string;
  mmszOptions: string[];
  mmszAnswer: number;
  mmszExplain: string;
}

export interface MmszFillExercise {
  mmszType: 'fill';
  mmszPrompt: string;
  mmszCode: string;
  mmszAnswers: string[];
  mmszExplain: string;
}

export interface MmszOrderExercise {
  mmszType: 'order';
  mmszPrompt: string;
  mmszLines: string[];
  mmszExplain: string;
}

export interface MmszCodeExercise {
  mmszType: 'code';
  mmszPrompt: string;
  mmszStarter: string;
  mmszExpectedOutput: string;
  mmszExplain: string;
  mmszSolucion?: string;
}

export type MmszExercise = MmszChoiceExercise | MmszFillExercise | MmszOrderExercise | MmszCodeExercise;

export interface MmszLectura {
  mmszTipo: 'lectura' | 'consejo' | 'repaso';
  mmszId: string;
  mmszTitulo: string;
  mmszContenido: string;
}

export interface MmszPaso {
  mmszTitulo: string;
  mmszInstrucciones: string;
  mmszInicio?: string;
  mmszPista?: string;
  mmszSalida?: string;
  mmszRequiere?: string[];
  mmszSolucion: string;
}

export interface MmszDesafio {
  mmszTipo: 'desafio' | 'proyecto';
  mmszId: string;
  mmszTitulo: string;
  mmszPasos: MmszPaso[];
}

export interface MmszVideo {
  mmszTipo: 'video';
  mmszId: string;
  mmszTitulo: string;
  mmszYoutubeId: string;
  mmszInicio: number;
  mmszFin?: number;
  mmszCanal: string;
  mmszDescripcion: string;
}

export interface MmszRecuerdo {
  mmszLeccion: string;
  mmszResumen: string;
}

export interface MmszAnimada {
  mmszTipo: 'animada';
  mmszId: string;
  mmszTitulo: string;
  mmszLecturas: string[];
  mmszRecuerdo?: MmszRecuerdo;
}

export interface MmszGuia {
  mmszTipo: 'guia';
  mmszId: string;
  mmszTitulo: string;
  mmszObjetivo: string;
  mmszCodigo: string;
  mmszSalida?: string;
  mmszRecuerdo?: MmszRecuerdo;
}

export interface MmszGuiado {
  mmszTipo: 'guiado';
  mmszId: string;
  mmszTitulo: string;
  mmszObjetivo: string;
  mmszCodigo: string;
  mmszSalida?: string;
}

export type MmszItem = MmszLectura | MmszDesafio | MmszVideo | MmszAnimada | MmszGuiado | MmszGuia;

export type MmszNivel = 'Básico' | 'Intermedio' | 'Avanzado';

export interface MmszLesson {
  mmszId: string;
  mmszTitle: string;
  mmszIntro: string;
  mmszItems: MmszItem[];
  mmszExercises: MmszExercise[];
}

export interface MmszUnit {
  mmszTitle: string;
  mmszDescription: string;
  mmszNivel: MmszNivel;
  mmszLessons: MmszLesson[];
}

export interface MmszCourse {
  mmszId: 'python' | 'javascript' | 'cpp';
  mmszName: string;
  mmszTagline: string;
  mmszColor: string;
  mmszIcon: string;
  mmszUnits: MmszUnit[];
}
