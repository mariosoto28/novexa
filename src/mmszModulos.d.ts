// Autor: MMSZ (Mario Soto Zea)
declare module 'JSCPP' {
  const MMSZ_JSCPP: {
    run(mmszCodigo: string, mmszEntrada: string, mmszConfig?: { stdio?: { write?: (s: string) => void } }): number;
  };
  export default MMSZ_JSCPP;
}
