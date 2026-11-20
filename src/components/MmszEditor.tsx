// Autor: MMSZ (Mario Soto Zea)
// Editor de código con números de línea, sangría automática y Ctrl+Enter para ejecutar.
import { useRef } from 'react';

interface MmszProps {
  mmszValor: string;
  mmszCambiar: (v: string) => void;
  mmszLang: string;
  mmszEjecutar?: () => void;
  mmszBloqueado?: boolean;
}

export default function MmszEditor({ mmszValor, mmszCambiar, mmszLang, mmszEjecutar, mmszBloqueado }: MmszProps) {
  const mmszRef = useRef<HTMLTextAreaElement>(null);
  const mmszSangria = mmszLang === 'javascript' ? '  ' : '    ';
  const mmszLineas = mmszValor.split('\n').length;

  function mmszInsertar(t: HTMLTextAreaElement, mmszTexto: string) {
    const s = t.selectionStart;
    mmszCambiar(mmszValor.slice(0, s) + mmszTexto + mmszValor.slice(t.selectionEnd));
    requestAnimationFrame(() => t.setSelectionRange(s + mmszTexto.length, s + mmszTexto.length));
  }

  function mmszTecla(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    const t = e.currentTarget;
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      mmszEjecutar?.();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      mmszInsertar(t, mmszSangria);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const mmszAntes = mmszValor.slice(0, t.selectionStart);
      const mmszLinea = mmszAntes.slice(mmszAntes.lastIndexOf('\n') + 1);
      const mmszActual = mmszLinea.match(/^\s*/)![0];
      const mmszAbre = /[:{]\s*$/.test(mmszLinea);
      mmszInsertar(t, '\n' + mmszActual + (mmszAbre ? mmszSangria : ''));
    }
  }

  return (
    <div className="mmsz-editor">
      <div className="mmsz-editor-numeros" aria-hidden>
        {Array.from({ length: Math.max(mmszLineas, 12) }, (_, i) => (
          <span key={i}>{i + 1}</span>
        ))}
      </div>
      <textarea
        ref={mmszRef}
        value={mmszValor}
        onChange={(e) => mmszCambiar(e.target.value)}
        onKeyDown={mmszTecla}
        disabled={mmszBloqueado}
        spellCheck={false}
        rows={Math.max(mmszLineas, 12)}
        wrap="off"
      />
    </div>
  );
}
