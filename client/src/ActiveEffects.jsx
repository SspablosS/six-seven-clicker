import { EVENTS } from '../../config/gameConfig.js'
import './ActiveEffects.css'

export default function ActiveEffects({ activeEvents, now }) {
  const alive = (activeEvents || []).filter((e) => e.endsAt > now)
  if (alive.length === 0) return null

  return (
    <ul className="effects" aria-label="Активные эффекты">
      {alive.map((entry) => {
        const def = EVENTS[entry.id]
        const sec = Math.max(0, Math.ceil((entry.endsAt - now) / 1000))
        const name = def?.title ?? entry.id
        return (
          <li
            key={entry.id}
            className={`effects__item effects__item--${def?.type || 'bonus'}`}
            title={name}
          >
            <span className="effects__icon" aria-hidden="true">
              {def?.icon ?? '?'}
            </span>
            <span className="effects__name">{name}</span>
            <span className="effects__time">{sec}с</span>
          </li>
        )
      })}
    </ul>
  )
}
