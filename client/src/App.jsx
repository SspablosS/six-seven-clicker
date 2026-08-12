import { useEffect, useMemo, useRef, useState } from 'react'
import {
  TICK_MS,
  AD_BOOST,
  addEcho,
  applyAdBoost,
  applyStageProgress,
  calcClickValueWithEvents,
  calcEchoPerSecWithEvents,
  getResourceLabel,
  getStageDef,
  getStageName,
  getStageTheme,
  isAttentionUnlocked,
  isRebirthUnlocked,
  performRebirth,
  pruneActiveEvents,
  purchaseUpgrade,
  randomEventDelayMs,
  triggerRandomEvent,
} from '../../config/gameConfig.js'
import { loadSave, persistSave } from './api/saveApi'
import ActiveEffects from './ActiveEffects'
import ClickButton from './ClickButton'
import { BRAND_NAME, ECHO_LABEL } from './constants'
import EventToast from './EventToast'
import MonetizationPanel from './MonetizationPanel'
import OfflineModal from './OfflineModal'
import { getOrCreatePlayerId } from './playerId'
import SaveIndicator from './SaveIndicator'
import StageCutscene from './StageCutscene'
import UpgradePanel from './UpgradePanel'
import { formatNumber } from './utils/formatNumber'
import './App.css'

const ATTENTION_LABEL = 'Внимание'
const REBIRTH_LABEL = 'Переродиться'
/** AC US-6.1: автосохранение каждые 15–30 сек */
const PERSIST_INTERVAL_MS = 20_000
const SAVED_FLASH_MS = 2500

function themeStyle(stage) {
  const theme = getStageTheme(stage)
  return {
    '--color-bg': theme.bg,
    '--color-accent': theme.accent,
    '--color-success': theme.success,
    '--color-alert': theme.alert,
    '--color-ink': theme.ink,
    '--color-surface': theme.surface,
  }
}

