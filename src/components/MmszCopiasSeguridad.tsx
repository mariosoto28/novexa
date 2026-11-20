// Autor: MMSZ (Mario Soto Zea)
// Sección de Configuración: exportar, importar y restaurar copias del progreso.
import { useCallback, useEffect, useState } from 'react';
import { mmszCopiaManual, mmszListarCopias, type MmszCopia, type MmszProgress } from '../progress';
import { mmszElegirArchivo, mmszExportar, mmszLeerArchivo, mmszResumen } from '../mmszRespaldo';

interface MmszProps {
  mmszProgreso: MmszProgress;
  mmszReemplazar: (p: MmszProgress) => void;
}

interface MmszPendiente {
  progreso: MmszProgress;
  origen: string;
}

// Hora en formato de 24 h ("13:54") para que el texto no termine en "p. m.".
const mmszFecha = (iso: string) =>
  new Date(iso).toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short', hourCycle: 'h23' });

function mmszTipoCopia(mmszNombre: string) {
  if (mmszNombre.includes('antes-de')) return 'Antes de un cambio';
  if (/^progreso-\d{4}-\d{2}-\d{2}\.json$/.test(mmszNombre)) return 'Automática del día';
  return 'Manual';
}

export default function MmszCopiasSeguridad({ mmszProgreso, mmszReemplazar }: MmszProps) {
  const [mmszCopias, setMmszCopias] = useState<MmszCopia[]>([]);
  const [mmszPendiente, setMmszPendiente] = useState<MmszPendiente | null>(null);
  const [mmszMensaje, setMmszMensaje] = useState<{ ok: boolean; texto: string } | null>(null);
  const [mmszOcupado, setMmszOcupado] = useState(false);

  const mmszCargar = useCallback(() => {
    mmszListarCopias().then(setMmszCopias).catch(() => setMmszCopias([]));
  }, []);
  useEffect(mmszCargar, [mmszCargar]);

  async function mmszAlExportar() {
    setMmszMensaje(null);
    const mmszRuta = await mmszExportar(mmszProgreso);
    if (mmszRuta !== null) setMmszMensaje({ ok: true, texto: `Progreso exportado${mmszRuta ? `: ${mmszRuta}` : '.'}` });
  }

  async function mmszAlImportar() {
    setMmszMensaje(null);
    try {
      const mmszTexto = await mmszElegirArchivo();
      if (mmszTexto === null) return;
      const { progreso, exportado } = mmszLeerArchivo(mmszTexto);
      setMmszPendiente({ progreso, origen: exportado ? `el archivo exportado el ${mmszFecha(exportado)}` : 'el archivo elegido' });
    } catch (e) {
      setMmszMensaje({ ok: false, texto: (e as Error).message });
    }
  }

  async function mmszConfirmar() {
    if (!mmszPendiente) return;
    setMmszOcupado(true);
    // Antes de reemplazar, se guarda el progreso actual por si el estudiante se arrepiente.
    await mmszCopiaManual(mmszProgreso, 'antes-de-reemplazar');
    mmszReemplazar(mmszPendiente.progreso);
    setMmszMensaje({ ok: true, texto: `Listo: se cargó el progreso de ${mmszPendiente.origen}. Tu progreso anterior quedó guardado en las copias.` });
    setMmszPendiente(null);
    setMmszOcupado(false);
    setTimeout(mmszCargar, 300);
  }

  const mmszActual = mmszResumen(mmszProgreso);
  const mmszNuevo = mmszPendiente ? mmszResumen(mmszPendiente.progreso) : null;

  return (
    <section className="mmsz-tarjeta">
      <h3>Copias de seguridad</h3>
      <p className="muted">
        Novexa guarda una <b>copia automática cada día</b>{window.api ? ' (las de los últimos 14 días)' : ''}. Si el archivo
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

      {mmszMensaje && <div className={`mmsz-mensaje ${mmszMensaje.ok ? 'ok' : 'error'}`}>{mmszMensaje.texto}</div>}

      {mmszPendiente && mmszNuevo && (
        <div className="mmsz-confirmar">
          <b>¿Reemplazar tu progreso actual con el de {mmszPendiente.origen}?</b>
          <table className="mmsz-comparacion">
            <thead>
              <tr>
                <th />
                <th>Actual</th>
                <th>Nuevo</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Nombre</td><td>{mmszActual.nombre}</td><td>{mmszNuevo.nombre}</td></tr>
              <tr><td>XP</td><td>{mmszActual.xp}</td><td>{mmszNuevo.xp}</td></tr>
              <tr><td>Lecciones practicadas</td><td>{mmszActual.lecciones}</td><td>{mmszNuevo.lecciones}</td></tr>
              <tr><td>Racha</td><td>{mmszActual.racha} días</td><td>{mmszNuevo.racha} días</td></tr>
            </tbody>
          </table>
          <small className="muted">Tu progreso actual se guardará antes en las copias, así que puedes volver a él.</small>
          <div className="mmsz-acciones">
            <button className="mmsz-btn mmsz-btn-fuerte" disabled={mmszOcupado} onClick={mmszConfirmar}>
              Sí, reemplazar
            </button>
            <button className="mmsz-btn" disabled={mmszOcupado} onClick={() => setMmszPendiente(null)}>
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
          {mmszCopias.slice(0, 10).map((c) => {
            const r = mmszResumen(c.datos);
            return (
              <li key={c.nombre}>
                <div>
                  <b>{mmszFecha(c.fecha)}</b>
                  <small className="muted">
                    {mmszTipoCopia(c.nombre)} · {r.xp} XP · {r.lecciones} lecciones · {r.nombre}
                  </small>
                </div>
                <button
                  className="mmsz-btn"
                  onClick={() => setMmszPendiente({ progreso: mmszCompletar(c.datos), origen: `la copia del ${mmszFecha(c.fecha)}` })}
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

const mmszCompletar = (p: MmszProgress) => mmszLeerArchivo(JSON.stringify(p)).progreso;
