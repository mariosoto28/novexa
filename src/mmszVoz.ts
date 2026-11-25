export interface MmszDicho {
  mmszFin: Promise<void>;
  mmszCancelar: () => void;
  mmszPausar: () => void;
  mmszReanudar: () => void;
}

const MMSZ_LETRAS_POR_SEGUNDO = 14;
const mmszAudios = new Map<string, Promise<string | null>>();
let mmszNaturalNoDisponible = false;
let mmszActual: MmszDicho | null = null;

const mmszHaySistema = () => typeof window !== 'undefined' && 'speechSynthesis' in window;
const mmszHayNatural = () => typeof window !== 'undefined' && Boolean(window.mmszApi?.mmszSintetizarVoz) && !mmszNaturalNoDisponible;

export const mmszHayVoz = () => mmszHayNatural() || mmszHaySistema();

export function mmszVozEspanol(): SpeechSynthesisVoice | undefined {
  if (!mmszHaySistema()) return undefined;
  const mmszVoces = speechSynthesis.getVoices().filter((mmszV) => mmszV.lang.toLowerCase().startsWith('es'));
  return (
    mmszVoces.find((mmszV) => /es-(MX|US|PE|419)/i.test(mmszV.lang) && /sabina|female|mujer/i.test(mmszV.name)) ??
    mmszVoces.find((mmszV) => /es-(MX|US|PE|419)/i.test(mmszV.lang)) ??
    mmszVoces.find((mmszV) => /es-ES/i.test(mmszV.lang)) ??
    mmszVoces[0]
  );
}

function mmszAudioNatural(mmszTexto: string): Promise<string | null> {
  const mmszSintetizar = window.mmszApi?.mmszSintetizarVoz;
  if (!mmszSintetizar || mmszNaturalNoDisponible || !mmszTexto.trim()) return Promise.resolve(null);
  let mmszAudio = mmszAudios.get(mmszTexto);
  if (!mmszAudio) {
    mmszAudio = mmszSintetizar(mmszTexto)
      .then((mmszDatos) => {
        if (!mmszDatos) {
          mmszNaturalNoDisponible = true;
          return null;
        }
        return URL.createObjectURL(new Blob([mmszDatos as BlobPart], { type: 'audio/wav' }));
      })
      .catch(() => null);
    mmszAudios.set(mmszTexto, mmszAudio);
  }
  return mmszAudio;
}

export function mmszPrecargar(mmszTextos: string[] | undefined) {
  (mmszTextos ?? []).forEach((mmszT) => void mmszAudioNatural(mmszT));
}

function mmszDecirUna(mmszTexto: string, mmszVelocidad: number): MmszDicho {
  let mmszCancelado = false;
  let mmszPausado = false;
  let mmszAudio: HTMLAudioElement | null = null;
  let mmszConSistema = false;
  let mmszResolver: () => void = () => {};
  const mmszFin = new Promise<void>((mmszR) => (mmszResolver = mmszR));
  const mmszTerminar = () => {
    if (!mmszCancelado) mmszResolver();
  };
  const mmszSistema = () => {
    if (mmszCancelado) return;
    if (!mmszHaySistema()) {
      window.setTimeout(mmszTerminar, ((mmszTexto.length / MMSZ_LETRAS_POR_SEGUNDO) * 1000) / mmszVelocidad);
      return;
    }
    mmszConSistema = true;
    const mmszU = new SpeechSynthesisUtterance(mmszTexto);
    const mmszVoz = mmszVozEspanol();
    mmszU.lang = mmszVoz?.lang ?? 'es-ES';
    if (mmszVoz) mmszU.voice = mmszVoz;
    mmszU.rate = mmszVelocidad;
    mmszU.onend = mmszTerminar;
    mmszU.onerror = mmszTerminar;
    speechSynthesis.speak(mmszU);
    if (mmszPausado) speechSynthesis.pause();
  };
  mmszAudioNatural(mmszTexto).then((mmszUrl) => {
    if (mmszCancelado) return;
    if (!mmszUrl) {
      mmszSistema();
      return;
    }
    const mmszA = new Audio(mmszUrl);
    mmszA.playbackRate = mmszVelocidad;
    mmszA.onended = mmszTerminar;
    mmszA.onerror = () => {
      mmszAudio = null;
      mmszSistema();
    };
    mmszAudio = mmszA;
    if (!mmszPausado) mmszA.play().catch(() => mmszA.onerror?.(new Event('error')));
  });
  return {
    mmszFin,
    mmszCancelar: () => {
      mmszCancelado = true;
      mmszAudio?.pause();
      if (mmszConSistema) speechSynthesis.cancel();
    },
    mmszPausar: () => {
      mmszPausado = true;
      mmszAudio?.pause();
      if (mmszConSistema) speechSynthesis.pause();
    },
    mmszReanudar: () => {
      mmszPausado = false;
      void mmszAudio?.play();
      if (mmszConSistema) speechSynthesis.resume();
    },
  };
}

export function mmszCallar() {
  mmszActual?.mmszCancelar();
  mmszActual = null;
  if (mmszHaySistema()) speechSynthesis.cancel();
}

export function mmszDecirFrases(mmszFrases: string[], mmszVelocidad = 1, mmszAlFrase?: (mmszI: number) => void): MmszDicho {
  mmszCallar();
  let mmszCancelado = false;
  let mmszPausado = false;
  let mmszParte: MmszDicho | null = null;
  let mmszResolver: () => void = () => {};
  const mmszFin = new Promise<void>((mmszR) => (mmszResolver = mmszR));
  const mmszSeguir = (mmszI: number) => {
    if (mmszCancelado) return;
    if (mmszI >= mmszFrases.length) {
      if (mmszActual === mmszYo) mmszActual = null;
      mmszResolver();
      return;
    }
    mmszAlFrase?.(mmszI);
    mmszPrecargar(mmszFrases.slice(mmszI + 1, mmszI + 3));
    mmszParte = mmszDecirUna(mmszFrases[mmszI], mmszVelocidad);
    if (mmszPausado) mmszParte.mmszPausar();
    mmszParte.mmszFin.then(() => mmszSeguir(mmszI + 1));
  };
  const mmszYo: MmszDicho = {
    mmszFin,
    mmszCancelar: () => {
      mmszCancelado = true;
      mmszParte?.mmszCancelar();
    },
    mmszPausar: () => {
      mmszPausado = true;
      mmszParte?.mmszPausar();
    },
    mmszReanudar: () => {
      mmszPausado = false;
      mmszParte?.mmszReanudar();
    },
  };
  mmszActual = mmszYo;
  mmszSeguir(0);
  return mmszYo;
}

export const mmszDecir = (mmszTexto: string, mmszVelocidad = 1) => mmszDecirFrases([mmszTexto], mmszVelocidad);
