import { buildEventToast } from './toastBuilder.js';

/** Единый источник правды для баланса игры */

export const OFFLINE_CAP_MS = 8 * 60 * 60 * 1000; // 8 часов

export const BASE_CLICK_VALUE = 1;
export const PRICE_GROWTH = 1.18;
export const TICK_MS = 1000;

/** Мегафон: +Эхо за клик за уровень */
export const MEGAPHONE_PER_LEVEL = 1;

/** Пассивный доход (целые Эхо/сек) */
export const UPGRADE_RATES = {
  kids: 1,
  botfarm: 2,
};

/** Мерч: доход от sqrt(totalClicks), не от echo/lifetimeEcho */
export const MERCH_INCOME_PER_TOTAL_CLICK_SQRT = 0.02;

/** Бот-ферма: +% к шансу кризиса за уровень (для E4) */
export const BOTFARM_CRISIS_CHANCE_PER_LEVEL = 0.02;

/** Локальные новости: +Внимание/сек за уровень */
export const NEWS_ATTENTION_PER_LEVEL = 1;

/** Внимание: затухание и трата на инфоповод */
export const ATTENTION_DECAY_PER_SECOND = 0.03;
export const ATTENTION_SPEND_TO_TRIGGER_EVENT = 100;
export const ATTENTION_SPEND_TARGET_EVENT = 'muskTweet';

/** Интервал случайных событий */
export const EVENT_INTERVAL_MIN_MS = 60_000;
export const EVENT_INTERVAL_MAX_MS = 120_000;

/** Рекламный буст (монетизация US-8.1) — реальный эффект ×2 */
export const AD_BOOST = {
  id: 'adBoost',
  type: 'bonus',
  icon: '▶',
  title: 'Рекламный буст ×2',
  description: 'Доход ×2 на 5 минут',
  durationMs: 5 * 60 * 1000,
  incomeMult: 2,
  watchMs: 3000,
};

/** Моки магазина — без реальной оплаты */
export const MONETIZATION = {
  pass: {
    id: 'preacherPass',
    name: 'Абонемент «Проповедник»',
    price: '299 ₽ / сезон',
    bonuses: [
      '+10% Эхо за клик',
      'Уникальный скин кафедры',
      'Ежедневный сундук с мемами',
    ],
  },
  skins: [
    { id: 'classic', name: 'Классика', swatch: '#3b82ff' },
    { id: 'gold', name: 'Золотой мегафон', swatch: '#f4ff3d' },
    { id: 'void', name: 'Пустотный культ', swatch: '#a855f7' },
    { id: 'mint', name: 'Мятный хор', swatch: '#3dffc0' },
  ],
  removeAds: {
    id: 'removeAds',
    name: 'Без рекламы',
    price: '149 ₽',
  },
};

export function applyAdBoost(save, now = Date.now()) {
  const endsAt = now + AD_BOOST.durationMs;
  const rest = (save.activeEvents || []).filter((e) => e.id !== AD_BOOST.id);
  return {
    ...save,
    activeEvents: [...rest, { id: AD_BOOST.id, endsAt }],
  };
}

export const EVENTS = {
  muskTweet: {
    id: 'muskTweet',
    type: 'bonus',
    icon: 'X',
    title: 'Илон Маск затвитил про мем',
    description: 'Доход ×3 на 60 сек',
    durationMs: 60_000,
    incomeMult: 3,
  },
  parentsBan: {
    id: 'parentsBan',
    type: 'crisis',
    icon: '!',
    title: 'Родители запретили мем',
    description: 'Доход ×0.5 на 30 сек',
    durationMs: 30_000,
    incomeMult: 0.5,
  },
  copyright: {
    id: 'copyright',
    type: 'penalty',
    icon: '©',
    title: 'Заявка на авторские права на 6-7',
    description: 'Списывает 10% текущего Эха',
    durationMs: 0,
    echoLossPercent: 0.1,
  },
  memeTwist: {
    id: 'memeTwist',
    type: 'twist',
    icon: '78',
    title: 'Мем эволюционировал в 7-8',
    description: 'Ресурс временно «7-8», доход ×2 на 2 мин',
    durationMs: 120_000,
    incomeMult: 2,
    resourceLabel: '7-8',
  },
};

