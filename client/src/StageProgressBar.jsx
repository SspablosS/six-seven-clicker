import { useMemo } from 'react'
import { getStageEchoProgress } from '../../config/gameConfig.js'
import { formatNumber } from './utils/formatNumber'
import './StageProgressBar.css'

export default function StageProgressBar({ save }) {
  const progress = useMemo(() => getStageEchoProgress(save), [
    save.stage,
    save.lifetimeEcho,
    save.attention,
    save.upgrades?.aiGen,
    save.rebirths,
  ])

  const label =
    progress.kind === 'progress'
      ? `До этапа «${progress.nextName}»: ${formatNumber(progress.current)} / ${formatNumber(progress.target)} Эхо`
      : progress.label

  const showBar = progress.kind === 'progress'
  const attentionHint =
    progress.attentionBlocked && progress.requiredAttention != null
      ? `Требуется ${formatNumber(progress.requiredAttention)} Внимания для перехода на следующий этап!`
      : null

  return (
    <div
      className={`stage-progress stage-progress--${progress.kind}${progress.attentionBlocked ? ' stage-progress--attention-blocked' : ''}`}
      aria-live="polite"
    >
      <p className="stage-progress__label">{label}</p>
      <div
        className="stage-progress__track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress.percent)}
        aria-label={attentionHint ? `${label}. ${attentionHint}` : label}
        hidden={!showBar}
      >
        <div
          className="stage-progress__fill"
          style={{ width: `${progress.percent}%` }}
        />
      </div>
      {attentionHint && (
        <p className="stage-progress__hint">{attentionHint}</p>
      )}
    </div>
  )
}
