import { loadLocalSave, persistLocalSave } from './localSave.js'

const useLocalSaves = import.meta.env.VITE_STATIC_DEPLOY === 'true'

function wrapApiError(operation, err) {
  const message =
    err instanceof Error ? err.message : `Unknown ${operation} error`
  const wrapped = new Error(message)
  console.error(`[saveApi] ${operation} failed:`, err)
  return wrapped
}

export async function loadSave(playerId) {
  if (useLocalSaves) {
    return loadLocalSave(playerId)
  }

  try {
    const res = await fetch(`/api/save/${playerId}`)
    if (!res.ok) {
      throw new Error(`Failed to load save: ${res.status}`)
    }
    return await res.json()
  } catch (err) {
    throw wrapApiError('load', err)
  }
}

export async function persistSave(playerId, save) {
  if (useLocalSaves) {
    return persistLocalSave(playerId, save)
  }

  try {
    const res = await fetch(`/api/save/${playerId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(save),
    })
    if (!res.ok) {
      throw new Error(`Failed to save: ${res.status}`)
    }
    return await res.json()
  } catch (err) {
    throw wrapApiError('persist', err)
  }
}
