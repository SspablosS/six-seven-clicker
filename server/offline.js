import { OFFLINE_CAP_MS, addEcho, applyStageProgress, calcEchoEarned } from '../config/gameConfig.js';

/**
 * Считает офлайн-доход и возвращает обновлённое сохранение.
 * Эхо всегда целое; дроби отсекаются.
 * @returns {{ save: object, offlineEarned: number }}
 */
export function applyOfflineEarnings(save) {
  const now = Date.now();
  const lastSeen = Date.parse(save.lastSeenAt);
  let offlineEarned = 0;

  let next = {
    ...save,
    echo: Math.floor(save.echo || 0),
    lifetimeEcho: Math.floor(save.lifetimeEcho || 0),
  };

  if (Number.isFinite(lastSeen) && lastSeen < now) {
    const elapsedMs = Math.min(now - lastSeen, OFFLINE_CAP_MS);
    offlineEarned = calcEchoEarned(next, elapsedMs);
    if (offlineEarned > 0) {
      next = addEcho(next, offlineEarned);
    }
  }

  next = applyStageProgress(next).save;

  return {
    save: {
      ...next,
      lastSeenAt: new Date(now).toISOString(),
    },
    offlineEarned,
  };
}
