import { useEffect, useState } from 'react'
import { BASE_CLICK_VALUE } from '../../config/gameConfig.js'
import { loadSave } from './api/saveApi'
import ClickButton from './ClickButton'
import { ECHO_LABEL } from './constants'
import OfflineModal from './OfflineModal'
import { getOrCreatePlayerId } from './playerId'
import { formatNumber } from './utils/formatNumber'
import './App.css'

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

    const gain = BASE_CLICK_VALUE
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

  return (
    <main className="app">
      <h1 className="title">Церковь Шесть-Семь</h1>
      <p className="subtitle">Кликер-тайкун вокруг мема 6-7</p>
      {error && <p className="status">Ошибка: {error}</p>}
      {save && (
        <>
          <p className="echo-counter" aria-live="polite">
            <span className="echo-counter__label">{ECHO_LABEL}</span>
            <span className="echo-counter__value">{formatNumber(save.echo)}</span>
          </p>

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
