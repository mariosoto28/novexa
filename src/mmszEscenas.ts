import { mmszTextoHablado } from './components/MmszLectorVoz';
import type { MmszRecuerdo } from './types';

export interface MmszEscena {
  mmszTitular?: string;
  mmszTexto?: string;
  mmszCodigo?: string;
  mmszEjecutable?: boolean;
  mmszNarracion: string[];
}

type MmszBloque =
  | { mmszTipo: 'h' | 'p' | 'nota'; mmszTexto: string }
  | { mmszTipo: 'lista'; mmszItems: string[] }
  | { mmszTipo: 'codigo'; mmszCodigo: string; mmszEjecutable: boolean };

function mmszBloques(mmszTexto: string): MmszBloque[] {
  const mmszLineas = mmszTexto.split('\n');
  const mmszSalida: MmszBloque[] = [];
  let mmszParrafo: string[] = [];
  const mmszCerrar = () => {
    if (mmszParrafo.length) mmszSalida.push({ mmszTipo: 'p', mmszTexto: mmszParrafo.join(' ') });
    mmszParrafo = [];
  };
  for (let mmszI = 0; mmszI < mmszLineas.length; mmszI++) {
    const mmszL = mmszLineas[mmszI];
    if (mmszL.startsWith('~~~') || mmszL.startsWith('```')) {
      mmszCerrar();
      const mmszCerca = mmszL.slice(0, 3);
      const mmszEjecutable = mmszL.slice(3).trim() === 'run';
      const mmszCodigo: string[] = [];
      for (mmszI++; mmszI < mmszLineas.length && !mmszLineas[mmszI].startsWith(mmszCerca); mmszI++) mmszCodigo.push(mmszLineas[mmszI]);
      mmszSalida.push({ mmszTipo: 'codigo', mmszCodigo: mmszCodigo.join('\n'), mmszEjecutable });
    } else if (mmszL.startsWith('- ')) {
      mmszCerrar();
      const mmszU = mmszSalida[mmszSalida.length - 1];
      if (mmszU?.mmszTipo === 'lista') mmszU.mmszItems.push(mmszL.slice(2));
      else mmszSalida.push({ mmszTipo: 'lista', mmszItems: [mmszL.slice(2)] });
    } else if (mmszL.startsWith('### ')) {
      mmszCerrar();
      mmszSalida.push({ mmszTipo: 'h', mmszTexto: mmszL.slice(4) });
    } else if (mmszL.startsWith('> ')) {
      mmszCerrar();
      mmszSalida.push({ mmszTipo: 'nota', mmszTexto: mmszL.slice(2) });
    } else if (!mmszL.trim()) {
      mmszCerrar();
    } else {
      mmszParrafo.push(mmszL.trim());
    }
  }
  mmszCerrar();
  return mmszSalida;
}

export function mmszCrearEscenas(
  mmszTitulo: string,
  mmszIntro: string,
  mmszLecturas: string[],
  mmszRecuerdo?: MmszRecuerdo,
): MmszEscena[] {
  const mmszLista: MmszEscena[] = [];
  if (mmszRecuerdo) {
    mmszLista.push({
      mmszTitular: '¿Recuerdas?',
      mmszTexto: `En la lección anterior, **${mmszRecuerdo.mmszLeccion}**, aprendiste: ${mmszRecuerdo.mmszResumen}

Hoy vamos a construir sobre eso.`,
      mmszNarracion: mmszTextoHablado(
        `¿Recuerdas lo que hiciste en la lección ${mmszRecuerdo.mmszLeccion}? ${mmszRecuerdo.mmszResumen} Hoy vamos a construir sobre eso.`,
      ),
    });
  }
  mmszLista.push({ mmszTitular: mmszTitulo, mmszTexto: mmszIntro, mmszNarracion: mmszTextoHablado(`${mmszTitulo}. ${mmszIntro}`) });
  const mmszPrimera = mmszLista[mmszLista.length - 1];
  const mmszActual = () => mmszLista[mmszLista.length - 1];

  for (const mmszLectura of mmszLecturas) {
    for (const mmszB of mmszBloques(mmszLectura)) {
      if (mmszB.mmszTipo === 'h') {
        mmszLista.push({ mmszTitular: mmszB.mmszTexto, mmszNarracion: mmszTextoHablado(mmszB.mmszTexto) });
      } else if (mmszB.mmszTipo === 'codigo') {
        const mmszE = mmszActual();
        if (mmszE.mmszTexto && !mmszE.mmszCodigo && mmszE !== mmszPrimera) {
          mmszE.mmszCodigo = mmszB.mmszCodigo;
          mmszE.mmszEjecutable = mmszB.mmszEjecutable;
        } else {
          mmszLista.push({ mmszCodigo: mmszB.mmszCodigo, mmszEjecutable: mmszB.mmszEjecutable, mmszNarracion: ['Observa este ejemplo de código.'] });
        }
      } else {
        const mmszTexto =
          mmszB.mmszTipo === 'lista' ? mmszB.mmszItems.map((mmszT) => `• ${mmszT}`).join('\n') : mmszB.mmszTipo === 'nota' ? `💡 ${mmszB.mmszTexto}` : mmszB.mmszTexto;
        const mmszVoz = mmszTextoHablado(mmszB.mmszTipo === 'lista' ? mmszB.mmszItems.join('.\n') : mmszB.mmszTipo === 'nota' ? `Nota: ${mmszB.mmszTexto}` : mmszB.mmszTexto);
        const mmszE = mmszActual();
        if (mmszE.mmszTitular && !mmszE.mmszTexto && !mmszE.mmszCodigo) {
          mmszE.mmszTexto = mmszTexto;
          mmszE.mmszNarracion.push(...mmszVoz);
        } else {
          mmszLista.push({ mmszTexto, mmszNarracion: mmszVoz });
        }
      }
    }
  }

  mmszLista.push({
    mmszTitular: '¡Muy bien!',
    mmszTexto: 'Ya viste lo esencial de esta lección. Ahora ponlo en práctica con el desafío y la práctica.',
    mmszNarracion: ['¡Muy bien!', 'Ya viste lo esencial de esta lección.', 'Ahora ponlo en práctica con el desafío y la práctica.'],
  });
  return mmszLista;
}
