import { useState } from 'react';
import { mmszIniciales } from '../mmszUtilidades';
import type { MmszFichaUsuario } from '../mmszUsuarios';
import '../mmszUsuarios.css';

interface MmszProps {
  mmszUsuarios: MmszFichaUsuario[];
  mmszElegir: (mmszId: string) => void;
  mmszAgregar: () => void;
  mmszQuitar: (mmszId: string) => void;
}

const MMSZ_COLORES = ['#7a5af8', '#1f9d74', '#e8613f', '#d23a6f', '#a0682a', '#2f80c9', '#8a6d00'];

function mmszHace(mmszFecha: string) {
  const mmszDias = Math.floor((Date.now() - new Date(mmszFecha).getTime()) / 86400000);
  if (mmszDias <= 0) return 'Hoy';
  if (mmszDias === 1) return 'Ayer';
  return `Hace ${mmszDias} días`;
}

export default function MmszElegirUsuario({ mmszUsuarios, mmszElegir, mmszAgregar, mmszQuitar }: MmszProps) {
  const [mmszEditando, mmszSetEditando] = useState(false);

  return (
    <div className="mmsz-bienvenida">
      <div className="mmsz-usuarios-caja">
        <div className="mmsz-usuarios-marca">Novexa</div>
        <h1>¿Quién va a estudiar hoy?</h1>
        <p className="muted">Elige tu usuario para seguir donde te quedaste.</p>

        <div className="mmsz-usuarios-lista">
          {mmszUsuarios.map((mmszU, mmszIndice) => (
            <div key={mmszU.mmszId} className="mmsz-usuario-ficha">
              <button
                className="mmsz-usuario-boton"
                disabled={mmszEditando}
                onClick={() => mmszElegir(mmszU.mmszId)}
                title={`Entrar como ${mmszU.mmszNombre}`}
              >
                <span className="mmsz-usuario-avatar" style={{ background: MMSZ_COLORES[mmszIndice % MMSZ_COLORES.length] }}>
                  {mmszIniciales(mmszU.mmszNombre)}
                </span>
                <span className="mmsz-usuario-nombre">{mmszU.mmszNombre}</span>
                <span className="mmsz-usuario-datos">
                  {mmszU.mmszXp} XP · {mmszU.mmszLecciones} {mmszU.mmszLecciones === 1 ? 'lección' : 'lecciones'}
                </span>
                <span className="mmsz-usuario-fecha">{mmszHace(mmszU.mmszUltimoUso)}</span>
              </button>
              {mmszEditando && !mmszU.mmszEsActual && (
                <button
                  className="mmsz-usuario-quitar"
                  title={`Quitar a ${mmszU.mmszNombre}`}
                  onClick={() => {
                    if (window.confirm(`¿Quitar a ${mmszU.mmszNombre}? Se borrará su progreso de esta computadora.`)) mmszQuitar(mmszU.mmszId);
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          {!mmszEditando && (
            <button className="mmsz-usuario-boton mmsz-usuario-nuevo" onClick={mmszAgregar} title="Crear un usuario nuevo">
              <span className="mmsz-usuario-avatar mmsz-usuario-mas">+</span>
              <span className="mmsz-usuario-nombre">Agregar usuario</span>
              <span className="mmsz-usuario-datos">Empieza desde cero</span>
            </button>
          )}
        </div>

        {mmszUsuarios.length > 1 && (
          <button className="mmsz-enlace" onClick={() => mmszSetEditando(!mmszEditando)}>
            {mmszEditando ? 'Listo' : 'Administrar usuarios'}
          </button>
        )}
      </div>
    </div>
  );
}
