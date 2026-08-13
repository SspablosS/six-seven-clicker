import { getDefaultUpgrades } from '../config/gameConfig.js';

/** @param {string} playerId */
export function createDefaultSave(playerId) {
  return {
    playerId,
    echo: 0,
    attention: 0,
    totalClicks: 0,
    stage: 1,
    upgrades: getDefaultUpgrades(),
    rebirths: 0,
    lifetimeEcho: 0,
    activeEvents: [],
    selectedSkin: 'classic',
    lastSeenAt: new Date().toISOString(),
  };
}
