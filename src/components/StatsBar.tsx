// Autor: MMSZ (Mario Soto Zea)
import { MMSZ_MAX_HEARTS, mmszMinutesToNextHeart, type MmszProgress } from '../progress';

export default function MmszStatsBar({ progress: mmszProgress }: { progress: MmszProgress }) {
  const mmszNext = mmszMinutesToNextHeart(mmszProgress);
  return (
    <div className="stats">
      <span className="stat" title="Días seguidos estudiando">
        🔥 <b>{mmszProgress.streak}</b>
      </span>
      <span className="stat" title="Puntos de experiencia">
        ⭐ <b>{mmszProgress.xp}</b> XP
      </span>
      <span
        className="stat"
        title={mmszProgress.hearts < MMSZ_MAX_HEARTS ? `Próxima vida en ${mmszNext} min` : 'Vidas completas'}
      >
        ❤️ <b>{mmszProgress.hearts}</b>
      </span>
    </div>
  );
}
