import { useEffect, useState } from 'react'
import {
  getSettings,
  resumeAudio,
  setMusicVolume,
  setSfxVolume,
  subscribe,
  toggleMusic,
  toggleSfx,
} from '@/audio/AudioController'
import './AudioControls.css'

const PANEL_TITLE = 'Звук'
const CLOSE_LABEL = 'Готово'

function AudioSettingsPanel({ settings, onToggleMusic, onToggleSfx, onMusicVolume, onSfxVolume }) {
  return (
    <>
      <p className="audio-controls__title">{PANEL_TITLE}</p>

      <div className="audio-controls__row">
        <button
          type="button"
          className={`audio-controls__btn${settings.musicEnabled ? '' : ' audio-controls__btn--off'}`}
          aria-pressed={settings.musicEnabled}
          onClick={onToggleMusic}
        >
          Music
        </button>
        <button
          type="button"
          className={`audio-controls__btn${settings.sfxEnabled ? '' : ' audio-controls__btn--off'}`}
          aria-pressed={settings.sfxEnabled}
          onClick={onToggleSfx}
        >
          SFX
        </button>
      </div>

      <label className="audio-controls__slider">
        <span className="audio-controls__slider-label">Music</span>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(settings.musicVolume * 100)}
          onInput={onMusicVolume}
          onChange={onMusicVolume}
        />
      </label>

      <label className="audio-controls__slider">
        <span className="audio-controls__slider-label">SFX</span>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(settings.sfxVolume * 100)}
          onInput={onSfxVolume}
          onChange={onSfxVolume}
        />
      </label>
    </>
  )
}

export default function AudioControls() {
  const [settings, setSettings] = useState(() => getSettings())
  const [open, setOpen] = useState(false)

  useEffect(() => subscribe(setSettings), [])

  useEffect(() => {
    if (!open) return undefined

    function onKeyDown(event) {
      if (event.key === 'Escape') setOpen(false)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  function handleToggleMusic() {
    resumeAudio().then(() => toggleMusic())
  }

  function handleToggleSfx() {
    resumeAudio().then(() => toggleSfx())
  }

  function handleMusicVolume(event) {
    const value = Number(event.target.value) / 100
    setMusicVolume(value)
    setSettings(getSettings())
  }

  function handleSfxVolume(event) {
    const value = Number(event.target.value) / 100
    setSfxVolume(value)
    setSettings(getSettings())
  }

  function openPanel() {
    resumeAudio().then(() => setOpen(true))
  }

  const panelProps = {
    settings,
    onToggleMusic: handleToggleMusic,
    onToggleSfx: handleToggleSfx,
    onMusicVolume: handleMusicVolume,
    onSfxVolume: handleSfxVolume,
  }

  const muted = !settings.musicEnabled && !settings.sfxEnabled

  return (
    <div className="audio-controls">
      <button
        type="button"
        className={`audio-controls__toggle${muted ? ' audio-controls__toggle--muted' : ''}`}
        aria-label="Настройки звука"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => (open ? setOpen(false) : openPanel())}
      >
        ♪
      </button>

      {open && (
        <>
          <button
            type="button"
            className="audio-controls__backdrop"
            aria-label="Закрыть настройки звука"
            onClick={() => setOpen(false)}
          />
          <section
            className="audio-controls__panel"
            role="dialog"
            aria-modal="true"
            aria-label={PANEL_TITLE}
          >
            <AudioSettingsPanel {...panelProps} />
            <button
              type="button"
              className="audio-controls__close"
              onClick={() => setOpen(false)}
            >
              {CLOSE_LABEL}
            </button>
          </section>
        </>
      )}
    </div>
  )
}
