import { useEffect, useState } from 'react'
import { AD_BOOST, MONETIZATION } from '@config/gameConfig.js'
import './MonetizationPanel.css'

const SOON_TITLE = 'Скоро!'
const SOON_TEXT = 'Подписка ещё готовится. Пока культ работает бесплатно.'
const AD_TITLE = 'Реклама'
const AD_WATCHING = 'Смотрим проповедь спонсора…'
const SKINS_TITLE = 'Скины мегафона'
const SKIN_HINT = 'Только косметика — на доход не влияет'
const REMOVE_ADS_SOON = 'Покупка «Без рекламы» — заглушка без оплаты'

export default function MonetizationPanel({
  save,
  onSelectSkin,
  onAdBoost,
  adBlocked,
}) {
  const [modal, setModal] = useState(null)
  const [adProgress, setAdProgress] = useState(0)
  const selectedSkin = save.selectedSkin || 'classic'

  useEffect(() => {
    if (modal !== 'ad') return undefined
    setAdProgress(0)
    const started = Date.now()
    const timer = window.setInterval(() => {
      const p = Math.min(100, ((Date.now() - started) / AD_BOOST.watchMs) * 100)
      setAdProgress(p)
      if (p >= 100) {
        window.clearInterval(timer)
        onAdBoost()
        setModal(null)
        setAdProgress(0)
      }
    }, 50)
    return () => window.clearInterval(timer)
  }, [modal, onAdBoost])

  return (
    <section className="mono" aria-label="Магазин">
      <h2 className="mono__title">Магазин культа</h2>

      <button
        type="button"
        className="mono__pass"
        onClick={() => setModal('pass')}
      >
        <span className="mono__pass-name">{MONETIZATION.pass.name}</span>
        <span className="mono__pass-price">{MONETIZATION.pass.price}</span>
      </button>

      <div className="mono__row">
        <button
          type="button"
          className="mono__chip"
          onClick={() => setModal('skins')}
        >
          Скины
        </button>
        <button
          type="button"
          className="mono__chip mono__chip--ad"
          disabled={adBlocked}
          onClick={() => setModal('ad')}
        >
          Реклама ×2 / 5 мин
        </button>
        <button
          type="button"
          className="mono__chip"
          onClick={() => setModal('removeAds')}
        >
          {MONETIZATION.removeAds.name} · {MONETIZATION.removeAds.price}
        </button>
      </div>

      {modal === 'pass' && (
        <div className="mono-modal-backdrop" role="dialog" aria-modal="true">
          <div className="mono-modal">
            <h3 className="mono-modal__title">{MONETIZATION.pass.name}</h3>
            <p className="mono-modal__price">{MONETIZATION.pass.price}</p>
            <ul className="mono-modal__list">
              {MONETIZATION.pass.bonuses.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
            <p className="mono-modal__soon">{SOON_TITLE}</p>
            <p className="mono-modal__text">{SOON_TEXT}</p>
            <button type="button" className="mono-modal__btn" onClick={() => setModal(null)}>
              Ок
            </button>
          </div>
        </div>
      )}

      {modal === 'skins' && (
        <div className="mono-modal-backdrop" role="dialog" aria-modal="true">
          <div className="mono-modal">
            <h3 className="mono-modal__title">{SKINS_TITLE}</h3>
            <p className="mono-modal__text">{SKIN_HINT}</p>
            <ul className="mono-skins">
              {MONETIZATION.skins.map((skin) => (
                <li key={skin.id}>
                  <button
                    type="button"
                    className={`mono-skin${selectedSkin === skin.id ? ' mono-skin--on' : ''}`}
                    onClick={() => onSelectSkin(skin.id)}
                  >
                    <span
                      className="mono-skin__swatch"
                      style={{ backgroundColor: skin.swatch }}
                      aria-hidden="true"
                    />
                    <span className="mono-skin__name">{skin.name}</span>
                    <span className="mono-skin__state">
                      {selectedSkin === skin.id ? 'Надето' : 'Надеть'}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <button type="button" className="mono-modal__btn" onClick={() => setModal(null)}>
              Закрыть
            </button>
          </div>
        </div>
      )}

      {modal === 'ad' && (
        <div className="mono-modal-backdrop" role="dialog" aria-modal="true">
          <div className="mono-modal mono-modal--ad">
            <h3 className="mono-modal__title">{AD_TITLE}</h3>
            <p className="mono-modal__text">{AD_WATCHING}</p>
            <div className="mono-ad-bar" aria-valuenow={Math.round(adProgress)}>
              <div className="mono-ad-bar__fill" style={{ width: `${adProgress}%` }} />
            </div>
          </div>
        </div>
      )}

      {modal === 'removeAds' && (
        <div className="mono-modal-backdrop" role="dialog" aria-modal="true">
          <div className="mono-modal">
            <h3 className="mono-modal__title">{MONETIZATION.removeAds.name}</h3>
            <p className="mono-modal__price">{MONETIZATION.removeAds.price}</p>
            <p className="mono-modal__soon">{SOON_TITLE}</p>
            <p className="mono-modal__text">{REMOVE_ADS_SOON}</p>
            <button type="button" className="mono-modal__btn" onClick={() => setModal(null)}>
              Ок
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