export const EFFECT_DEFS = { ...EVENTS, [AD_BOOST.id]: AD_BOOST };

export function getEffectDef(id) {
  return EFFECT_DEFS[id] ?? null;
}

/**
 * Этапы культа.
 * theme — плоские цвета (без градиентов), пишутся в CSS-переменные.
 */
export const STAGES = {
  1: {
    id: 1,
    name: 'Школьный двор',
    lifetimeEcho: 0,
    minAttention: 0,
    minRebirths: 0,
    theme: {
      bg: '#ff2e93',
      accent: '#3b82ff',
      success: '#3dffc0',
      alert: '#f4ff3d',
      ink: '#111111',
      surface: '#ffffff',
    },
    cutscene:
      'На школьном дворе кто-то впервые крикнул «Six Seven!». Никто не понял зачем — и именно поэтому мем прижился.',
  },
  2: {
    id: 2,
    name: 'TikTok-вирус',
    lifetimeEcho: 500,
    minAttention: 0,
    minRebirths: 0,
    theme: {
      bg: '#111111',
      accent: '#3b82ff',
      success: '#25f4ee',
      alert: '#fe2c55',
      ink: '#111111',
      surface: '#ffffff',
    },
    cutscene:
      'Алгоритм подхватил крик. Лента забита дуэтом «6-7», школьный двор больше не вмещает эхо.',
  },
  3: {
    id: 3,
    name: 'Федеральные новости',
    lifetimeEcho: 2000,
    minAttention: 200,
    minRebirths: 0,
    theme: {
      bg: '#111111',
      accent: '#8b5cf6',
      success: '#3dffc0',
      alert: '#a855f7',
      ink: '#111111',
      surface: '#ffffff',
    },
    cutscene:
      'Ведущие произносят «Six Seven» с каменным лицом. Внимание стало валютой — культ вышел в прайм-тайм.',
  },
  4: {
    id: 4,
    name: 'Мировой культ',
    lifetimeEcho: 15000,
    minAttention: 500,
    minRebirths: 0,
    theme: {
      bg: '#0a0a0a',
      accent: '#3b82ff',
      success: '#3dffc0',
      alert: '#ff2e93',
      ink: '#111111',
      surface: '#ffffff',
    },
    cutscene:
      'Флаги, мерч, хоры на площадях. Планета синхронно орёт два числа 6-7!',
  },
  5: {
    id: 5,
    name: 'Числовая сингулярность',
    lifetimeEcho: 0,
    minAttention: 0,
    minRebirths: 1,
    theme: {
      bg: '#07070f',
      accent: '#3b82ff',
      success: '#3dffc0',
      alert: '#ff2e93',
      ink: '#111111',
      surface: '#ffffff',
    },
    cutscene:
      'После перерождения числа сложились в узор. Six и Seven больше не мем — это целая вселенная.',
  },
};

export function getStageDef(stage) {
  return STAGES[stage] ?? STAGES[1];
}

export function getStageName(stage) {
  return getStageDef(stage).name;
}

export function getStageTheme(stage) {
  return getStageDef(stage).theme;
}

/**
 * Прогресс к следующему этапу по lifetimeEcho.
 * @returns {{
 *   kind: 'progress' | 'max' | 'rebirth',
 *   percent: number,
 *   label: string,
 *   current?: number,
 *   target?: number,
 *   nextName?: string,
 *   attentionBlocked?: boolean,
 *   requiredAttention?: number,
 * }}
 */
export function getStageEchoProgress(save) {
  const stage = save.stage || 1;
  const lifetimeEcho = Math.floor(save.lifetimeEcho || 0);
  const attention = save.attention || 0;
  const nextDef = STAGES[stage + 1];

  if (stage >= 5 || !nextDef) {
    return { kind: 'max', percent: 100, label: 'Максимальный этап' };
  }

  if (nextDef.minRebirths > 0) {
    if (isRebirthUnlocked(save)) {
      return { kind: 'rebirth', percent: 100, label: 'Доступно перерождение!' };
    }
    return { kind: 'max', percent: 100, label: 'Максимальный этап' };
  }

  const from = getStageDef(stage).lifetimeEcho;
  const to = nextDef.lifetimeEcho;
  const span = to - from;

  if (span <= 0) {
    return { kind: 'max', percent: 100, label: 'Максимальный этап' };
  }

  const percent = Math.min(
    100,
    Math.max(0, ((lifetimeEcho - from) / span) * 100),
  );
  const echoComplete = lifetimeEcho >= to;
  const attentionBlocked =
    nextDef.minAttention > 0 &&
    echoComplete &&
    attention < nextDef.minAttention;

  return {
    kind: 'progress',
    percent,
    current: lifetimeEcho,
    target: to,
    nextName: nextDef.name,
    attentionBlocked,
    requiredAttention: attentionBlocked ? nextDef.minAttention : undefined,
  };
}