function App() {
  const [save, setSave] = useState(null)
  const [offlineEarned, setOfflineEarned] = useState(0)
  const [showOfflineModal, setShowOfflineModal] = useState(false)
  const [cutscene, setCutscene] = useState(null)
  const [eventToast, setEventToast] = useState(null)
  const [now, setNow] = useState(() => Date.now())
  const [error, setError] = useState(null)
  const [floaters, setFloaters] = useState([])
  const [hydrated, setHydrated] = useState(false)
  const [saveStatus, setSaveStatus] = useState('idle')
  const playerIdRef = useRef(null)
  const saveRef = useRef(null)
  const prevStageRef = useRef(null)
  const dirtyRef = useRef(false)
  const skipNextPersistRef = useRef(true)
  const savedFlashRef = useRef(null)
  const flushSaveRef = useRef(() => {})

  function markDirty() {
    dirtyRef.current = true
  }

  function flashSaved() {
    setSaveStatus('saved')
    if (savedFlashRef.current) window.clearTimeout(savedFlashRef.current)
    savedFlashRef.current = window.setTimeout(() => {
      setSaveStatus('idle')
    }, SAVED_FLASH_MS)
  }

  async function persistNow(nextSave, { silent = false } = {}) {
    const playerId = playerIdRef.current
    if (!playerId || !nextSave) return

    if (!silent) setSaveStatus('saving')
    try {
      await persistSave(playerId, nextSave)
      dirtyRef.current = false
      if (!silent) flashSaved()
    } catch (err) {
      dirtyRef.current = true
      console.error(err)
      if (!silent) setSaveStatus('error')
    }
  }

  flushSaveRef.current = (options = {}) => {
    const current = saveRef.current
    const playerId = playerIdRef.current
    if (!current || !playerId || !dirtyRef.current) return
    persistNow(current, options)
  }

  useEffect(() => {
    const playerId = getOrCreatePlayerId()
    playerIdRef.current = playerId
    loadSave(playerId)
      .then(({ save: nextSave, offlineEarned: earned }) => {
        let cleaned = {
          ...nextSave,
          echo: Math.floor(nextSave.echo || 0),
          lifetimeEcho: Math.floor(
            nextSave.lifetimeEcho || nextSave.echo || 0,
          ),
        }
        cleaned = pruneActiveEvents(cleaned)
        cleaned = applyStageProgress(cleaned).save
        prevStageRef.current = cleaned.stage || 1
        skipNextPersistRef.current = true
        dirtyRef.current = false
        setSave(cleaned)
        if (earned >= 1) {
          setOfflineEarned(Math.floor(earned))
          setShowOfflineModal(true)
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setHydrated(true))
  }, [])

  useEffect(() => {
    if (!save) return
    const stage = save.stage || 1
    const prev = prevStageRef.current
    if (prev != null && stage > prev) {
      const def = getStageDef(stage)
      setCutscene({ stage, text: def.cutscene })
    }
    prevStageRef.current = stage
  }, [save?.stage])

  useEffect(() => {
    saveRef.current = save
    if (!save || !hydrated) return
    if (skipNextPersistRef.current) {
      skipNextPersistRef.current = false
      return
    }
    markDirty()
  }, [save, hydrated])

  useEffect(() => {
    if (!hydrated) return undefined

    const timer = window.setInterval(() => {
      flushSaveRef.current({ silent: false })
    }, PERSIST_INTERVAL_MS)

    function onVisibilityChange() {
      if (document.visibilityState === 'hidden') {
        flushSaveRef.current({ silent: true })
      }
    }

    function onBeforeUnload() {
      flushSaveRef.current({ silent: true })
    }

    window.addEventListener('beforeunload', onBeforeUnload)
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      window.clearInterval(timer)
      window.removeEventListener('beforeunload', onBeforeUnload)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      if (savedFlashRef.current) window.clearTimeout(savedFlashRef.current)
    }
  }, [hydrated])

  // Пассивный тик + обновление таймеров эффектов
  useEffect(() => {
    if (!hydrated) return undefined

    const timer = window.setInterval(() => {
      const tickNow = Date.now()
      setNow(tickNow)
      setSave((prev) => {
        if (!prev) return prev
        let next = pruneActiveEvents(prev, tickNow)
        const gain = calcEchoPerSecWithEvents(next, tickNow)
        if (gain > 0) {
          next = applyStageProgress(addEcho(next, gain)).save
        }
        return next
      })
    }, TICK_MS)

    return () => window.clearInterval(timer)
  }, [hydrated])

  // Случайные события раз в 20–60 сек
  useEffect(() => {
    if (!hydrated) return undefined

    let cancelled = false
    let timeoutId

    function scheduleNext() {
      const delay = randomEventDelayMs()
      timeoutId = window.setTimeout(() => {
        if (cancelled) return
        const current = saveRef.current
        if (current) {
          const { save: next, toast } = triggerRandomEvent(current)
          setSave(next)
          if (toast) {
            setEventToast(toast)
            setNow(Date.now())
          }
        }
        scheduleNext()
      }, delay)
    }

    scheduleNext()

    return () => {
      cancelled = true
      window.clearTimeout(timeoutId)
    }
  }, [hydrated])

  function handleShout() {
    if (!save) return

    const gain = calcClickValueWithEvents(save, now)
    setSave((prev) =>
      applyStageProgress({
        ...addEcho(prev, gain),
        totalClicks: prev.totalClicks + 1,
      }).save,
    )

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
      const bought = purchaseUpgrade(prev, upgradeId)
      if (!bought) return prev
      dirtyRef.current = true
      saveRef.current = bought
      persistNow(bought)
      return bought
    })
  }

  function handleRebirth() {
    setSave((prev) => {
      if (!prev) return prev
      const next = performRebirth(prev)
      if (!next) return prev
      dirtyRef.current = true
      saveRef.current = next
      persistNow(next)
      return next
    })
  }

  function handleSelectSkin(skinId) {
    setSave((prev) => {
      if (!prev) return prev
      return { ...prev, selectedSkin: skinId }
    })
  }

  function handleAdBoost() {
    setSave((prev) => {
      if (!prev) return prev
      return applyAdBoost(prev)
    })
    setNow(Date.now())
  }

  const stage = save?.stage || 1
  const stageName = save ? getStageName(save.stage) : null
  const clickValue = save ? calcClickValueWithEvents(save, now) : 0
  const resourceLabel = save
    ? getResourceLabel(save, ECHO_LABEL, now)
    : ECHO_LABEL
  const themeVars = useMemo(() => themeStyle(stage), [stage])
  const adBoostActive = Boolean(
    save?.activeEvents?.some(
      (e) => e.id === AD_BOOST.id && e.endsAt > now,
    ),
  )

  return (
    <main className="app" data-stage={stage} style={themeVars}>
      <SaveIndicator status={saveStatus} />
      <p className="brand">{BRAND_NAME}</p>
      {stageName && <h1 className="title">{stageName}</h1>}
      {error && <p className="status">Ошибка: {error}</p>}
      {save && (
        <>
          <ActiveEffects activeEvents={save.activeEvents} now={now} />

          <div className="resource-row">
            <p className="echo-counter" aria-live="polite">
              <span className="echo-counter__label">{resourceLabel}</span>
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
            <ClickButton
              onShout={handleShout}
              skinId={save.selectedSkin || 'classic'}
            />
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
            <button type="button" className="rebirth-btn" onClick={handleRebirth}>
              {REBIRTH_LABEL}
            </button>
          )}

          <MonetizationPanel
            save={save}
            onSelectSkin={handleSelectSkin}
            onAdBoost={handleAdBoost}
            adBlocked={adBoostActive}
          />

          <UpgradePanel save={save} onBuy={handleBuy} />
        </>
      )}
      {showOfflineModal && (
        <OfflineModal
          echoEarned={offlineEarned}
          onClose={() => setShowOfflineModal(false)}
        />
      )}
      {cutscene && (
        <StageCutscene
          stage={cutscene.stage}
          text={cutscene.text}
          onClose={() => setCutscene(null)}
        />
      )}
      {eventToast && (
        <EventToast toast={eventToast} onClose={() => setEventToast(null)} />
      )}
    </main>
  )
}

export default App
