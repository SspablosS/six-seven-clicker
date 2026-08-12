import { OFFLINE_CAP_MS, calcEchoPerSec } from '../config/gameConfig.js';

/**
 * Считает офлайн-доход и возвращает обновлённое сохранение.
 * @returns {{ save: object, offlineEarned: number }}
 */
export function applyOfflineEarnings(save) {
  const now = Date.now();
  const lastSeen = Date.parse(save.lastSeenAt);
  let offlineEarned = 0;

  if (Number.isFinite(lastSeen) && lastSeen < now) {
    const elapsedMs = Math.min(now - lastSeen, OFFLINE_CAP_MS);
    const echoPerSec = calcEchoPerSec(save);
    offlineEarned = echoPerSec * (elapsedMs / 1000);
    if (offlineEarned > 0) {
      save = {
        ...save,
        echo: (save.echo || 0) + offlineEarned,
      };
    }
  }

  save = {
    ...save,
    lastSeenAt: new Date(now).toISOString(),
  };

  return { save, offlineEarned };
}
