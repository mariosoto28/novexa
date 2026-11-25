import { useEffect, useState } from 'react';
import type { MmszVideo } from '../types';

const mmszReloj = (mmszS: number) => {
  const mmszH = Math.floor(mmszS / 3600);
  const mmszM = Math.floor((mmszS % 3600) / 60);
  const mmszSeg = String(mmszS % 60).padStart(2, '0');
  return mmszH ? `${mmszH}:${String(mmszM).padStart(2, '0')}:${mmszSeg}` : `${mmszM}:${mmszSeg}`;
};

interface MmszProps {
  mmszVideo: MmszVideo;
  mmszAlternativa?: () => void;
}

export default function MmszVideoVista({ mmszVideo, mmszAlternativa }: MmszProps) {
  const [mmszEnLinea, mmszSetEnLinea] = useState(navigator.onLine);

  useEffect(() => {
    const mmszCambio = () => mmszSetEnLinea(navigator.onLine);
    window.addEventListener('online', mmszCambio);
    window.addEventListener('offline', mmszCambio);
    return () => {
      window.removeEventListener('online', mmszCambio);
      window.removeEventListener('offline', mmszCambio);
    };
  }, []);

  const mmszParams = new URLSearchParams({ start: String(mmszVideo.mmszInicio), rel: '0', modestbranding: '1' });
  if (mmszVideo.mmszFin) mmszParams.set('end', String(mmszVideo.mmszFin));
  const mmszEmbed = `https://www.youtube-nocookie.com/embed/${mmszVideo.mmszYoutubeId}?${mmszParams}`;
  const mmszEnYoutube = `https://www.youtube.com/watch?v=${mmszVideo.mmszYoutubeId}&t=${mmszVideo.mmszInicio}s`;
  const mmszMinutos = mmszVideo.mmszFin ? Math.round((mmszVideo.mmszFin - mmszVideo.mmszInicio) / 60) : null;

  return (
    <div className="mmsz-video">
      <div className="mmsz-video-marco">
        {mmszEnLinea ? (
          <iframe
            src={mmszEmbed}
            title={mmszVideo.mmszTitulo}
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
          <p>{mmszVideo.mmszDescripcion}</p>
          <small className="muted">
            Desde {mmszReloj(mmszVideo.mmszInicio)}
            {mmszVideo.mmszFin ? ` hasta ${mmszReloj(mmszVideo.mmszFin)} · unos ${mmszMinutos} min` : ''} · Canal: {mmszVideo.mmszCanal}
          </small>
        </div>
        <a className="mmsz-btn" href={mmszEnYoutube} target="_blank" rel="noreferrer">
          Ver en YouTube ↗
        </a>
      </div>
    </div>
  );
}
