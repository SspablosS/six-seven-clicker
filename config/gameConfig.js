/** Единый источник правды для баланса игры */

export const OFFLINE_CAP_MS = 8 * 60 * 60 * 1000; // 8 часов

export const BASE_CLICK_VALUE = 1;

/** Базовые ставки пассивного дохода (Эхо/сек за уровень) — уточним в E3 */
export const UPGRADE_RATES = {
  kids: 0.5,
  botfarm: 1,
  /** merch: echo/sec = merchLevel * totalClicks * MERCH_CLICK_FACTOR */
  merchClickFactor: 0.0001,
};

/**
 * Пассивный доход Эхо/сек по текущему состоянию сохранения.
 * @param {{ upgrades: Record<string, number>, totalClicks: number }} save
 */
export function calcEchoPerSec(save) {
  const { upgrades, totalClicks } = save;
  const kids = (upgrades.kids || 0) * UPGRADE_RATES.kids;
  const botfarm = (upgrades.botfarm || 0) * UPGRADE_RATES.botfarm;
  const merch =
    (upgrades.merch || 0) * (totalClicks || 0) * UPGRADE_RATES.merchClickFactor;
  return kids + botfarm + merch;
}
