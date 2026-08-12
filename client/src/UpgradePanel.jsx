import {
  calcEchoPerSec,
  calcUpgradePrice,
  UPGRADES,
} from '../../config/gameConfig.js'
import { formatNumber } from './utils/formatNumber'
import './UpgradePanel.css'

const BUY_LABEL = 'Купить'
const LEVEL_LABEL = 'ур.'
const BADGE_CLASSES = ['badge--alert', 'badge--accent', 'badge--bg']

export default function UpgradePanel({ save, onBuy }) {
  const echoPerSec = calcEchoPerSec(save)

  return (
    <section className="upgrades" aria-label="Улучшения">
      <header className="upgrades__header">
        <h2 className="upgrades__title">Улучшения</h2>
        <p className="upgrades__rate">
          {formatNumber(echoPerSec)} Эхо/сек
        </p>
      </header>

      <ul className="upgrades__grid">
        {UPGRADES.map((def) => {
          const level = save.upgrades?.[def.id] || 0
          const price = calcUpgradePrice(def.id, level)
          const canBuy = save.echo >= price
          const badgeClass = BADGE_CLASSES[def.badgeIndex % BADGE_CLASSES.length]

          return (
            <li
              key={def.id}
              className="upgrade-card"
              style={{ transform: `rotate(${def.rotate}deg)` }}
            >
              <div className={`upgrade-card__badge ${badgeClass}`} aria-hidden="true">
                {def.icon}
              </div>
              <div className="upgrade-card__body">
                <h3 className="upgrade-card__name">{def.name}</h3>
                <p className="upgrade-card__desc">{def.description}</p>
                <p className="upgrade-card__meta">
                  {LEVEL_LABEL} {level} · {formatNumber(price)} Эхо
                </p>
              </div>
              <button
                type="button"
                className="upgrade-card__buy"
                disabled={!canBuy}
                onClick={() => onBuy(def.id)}
              >
                {BUY_LABEL}
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
