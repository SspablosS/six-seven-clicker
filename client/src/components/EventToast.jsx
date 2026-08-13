import { EVENTS } from '@config/gameConfig.js'
import './EventToast.css'

const DISMISS_LABEL = 'Ок'

export default function EventToast({ toast, onClose }) {
  const def = EVENTS[toast.eventId]
  const isCrisis = toast.type === 'crisis' || toast.type === 'penalty'
  const secondsLeft =
    toast.endsAt != null
      ? Math.max(0, Math.ceil((toast.endsAt - Date.now()) / 1000))
      : null

  return (
    <div className="event-toast-backdrop" role="dialog" aria-modal="true">
      <div
        className={`event-toast${isCrisis ? ' event-toast--crisis' : ''}`}
      >
        <p className="event-toast__icon" aria-hidden="true">
          {def?.icon ?? '!'}
        </p>
        <h2 className="event-toast__title">{toast.title}</h2>
        <p className="event-toast__desc">{toast.description}</p>
        {secondsLeft != null && (
          <p className="event-toast__timer">{secondsLeft} сек</p>
        )}
        <button type="button" className="event-toast__btn" onClick={onClose}>
          {DISMISS_LABEL}
        </button>
      </div>
    </div>
  )
}
