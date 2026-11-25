import { useEffect, useState, type ReactNode } from 'react';

interface MmszProps {
  mmszPct: number;
  mmszTam?: number;
  mmszGrosor?: number;
  mmszColor?: string;
  children?: ReactNode;
}

export default function MmszAnillo({ mmszPct, mmszTam = 64, mmszGrosor = 7, mmszColor = 'var(--accent)', children }: MmszProps) {
  const [mmszMostrado, mmszSetMostrado] = useState(0);
  useEffect(() => {
    const mmszT = requestAnimationFrame(() => mmszSetMostrado(Math.max(0, Math.min(100, mmszPct))));
    return () => cancelAnimationFrame(mmszT);
  }, [mmszPct]);

  const mmszR = (mmszTam - mmszGrosor) / 2;
  const mmszC = 2 * Math.PI * mmszR;
  return (
    <div className="mmsz-anillo" style={{ width: mmszTam, height: mmszTam }}>
      <svg width={mmszTam} height={mmszTam} viewBox={`0 0 ${mmszTam} ${mmszTam}`}>
        <circle cx={mmszTam / 2} cy={mmszTam / 2} r={mmszR} fill="none" stroke="var(--track)" strokeWidth={mmszGrosor} />
        <circle
          cx={mmszTam / 2}
          cy={mmszTam / 2}
          r={mmszR}
          fill="none"
          stroke={mmszColor}
          strokeWidth={mmszGrosor}
          strokeLinecap="round"
          strokeDasharray={mmszC}
          strokeDashoffset={mmszC * (1 - mmszMostrado / 100)}
          transform={`rotate(-90 ${mmszTam / 2} ${mmszTam / 2})`}
          className="mmsz-anillo-trazo"
        />
      </svg>
      <div className="mmsz-anillo-centro">{children ?? `${Math.round(mmszPct)}%`}</div>
    </div>
  );
}

export function MmszNumero({ mmszValor, mmszMs = 900 }: { mmszValor: number; mmszMs?: number }) {
  const [mmszActual, mmszSetActual] = useState(0);
  useEffect(() => {
    const mmszInicio = performance.now();
    let mmszCuadro = 0;
    const mmszPaso = (mmszT: number) => {
      const mmszK = Math.min(1, (mmszT - mmszInicio) / mmszMs);
      mmszSetActual(Math.round(mmszValor * (1 - Math.pow(1 - mmszK, 3))));
      if (mmszK < 1) mmszCuadro = requestAnimationFrame(mmszPaso);
    };
    mmszCuadro = requestAnimationFrame(mmszPaso);
    return () => cancelAnimationFrame(mmszCuadro);
  }, [mmszValor, mmszMs]);
  return <>{mmszActual}</>;
}
