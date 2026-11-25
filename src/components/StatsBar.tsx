import { MMSZ_MAX_HEARTS, mmszMinutesToNextHeart, type MmszProgress } from '../progress';

export default function MmszStatsBar({ mmszProgress }: { mmszProgress: MmszProgress }) {
  const mmszNext = mmszMinutesToNextHeart(mmszProgress);
  return (
    <div className="stats">
      <span className="stat" title="Días seguidos estudiando">
        🔥 <b>{mmszProgress.mmszStreak}</b>
      </span>
      <span className="stat" title="Puntos de experiencia">
        ⭐ <b>{mmszProgress.mmszXp}</b> XP
      </span>
      <span
        className="stat"
        title={mmszProgress.mmszHearts < MMSZ_MAX_HEARTS ? `Próxima vida en ${mmszNext} min` : 'Vidas completas'}
      >
        ❤️ <b>{mmszProgress.mmszHearts}</b>
      </span>
    </div>
  );
}
