import { useMemo, useRef } from 'react'

/** Shared across all tap targets — emulated mouse follows any touch. */
let lastTouchAt = 0

const EMULATED_MOUSE_MS = 700

function handlePointerDown(event, action) {
  if (!event.isPrimary) return
  if (event.pointerType === 'mouse' && event.button !== 0) return

  const now = performance.now()

  if (
    event.pointerType === 'mouse' &&
    now - lastTouchAt < EMULATED_MOUSE_MS
  ) {
    event.preventDefault()
    return
  }

  if (event.pointerType === 'touch' || event.pointerType === 'pen') {
    lastTouchAt = now
    event.preventDefault()
  }

  action(event)
}

function handleKeyDown(event, action) {
  if (event.key !== 'Enter' && event.key !== ' ') return
  if (event.repeat) return
  event.preventDefault()
  action(event)
}

export function bindTapAction(action) {
  return {
    onPointerDown: (event) => handlePointerDown(event, action),
    onKeyDown: (event) => handleKeyDown(event, action),
  }
}

export function useTapAction(action) {
  const actionRef = useRef(action)
  actionRef.current = action

  return useMemo(
    () =>
      bindTapAction((event) => {
        actionRef.current(event)
      }),
    [],
  )
}
