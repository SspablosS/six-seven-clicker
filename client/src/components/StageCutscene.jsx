import { getStageName } from '@config/gameConfig.js'
import './StageCutscene.css'

const CONTINUE_LABEL = 'Дальше'

export default function StageCutscene({ stage, text, onClose }) {
  return (
    <div className="cutscene-backdrop" role="dialog" aria-modal="true">
      <div className="cutscene-modal">
        <p className="cutscene-stage">{getStageName(stage)}</p>
        <p className="cutscene-text">{text}</p>
        <button type="button" className="cutscene-btn" onClick={onClose}>
          {CONTINUE_LABEL}
        </button>
      </div>
    </div>
  )
}
