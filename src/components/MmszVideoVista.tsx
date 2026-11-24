// Autor: MMSZ (Mario Soto Zea)
// Reproductor de un fragmento de video de YouTube (necesita internet).
import { useEffect, useState } from 'react';
import type { MmszVideo } from '../types';

const mmszReloj = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const seg = String(s % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${seg}` : `${m}:${seg}`;
};

interface MmszProps {
  mmszVideo: MmszVideo;
  mmszAlternativa?: () => void; // abre la lección animada (offline) de la misma lección
}

export default function MmszVideoVista({ mmszVideo, mmszAlternativa }: MmszProps) {
  const [mmszEnLinea, setMmszEnLinea] = useState(navigator.onLine);

  useEffect(() => {
    const mmszCambio = () => setMmszEnLinea(navigator.onLine);
    window.addEventListener('online', mmszCambio);
    window.addEventListener('offline', mmszCambio);
    return () => {
      window.removeEventListener('online', mmszCambio);
      window.removeEventListener('offline', mmszCambio);
    };
  }, []);

  const mmszParams = new URLSearchParams({ start: String(mmszVideo.inicio), rel: '0', modestbranding: '1' });
  if (mmszVideo.fin) mmszParams.set('end', String(mmszVideo.fin));
  const mmszEmbed = `https://www.youtube-nocookie.com/embed/${mmszVideo.youtubeId}?${mmszParams}`;
  const mmszEnYoutube = `https://www.youtube.com/watch?v=${mmszVideo.youtubeId}&t=${mmszVideo.inicio}s`;
  const mmszMinutos = mmszVideo.fin ? Math.round((mmszVideo.fin - mmszVideo.inicio) / 60) : null;

  return (
    <div className="mmsz-video">
      <div className="mmsz-video-marco">
        {mmszEnLinea ? (
          <iframe
            src={mmszEmbed}
            title={mmszVideo.titulo}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <div className="mmsz-video-sin-red">
            <span>📡</span>
            <b>Este video necesita conexión a internet.</b>
            <small>Pero puedes aprender lo mismo sin internet con la lección animada.</small>
            {mmszAlternativa && (
              <button className="mmsz-din-boton" onClick={mmszAlternativa}>
                ✺ Ver la lección animada
              </button>
            )}
          </div>
        )}
      </div>

      <div className="mmsz-video-info">
        <div>
          <b>Acerca de este video</b>
          <p>{mmszVideo.descripcion}</p>
          <small className="muted">
            Desde {mmszReloj(mmszVideo.inicio)}
            {mmszVideo.fin ? ` hasta ${mmszReloj(mmszVideo.fin)} · unos ${mmszMinutos} min` : ''} · Canal: {mmszVideo.canal}
          </small>
        </div>
        <a className="mmsz-btn" href={mmszEnYoutube} target="_blank" rel="noreferrer">
          Ver en YouTube ↗
        </a>
      </div>
    </div>
  );
}