/** Максимальный этап, доступный по текущему прогрессу */
export function resolveStage(save) {
  const lifetimeEcho = Math.floor(save.lifetimeEcho || 0);
  const attention = save.attention || 0;
  const rebirths = save.rebirths || 0;

  let best = 1;
  for (const stage of Object.values(STAGES)) {
    if (lifetimeEcho < stage.lifetimeEcho) continue;
    if (attention < stage.minAttention) continue;
    if (rebirths < stage.minRebirths) continue;
    if (stage.id > best) best = stage.id;
  }
  return best;
}

/**
 * Если открыт новый этап — поднимает stage.
 * @returns {{ save: object, unlockedStage: number|null }}
 */
export function applyStageProgress(save) {
  const next = resolveStage(save);
  const current = save.stage || 1;
  if (next <= current) {
    return { save, unlockedStage: null };
  }
  return {
    save: { ...save, stage: next },
    unlockedStage: next,
  };
}

export function addEcho(save, amount) {
  const gain = Math.floor(amount);
  if (gain <= 0) return save;
  return {
    ...save,
    echo: Math.floor(save.echo || 0) + gain,
    lifetimeEcho: Math.floor(save.lifetimeEcho || 0) + gain,
  };
}

/**
 * Каталог улучшений.
 * minStage — с какого этапа карточка видна.
 */
export const UPGRADES = [
  {
    id: 'megaphone',
    name: 'Мегафон',
    iconSrc: '/upgrades/megaphone.png',
    description: `+${MEGAPHONE_PER_LEVEL} Эхо за клик`,
    basePrice: 15,
    badgeIndex: 0,
    rotate: -2,
    minStage: 1,
  },
  {
    id: 'kids',
    name: 'Школьники-репитеры',
    iconSrc: '/upgrades/schoolboy.png',
    description: `+${UPGRADE_RATES.kids} Эхо/сек`,
    basePrice: 50,
    badgeIndex: 1,
    rotate: 1.5,
    minStage: 1,
  },
  {
    id: 'botfarm',
    name: 'Бот-ферма в Discord',
    iconSrc: '/upgrades/discord.png',
    description: `+${UPGRADE_RATES.botfarm} Эхо/сек, но +${Math.round(BOTFARM_CRISIS_CHANCE_PER_LEVEL * 100)}% к кризисам`,
    basePrice: 200,
    badgeIndex: 2,
    rotate: -1,
    minStage: 2,
  },
  {
    id: 'news',
    name: 'Локальные новости',
    iconSrc: '/upgrades/news.png',
    description: `+${NEWS_ATTENTION_PER_LEVEL} Внимание/сек за уровень`,
    basePrice: 300,
    badgeIndex: 0,
    rotate: 2,
    minStage: 2,
  },
  {
    id: 'merch',
    name: 'Мерч-линия',
    iconSrc: '/upgrades/merch.png',
    description: `+${MERCH_INCOME_PER_TOTAL_CLICK_SQRT}×√кликов×ур. Эхо/сек`,
    basePrice: 750,
    badgeIndex: 2,
    rotate: 1,
    minStage: 3,
  },
  {
    id: 'aiGen',
    name: 'ИИ-генератор мемов',
    iconSrc: '/upgrades/ai.png',
    description: 'Открывает кнопку «Переродиться»',
    basePrice: 20000,
    badgeIndex: 1,
    rotate: -1.5,
    minStage: 4,
  },
];

export function getDefaultUpgrades() {
  return Object.fromEntries(UPGRADES.map((u) => [u.id, 0]));
}

