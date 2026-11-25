import { useCallback, useEffect, useState } from 'react';
import { mmszCopiaManual, mmszListarCopias, type MmszCopia, type MmszProgress } from '../progress';
import { mmszElegirArchivo, mmszExportar, mmszLeerArchivo, mmszResumen } from '../mmszRespaldo';

interface MmszProps {
  mmszProgreso: MmszProgress;
  mmszReemplazar: (mmszP: MmszProgress) => void;
}

interface MmszPendiente {
  mmszProgreso: MmszProgress;
  mmszOrigen: string;
}

const mmszFecha = (mmszIso: string) =>
  new Date(mmszIso).toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short', hourCycle: 'h23' });

function mmszTipoCopia(mmszNombre: string) {
  if (mmszNombre.includes('antes-de')) return 'Antes de un cambio';
  if (/^progreso-\d{4}-\d{2}-\d{2}\.json$/.test(mmszNombre)) return 'Automática del día';
  return 'Manual';
}

export default function MmszCopiasSeguridad({ mmszProgreso, mmszReemplazar }: MmszProps) {
  const [mmszCopias, mmszSetCopias] = useState<MmszCopia[]>([]);
  const [mmszPendiente, mmszSetPendiente] = useState<MmszPendiente | null>(null);
  const [mmszMensaje, mmszSetMensaje] = useState<{ mmszOk: boolean; mmszTexto: string } | null>(null);
  const [mmszOcupado, mmszSetOcupado] = useState(false);

  const mmszCargar = useCallback(() => {
    mmszListarCopias().then(mmszSetCopias).catch(() => mmszSetCopias([]));
  }, []);
  useEffect(mmszCargar, [mmszCargar]);

  async function mmszAlExportar() {
    mmszSetMensaje(null);
    const mmszRuta = await mmszExportar(mmszProgreso);
    if (mmszRuta !== null) mmszSetMensaje({ mmszOk: true, mmszTexto: `Progreso exportado${mmszRuta ? `: ${mmszRuta}` : '.'}` });
  }

  async function mmszAlImportar() {
    mmszSetMensaje(null);
    try {
      const mmszTexto = await mmszElegirArchivo();
      if (mmszTexto === null) return;
      const { mmszProgreso, mmszExportado } = mmszLeerArchivo(mmszTexto);
      mmszSetPendiente({ mmszProgreso, mmszOrigen: mmszExportado ? `el archivo exportado el ${mmszFecha(mmszExportado)}` : 'el archivo elegido' });
    } catch (mmszE) {
      mmszSetMensaje({ mmszOk: false, mmszTexto: (mmszE as Error).message });
    }
  }

  async function mmszConfirmar() {
    if (!mmszPendiente) return;
    mmszSetOcupado(true);
    await mmszCopiaManual(mmszProgreso, 'antes-de-reemplazar');
    mmszReemplazar(mmszPendiente.mmszProgreso);
    mmszSetMensaje({ mmszOk: true, mmszTexto: `Listo: se cargó el progreso de ${mmszPendiente.mmszOrigen}. Tu progreso anterior quedó guardado en las copias.` });
    mmszSetPendiente(null);
    mmszSetOcupado(false);
    setTimeout(mmszCargar, 300);
  }

  const mmszActual = mmszResumen(mmszProgreso);
  const mmszNuevo = mmszPendiente ? mmszResumen(mmszPendiente.mmszProgreso) : null;

  return (
    <section className="mmsz-tarjeta">
      <h3>Copias de seguridad</h3>
      <p className="muted">
        Novexa guarda una <b>copia automática cada día</b>{window.mmszApi ? ' (las de los últimos 14 días)' : ''}. Si el archivo
        de progreso se daña, se recupera solo. También puedes <b>exportar</b> tu progreso a un archivo para guardarlo o
        pasarlo a otra computadora, e <b>importarlo</b> después.
      </p>

      <div className="mmsz-acciones">
        <button className="mmsz-btn" onClick={mmszAlExportar}>
          ⬇ Exportar progreso
        </button>
        <button className="mmsz-btn" onClick={mmszAlImportar}>
          ⬆ Importar progreso
        </button>
      </div>

      {mmszMensaje && <div className={`mmsz-mensaje ${mmszMensaje.mmszOk ? 'ok' : 'error'}`}>{mmszMensaje.mmszTexto}</div>}

      {mmszPendiente && mmszNuevo && (
        <div className="mmsz-confirmar">
          <b>¿Reemplazar tu progreso actual con el de {mmszPendiente.mmszOrigen}?</b>
          <table className="mmsz-comparacion">
            <thead>
              <tr>
                <th />
                <th>Actual</th>
                <th>Nuevo</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Nombre</td><td>{mmszActual.mmszNombre}</td><td>{mmszNuevo.mmszNombre}</td></tr>
              <tr><td>XP</td><td>{mmszActual.mmszXp}</td><td>{mmszNuevo.mmszXp}</td></tr>
              <tr><td>Lecciones practicadas</td><td>{mmszActual.mmszLecciones}</td><td>{mmszNuevo.mmszLecciones}</td></tr>
              <tr><td>Racha</td><td>{mmszActual.mmszRacha} días</td><td>{mmszNuevo.mmszRacha} días</td></tr>
            </tbody>
          </table>
          <small className="muted">Tu progreso actual se guardará antes en las copias, así que puedes volver a él.</small>
          <div className="mmsz-acciones">
            <button className="mmsz-btn mmsz-btn-fuerte" disabled={mmszOcupado} onClick={mmszConfirmar}>
              Sí, reemplazar
            </button>
            <button className="mmsz-btn" disabled={mmszOcupado} onClick={() => mmszSetPendiente(null)}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      <h4 className="mmsz-copias-titulo">Copias guardadas</h4>
      {mmszCopias.length === 0 ? (
        <p className="muted small">Todavía no hay copias. Se crea una automáticamente cuando avanzas en un curso.</p>
      ) : (
        <ul className="mmsz-copias">
          {mmszCopias.slice(0, 10).map((mmszC) => {
            const mmszR = mmszResumen(mmszC.mmszDatos);
            return (
              <li key={mmszC.mmszNombre}>
                <div>
                  <b>{mmszFecha(mmszC.mmszFecha)}</b>
                  <small className="muted">
                    {mmszTipoCopia(mmszC.mmszNombre)} · {mmszR.mmszXp} XP · {mmszR.mmszLecciones} lecciones · {mmszR.mmszNombre}
                  </small>
                </div>
                <button
                  className="mmsz-btn"
                  onClick={() => mmszSetPendiente({ mmszProgreso: mmszCompletar(mmszC.mmszDatos), mmszOrigen: `la copia del ${mmszFecha(mmszC.mmszFecha)}` })}
                >
                  Restaurar
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

const mmszCompletar = (mmszP: MmszProgress) => mmszLeerArchivo(JSON.stringify(mmszP)).mmszProgreso;
