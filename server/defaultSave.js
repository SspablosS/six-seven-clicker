/** @param {string} playerId */
export function createDefaultSave(playerId) {
  return {
    playerId,
    echo: 0,
    attention: 0,
    totalClicks: 0,
    stage: 1,
    upgrades: {
      megaphone: 0,
      kids: 0,
      botfarm: 0,
      news: 0,
      aiGen: 0,
      merch: 0,
    },
    rebirths: 0,
    activeEvents: [],
    lastSeenAt: new Date().toISOString(),
  };
}
