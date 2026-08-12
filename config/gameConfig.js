/** Единый источник правды для баланса игры */

export const OFFLINE_CAP_MS = 8 * 60 * 60 * 1000; // 8 часов

export const BASE_CLICK_VALUE = 1;
export const PRICE_GROWTH = 1.15;

/** Этапы культа (id === save.stage) */
export const STAGES = {
  1: { id: 1, name: 'Школьный двор' },
  2: { id: 2, name: 'TikTok-вирус' },
  3: { id: 3, name: 'Федеральные новости' },
  4: { id: 4, name: 'Мировой культ' },
  5: { id: 5, name: 'Числовая сингулярность' },
};

export function getStageName(stage) {
  return STAGES[stage]?.name ?? STAGES[1].name;
}

/** Мегафон: +Эхо за клик за уровень */
export const MEGAPHONE_PER_LEVEL = 1;

/** Пассивный доход */
export const UPGRADE_RATES = {
  kids: 0.5,
  botfarm: 1,
  merchClickFactor: 0.0001,
};

/** Бот-ферма: +% к шансу кризиса за уровень (для E4) */
export const BOTFARM_CRISIS_CHANCE_PER_LEVEL = 0.02;

/** Локальные новости: +Внимание за уровень при покупке */
export const NEWS_ATTENTION_PER_LEVEL = 1;

/**
 * Каталог улучшений.
 * badgeIndex: 0 жёлтый / 1 синий / 2 розовый
 * rotate: лёгкий поворот карточки (±3deg)
 */
export const UPGRADES = [
  {
    id: 'megaphone',
    name: 'Мегафон',
    icon: 'M',
    description: `+${MEGAPHONE_PER_LEVEL} Эхо за клик`,
    basePrice: 15,
    badgeIndex: 0,
    rotate: -2,
  },
  {
    id: 'kids',
    name: 'Школьники-репитеры',
    icon: 'Ш',
    description: `+${UPGRADE_RATES.kids} Эхо/сек`,
    basePrice: 50,
    badgeIndex: 1,
    rotate: 1.5,
  },
  {
    id: 'botfarm',
    name: 'Бот-ферма в Discord',
    icon: 'Б',
    description: `+${UPGRADE_RATES.botfarm} Эхо/сек, но +${Math.round(BOTFARM_CRISIS_CHANCE_PER_LEVEL * 100)}% к кризисам`,
    basePrice: 200,
    badgeIndex: 2,
    rotate: -1,
  },
  {
    id: 'news',
    name: 'Локальные новости',
    icon: 'Н',
    description: 'Открывает Внимание для этапов 3+',
    basePrice: 500,
    badgeIndex: 0,
    rotate: 2,
  },
  {
    id: 'aiGen',
    name: 'ИИ-генератор мемов',
    icon: 'И',
    description: 'Открывает кнопку «Переродиться»',
    basePrice: 2000,
    badgeIndex: 1,
    rotate: -1.5,
  },
  {
    id: 'merch',
    name: 'Мерч-линия',
    icon: 'Р',
    description: 'Доход от totalClicks за всё время',
    basePrice: 750,
    badgeIndex: 2,
    rotate: 1,
  },
];

export function getUpgradeDef(id) {
  return UPGRADES.find((u) => u.id === id);
}

/** Цена следующего уровня: basePrice * 1.15^level */
export function calcUpgradePrice(upgradeId, level) {
  const def = getUpgradeDef(upgradeId);
  if (!def) return Infinity;
  return Math.floor(def.basePrice * PRICE_GROWTH ** level);
}

export function calcClickValue(save) {
  const megaphone = save.upgrades?.megaphone || 0;
  return BASE_CLICK_VALUE + megaphone * MEGAPHONE_PER_LEVEL;
}

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

export function isAttentionUnlocked(save) {
  return (save.upgrades?.news || 0) > 0;
}

export function isRebirthUnlocked(save) {
  return (save.upgrades?.aiGen || 0) > 0;
}

/**
 * Покупка улучшения. Возвращает новый save или null, если нельзя купить.
 */
export function purchaseUpgrade(save, upgradeId) {
  const level = save.upgrades?.[upgradeId] || 0;
  const price = calcUpgradePrice(upgradeId, level);
  if (save.echo < price) return null;

  const nextUpgrades = {
    ...save.upgrades,
    [upgradeId]: level + 1,
  };

  let attention = save.attention || 0;
  if (upgradeId === 'news') {
    attention += NEWS_ATTENTION_PER_LEVEL;
  }

  return {
    ...save,
    echo: save.echo - price,
    attention,
    upgrades: nextUpgrades,
  };
}