export function getUpgradeDef(id) {
  return UPGRADES.find((u) => u.id === id);
}

export function getVisibleUpgrades(stage) {
  return UPGRADES.filter((u) => (u.minStage || 1) <= stage);
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

export function pruneActiveEvents(save, now = Date.now()) {
  const activeEvents = (save.activeEvents || []).filter((e) => e.endsAt > now);
  if (activeEvents.length === (save.activeEvents || []).length) return save;
  return { ...save, activeEvents };
}

export function getIncomeMultiplier(save, now = Date.now()) {
  const active = pruneActiveEvents(save, now).activeEvents || [];
  return active.reduce((mult, entry) => {
    const def = getEffectDef(entry.id);
    return mult * (def?.incomeMult ?? 1);
  }, 1);
}

export function getResourceLabel(save, fallback = 'Эхо', now = Date.now()) {
  const active = pruneActiveEvents(save, now).activeEvents || [];
  for (let i = active.length - 1; i >= 0; i -= 1) {
    const label = EVENTS[active[i].id]?.resourceLabel;
    if (label) return label;
  }
  return fallback;
}

export function scaleIncome(amount, mult) {
  if (amount <= 0 || mult <= 0) return 0;
  return Math.max(0, Math.floor(amount * mult));
}

export function randomEventDelayMs() {
  const span = EVENT_INTERVAL_MAX_MS - EVENT_INTERVAL_MIN_MS;
  return EVENT_INTERVAL_MIN_MS + Math.floor(Math.random() * (span + 1));
}

export function hasActiveTimedEvent(save, now = Date.now()) {
  const active = pruneActiveEvents(save, now).activeEvents || [];
  return active.some((e) => (getEffectDef(e.id)?.durationMs ?? 0) > 0);
}

/** Вес кризиса растёт с бот-фермой. Timed-события не выбираются, если уже есть активный таймер. */
export function pickWeightedEventId(save, now = Date.now()) {
  const botfarm = save.upgrades?.botfarm || 0;
  const blockTimed = hasActiveTimedEvent(save, now);
  const weights = [
    { id: 'muskTweet', weight: 1 },
    {
      id: 'parentsBan',
      weight: 1 + botfarm * BOTFARM_CRISIS_CHANCE_PER_LEVEL * 50,
    },
    { id: 'copyright', weight: 1 },
    { id: 'memeTwist', weight: 1 },
  ].filter((item) => {
    if (!blockTimed) return true;
    return (getEffectDef(item.id)?.durationMs ?? 0) === 0;
  });

  if (weights.length === 0) return null;

  const total = weights.reduce((sum, w) => sum + w.weight, 0);
  let roll = Math.random() * total;
  for (const item of weights) {
    roll -= item.weight;
    if (roll <= 0) return item.id;
  }
  return weights[0].id;
}

/**
 * Запускает случайное событие.
 * @returns {{ save: object, toast: object|null }}
 */
export function triggerRandomEvent(save, now = Date.now()) {
  let next = pruneActiveEvents(save, now);
  const eventId = pickWeightedEventId(next, now);
  if (!eventId) {
    return { save: next, toast: null };
  }

  const def = EVENTS[eventId];

  let echoLoss = null;
  if (def.echoLossPercent) {
    const loss = Math.floor(Math.floor(next.echo || 0) * def.echoLossPercent);
    next = { ...next, echo: Math.max(0, Math.floor(next.echo || 0) - loss) };
    echoLoss = loss;
  }

  let endsAt = null;
  if (def.durationMs > 0) {
    endsAt = now + def.durationMs;
    const rest = (next.activeEvents || []).filter((e) => e.id !== eventId);
    next = {
      ...next,
      activeEvents: [...rest, { id: eventId, endsAt }],
    };
  }

  const toast = buildEventToast({ eventId, def, now, echoLoss, endsAt });

  return { save: next, toast };
}

/**
 * Пассивный доход Эхо/сек (целое число, без множителей событий).
 * @param {{ upgrades: Record<string, number>, totalClicks: number }} save
 */
export function calcEchoPerSec(save) {
  const { upgrades, totalClicks } = save;
  const kids = (upgrades.kids || 0) * UPGRADE_RATES.kids;
  const botfarm = (upgrades.botfarm || 0) * UPGRADE_RATES.botfarm;
  const merchLevel = upgrades.merch || 0;
  const merch =
    merchLevel > 0
      ? Math.floor(
          Math.sqrt(totalClicks || 0) *
            MERCH_INCOME_PER_TOTAL_CLICK_SQRT *
            merchLevel,
        )
      : 0;
  return kids + botfarm + merch;
}

export function calcEchoPerSecWithEvents(save, now = Date.now()) {
  return scaleIncome(calcEchoPerSec(save), getIncomeMultiplier(save, now));
}

export function calcClickValueWithEvents(save, now = Date.now()) {
  return scaleIncome(calcClickValue(save), getIncomeMultiplier(save, now));
}

/** Начисление за elapsedMs офлайн/тик — всегда целое */
export function calcEchoEarned(save, elapsedMs) {
  if (elapsedMs <= 0) return 0;
  return Math.floor(calcEchoPerSec(save) * (elapsedMs / 1000));
}

export function getAttentionPerSecond(save) {
  const newsLevel = save.upgrades?.news || 0;
  const attention = save.attention || 0;
  return (
    newsLevel * NEWS_ATTENTION_PER_LEVEL -
    attention * ATTENTION_DECAY_PER_SECOND
  );
}

export function applyAttentionTick(save) {
  const delta = getAttentionPerSecond(save);
  return {
    ...save,
    attention: Math.max(0, (save.attention || 0) + delta),
  };
}

export function isAttentionUnlocked(save) {
  return (save.upgrades?.news || 0) > 0;
}

export function isAttentionSpendUnlocked(save) {
  return (save.stage || 1) >= 3 && isAttentionUnlocked(save);
}

export function canSpendAttentionForEvent(save) {
  return (save.attention || 0) >= ATTENTION_SPEND_TO_TRIGGER_EVENT;
}

/**
 * Тратит внимание на гарантированный инфоповод.
 * @returns {{ save: object, toast: object|null }}
 */
export function spendAttentionForEvent(save, now = Date.now()) {
  if (!canSpendAttentionForEvent(save)) {
    return { save, toast: null };
  }

  const eventId = ATTENTION_SPEND_TARGET_EVENT;
  const def = EVENTS[eventId];
  if (!def) return { save, toast: null };

  let next = {
    ...save,
    attention: (save.attention || 0) - ATTENTION_SPEND_TO_TRIGGER_EVENT,
  };

  let endsAt = null;
  if (def.durationMs > 0) {
    endsAt = now + def.durationMs;
    const rest = (next.activeEvents || []).filter((e) => e.id !== eventId);
    next = {
      ...next,
      activeEvents: [...rest, { id: eventId, endsAt }],
    };
  }

  const toast = buildEventToast({ eventId, def, now, echoLoss: null, endsAt });
  return { save: next, toast };
}

export function isRebirthUnlocked(save) {
  return (save.upgrades?.aiGen || 0) > 0;
}

/**
 * Покупка улучшения. Возвращает новый save или null, если нельзя купить.
 */
export function purchaseUpgrade(save, upgradeId) {
  const def = getUpgradeDef(upgradeId);
  if (!def || (save.stage || 1) < (def.minStage || 1)) return null;

  const level = save.upgrades?.[upgradeId] || 0;
  const price = calcUpgradePrice(upgradeId, level);
  if (save.echo < price) return null;

  const nextUpgrades = {
    ...save.upgrades,
    [upgradeId]: level + 1,
  };

  const next = {
    ...save,
    echo: Math.floor(save.echo - price),
    upgrades: nextUpgrades,
  };

  return applyStageProgress(next).save;
}

/** Престиж: сброс ресурсов/апгрейдов, +1 rebirth → этап 5 */
export function performRebirth(save) {
  if (!isRebirthUnlocked(save)) return null;

  const next = {
    ...save,
    echo: 0,
    attention: 0,
    totalClicks: 0,
    upgrades: getDefaultUpgrades(),
    rebirths: (save.rebirths || 0) + 1,
    activeEvents: [],
    lifetimeEcho: Math.floor(save.lifetimeEcho || 0),
  };

  return applyStageProgress(next).save;
}
