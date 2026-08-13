import { createDefaultSave } from '../../../server/defaultSave.js'
import { applyOfflineEarnings } from '../../../server/offline.js'

const storageKey = (playerId) => `sixSevenSave:${playerId}`

export function loadLocalSave(playerId) {
  const raw = localStorage.getItem(storageKey(playerId))

  if (!raw) {
    return { save: createDefaultSave(playerId), offlineEarned: 0 }
  }

  let existing
  try {
    existing = JSON.parse(raw)
  } catch {
    return { save: createDefaultSave(playerId), offlineEarned: 0 }
  }

  const { save, offlineEarned } = applyOfflineEarnings({ ...existing, playerId })
  localStorage.setItem(storageKey(playerId), JSON.stringify(save))
  return { save, offlineEarned }
}

export function persistLocalSave(playerId, save) {
  const next = {
    ...createDefaultSave(playerId),
    ...save,
    playerId,
    lastSeenAt: new Date().toISOString(),
  }
  localStorage.setItem(storageKey(playerId), JSON.stringify(next))
  return { save: next }
}
