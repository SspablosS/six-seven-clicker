import { useEffect, useState } from 'react'
import { loadSave } from './api/saveApi'
import OfflineModal from './OfflineModal'
import { getOrCreatePlayerId } from './playerId'
import './App.css'

function App() {
  const [save, setSave] = useState(null)
  const [offlineEarned, setOfflineEarned] = useState(0)
  const [showOfflineModal, setShowOfflineModal] = useState(false)
  const [error, setError] = useState(null)

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

  return (
    <main className="app">
      <h1 className="title">Церковь Шесть-Семь</h1>
      <p className="subtitle">Кликер-тайкун вокруг мема 6-7</p>
      {error && <p className="status">Ошибка: {error}</p>}
      {save && (
        <p className="status">
          Эхо: <span className="status-value">{Math.floor(save.echo)}</span>
          {' · '}
          id: <code>{save.playerId.slice(0, 8)}</code>
        </p>
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
