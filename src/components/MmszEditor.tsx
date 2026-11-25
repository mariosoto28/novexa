import { useRef } from 'react';

interface MmszProps {
  mmszValor: string;
  mmszCambiar: (mmszV: string) => void;
  mmszLang: string;
  mmszEjecutar?: () => void;
  mmszBloqueado?: boolean;
}

export default function MmszEditor({ mmszValor, mmszCambiar, mmszLang, mmszEjecutar, mmszBloqueado }: MmszProps) {
  const mmszRef = useRef<HTMLTextAreaElement>(null);
  const mmszSangria = mmszLang === 'javascript' ? '  ' : '    ';
  const mmszLineas = mmszValor.split('\n').length;

  function mmszInsertar(mmszT: HTMLTextAreaElement, mmszTexto: string) {
    const mmszS = mmszT.selectionStart;
    mmszCambiar(mmszValor.slice(0, mmszS) + mmszTexto + mmszValor.slice(mmszT.selectionEnd));
    requestAnimationFrame(() => mmszT.setSelectionRange(mmszS + mmszTexto.length, mmszS + mmszTexto.length));
  }

  function mmszTecla(mmszE: React.KeyboardEvent<HTMLTextAreaElement>) {
    const mmszT = mmszE.currentTarget;
    if (mmszE.key === 'Enter' && (mmszE.ctrlKey || mmszE.metaKey)) {
      mmszE.preventDefault();
      mmszEjecutar?.();
    } else if (mmszE.key === 'Tab') {
      mmszE.preventDefault();
      mmszInsertar(mmszT, mmszSangria);
    } else if (mmszE.key === 'Enter') {
      mmszE.preventDefault();
      const mmszAntes = mmszValor.slice(0, mmszT.selectionStart);
      const mmszLinea = mmszAntes.slice(mmszAntes.lastIndexOf('\n') + 1);
      const mmszActual = mmszLinea.match(/^\s*/)![0];
      const mmszAbre = /[:{]\s*$/.test(mmszLinea);
      mmszInsertar(mmszT, '\n' + mmszActual + (mmszAbre ? mmszSangria : ''));
    }
  }

  return (
    <div className="mmsz-editor">
      <div className="mmsz-editor-numeros" aria-hidden>
        {Array.from({ length: Math.max(mmszLineas, 12) }, (mmszSinUso, mmszI) => (
          <span key={mmszI}>{mmszI + 1}</span>
        ))}
      </div>
      <textarea
        ref={mmszRef}
        value={mmszValor}
        onChange={(mmszE) => mmszCambiar(mmszE.target.value)}
        onKeyDown={mmszTecla}
        disabled={mmszBloqueado}
        spellCheck={false}
        rows={Math.max(mmszLineas, 12)}
        wrap="off"
      />
    </div>
  );
}
