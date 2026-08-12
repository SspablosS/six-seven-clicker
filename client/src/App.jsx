import { useEffect, useState } from 'react'
import {
  calcClickValue,
  getStageName,
  isAttentionUnlocked,
  isRebirthUnlocked,
  purchaseUpgrade,
} from '../../config/gameConfig.js'
import { loadSave } from './api/saveApi'
import ClickButton from './ClickButton'
import { BRAND_NAME, ECHO_LABEL } from './constants'
import OfflineModal from './OfflineModal'
import { getOrCreatePlayerId } from './playerId'
import UpgradePanel from './UpgradePanel'
import { formatNumber } from './utils/formatNumber'
import './App.css'

const ATTENTION_LABEL = 'Внимание'
const REBIRTH_LABEL = 'Переродиться'
const REBIRTH_SOON = 'Скоро'

function App() {
  const [save, setSave] = useState(null)
  const [offlineEarned, setOfflineEarned] = useState(0)
  const [showOfflineModal, setShowOfflineModal] = useState(false)
  const [error, setError] = useState(null)
  const [floaters, setFloaters] = useState([])

  useEffect(() => {
    const playerId = getOrCreatePlayerId()
    loadSave(playerId)
      .then(({ save: nextSave, offlineEarned: earned }) => {
        setSave(nextSave)
        if (earned > 0) {
          setOfflineEarned(earned)
          setShowOfflineModal(true)
        }
      })
      .catch((err) => setError(err.message))
  }, [])

  function handleShout() {
    if (!save) return

    const gain = calcClickValue(save)
    setSave((prev) => ({
      ...prev,
      echo: prev.echo + gain,
      totalClicks: prev.totalClicks + 1,
    }))

    const id = crypto.randomUUID()
    const offsetX = (Math.random() - 0.5) * 80
    setFloaters((prev) => [...prev, { id, value: gain, offsetX }])
    window.setTimeout(() => {
      setFloaters((prev) => prev.filter((f) => f.id !== id))
    }, 800)
  }

  function handleBuy(upgradeId) {
    setSave((prev) => {
      if (!prev) return prev
      return purchaseUpgrade(prev, upgradeId) ?? prev
    })
  }

  const stageName = save ? getStageName(save.stage) : null
  const clickValue = save ? calcClickValue(save) : 0

  return (
    <main className="app">
      <p className="brand">{BRAND_NAME}</p>
      {stageName && <h1 className="title">{stageName}</h1>}
      {error && <p className="status">Ошибка: {error}</p>}
      {save && (
        <>
          <div className="resource-row">
            <p className="echo-counter" aria-live="polite">
              <span className="echo-counter__label">{ECHO_LABEL}</span>
              <span className="echo-counter__value">{formatNumber(save.echo)}</span>
            </p>
            {isAttentionUnlocked(save) && (
              <p className="attention-counter" aria-live="polite">
                <span className="echo-counter__label">{ATTENTION_LABEL}</span>
                <span className="attention-counter__value">
                  {formatNumber(save.attention)}
                </span>
              </p>
            )}
          </div>

          <p className="click-power">за клик: +{formatNumber(clickValue)}</p>

          <div className="click-zone">
            <ClickButton onShout={handleShout} />
            {floaters.map((f) => (
              <span
                key={f.id}
                className="floater"
                style={{ '--floater-x': `${f.offsetX}px` }}
              >
                +{formatNumber(f.value)}
              </span>
            ))}
          </div>

          {isRebirthUnlocked(save) && (
            <button type="button" className="rebirth-btn" disabled title={REBIRTH_SOON}>
              {REBIRTH_LABEL}
            </button>
          )}

          <UpgradePanel save={save} onBuy={handleBuy} />
        </>
      )}
      {showOfflineModal && (
        <OfflineModal
          echoEarned={offlineEarned}
          onClose={() => setShowOfflineModal(false)}
        />
      )}
    </main>
  )
}

export default App
