// Autor: MMSZ (Mario Soto Zea)
// Anillo de progreso que se llena con animación al aparecer, y número que cuenta hacia arriba.
import { useEffect, useState, type ReactNode } from 'react';

interface MmszProps {
  mmszPct: number; // 0 a 100
  mmszTam?: number; // tamaño en px
  mmszGrosor?: number;
  mmszColor?: string;
  children?: ReactNode;
}

export default function MmszAnillo({ mmszPct, mmszTam = 64, mmszGrosor = 7, mmszColor = 'var(--accent)', children }: MmszProps) {
  const [mmszMostrado, setMmszMostrado] = useState(0);
  useEffect(() => {
    // Empieza en 0 y en el siguiente cuadro sube al valor real, así la transición CSS se ve.
    const t = requestAnimationFrame(() => setMmszMostrado(Math.max(0, Math.min(100, mmszPct))));
    return () => cancelAnimationFrame(t);
  }, [mmszPct]);

  const r = (mmszTam - mmszGrosor) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="mmsz-anillo" style={{ width: mmszTam, height: mmszTam }}>
      <svg width={mmszTam} height={mmszTam} viewBox={`0 0 ${mmszTam} ${mmszTam}`}>
        <circle cx={mmszTam / 2} cy={mmszTam / 2} r={r} fill="none" stroke="var(--track)" strokeWidth={mmszGrosor} />
        <circle
          cx={mmszTam / 2}
          cy={mmszTam / 2}
          r={r}
          fill="none"
          stroke={mmszColor}
          strokeWidth={mmszGrosor}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - mmszMostrado / 100)}
          transform={`rotate(-90 ${mmszTam / 2} ${mmszTam / 2})`}
          className="mmsz-anillo-trazo"
        />
      </svg>
      <div className="mmsz-anillo-centro">{children ?? `${Math.round(mmszPct)}%`}</div>
    </div>
  );
}

/** Número que sube animado de 0 al valor (para XP, lecciones, etc.). */
export function MmszNumero({ mmszValor, mmszMs = 900 }: { mmszValor: number; mmszMs?: number }) {
  const [mmszActual, setMmszActual] = useState(0);
  useEffect(() => {
    const mmszInicio = performance.now();
    let mmszCuadro = 0;
    const paso = (t: number) => {
      const k = Math.min(1, (t - mmszInicio) / mmszMs);
      setMmszActual(Math.round(mmszValor * (1 - Math.pow(1 - k, 3))));
      if (k < 1) mmszCuadro = requestAnimationFrame(paso);
    };
    mmszCuadro = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(mmszCuadro);
  }, [mmszValor, mmszMs]);
  return <>{mmszActual}</>;
}
