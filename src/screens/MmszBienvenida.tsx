import { useState } from 'react';
import { mmszIniciales } from '../mmszUtilidades';

interface MmszProps {
  mmszNombre: string;
  mmszEntrar: (mmszNombre: string) => void;
}

export default function MmszBienvenida({ mmszNombre, mmszEntrar }: MmszProps) {
  const [mmszOtro, mmszSetOtro] = useState(false);
  const [mmszNuevo, mmszSetNuevo] = useState('');

  return (
    <div className="mmsz-bienvenida">
      <div className="mmsz-bienvenida-caja">
        <div className="mmsz-marca grande">
          Novexa
        </div>
        <p className="muted">Cerraste tu sesión.</p>

        {!mmszOtro ? (
          <>
            <div className="mmsz-avatar">{mmszIniciales(mmszNombre)}</div>
            <h2>¡Hola de nuevo, {mmszNombre}!</h2>
            <button className="mmsz-btn mmsz-btn-ancho" onClick={() => mmszEntrar(mmszNombre)}>
              Entrar
            </button>
            <button className="mmsz-enlace" onClick={() => mmszSetOtro(true)}>
              ¿No eres {mmszNombre}?
            </button>
          </>
        ) : (
          <form
            onSubmit={(mmszE) => {
              mmszE.preventDefault();
              if (mmszNuevo.trim()) mmszEntrar(mmszNuevo);
            }}
          >
            <label className="mmsz-campo">
              Escribe tu nombre
              <input autoFocus value={mmszNuevo} maxLength={40} onChange={(mmszE) => mmszSetNuevo(mmszE.target.value)} />
            </label>
            <button className="mmsz-btn mmsz-btn-ancho" disabled={!mmszNuevo.trim()}>
              Entrar
            </button>
            <button type="button" className="mmsz-enlace" onClick={() => mmszSetOtro(false)}>
              Volver
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
