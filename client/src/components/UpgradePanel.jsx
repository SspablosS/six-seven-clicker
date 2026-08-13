import {
  calcEchoPerSecWithEvents,
  calcUpgradePrice,
  getVisibleUpgrades,
} from '@config/gameConfig.js'
import { useTapAction } from '@/hooks/useTapAction'
import { formatNumber } from '@/utils/formatNumber'
import { assetUrl } from '@/utils/assetUrl'
import './UpgradePanel.css'

const BUY_LABEL = 'Купить'
const LEVEL_LABEL = 'ур.'
const BADGE_CLASSES = ['badge--alert', 'badge--accent', 'badge--bg']

function rotateClass(deg) {
  return `upgrade-card--rot${String(deg).replace('.', '')}`
}

function BuyButton({ disabled, onBuy, className, children }) {
  const tap = useTapAction(() => {
    if (!disabled) onBuy()
  })

  return (
    <button
      type="button"
      className={className}
      disabled={disabled}
      {...tap}
    >
      {children}
    </button>
  )
}

export default function UpgradePanel({ save, onBuy }) {
  const echoPerSec = calcEchoPerSecWithEvents(save)
  const upgrades = getVisibleUpgrades(save.stage || 1)

  return (
    <section className="upgrades" aria-label="Улучшения">
      <header className="upgrades__header">
        <h2 className="upgrades__title">Улучшения</h2>
        <p className="upgrades__rate">
          {formatNumber(echoPerSec)} Эхо/сек
        </p>
      </header>

      <ul className="upgrades__grid">
        {upgrades.map((def) => {
          const level = save.upgrades?.[def.id] || 0
          const price = calcUpgradePrice(def.id, level)
          const canBuy = save.echo >= price
          const badgeClass = BADGE_CLASSES[def.badgeIndex % BADGE_CLASSES.length]

          return (
            <li
              key={def.id}
              className={`upgrade-card ${rotateClass(def.rotate)}`}
            >
              <div className={`upgrade-card__badge ${badgeClass}`}>
                <img
                  className="upgrade-card__icon"
                  src={assetUrl(def.iconSrc)}
                  alt=""
                  width={40}
                  height={40}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="upgrade-card__body">
                <h3 className="upgrade-card__name">{def.name}</h3>
                <p className="upgrade-card__desc">{def.description}</p>
                <p className="upgrade-card__meta">
                  {LEVEL_LABEL} {level} · {formatNumber(price)} Эхо
                </p>
              </div>
              <BuyButton
                className="upgrade-card__buy"
                disabled={!canBuy}
                onBuy={() => onBuy(def.id)}
              >
                {BUY_LABEL}
              </BuyButton>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
