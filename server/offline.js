import { OFFLINE_CAP_MS, calcEchoEarned } from '../config/gameConfig.js';

/**
 * Считает офлайн-доход и возвращает обновлённое сохранение.
 * Эхо всегда целое; дроби отсекаются.
 * @returns {{ save: object, offlineEarned: number }}
 */
export function applyOfflineEarnings(save) {
  const now = Date.now();
  const lastSeen = Date.parse(save.lastSeenAt);
  let offlineEarned = 0;

  const baseEcho = Math.floor(save.echo || 0);

  if (Number.isFinite(lastSeen) && lastSeen < now) {
    const elapsedMs = Math.min(now - lastSeen, OFFLINE_CAP_MS);
    offlineEarned = calcEchoEarned(save, elapsedMs);
  }

  return {
    save: {
      ...save,
      echo: baseEcho + offlineEarned,
      lastSeenAt: new Date(now).toISOString(),
    },
    offlineEarned,
  };
}
