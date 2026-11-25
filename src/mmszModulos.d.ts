declare module 'JSCPP' {
  const MMSZ_JSCPP: {
    run(mmszCodigo: string, mmszEntrada: string, mmszConfig?: { stdio?: { write?: (mmszS: string) => void } }): number;
  };
  export default MMSZ_JSCPP;
}
