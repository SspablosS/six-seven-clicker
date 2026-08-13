import './SaveIndicator.css'

const LABELS = {
  saving: 'Сохранение…',
  saved: 'Сохранено',
  error: 'Ошибка сохранения',
}

export default function SaveIndicator({ status }) {
  if (!status || status === 'idle') return null

  return (
    <div
      className={`save-indicator save-indicator--${status}`}
      aria-live="polite"
    >
      {LABELS[status]}
    </div>
  )
}
