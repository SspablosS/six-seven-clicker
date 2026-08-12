import { useState } from 'react'
import { SHOUT_BUTTON_LABEL } from './constants'
import './ClickButton.css'

export default function ClickButton({ onShout, skinId = 'classic' }) {
  const [pressed, setPressed] = useState(false)

  function handleClick() {
    setPressed(true)
    onShout()
    window.setTimeout(() => setPressed(false), 120)
  }

  return (
    <button
      type="button"
      className={`click-btn click-btn--skin-${skinId}${pressed ? ' click-btn--pressed' : ''}`}
      onClick={handleClick}
      aria-label={SHOUT_BUTTON_LABEL}
    >
      <span className="click-btn__label">{SHOUT_BUTTON_LABEL}</span>
    </button>
  )
}
