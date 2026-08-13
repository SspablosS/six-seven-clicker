import { formatNumber } from '@/utils/formatNumber'
import './OfflineModal.css'

const OFFLINE_MODAL_TITLE = 'Пока тебя не было, культ заработал'

export default function OfflineModal({ echoEarned, onClose }) {
  return (
    <div className="offline-backdrop" role="dialog" aria-modal="true">
      <div className="offline-modal">
        <p className="offline-text">
          {OFFLINE_MODAL_TITLE}{' '}
          <span className="offline-amount">{formatNumber(echoEarned)}</span> Эха
        </p>
        <button type="button" className="offline-btn" onClick={onClose}>
          Забрать
        </button>
      </div>
    </div>
  )
}
