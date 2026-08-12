import './OfflineModal.css'

const OFFLINE_MODAL_TITLE = 'Пока тебя не было, культ заработал';

function formatEcho(value) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return Number(value).toFixed(value >= 10 ? 0 : 1);
}

export default function OfflineModal({ echoEarned, onClose }) {
  return (
    <div className="offline-backdrop" role="dialog" aria-modal="true">
      <div className="offline-modal">
        <p className="offline-text">
          {OFFLINE_MODAL_TITLE}{' '}
          <span className="offline-amount">{formatEcho(echoEarned)}</span> Эха
        </p>
        <button type="button" className="offline-btn" onClick={onClose}>
          Забрать
        </button>
      </div>
    </div>
  )
}
