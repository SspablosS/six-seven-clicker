import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [health, setHealth] = useState(null)

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then(setHealth)
      .catch(() => setHealth({ status: 'error' }))
  }, [])

  return (
    <main className="app">
      <h1 className="title">Церковь Шесть-Семь</h1>
      <p className="subtitle">Кликер-тайкун вокруг мема 6-7</p>
      {health && (
        <p className="status">
          API: <span className="status-value">{health.status}</span>
        </p>
      )}
    </main>
  )
}

export default App
