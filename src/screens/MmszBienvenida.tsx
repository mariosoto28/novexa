// Autor: MMSZ (Mario Soto Zea)
// Pantalla que aparece después de "Finalizar sesión".
import { useState } from 'react';
import { mmszIniciales } from '../mmszUtilidades';

interface MmszProps {
  mmszNombre: string;
  mmszEntrar: (mmszNombre: string) => void;
}

export default function MmszBienvenida({ mmszNombre, mmszEntrar }: MmszProps) {
  const [mmszOtro, setMmszOtro] = useState(false);
  const [mmszNuevo, setMmszNuevo] = useState('');

  return (
    <div className="mmsz-bienvenida">
      <div className="mmsz-bienvenida-caja">
        <div className="mmsz-logo grande">
          <span className="logo">{'</>'}</span> Novexa
        </div>
        <p className="muted">Cerraste tu sesión.</p>

        {!mmszOtro ? (
          <>
            <div className="mmsz-avatar">{mmszIniciales(mmszNombre)}</div>
            <h2>¡Hola de nuevo, {mmszNombre}!</h2>
            <button className="mmsz-btn mmsz-btn-ancho" onClick={() => mmszEntrar(mmszNombre)}>
              Entrar
            </button>
            <button className="mmsz-enlace" onClick={() => setMmszOtro(true)}>
              ¿No eres {mmszNombre}?
            </button>
          </>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (mmszNuevo.trim()) mmszEntrar(mmszNuevo);
            }}
          >
            <label className="mmsz-campo">
              Escribe tu nombre
              <input autoFocus value={mmszNuevo} maxLength={40} onChange={(e) => setMmszNuevo(e.target.value)} />
            </label>
            <button className="mmsz-btn mmsz-btn-ancho" disabled={!mmszNuevo.trim()}>
              Entrar
            </button>
            <button type="button" className="mmsz-enlace" onClick={() => setMmszOtro(false)}>
              Volver
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
